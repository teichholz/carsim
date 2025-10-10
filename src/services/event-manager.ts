import { useSimulationStore } from '@/store/simulation-store';
import {
  getGridCellFromScreen,
  calculateZoomTransform,
  calculatePanTransform
} from '@/utils/coordinate-conversion';
import type { PointerPosition } from '@/types/simulation-state';

// Event constants
const BUILDING_BLOCK_CLICK = 'BuildingBlockClick';
const SELECTION_COMPLETE = 'SelectionComplete';
const BLOCK_SELECTED = 'BlockSelected';
const DELETE_SELECTED_BLOCKS = 'DeleteSelectedBlocks';
const BLOCKS_MOVE_PREVIEW = 'BlocksMovePreview';
const BLOCKS_MOVED = 'BlocksMoved';
const UNDO_REQUEST = 'UndoRequest';
const REDO_REQUEST = 'RedoRequest';
const CLEAR_SELECTION = 'ClearSelection';

class EventManager {
  private isInitialized = false;
  private isDragging = false;
  private isDragPlacing = false;
  private isSpacePressed = false;
  private isCtrlPressed = false;
  private isShiftPressed = false;
  private isSelecting = false;
  private isDraggingBlocks = false;
  private selectionStartPosition: PointerPosition | null = null;
  private dragStartGridCell: { x: number; y: number } | null = null;
  private lastPointerPosition: PointerPosition = { x: 0, y: 0 };
  private lastProcessedGridCell: { x: number; y: number } | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  // Event handler references
  private wheelHandler: ((e: WheelEvent) => void);
  private mouseMoveHandler: ((e: MouseEvent) => void);
  private mouseDownHandler: ((e: MouseEvent) => void);
  private mouseUpHandler: ((e: MouseEvent) => void);
  private clickHandler: ((e: MouseEvent) => void);
  private resizeHandler: ((e: UIEvent) => void);
  private keyDownHandler: ((e: KeyboardEvent) => void);
  private keyUpHandler: ((e: KeyboardEvent) => void);

  constructor() {
    this.wheelHandler = this.handleWheel.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    this.clickHandler = this.handleClick.bind(this);
    this.resizeHandler = this.handleResize.bind(this);
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);

    window.addEventListener('wheel', this.wheelHandler, { passive: false });
    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
    window.addEventListener('click', this.clickHandler);
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);

    // Initialize viewport size
    this.updateViewportSize();
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    // Remove all event listeners from window
    window.removeEventListener('wheel', this.wheelHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('mousedown', this.mouseDownHandler);
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('click', this.clickHandler);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);

    this.isDragging = false;
    this.isDragPlacing = false;
    this.isSpacePressed = false;
    this.isCtrlPressed = false;
    this.isShiftPressed = false;
    this.isSelecting = false;
    this.isDraggingBlocks = false;
    this.selectionStartPosition = null;
    this.dragStartGridCell = null;
    this.lastProcessedGridCell = null;

    // Reset cursor
    document.body.style.cursor = '';

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Get pointer position relative to viewport
   */
  private getViewportPointerPosition(e: MouseEvent): PointerPosition {
    return {
      x: e.clientX,
      y: e.clientY,
    };
  }

  /**
   * Handle wheel events for zooming
   */
  private handleWheel(e: WheelEvent) {
    e.preventDefault();

    const state = useSimulationStore.getState();
    const pointer = this.getViewportPointerPosition(e);

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const currentTransform = {
      scale: state.grid.scale,
      x: state.grid.position.x,
      y: state.grid.position.y,
    };

    const newTransform = calculateZoomTransform(
      currentTransform,
      zoomFactor,
      pointer.x,
      pointer.y,
    );

    // Update grid transform in store
    state.updateGridTransform(newTransform);
  }

  /**
   * Handle mouse move events for panning, selection, block dragging, and cell highlighting
   */
  private handleMouseMove(e: MouseEvent) {
    const state = useSimulationStore.getState();
    const pointer = this.getViewportPointerPosition(e);

    // Handle selection when Ctrl is held and dragging
    if (this.isSelecting && this.isCtrlPressed && this.selectionStartPosition) {
      state.setSelectionRectangle({
        startX: this.selectionStartPosition.x,
        startY: this.selectionStartPosition.y,
        endX: pointer.x,
        endY: pointer.y,
      });
    }

    // Handle block dragging
    if (this.isDraggingBlocks && this.dragStartGridCell) {
      const currentGridCell = getGridCellFromScreen(
        pointer.x,
        pointer.y,
        state.grid,
        state.viewport
      );

      if (currentGridCell) {
        const offsetX = currentGridCell.x - this.dragStartGridCell.x;
        const offsetY = currentGridCell.y - this.dragStartGridCell.y;

        // Emit preview event
        const event = new CustomEvent(BLOCKS_MOVE_PREVIEW, {
          detail: { offsetX, offsetY }
        });
        window.dispatchEvent(event);
      }
    }

    // Handle panning when Space is held and dragging
    if (this.isDragging && this.isSpacePressed) {
      const deltaX = pointer.x - this.lastPointerPosition.x;
      const deltaY = pointer.y - this.lastPointerPosition.y;

      const currentTransform = {
        scale: state.grid.scale,
        x: state.grid.position.x,
        y: state.grid.position.y,
      };

      const newTransform = calculatePanTransform(currentTransform, deltaX, deltaY);
      state.updateGridTransform(newTransform);
    }

    // Handle drag placement - emit click event for each new grid cell entered
    if (this.isDragPlacing && !this.isSpacePressed && !this.isCtrlPressed) {
      const gridCell = getGridCellFromScreen(
        pointer.x,
        pointer.y,
        state.grid,
        state.viewport
      );

      // Only emit click event if we've moved to a different grid cell
      if (gridCell && (!this.lastProcessedGridCell ||
          this.lastProcessedGridCell.x !== gridCell.x ||
          this.lastProcessedGridCell.y !== gridCell.y)) {

        // Update last processed grid cell
        this.lastProcessedGridCell = { x: gridCell.x, y: gridCell.y };

        // Emit click event for this cell
        const event = new CustomEvent(BUILDING_BLOCK_CLICK, {
          detail: {
            x: pointer.x,
            y: pointer.y
          }
        });
        window.dispatchEvent(event);
      }
    }

    this.lastPointerPosition = pointer;

    // Calculate which grid cell is being hovered (but not during selection or dragging blocks)
    if (!this.isSelecting && !this.isDraggingBlocks) {
      const gridCell = getGridCellFromScreen(
        pointer.x,
        pointer.y,
        state.grid,
        state.viewport
      );

      // Debounce hover updates to prevent excessive state updates
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        state.updateHoveredCell(gridCell);
      }, 5); // ~60fps
    }
  }

  /**
   * Handle mouse down events
   */
  private handleMouseDown(e: MouseEvent) {
    const state = useSimulationStore.getState();
    const pointer = this.getViewportPointerPosition(e);
    const gridCell = getGridCellFromScreen(
      pointer.x,
      pointer.y,
      state.grid,
      state.viewport
    );

    if (this.isCtrlPressed) {
      // Start selection mode
      this.isSelecting = true;
      this.selectionStartPosition = pointer;
      this.updateCursor();
    } else if (this.isSpacePressed) {
      // Start panning mode
      this.isDragging = true;
      this.lastPointerPosition = pointer;
      this.updateCursor();
    } else if (gridCell) {
      // Check if clicking on an existing block
      const key = `${gridCell.x},${gridCell.y}`;
      const hasBlock = state.buildingBlocks.has(key);
      const isSelected = state.selectedBlocks.has(key);

      if (hasBlock) {
        // Clicking on a block - handle selection or start drag
        if (isSelected && !this.isShiftPressed) {
          // Start dragging selected blocks
          this.isDraggingBlocks = true;
          this.dragStartGridCell = { x: gridCell.x, y: gridCell.y };
          this.updateCursor();
        } else {
          // Emit block selected event
          const event = new CustomEvent(BLOCK_SELECTED, {
            detail: {
              gridX: gridCell.x,
              gridY: gridCell.y,
              isShift: this.isShiftPressed
            }
          });
          window.dispatchEvent(event);
        }
      } else {
        // Clicking on empty cell
        // Clear selection if there are selected blocks and not shift-clicking
        if (state.selectedBlocks.size > 0 && !this.isShiftPressed) {
          const event = new CustomEvent(CLEAR_SELECTION, { detail: {} });
          window.dispatchEvent(event);
        }

        // Start drag placement mode
        this.isDragPlacing = true;
        this.lastPointerPosition = pointer;
        this.lastProcessedGridCell = null;
      }
    }
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp() {
    const state = useSimulationStore.getState();

    if (this.isSelecting) {
      const selection = state.selectionRectangle;

      // Emit selection complete event if there was a valid selection
      if (selection && this.selectionStartPosition) {
        const event = new CustomEvent(SELECTION_COMPLETE, {
          detail: {
            startX: selection.startX,
            startY: selection.startY,
            endX: selection.endX,
            endY: selection.endY,
          }
        });
        window.dispatchEvent(event);
      }

      // Finalize selection
      this.isSelecting = false;
      this.selectionStartPosition = null;
      this.updateCursor();

      // Clear the selection rectangle
      state.setSelectionRectangle(null);
    }

    if (this.isDraggingBlocks && this.dragStartGridCell) {
      // Emit blocks moved event
      const pointer = this.getViewportPointerPosition({ clientX: this.lastPointerPosition.x, clientY: this.lastPointerPosition.y } as MouseEvent);
      const currentGridCell = getGridCellFromScreen(
        pointer.x,
        pointer.y,
        state.grid,
        state.viewport
      );

      if (currentGridCell) {
        const offsetX = currentGridCell.x - this.dragStartGridCell.x;
        const offsetY = currentGridCell.y - this.dragStartGridCell.y;

        // Only emit if there was actual movement
        if (offsetX !== 0 || offsetY !== 0) {
          const event = new CustomEvent(BLOCKS_MOVED, {
            detail: { offsetX, offsetY }
          });
          window.dispatchEvent(event);
        }
      }

      this.isDraggingBlocks = false;
      this.dragStartGridCell = null;
      this.updateCursor();
    }

    if (this.isDragPlacing) {
      // If no cell was processed during drag, this was a simple click
      if (this.lastProcessedGridCell === null) {
        const event = new CustomEvent(BUILDING_BLOCK_CLICK, {
          detail: {
            x: this.lastPointerPosition.x,
            y: this.lastPointerPosition.y
          }
        });
        window.dispatchEvent(event);
      }
      // Otherwise, cells were already clicked during the drag

      this.isDragPlacing = false;
      this.lastProcessedGridCell = null;
    }

    if (this.isDragging) {
      this.isDragging = false;
      this.updateCursor();
    }
  }

  /**
   * Handle click events - now handled in mouse up to distinguish from drag
   */
  private handleClick(_e: MouseEvent) {
    // Click events are now handled in mouse up to distinguish from drag
    // This method is kept for compatibility but does nothing
  }

  /**
   * Handle key down events
   */
  private handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space' && !this.isSpacePressed) {
      e.preventDefault(); // Prevent default space behavior (scrolling)
      this.isSpacePressed = true;
      this.updateCursor();
    }

    if ((e.code === 'ControlLeft' || e.code === 'ControlRight' || e.key === 'Control') && !this.isCtrlPressed) {
      this.isCtrlPressed = true;
      this.updateCursor();
    }

    if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') && !this.isShiftPressed) {
      this.isShiftPressed = true;
      this.updateCursor();
    }

    // Handle delete/backspace
    if (e.code === 'Backspace' || e.code === 'Delete') {
      e.preventDefault(); // Prevent browser back navigation
      const event = new CustomEvent(DELETE_SELECTED_BLOCKS, { detail: {} });
      window.dispatchEvent(event);
    }

    // Handle undo (Ctrl+Z)
    if (this.isCtrlPressed && e.code === 'KeyZ' && !e.shiftKey) {
      e.preventDefault();
      const event = new CustomEvent(UNDO_REQUEST, { detail: {} });
      window.dispatchEvent(event);
    }

    // Handle redo (Ctrl+Shift+Z or Ctrl+Y)
    if (this.isCtrlPressed && ((e.code === 'KeyZ' && e.shiftKey) || e.code === 'KeyY')) {
      e.preventDefault();
      const event = new CustomEvent(REDO_REQUEST, { detail: {} });
      window.dispatchEvent(event);
    }

    // Handle ESC to clear selection
    if (e.code === 'Escape') {
      e.preventDefault();
      const event = new CustomEvent(CLEAR_SELECTION, { detail: {} });
      window.dispatchEvent(event);
    }
  }

  /**
   * Handle key up events
   */
  private handleKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space') {
      this.isSpacePressed = false;
      this.updateCursor();
    }

    if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.key === 'Control') {
      this.isCtrlPressed = false;

      // If we were selecting, end the selection
      if (this.isSelecting) {
        this.isSelecting = false;
        this.selectionStartPosition = null;
        const state = useSimulationStore.getState();
        state.setSelectionRectangle(null);
      }

      this.updateCursor();
    }

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
      this.isShiftPressed = false;
      this.updateCursor();
    }
  }

  /**
   * Update cursor based on current state
   */
  private updateCursor() {
    if (this.isDraggingBlocks) {
      document.body.style.cursor = 'move';
    } else if (this.isSpacePressed && this.isDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (this.isSpacePressed) {
      document.body.style.cursor = 'grab';
    } else if (this.isCtrlPressed) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }
  }

  /**
   * Handle window resize events
   */
  private handleResize() {
    this.updateViewportSize();
  }

  /**
   * Update viewport size in the store
   */
  private updateViewportSize() {
    const state = useSimulationStore.getState();
    state.setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    state.setDevicePixelRatio(window.devicePixelRatio);
  }

  /**
   * Get current pointer position relative to viewport
   */
  getPointerPosition(e: MouseEvent): PointerPosition {
    return this.getViewportPointerPosition(e);
  }

  /**
   * Check if the event manager is initialized
   */
  get initialized() {
    return this.isInitialized;
  }

  /**
   * Check if currently dragging
   */
  get dragging() {
    return this.isDragging;
  }
}

export const installEventHandling = () => {
  const eventManager = new EventManager();
  return () => eventManager.cleanup();
};

/**
 * Generic helper to create event listener registration functions with typed detail payload
 */
function createEventListenerWithDetail<TDetail, TArgs extends unknown[]>(
  eventName: string,
  extractArgs: (detail: TDetail) => TArgs
): (handler: (...args: TArgs) => void) => () => void {
  return (handler: (...args: TArgs) => void) => {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<TDetail>;
      handler(...extractArgs(customEvent.detail));
    };

    window.addEventListener(eventName, listener);

    return () => {
      window.removeEventListener(eventName, listener);
    };
  };
}

/**
 * Generic helper to create event listener registration functions without payload
 */
function createEventListener(
  eventName: string
): (handler: () => void) => () => void {
  return (handler: () => void) => {
    const listener = () => {
      handler();
    };

    window.addEventListener(eventName, listener);

    return () => {
      window.removeEventListener(eventName, listener);
    };
  };
}

/**
 * Add a listener for building block click events
 * @param handler - Callback function to handle clicks with screen coordinates
 * @returns Cleanup function to remove the listener
 */
export const addBuildingBlockClickListener = createEventListenerWithDetail<
  { x: number; y: number },
  [number, number]
>(BUILDING_BLOCK_CLICK, (detail) => [detail.x, detail.y]);

/**
 * Add a listener for selection complete events
 * @param handler - Callback function to handle selection completion with screen coordinates
 * @returns Cleanup function to remove the listener
 */
export const addSelectionCompleteListener = createEventListenerWithDetail<
  { startX: number; startY: number; endX: number; endY: number },
  [number, number, number, number]
>(SELECTION_COMPLETE, (detail) => [detail.startX, detail.startY, detail.endX, detail.endY]);

/**
 * Add a listener for block selected events
 * @param handler - Callback function to handle block selection
 * @returns Cleanup function to remove the listener
 */
export const addBlockSelectedListener = createEventListenerWithDetail<
  { gridX: number; gridY: number; isShift: boolean },
  [number, number, boolean]
>(BLOCK_SELECTED, (detail) => [detail.gridX, detail.gridY, detail.isShift]);

/**
 * Add a listener for delete selected blocks events
 * @param handler - Callback function to handle delete request
 * @returns Cleanup function to remove the listener
 */
export const addDeleteSelectedBlocksListener = createEventListener(DELETE_SELECTED_BLOCKS);

/**
 * Add a listener for blocks move preview events
 * @param handler - Callback function to handle move preview
 * @returns Cleanup function to remove the listener
 */
export const addBlocksMovePreviewListener = createEventListenerWithDetail<
  { offsetX: number; offsetY: number },
  [number, number]
>(BLOCKS_MOVE_PREVIEW, (detail) => [detail.offsetX, detail.offsetY]);

/**
 * Add a listener for blocks moved events
 * @param handler - Callback function to handle completed move
 * @returns Cleanup function to remove the listener
 */
export const addBlocksMovedListener = createEventListenerWithDetail<
  { offsetX: number; offsetY: number },
  [number, number]
>(BLOCKS_MOVED, (detail) => [detail.offsetX, detail.offsetY]);

/**
 * Add a listener for undo request events
 * @param handler - Callback function to handle undo request
 * @returns Cleanup function to remove the listener
 */
export const addUndoRequestListener = createEventListener(UNDO_REQUEST);

/**
 * Add a listener for redo request events
 * @param handler - Callback function to handle redo request
 * @returns Cleanup function to remove the listener
 */
export const addRedoRequestListener = createEventListener(REDO_REQUEST);

/**
 * Add a listener for clear selection events
 * @param handler - Callback function to handle clear selection request
 * @returns Cleanup function to remove the listener
 */
export const addClearSelectionListener = createEventListener(CLEAR_SELECTION);

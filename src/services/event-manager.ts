import { useSimulationStore } from '@/store/simulation-store';
import {
  getGridCellFromScreen,
  calculateZoomTransform,
  calculatePanTransform,
  screenToGrid
} from '@/utils/coordinate-conversion';
import type { PointerPosition } from '@/types/simulation-state';
import { useEffect, useCallback } from 'react';
import type { BuildingBlock } from '@/types/building-blocks';

// Event constants
const BUILDING_BLOCK_CLICK = 'BuildingBlockClick';

interface BuildingBlockClickEvent extends CustomEvent {
  detail: {
    x: number;
    y: number;
  };
}
class EventManager {
  private isInitialized = false;
  private isDragging = false;
  private isDragPlacing = false;
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

  constructor() {
    this.wheelHandler = this.handleWheel.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    this.clickHandler = this.handleClick.bind(this);
    this.resizeHandler = this.handleResize.bind(this);

    window.addEventListener('wheel', this.wheelHandler, { passive: false });
    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
    window.addEventListener('click', this.clickHandler);
    window.addEventListener('resize', this.resizeHandler);

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

    this.isDragging = false;
    this.isDragPlacing = false;
    this.lastProcessedGridCell = null;

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
   * Handle mouse move events for panning and cell highlighting
   */
  private handleMouseMove(e: MouseEvent) {
    const state = useSimulationStore.getState();
    const pointer = this.getViewportPointerPosition(e);

    // Handle panning when Ctrl is held and dragging
    if (this.isDragging && e.ctrlKey) {
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
    if (this.isDragPlacing && !e.ctrlKey) {
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

    // Calculate which grid cell is being hovered
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

  /**
   * Handle mouse down events
   */
  private handleMouseDown(e: MouseEvent) {
    if (e.ctrlKey) {
      this.isDragging = true;
      const pointer = this.getViewportPointerPosition(e);
      this.lastPointerPosition = pointer;
    } else {
      // Start drag placement mode
      this.isDragPlacing = true;
      const pointer = this.getViewportPointerPosition(e);
      this.lastPointerPosition = pointer;
      this.lastProcessedGridCell = null;
    }
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp() {
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
    this.isDragging = false;
  }

  /**
   * Handle click events - now handled in mouse up to distinguish from drag
   */
  private handleClick(_e: MouseEvent) {
    // Click events are now handled in mouse up to distinguish from drag
    // This method is kept for compatibility but does nothing
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
 * Custom hook for handling building block click events
 * @param selectedBlock - The currently selected building block
 * @param onCellClick - Callback function to handle cell clicks
 */
export const useBuildingBlockClick = (
  selectedBlock: BuildingBlock | null,
  onCellClick: (gridX: number, gridY: number) => void
) => {
  const { grid, viewport } = useSimulationStore();

  const handleBuildingBlockClick = useCallback((e: BuildingBlockClickEvent) => {
    if (!selectedBlock) return;

    const { x: screenX, y: screenY } = e.detail;

    // Convert screen coordinates to grid coordinates
    const { x: gridX, y: gridY } = screenToGrid(
      screenX,
      screenY,
      grid,
      viewport
    );

    onCellClick(gridX, gridY);
  }, [selectedBlock, grid, viewport, onCellClick]);

  useEffect(() => {
    window.addEventListener(BUILDING_BLOCK_CLICK, handleBuildingBlockClick as EventListener);

    return () => {
      window.removeEventListener(BUILDING_BLOCK_CLICK, handleBuildingBlockClick as EventListener);
    };
  }, [handleBuildingBlockClick]);
};

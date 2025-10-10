import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GridState, ViewportState, SelectedQuadrant, SimulationState, GridCell, GridTransform, SelectionRectangle } from '@/types/simulation-state';
import type { PlacedBuildingBlock } from '@/types/building-blocks';
import type { Operation, HistoryState } from '@/types/history';
import { OperationType, MAX_HISTORY_SIZE } from '@/types/history';

interface SimulationStore extends SimulationState {
  // History state
  history: HistoryState;

  // Grid actions
  setGridSize: (size: number) => void;
  setGridScale: (scale: number) => void;
  setGridPosition: (position: { x: number; y: number }) => void;
  setGridResolution: (resolution: number) => void;
  setShowGridLines: (show: boolean) => void;
  updateGridTransform: (transform: GridTransform) => void;

  // Viewport actions
  setViewportSize: (size: { width: number; height: number }) => void;
  setDevicePixelRatio: (ratio: number) => void;

  // Selection actions
  setSelectedQuadrant: (quadrant: SelectedQuadrant | null) => void;
  updateHoveredCell: (cell: GridCell | null) => void;
  setSelectionRectangle: (selection: SelectionRectangle | null) => void;

  // Block selection actions
  selectBlock: (gridX: number, gridY: number) => void;
  deselectBlock: (gridX: number, gridY: number) => void;
  clearSelection: () => void;
  setSelectedBlocks: (blocks: Set<string>) => void;
  toggleBlockSelection: (gridX: number, gridY: number) => void;

  // Simulation actions
  setSimulationRunning: (running: boolean) => void;
  setSimulationSpeed: (speed: number) => void;

  // Building blocks actions
  addBuildingBlock: (block: PlacedBuildingBlock, recordHistory?: boolean) => void;
  removeBuildingBlock: (gridX: number, gridY: number) => void;
  getBuildingBlock: (gridX: number, gridY: number) => PlacedBuildingBlock | undefined;
  updateStreetConnections: (gridX: number, gridY: number) => void;
  moveBuildingBlocks: (blocks: Array<{ from: { gridX: number; gridY: number }; to: { gridX: number; gridY: number } }>) => void;

  // History actions
  pushOperation: (operation: Operation) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Combined actions
  resetGrid: () => void;
  resetSimulation: () => void;
}

const initialGridState: GridState = {
  size: 50,
  scale: 1,
  position: { x: 0, y: 0 },
  showGridLines: false,
};

const initialViewportState: ViewportState = {
  width: 0,
  height: 0,
  devicePixelRatio: 1,
};

const initialSimulationState: SimulationState = {
  grid: initialGridState,
  viewport: initialViewportState,
  selectedQuadrant: null,
  selectionRectangle: null,
  isSimulationRunning: false,
  simulationSpeed: 1,
  buildingBlocks: new Map(),
  selectedBlocks: new Set(),
};

const initialHistoryState: HistoryState = {
  operations: [],
  currentIndex: -1,
};

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      ...initialSimulationState,
      history: initialHistoryState,

      // Grid actions
      setGridSize: (size: number) =>
        set((state) => ({
          grid: { ...state.grid, size },
        })),

      setGridScale: (scale: number) =>
        set((state) => ({
          grid: { ...state.grid, scale },
        })),

      setGridPosition: (position: { x: number; y: number }) =>
        set((state) => ({
          grid: { ...state.grid, position },
        })),

      setGridResolution: (resolution: number) =>
        set((state) => ({
          grid: { ...state.grid, resolution },
        })),

      setShowGridLines: (show: boolean) =>
        set((state) => ({
          grid: { ...state.grid, showGridLines: show },
        })),

      updateGridTransform: (transform: GridTransform) =>
        set((state) => ({
          grid: {
            ...state.grid,
            scale: transform.scale,
            position: { x: transform.x, y: transform.y },
          },
        })),

      // Viewport actions
      setViewportSize: (size: { width: number; height: number }) =>
        set((state) => ({
          viewport: { ...state.viewport, ...size },
        })),

      setDevicePixelRatio: (ratio: number) =>
        set((state) => ({
          viewport: { ...state.viewport, devicePixelRatio: ratio },
        })),

      // Selection actions
      setSelectedQuadrant: (quadrant: SelectedQuadrant | null) =>
        set({ selectedQuadrant: quadrant }),

      updateHoveredCell: (cell: GridCell | null) =>
        set(() => ({
          selectedQuadrant: cell ? {
            x: cell.x,
            y: cell.y,
            size: cell.size,
            isActive: true,
          } : null,
        })),

      setSelectionRectangle: (selection: SelectionRectangle | null) =>
        set({ selectionRectangle: selection }),

      // Block selection actions
      selectBlock: (gridX: number, gridY: number) =>
        set((state) => {
          const key = `${gridX},${gridY}`;
          const newSet = new Set(state.selectedBlocks);
          newSet.add(key);
          return { selectedBlocks: newSet };
        }),

      deselectBlock: (gridX: number, gridY: number) =>
        set((state) => {
          const key = `${gridX},${gridY}`;
          const newSet = new Set(state.selectedBlocks);
          newSet.delete(key);
          return { selectedBlocks: newSet };
        }),

      clearSelection: () =>
        set({ selectedBlocks: new Set() }),

      setSelectedBlocks: (blocks: Set<string>) =>
        set({ selectedBlocks: new Set(blocks) }),

      toggleBlockSelection: (gridX: number, gridY: number) =>
        set((state) => {
          const key = `${gridX},${gridY}`;
          const newSet = new Set(state.selectedBlocks);
          if (newSet.has(key)) {
            newSet.delete(key);
          } else {
            newSet.add(key);
          }
          return { selectedBlocks: newSet };
        }),

      // Simulation actions
      setSimulationRunning: (running: boolean) =>
        set({ isSimulationRunning: running }),

      setSimulationSpeed: (speed: number) =>
        set({ simulationSpeed: speed }),

      // Building blocks actions
      addBuildingBlock: (block: PlacedBuildingBlock, recordHistory = true) =>
        set((state) => {
          const key = `${block.gridX},${block.gridY}`;
          const newMap = new Map(state.buildingBlocks);
          newMap.set(key, block);

          // Record history if requested
          if (recordHistory) {
            get().pushOperation({
              type: OperationType.PLACE,
              blocks: [block],
            });
          }

          return { buildingBlocks: newMap };
        }),

      removeBuildingBlock: (gridX: number, gridY: number) =>
        set((state) => {
          const key = `${gridX},${gridY}`;
          const newMap = new Map(state.buildingBlocks);
          newMap.delete(key);
          return { buildingBlocks: newMap };
        }),

      getBuildingBlock: (gridX: number, gridY: number): PlacedBuildingBlock | undefined => {
        const key = `${gridX},${gridY}`;
        return useSimulationStore.getState().buildingBlocks.get(key);
      },

      updateStreetConnections: (gridX: number, gridY: number) =>
        set((state) => {
          // Import the function dynamically to avoid circular dependency
          const { updateStreetConnections } = require('@/utils/street-utils');
          const updatedMap = updateStreetConnections(gridX, gridY, state.buildingBlocks);
          return { buildingBlocks: updatedMap };
        }),

      moveBuildingBlocks: (blocks: Array<{ from: { gridX: number; gridY: number }; to: { gridX: number; gridY: number } }>) =>
        set((state) => {
          const newMap = new Map(state.buildingBlocks);
          const movedBlocks: PlacedBuildingBlock[] = [];
          const originalPositions: Array<{ gridX: number; gridY: number }> = [];
          const newPositions: Array<{ gridX: number; gridY: number }> = [];
          const blocksToMove: Array<{ block: PlacedBuildingBlock; from: string; to: string; toPos: { gridX: number; gridY: number } }> = [];

          // Phase 1: Collect all blocks to move and remove them from the map
          for (const { from, to } of blocks) {
            const fromKey = `${from.gridX},${from.gridY}`;
            const block = newMap.get(fromKey);

            if (block) {
              const toKey = `${to.gridX},${to.gridY}`;
              blocksToMove.push({
                block,
                from: fromKey,
                to: toKey,
                toPos: { gridX: to.gridX, gridY: to.gridY }
              });

              // Remove from old position immediately
              newMap.delete(fromKey);
            }
          }

          // Phase 2: Add all blocks to their new positions
          for (const { block, to, toPos } of blocksToMove) {
            const movedBlock = { ...block, gridX: toPos.gridX, gridY: toPos.gridY };
            newMap.set(to, movedBlock);

            movedBlocks.push(movedBlock);
            originalPositions.push({ gridX: block.gridX, gridY: block.gridY });
            newPositions.push({ gridX: toPos.gridX, gridY: toPos.gridY });
          }

          // Record history
          if (movedBlocks.length > 0) {
            get().pushOperation({
              type: OperationType.MOVE,
              blocks: movedBlocks,
              originalPositions,
              newPositions,
            });
          }

          return { buildingBlocks: newMap };
        }),

      // History actions
      pushOperation: (operation: Operation) =>
        set((state) => {
          const newHistory = { ...state.history };

          // Remove any operations after the current index (for redo)
          newHistory.operations = newHistory.operations.slice(0, newHistory.currentIndex + 1);

          // Add new operation
          newHistory.operations.push(operation);
          newHistory.currentIndex = newHistory.operations.length - 1;

          // Cap history size
          if (newHistory.operations.length > MAX_HISTORY_SIZE) {
            newHistory.operations = newHistory.operations.slice(-MAX_HISTORY_SIZE);
            newHistory.currentIndex = newHistory.operations.length - 1;
          }

          return { history: newHistory };
        }),

      undo: () => {
        const state = get();
        if (!state.canUndo()) return;

        const operation = state.history.operations[state.history.currentIndex];

        if (operation.type === OperationType.PLACE) {
          // Undo place: remove the blocks
          const newMap = new Map(state.buildingBlocks);
          for (const block of operation.blocks) {
            const key = `${block.gridX},${block.gridY}`;
            newMap.delete(key);
          }
          set({
            buildingBlocks: newMap,
            history: { ...state.history, currentIndex: state.history.currentIndex - 1 }
          });
        } else if (operation.type === OperationType.DELETE) {
          // Undo delete: restore the blocks
          const newMap = new Map(state.buildingBlocks);
          for (const block of operation.blocks) {
            const key = `${block.gridX},${block.gridY}`;
            newMap.set(key, block);
          }
          set({
            buildingBlocks: newMap,
            history: { ...state.history, currentIndex: state.history.currentIndex - 1 }
          });
        } else if (operation.type === OperationType.MOVE) {
          // Undo move: restore original positions
          const newMap = new Map(state.buildingBlocks);
          for (let i = 0; i < operation.blocks.length; i++) {
            const block = operation.blocks[i];
            const originalPos = operation.originalPositions[i];
            const newPos = operation.newPositions[i];

            // Remove from new position
            const newKey = `${newPos.gridX},${newPos.gridY}`;
            newMap.delete(newKey);

            // Restore to original position
            const restoredBlock = { ...block, gridX: originalPos.gridX, gridY: originalPos.gridY };
            const originalKey = `${originalPos.gridX},${originalPos.gridY}`;
            newMap.set(originalKey, restoredBlock);
          }
          set({
            buildingBlocks: newMap,
            history: { ...state.history, currentIndex: state.history.currentIndex - 1 }
          });
        }
      },

      redo: () => {
        const state = get();
        if (!state.canRedo()) return;

        const operation = state.history.operations[state.history.currentIndex + 1];

        if (operation.type === OperationType.PLACE) {
          // Redo place: add the blocks back
          const newMap = new Map(state.buildingBlocks);
          for (const block of operation.blocks) {
            const key = `${block.gridX},${block.gridY}`;
            newMap.set(key, block);
          }
          set({
            buildingBlocks: newMap,
            history: { ...state.history, currentIndex: state.history.currentIndex + 1 }
          });
        } else if (operation.type === OperationType.DELETE) {
          // Redo delete: remove the blocks again
          const newMap = new Map(state.buildingBlocks);
          for (const block of operation.blocks) {
            const key = `${block.gridX},${block.gridY}`;
            newMap.delete(key);
          }
          set({
            buildingBlocks: newMap,
            history: { ...state.history, currentIndex: state.history.currentIndex + 1 }
          });
        } else if (operation.type === OperationType.MOVE) {
          // Redo move: apply the move again
          const newMap = new Map(state.buildingBlocks);
          for (let i = 0; i < operation.blocks.length; i++) {
            const block = operation.blocks[i];
            const originalPos = operation.originalPositions[i];
            const newPos = operation.newPositions[i];

            // Remove from original position
            const originalKey = `${originalPos.gridX},${originalPos.gridY}`;
            newMap.delete(originalKey);

            // Move to new position
            const movedBlock = { ...block, gridX: newPos.gridX, gridY: newPos.gridY };
            const newKey = `${newPos.gridX},${newPos.gridY}`;
            newMap.set(newKey, movedBlock);
          }
          set({
            buildingBlocks: newMap,
            history: { ...state.history, currentIndex: state.history.currentIndex + 1 }
          });
        }
      },

      canUndo: () => {
        const state = get();
        return state.history.currentIndex >= 0;
      },

      canRedo: () => {
        const state = get();
        return state.history.currentIndex < state.history.operations.length - 1;
      },

      // Combined actions
      resetGrid: () =>
        set(() => ({
          grid: initialGridState,
          selectedQuadrant: null,
        })),

      resetSimulation: () =>
        set(() => ({
          isSimulationRunning: false,
          simulationSpeed: 1,
          buildingBlocks: new Map(),
          selectedBlocks: new Set(),
          history: initialHistoryState,
        })),
    }),
    {
      name: 'simulation-store',
      // Only persist grid and simulation settings, not viewport or selection state
      partialize: (state) => ({
        grid: {
          size: state.grid.size,
          scale: state.grid.scale,
          position: state.grid.position,
          showGridLines: state.grid.showGridLines,
        },
        isSimulationRunning: state.isSimulationRunning,
        simulationSpeed: state.simulationSpeed,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GridState, ViewportState, SelectedQuadrant, SimulationState, GridCell, GridTransform, SelectionRectangle } from '@/types/simulation-state';
import type { PlacedBuildingBlock } from '@/types/building-blocks';

interface SimulationStore extends SimulationState {
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

  // Simulation actions
  setSimulationRunning: (running: boolean) => void;
  setSimulationSpeed: (speed: number) => void;

  // Building blocks actions
  addBuildingBlock: (block: PlacedBuildingBlock) => void;
  removeBuildingBlock: (gridX: number, gridY: number) => void;
  getBuildingBlock: (gridX: number, gridY: number) => PlacedBuildingBlock | undefined;
  updateStreetConnections: (gridX: number, gridY: number) => void;

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
};

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set) => ({
      ...initialSimulationState,

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

      // Simulation actions
      setSimulationRunning: (running: boolean) =>
        set({ isSimulationRunning: running }),

      setSimulationSpeed: (speed: number) =>
        set({ simulationSpeed: speed }),

      // Building blocks actions
      addBuildingBlock: (block: PlacedBuildingBlock) =>
        set((state) => {
          const key = `${block.gridX},${block.gridY}`;
          const newMap = new Map(state.buildingBlocks);
          newMap.set(key, block);
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

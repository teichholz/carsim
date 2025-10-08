import type { PlacedBuildingBlock } from './building-blocks';

export interface GridState {
  /**
   * The size of one quadrant (square)
   */
  size: number;
  /**
   * The scale of the grid
   */
  scale: number;
  /**
   * The position of the grid
   */
  position: { x: number; y: number };
  /**
   * Whether to show the grid lines
   */
  showGridLines: boolean;
}

export interface ViewportState {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface SelectedQuadrant {
  x: number;
  y: number;
  size: number;
  isActive: boolean;
}

export interface SimulationState {
  grid: GridState;
  viewport: ViewportState;
  selectedQuadrant: SelectedQuadrant | null;
  selectionRectangle: SelectionRectangle | null;
  isSimulationRunning: boolean;
  simulationSpeed: number;
  buildingBlocks: Map<string, PlacedBuildingBlock>;
}

export interface GridCell {
  x: number;
  y: number;
  size: number;
}

export interface PointerPosition {
  x: number;
  y: number;
}

export interface GridTransform {
  scale: number;
  x: number;
  y: number;
}

export interface SelectionRectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

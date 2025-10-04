export interface GridState {
  size: number;
  scale: number;
  resolution: number;
  position: { x: number; y: number };
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
  isSimulationRunning: boolean;
  simulationSpeed: number;
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

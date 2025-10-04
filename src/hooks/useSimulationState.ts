import { useSimulationStore } from '@/store/simulation-store';

// Grid state hook
export const useGridState = () => {
  const grid = useSimulationStore((state) => state.grid);
  const setGridSize = useSimulationStore((state) => state.setGridSize);
  const setGridScale = useSimulationStore((state) => state.setGridScale);
  const setGridPosition = useSimulationStore((state) => state.setGridPosition);
  const setGridResolution = useSimulationStore((state) => state.setGridResolution);
  const setShowGridLines = useSimulationStore((state) => state.setShowGridLines);
  const updateGridTransform = useSimulationStore((state) => state.updateGridTransform);
  const resetGrid = useSimulationStore((state) => state.resetGrid);

  return {
    grid,
    setGridSize,
    setGridScale,
    setGridPosition,
    setGridResolution,
    setShowGridLines,
    updateGridTransform,
    resetGrid,
  };
};

// Viewport state hook
export const useViewportState = () => {
  const viewport = useSimulationStore((state) => state.viewport);
  const setViewportSize = useSimulationStore((state) => state.setViewportSize);
  const setDevicePixelRatio = useSimulationStore((state) => state.setDevicePixelRatio);

  return {
    viewport,
    setViewportSize,
    setDevicePixelRatio,
  };
};

// Selected quadrant hook
export const useSelectedQuadrant = () => {
  const selectedQuadrant = useSimulationStore((state) => state.selectedQuadrant);
  const setSelectedQuadrant = useSimulationStore((state) => state.setSelectedQuadrant);
  const updateHoveredCell = useSimulationStore((state) => state.updateHoveredCell);

  return {
    selectedQuadrant,
    setSelectedQuadrant,
    updateHoveredCell,
  };
};

// Simulation state hook
export const useSimulationState = () => {
  const isSimulationRunning = useSimulationStore((state) => state.isSimulationRunning);
  const simulationSpeed = useSimulationStore((state) => state.simulationSpeed);
  const setSimulationRunning = useSimulationStore((state) => state.setSimulationRunning);
  const setSimulationSpeed = useSimulationStore((state) => state.setSimulationSpeed);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);

  return {
    isSimulationRunning,
    simulationSpeed,
    setSimulationRunning,
    setSimulationSpeed,
    resetSimulation,
  };
};

// Combined state access hook
export const useAllSimulationState = () => {
  const grid = useSimulationStore((state) => state.grid);
  const viewport = useSimulationStore((state) => state.viewport);
  const selectedQuadrant = useSimulationStore((state) => state.selectedQuadrant);
  const isSimulationRunning = useSimulationStore((state) => state.isSimulationRunning);
  const simulationSpeed = useSimulationStore((state) => state.simulationSpeed);

  return {
    grid,
    viewport,
    selectedQuadrant,
    isSimulationRunning,
    simulationSpeed,
  };
};

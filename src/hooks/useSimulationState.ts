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

export const useBuildingBlocksState = () => {
  const buildingBlocks = useSimulationStore((state) => state.buildingBlocks);
  const addBuildingBlock = useSimulationStore((state) => state.addBuildingBlock);
  const removeBuildingBlock = useSimulationStore((state) => state.removeBuildingBlock);
  const getBuildingBlock = useSimulationStore((state) => state.getBuildingBlock);

  return {
    buildingBlocks,
    addBuildingBlock,
    removeBuildingBlock,
    getBuildingBlock,
  };
};

// Block selection state hook
export const useBlockSelectionState = () => {
  const selectedBlocks = useSimulationStore((state) => state.selectedBlocks);
  const selectBlock = useSimulationStore((state) => state.selectBlock);
  const deselectBlock = useSimulationStore((state) => state.deselectBlock);
  const clearSelection = useSimulationStore((state) => state.clearSelection);
  const setSelectedBlocks = useSimulationStore((state) => state.setSelectedBlocks);
  const toggleBlockSelection = useSimulationStore((state) => state.toggleBlockSelection);

  return {
    selectedBlocks,
    selectBlock,
    deselectBlock,
    clearSelection,
    setSelectedBlocks,
    toggleBlockSelection,
  };
};

// History state hook
export const useHistoryState = () => {
  const history = useSimulationStore((state) => state.history);
  const pushOperation = useSimulationStore((state) => state.pushOperation);
  const undo = useSimulationStore((state) => state.undo);
  const redo = useSimulationStore((state) => state.redo);
  const canUndo = useSimulationStore((state) => state.canUndo);
  const canRedo = useSimulationStore((state) => state.canRedo);

  return {
    history,
    pushOperation,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
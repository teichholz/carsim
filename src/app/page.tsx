"use client";

import EquilateralGrid from "@/components/EquilateralGrid";
import FloatingPanel from "@/components/FloatingPanel";
import Inventory from "@/components/Inventory";
import { useGridState, useViewportState, useSimulationState } from "@/hooks/useSimulationState";
import { useEffect, useState } from "react";
import type { BuildingBlock } from "@/types/building-blocks";
import { installEventHandling } from "@/services/event-manager";

export default function Home() {
  // Get state from global store
  const { grid, setGridSize, setShowGridLines } = useGridState();
  const { viewport, setViewportSize } = useViewportState();
  const { isSimulationRunning, simulationSpeed, setSimulationRunning, setSimulationSpeed } = useSimulationState();

  // Local state for building block selection
  const [selectedBlock, setSelectedBlock] = useState<BuildingBlock | null>(null);

  useEffect(() => {
    installEventHandling();
  }, []);

  // Update viewport size on mount and resize
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, [setViewportSize]);

  // Don't render until viewport size is available
  if (viewport.width === 0 || viewport.height === 0) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* Fullscreen Grid */}
      <EquilateralGrid
        width={viewport.width}
        height={viewport.height}
        cellSize={grid.size}
        showGridLines={grid.showGridLines}
      />

      {/* Building Blocks Inventory */}
      <Inventory
        onBlockSelect={setSelectedBlock}
        selectedBlock={selectedBlock}
      />

      {/* Floating Grid Controls Panel */}
      <FloatingPanel
        title="Grid Controls"
        initialPosition={{ x: 20, y: 200 }}
        className="min-w-[280px]"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="gridSizeSlider"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cell Size: {grid.size}px
            </label>
            <input
              id="gridSizeSlider"
              type="range"
              min="20"
              max="100"
              value={grid.size}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Adjust cell size with slider</div>
            <div>• Grid scales with cell size</div>
            <div>• Maintains equilateral properties</div>
          </div>

          {/* Grid Lines Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="gridLinesToggle"
              className="text-sm font-medium text-gray-700"
            >
              Show Grid Lines
            </label>
            <button
              id="gridLinesToggle"
              type="button"
              onClick={() => setShowGridLines(!grid.showGridLines)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                grid.showGridLines ? "bg-blue-600" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={grid.showGridLines}
              aria-label="Toggle grid lines visibility"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  grid.showGridLines ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Simulation Controls */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Simulation
              </span>
              <button
                type="button"
                onClick={() => setSimulationRunning(!isSimulationRunning)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isSimulationRunning
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isSimulationRunning ? "Stop" : "Start"}
              </button>
            </div>
            <div>
              <label htmlFor="simulationSpeed" className="block text-xs text-gray-600 mb-1">
                Speed: {simulationSpeed}x
              </label>
              <input
                id="simulationSpeed"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Debug Info */}
          <div className="text-xs text-gray-500 space-y-1 pt-3">
            <div>Grid Size: {grid.size}px</div>
            <div>Grid Scale: {grid.scale.toFixed(2)}x</div>
            <div>
              Viewport: {viewport.width}×{viewport.height}
            </div>
            <div>Grid Lines: {grid.showGridLines ? "Enabled" : "Disabled"}</div>
            <div>Selected Block: {selectedBlock?.name || "None"}</div>
            <div>Simulation: {isSimulationRunning ? "Running" : "Stopped"}</div>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}

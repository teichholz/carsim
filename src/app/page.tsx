"use client";

import EquilateralGrid from "@/components/EquilateralGrid";
import HighlightedCell from "@/components/HighlightedCell";
import FloatingPanel from "@/components/FloatingPanel";
import Inventory from "@/components/Inventory";
import BuildingBlocksLayer from "@/components/building-blocks/BuildingBlocksLayer";
import {
  useGridState,
  useViewportState,
  useSimulationState,
  useSelectedQuadrant,
} from "@/hooks/useSimulationState";
import { Application, extend } from "@pixi/react";
import { Container, Assets } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import type { BuildingBlock } from "@/types/building-blocks";
import { BuildingBlockType } from "@/types/building-blocks";
import {
  installEventHandling,
  addBuildingBlockClickListener,
} from "@/services/event-manager";
import { useSimulationStore } from "@/store/simulation-store";
import { createStreetBlock } from "@/utils/street-utils";
import { screenToGrid } from "@/utils/coordinate-conversion";

// Extend PIXI components to make them available as JSX
extend({ Container });

export default function Home() {
  // Get state from global store
  const { grid, setGridSize, setShowGridLines } = useGridState();
  const { viewport } = useViewportState();
  const {
    isSimulationRunning,
    simulationSpeed,
    setSimulationRunning,
    setSimulationSpeed,
  } = useSimulationState();
  const { selectedQuadrant } = useSelectedQuadrant();
  const { addBuildingBlock, buildingBlocks, updateStreetConnections } =
    useSimulationStore();

  // Local state for building block selection
  const [selectedBlock, setSelectedBlock] = useState<BuildingBlock | null>(
    null,
  );

  // Local state for asset loading
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Preload sprite assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Add assets to the cache
        Assets.add({ alias: 'linear-street', src: '/sprites/Linear Street.png' });
        Assets.add({ alias: 'curved-street', src: '/sprites/Curved Street.png' });

        // Load the assets
        await Assets.load(['linear-street', 'curved-street']);

        setAssetsLoaded(true);
      } catch (error) {
        console.error('Failed to load sprite assets:', error);
        // Set as loaded anyway to prevent infinite loading
        setAssetsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  // Handle building block placement
  const handleCellClick = useCallback(
    (gridX: number, gridY: number) => {
      if (!selectedBlock) return;

      // Check if there's already a building block at this position
      const key = `${gridX},${gridY}`;
      if (buildingBlocks.has(key)) {
        // Remove existing block
        useSimulationStore.getState().removeBuildingBlock(gridX, gridY);

        // Update connections for surrounding streets that might have lost a connection
        updateStreetConnections(gridX, gridY);
        return;
      }

      // Create new building block based on type
      if (selectedBlock.type === BuildingBlockType.STREET) {
        const streetBlock = createStreetBlock(
          `street-${Date.now()}`,
          gridX,
          gridY,
          buildingBlocks,
        );
        addBuildingBlock(streetBlock);

        // Update connections for existing streets that might now be connected
        updateStreetConnections(gridX, gridY);
      }
    },
    [selectedBlock, buildingBlocks, addBuildingBlock, updateStreetConnections],
  );

  // Install event handling once on mount
  useEffect(installEventHandling, []);

  // Handle building block placement clicks
  useEffect(() => {
    const cleanup = addBuildingBlockClickListener((screenX, screenY) => {
      if (!selectedBlock) return;

      // Convert screen coordinates to grid coordinates
      const { x: gridX, y: gridY } = screenToGrid(
        screenX,
        screenY,
        grid,
        viewport
      );

      handleCellClick(gridX, gridY);
    });

    return cleanup;
  }, [selectedBlock, grid, viewport, handleCellClick]);

  // Viewport size is now handled by the event manager

  // Don't render until viewport size is available and assets are loaded
  if (viewport.width === 0 || viewport.height === 0 || !assetsLoaded) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* Fullscreen Grid */}
      <div className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Application
          width={viewport.width}
          height={viewport.height}
          background={0xffffff}
          antialias={true}
        >
          {/* Main container with transform */}
          <pixiContainer
            x={grid.position.x}
            y={grid.position.y}
            scale={grid.scale}
          >
            {/* Grid lines layer */}
            {grid.showGridLines && (
              <EquilateralGrid
                width={viewport.width}
                height={viewport.height}
                cellSize={grid.size}
              />
            )}

            {/* Highlighted grid layer */}
            <HighlightedCell cellSize={grid.size} />

            {/* Building blocks layer */}
            <BuildingBlocksLayer cellSize={grid.size} />
          </pixiContainer>
        </Application>

        {/* Grid info overlay */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
          <div>Scale: {grid.scale.toFixed(2)}x</div>
          <div>
            Position: ({Math.round(grid.position.x)},{" "}
            {Math.round(grid.position.y)})
          </div>
          {selectedQuadrant && (
            <div>
              Cell: ({selectedQuadrant.x}, {selectedQuadrant.y})
            </div>
          )}
          <div className="text-xs mt-1 opacity-75">
            Ctrl + Drag to pan • Scroll to zoom
          </div>
        </div>
      </div>

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
              <label
                htmlFor="simulationSpeed"
                className="block text-xs text-gray-600 mb-1"
              >
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

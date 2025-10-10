"use client";

import EquilateralGrid from "@/components/EquilateralGrid";
import HighlightedCell from "@/components/HighlightedCell";
import FloatingPanel from "@/components/FloatingPanel";
import Inventory from "@/components/Inventory";
import BuildingBlocksLayer from "@/components/building-blocks/BuildingBlocksLayer";
import SelectionRectangle from "@/components/SelectionRectangle";
import SelectedBlocksLayer from "@/components/SelectedBlocksLayer";
import MovePreviewLayer from "@/components/MovePreviewLayer";
import ContextMenu, { type SettingConfig } from "@/components/ContextMenu";
import {
  useGridState,
  useViewportState,
  useSimulationState,
  useSelectedQuadrant,
} from "@/hooks/useSimulationState";
import { Application, extend } from "@pixi/react";
import { Container, Assets } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import type { BuildingBlock, CarGeneratorBlock } from "@/types/building-blocks";
import { BuildingBlockType } from "@/types/building-blocks";
import {
  installEventHandling,
  addBuildingBlockClickListener,
  addSelectionCompleteListener,
  addBlockSelectedListener,
  addDeleteSelectedBlocksListener,
  addBlocksMovedListener,
  addUndoRequestListener,
  addRedoRequestListener,
  addClearSelectionListener,
} from "@/services/event-manager";
import { useSimulationStore } from "@/store/simulation-store";
import { createStreetBlock } from "@/utils/street-utils";
import { createCarGeneratorBlock, canPlaceCarGenerator } from "@/utils/car-generator-utils";
import { screenToGrid } from "@/utils/coordinate-conversion";
import { initializeECSWorld, updateECS, createCarGeneratorEntity, removeCarGeneratorEntity } from "@/ecs/world";

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

  // Local state for context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    block: CarGeneratorBlock;
  } | null>(null);

  // Preload sprite assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Add assets to the cache
        Assets.add({ alias: 'linear-street', src: '/sprites/Linear Street.png' });
        Assets.add({ alias: 'curved-street', src: '/sprites/Curved Street.png' });
        Assets.add({ alias: 'car-gen-n', src: '/sprites/Car Gen N.png' });
        Assets.add({ alias: 'car-gen-s', src: '/sprites/Car Gen S.png' });
        Assets.add({ alias: 'car-gen-e', src: '/sprites/Car Gen E.png' });
        Assets.add({ alias: 'car-gen-w', src: '/sprites/Car Gen W.png' });

        // Load the assets
        await Assets.load([
          'linear-street',
          'curved-street',
          'car-gen-n',
          'car-gen-s',
          'car-gen-e',
          'car-gen-w',
        ]);

        setAssetsLoaded(true);
      } catch (error) {
        console.error('Failed to load sprite assets:', error);
        // Set as loaded anyway to prevent infinite loading
        setAssetsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  // Initialize ECS world once
  useEffect(() => {
    initializeECSWorld();
  }, []);

  // Handle building block placement
  const handleCellClick = useCallback(
    (gridX: number, gridY: number, _isDrag: boolean) => {
      if (!selectedBlock) return;

      // Check if there's already a building block at this position
      const key = `${gridX},${gridY}`;
      if (buildingBlocks.has(key)) {
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
      } else if (selectedBlock.type === BuildingBlockType.CAR_GENERATOR) {
        // Validate placement - must be adjacent to a street
        if (!canPlaceCarGenerator(gridX, gridY, buildingBlocks)) {
          console.warn('Car generator must be placed adjacent to a street');
          return;
        }

        const carGenBlock = createCarGeneratorBlock(
          `car-gen-${Date.now()}`,
          gridX,
          gridY,
          buildingBlocks,
          selectedBlock.properties?.frequency as number || 1,
          selectedBlock.properties?.speed as number || 2,
        );

        if (carGenBlock) {
          addBuildingBlock(carGenBlock);

          // Create ECS entity for the car generator
          createCarGeneratorEntity(
            carGenBlock.id,
            carGenBlock.gridX,
            carGenBlock.gridY,
            carGenBlock.direction,
            carGenBlock.frequency,
            carGenBlock.speed
          );
        }
      }
    },
    [selectedBlock, buildingBlocks, addBuildingBlock, updateStreetConnections],
  );

  // Install event handling once on mount
  useEffect(installEventHandling, []);

  // Handle building block placement clicks
  useEffect(() => {
    const cleanup = addBuildingBlockClickListener((screenX, screenY, isDrag) => {
      if (!selectedBlock) return;

      // Convert screen coordinates to grid coordinates
      const { x: gridX, y: gridY } = screenToGrid(
        screenX,
        screenY,
        grid,
        viewport
      );

      handleCellClick(gridX, gridY, isDrag);
    });

    return cleanup;
  }, [selectedBlock, grid, viewport, handleCellClick]);

  // Handle selection complete events (rectangle selection)
  useEffect(() => {
    const cleanup = addSelectionCompleteListener((startX, startY, endX, endY) => {
      // Convert screen coordinates to grid coordinates
      const startGrid = screenToGrid(startX, startY, grid, viewport);
      const endGrid = screenToGrid(endX, endY, grid, viewport);

      // Calculate selection bounds
      const minX = Math.min(startGrid.x, endGrid.x);
      const maxX = Math.max(startGrid.x, endGrid.x);
      const minY = Math.min(startGrid.y, endGrid.y);
      const maxY = Math.max(startGrid.y, endGrid.y);

      // Find all blocks that intersect with the selection rectangle
      const selectedKeys = new Set<string>();
      for (const [key, block] of buildingBlocks.entries()) {
        // Check if block intersects with selection rectangle
        if (block.gridX >= minX && block.gridX <= maxX &&
            block.gridY >= minY && block.gridY <= maxY) {
          selectedKeys.add(key);
        }
      }

      // Update selection
      useSimulationStore.getState().setSelectedBlocks(selectedKeys);
    });

    return cleanup;
  }, [grid, viewport, buildingBlocks]);

  // Handle block selection events
  useEffect(() => {
    const cleanup = addBlockSelectedListener((gridX, gridY, isShift) => {
      if (isShift) {
        // Shift+click: toggle selection
        useSimulationStore.getState().toggleBlockSelection(gridX, gridY);
      } else {
        // Normal click: clear selection and select only this block
        useSimulationStore.getState().clearSelection();
        useSimulationStore.getState().selectBlock(gridX, gridY);
      }
    });

    return cleanup;
  }, []);

  // Handle delete selected blocks
  useEffect(() => {
    const cleanup = addDeleteSelectedBlocksListener(() => {
      const state = useSimulationStore.getState();
      const selectedBlocks = Array.from(state.selectedBlocks);

      if (selectedBlocks.length === 0) return;

      // Collect blocks to delete
      const blocksToDelete = selectedBlocks
        .map(key => state.buildingBlocks.get(key))
        .filter((block): block is NonNullable<typeof block> => block !== undefined);

      if (blocksToDelete.length === 0) return;

      // Push delete operation to history
      state.pushOperation({
        type: require('@/types/history').OperationType.DELETE,
        blocks: blocksToDelete,
      });

      // Remove blocks and their ECS entities
      for (const block of blocksToDelete) {
        // Remove ECS entity if it's a car generator
        if (block.type === BuildingBlockType.CAR_GENERATOR) {
          removeCarGeneratorEntity(block.id);
        }

        state.removeBuildingBlock(block.gridX, block.gridY);
        // Update street connections for surrounding blocks
        state.updateStreetConnections(block.gridX, block.gridY);
      }

      // Clear selection
      state.clearSelection();
    });

    return cleanup;
  }, []);

  // Handle blocks moved
  useEffect(() => {
    const cleanup = addBlocksMovedListener((offsetX, offsetY) => {
      const state = useSimulationStore.getState();
      const selectedBlocks = Array.from(state.selectedBlocks);

      if (selectedBlocks.length === 0 || (offsetX === 0 && offsetY === 0)) return;

      // Validate move: check for collisions
      const moves: Array<{ from: { gridX: number; gridY: number }; to: { gridX: number; gridY: number } }> = [];
      const newPositions = new Set<string>();

      for (const key of selectedBlocks) {
        const block = state.buildingBlocks.get(key);
        if (!block) continue;

        const newX = block.gridX + offsetX;
        const newY = block.gridY + offsetY;
        const newKey = `${newX},${newY}`;

        // Check if new position conflicts with an existing block (that's not being moved)
        if (state.buildingBlocks.has(newKey) && !state.selectedBlocks.has(newKey)) {
          // Collision detected - abort move
          console.warn('Cannot move blocks: collision detected');
          return;
        }

        newPositions.add(newKey);
        moves.push({
          from: { gridX: block.gridX, gridY: block.gridY },
          to: { gridX: newX, gridY: newY }
        });
      }

      // Check for internal collisions (two blocks moving to the same position)
      if (newPositions.size !== moves.length) {
        console.warn('Cannot move blocks: internal collision detected');
        return;
      }

      // Perform the move
      state.moveBuildingBlocks(moves);

      // Update selection to reflect new positions
      state.setSelectedBlocks(newPositions);

      // Update street connections for affected areas
      for (const move of moves) {
        state.updateStreetConnections(move.from.gridX, move.from.gridY);
        state.updateStreetConnections(move.to.gridX, move.to.gridY);
      }
    });

    return cleanup;
  }, []);

  // Handle undo
  useEffect(() => {
    const cleanup = addUndoRequestListener(() => {
      useSimulationStore.getState().undo();
    });

    return cleanup;
  }, []);

  // Handle redo
  useEffect(() => {
    const cleanup = addRedoRequestListener(() => {
      useSimulationStore.getState().redo();
    });

    return cleanup;
  }, []);

  // Handle clear selection
  useEffect(() => {
    const cleanup = addClearSelectionListener(() => {
      useSimulationStore.getState().clearSelection();
    });

    return cleanup;
  }, []);

  // ECS Update loop for simulation
  useEffect(() => {
    if (!isSimulationRunning) return;

    let animationFrameId: number;

    const loop = () => {
      updateECS(grid.size, viewport.width, viewport.height);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isSimulationRunning, grid.size, viewport.width, viewport.height]);

  // Prevent default context menu and handle right-click on building blocks
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      // Convert screen coordinates to grid coordinates
      const { x: gridX, y: gridY } = screenToGrid(
        e.clientX,
        e.clientY,
        grid,
        viewport
      );

      // Check if there's a car generator at this position
      const key = `${gridX},${gridY}`;
      const block = buildingBlocks.get(key);

      if (block && block.type === BuildingBlockType.CAR_GENERATOR) {
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          block: block as CarGeneratorBlock,
        });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [grid, viewport, buildingBlocks]);

  // Context menu handlers
  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleSettingChange = useCallback((id: string, value: number) => {
    if (!contextMenu) return;

    const block = contextMenu.block;
    const updatedBlock: CarGeneratorBlock = {
      ...block,
      [id]: value,
    };

    // Update in store
    const state = useSimulationStore.getState();
    const key = `${block.gridX},${block.gridY}`;
    const newMap = new Map(state.buildingBlocks);
    newMap.set(key, updatedBlock);
    state.buildingBlocks = newMap;

    // Update context menu
    setContextMenu({ ...contextMenu, block: updatedBlock });

    // Note: ECS entity update would be handled here in a full implementation
  }, [contextMenu]);

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

            {/* Selected blocks highlight layer */}
            <SelectedBlocksLayer cellSize={grid.size} />

            {/* Move preview layer */}
            <MovePreviewLayer cellSize={grid.size} />
          </pixiContainer>

          {/* Selection rectangle (in screen coordinates, outside transform) */}
          <SelectionRectangle />
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
            Space+Drag: pan • Scroll: zoom • Ctrl+Drag: select • Shift+Click: multi-select
          </div>
          <div className="text-xs opacity-75">
            Drag block: move • Backspace: delete • ESC: deselect • Ctrl+Z: undo • Ctrl+Shift+Z: redo
          </div>
        </div>
      </div>

      {/* Building Blocks Inventory */}
      <Inventory
        onBlockSelect={setSelectedBlock}
        selectedBlock={selectedBlock}
      />

      {/* Context Menu */}
      {contextMenu && (() => {
        const settings: SettingConfig[] = [
          {
            id: 'frequency',
            label: 'Frequency',
            value: contextMenu.block.frequency,
            unit: 'cars/tile',
            type: 'slider',
            min: 0.1,
            max: 5,
            step: 0.1,
          },
          {
            id: 'speed',
            label: 'Speed',
            value: contextMenu.block.speed,
            unit: 'tiles/second',
            type: 'slider',
            min: 0.5,
            max: 10,
            step: 0.5,
          },
        ];

        return (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            title="Car Generator Settings"
            subtitle={`Direction: ${contextMenu.block.direction.toUpperCase()}`}
            settings={settings}
            onSettingChange={handleSettingChange}
            onClose={handleContextMenuClose}
          />
        );
      })()}

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

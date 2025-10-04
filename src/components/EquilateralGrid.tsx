"use client";

import { useGridState, useSelectedQuadrant } from "@/hooks/useSimulationState";
import { Application, extend } from "@pixi/react";
import type * as PIXI from "pixi.js";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";

// Extend PIXI components to make them available as JSX
extend({ Container, Graphics });

interface EquilateralGridProps {
  width: number;
  height: number;
  cellSize?: number;
  minScale?: number;
  maxScale?: number;
  showGridLines?: boolean;
}

export default function EquilateralGrid({
  width,
  height,
  cellSize = 50,
  showGridLines = false,
}: EquilateralGridProps) {
  // Get state from global store
  const { grid } = useGridState();
  const { selectedQuadrant } = useSelectedQuadrant();


  // Render the infinite grid
  const renderGridLines = useCallback(
    (graphics: PIXI.Graphics) => {
      graphics.clear();

      if (!showGridLines) return;

      const { scale, position } = grid;
      const strokeWidth = Math.max(0.5, Math.min(2, scale));
      const opacity = 0.2;

      graphics.setStrokeStyle({ width: strokeWidth, color: 0x6b7280, alpha: opacity });

      // Calculate the visible area in world coordinates
      const visibleWidth = width / scale;
      const visibleHeight = height / scale;

      // Calculate the world position of the top-left corner of the viewport
      const worldLeft = -position.x / scale;
      const worldTop = -position.y / scale;
      const worldRight = worldLeft + visibleWidth;
      const worldBottom = worldTop + visibleHeight;

      // Calculate grid bounds with some padding for smooth scrolling
      const padding = cellSize * 2; // Extra padding to ensure smooth transitions
      const startX = Math.floor((worldLeft - padding) / cellSize) * cellSize;
      const endX = Math.ceil((worldRight + padding) / cellSize) * cellSize;
      const startY = Math.floor((worldTop - padding) / cellSize) * cellSize;
      const endY = Math.ceil((worldBottom + padding) / cellSize) * cellSize;

      // Draw vertical lines
      for (let x = startX; x <= endX; x += cellSize) {
        graphics.moveTo(x, startY);
        graphics.lineTo(x, endY);
      }

      // Draw horizontal lines
      for (let y = startY; y <= endY; y += cellSize) {
        graphics.moveTo(startX, y);
        graphics.lineTo(endX, y);
      }

      graphics.stroke();
    },
    [grid, cellSize, width, height, showGridLines],
  );

  // Render highlighted grid cell
  const renderHighlightedCell = useCallback(
    (graphics: PIXI.Graphics) => {
      graphics.clear();

      if (!selectedQuadrant) return;

      // Convert grid coordinates to world coordinates
      const worldX = selectedQuadrant.x * cellSize;
      const worldY = selectedQuadrant.y * cellSize;

      graphics.setFillStyle({ color: 0x3b82f6, alpha: 0.1 });
      graphics.roundRect(worldX, worldY, cellSize, cellSize, 5);
      graphics.fill();
    },
    [selectedQuadrant, cellSize],
  );


  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Application
        width={width}
        height={height}
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
          <pixiGraphics draw={renderGridLines} />

          {/* Highlighted grid layer */}
          <pixiGraphics draw={renderHighlightedCell} />
        </pixiContainer>
      </Application>

      {/* Grid info overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
        <div>Scale: {grid.scale.toFixed(2)}x</div>
        <div>
          Position: ({Math.round(grid.position.x)}, {Math.round(grid.position.y)})
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
  );
}
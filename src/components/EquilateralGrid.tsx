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


  // Render the entire grid as a single geometry
  const renderGridLines = useCallback(
    (graphics: PIXI.Graphics) => {
      graphics.clear();

      if (!showGridLines) return;

      const { scale } = grid;
      const strokeWidth = Math.max(0.5, Math.min(2, scale));
      const opacity = 0.1;

      graphics.setStrokeStyle({ width: strokeWidth, color: 0x6b7280, alpha: opacity });

      // Calculate how many grid cells we need to cover the visible area
      // Since the container is transformed, we need to account for that
      const visibleWidth = width / scale;
      const visibleHeight = height / scale;
      const cellsX = Math.ceil(visibleWidth / cellSize) + 2;
      const cellsY = Math.ceil(visibleHeight / cellSize) + 2;

      // Vertical lines
      for (let i = 0; i <= cellsX; i++) {
        const lineX = i * cellSize;
        graphics.moveTo(lineX, 0);
        graphics.lineTo(lineX, cellsY * cellSize);
      }

      // Horizontal lines
      for (let i = 0; i <= cellsY; i++) {
        const lineY = i * cellSize;
        graphics.moveTo(0, lineY);
        graphics.lineTo(cellsX * cellSize, lineY);
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

      // The grid container already applies position and scale transformations
      // So we just need to render the cell in local coordinates
      const pixelX = selectedQuadrant.x * cellSize;
      const pixelY = selectedQuadrant.y * cellSize;

      graphics.setFillStyle({ color: 0x3b82f6, alpha: 0.1 });
      graphics.roundRect(pixelX, pixelY, cellSize, cellSize, 5);
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
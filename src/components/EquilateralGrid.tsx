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

      const { scale, position } = grid;
      const scaledCellSize = cellSize * scale;
      const strokeWidth = Math.max(0.5, Math.min(2, scale));
      const opacity = 0.1;

      // Calculate the offset to align the grid properly
      const offsetX = ((position.x % scaledCellSize) + scaledCellSize) % scaledCellSize;
      const offsetY = ((position.y % scaledCellSize) + scaledCellSize) % scaledCellSize;

      graphics.setStrokeStyle({ width: strokeWidth, color: 0x6b7280, alpha: opacity });

      // Vertical lines
      for (let i = 0; i <= Math.ceil((width + scaledCellSize) / scaledCellSize) + 1; i++) {
        const lineX = i * scaledCellSize - offsetX;
        graphics.moveTo(lineX, 0);
        graphics.lineTo(lineX, height + scaledCellSize);
      }

      // Horizontal lines
      for (let i = 0; i <= Math.ceil((height + scaledCellSize) / scaledCellSize) + 1; i++) {
        const lineY = i * scaledCellSize - offsetY;
        graphics.moveTo(0, lineY);
        graphics.lineTo(width + scaledCellSize, lineY);
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

      const { scale, position } = grid;
      const scaledCellSize = cellSize * scale;

      // Calculate the offset to align with grid lines
      const offsetX = ((position.x % scaledCellSize) + scaledCellSize) % scaledCellSize;
      const offsetY = ((position.y % scaledCellSize) + scaledCellSize) % scaledCellSize;

      // Calculate the pixel position of the hovered cell
      const pixelX = selectedQuadrant.x * scaledCellSize - offsetX;
      const pixelY = selectedQuadrant.y * scaledCellSize - offsetY;

      graphics.setFillStyle({ color: 0x3b82f6, alpha: 0.1 });
      graphics.roundRect(pixelX, pixelY, scaledCellSize, scaledCellSize, 5);
      graphics.fill();
    },
    [grid, selectedQuadrant, cellSize],
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
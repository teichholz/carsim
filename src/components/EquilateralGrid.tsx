"use client";

import { useGridState } from "@/hooks/useSimulationState";
import { getVisibleWorldBounds } from "@/utils/coordinate-conversion";
import { extend } from "@pixi/react";
import type * as PIXI from "pixi.js";
import { Graphics } from "pixi.js";
import { useCallback } from "react";

// Extend PIXI components to make them available as JSX
extend({ Graphics });

interface EquilateralGridProps {
  width: number;
  height: number;
  cellSize?: number;
}

export default function EquilateralGrid({
  width,
  height,
  cellSize = 50,
}: EquilateralGridProps) {
  const { grid } = useGridState();


  // Render the infinite grid
  const renderGridLines = useCallback(
    (graphics: PIXI.Graphics) => {
      graphics.clear();

      const { scale } = grid;
      const strokeWidth = Math.max(0.5, Math.min(2, scale));
      const opacity = 0.2;

      graphics.setStrokeStyle({ width: strokeWidth, color: 0x6b7280, alpha: opacity });

      // Use the helper function to calculate visible world bounds
      const viewportState = { width, height, devicePixelRatio: 1 };
      const { startX, endX, startY, endY } = getVisibleWorldBounds(
        grid,
        viewportState,
        cellSize,
        2 // padding multiplier
      );

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
    [grid, cellSize, width, height],
  );



  return <pixiGraphics draw={renderGridLines} />;
}
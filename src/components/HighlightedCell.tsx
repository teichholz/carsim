"use client";

import { useSelectedQuadrant } from "@/hooks/useSimulationState";
import { gridToWorld } from "@/utils/coordinate-conversion";
import type * as PIXI from "pixi.js";
import { useCallback } from "react";

interface HighlightedCellProps {
  cellSize: number;
}

export default function HighlightedCell({ cellSize }: HighlightedCellProps) {
  const { selectedQuadrant } = useSelectedQuadrant();

  // Render highlighted grid cell
  const renderHighlightedCell = useCallback(
    (graphics: PIXI.Graphics) => {
      graphics.clear();

      if (!selectedQuadrant) return;

      // Use the helper function to convert grid coordinates to world coordinates
      const { x: worldX, y: worldY } = gridToWorld(
        selectedQuadrant.x,
        selectedQuadrant.y,
        cellSize
      );

      graphics.setFillStyle({ color: 0x3b82f6, alpha: 0.1 });
      graphics.roundRect(worldX, worldY, cellSize, cellSize, 5);
      graphics.fill();
    },
    [selectedQuadrant, cellSize],
  );

  return <pixiGraphics draw={renderHighlightedCell} />;
}

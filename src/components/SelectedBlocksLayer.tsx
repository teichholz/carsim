"use client";

import { useSimulationStore } from "@/store/simulation-store";
import { gridToWorld } from "@/utils/coordinate-conversion";
import type * as PIXI from "pixi.js";
import { useCallback } from "react";

interface SelectedBlocksLayerProps {
  cellSize: number;
}

export default function SelectedBlocksLayer({ cellSize }: SelectedBlocksLayerProps) {
  const selectedBlocks = useSimulationStore((state) => state.selectedBlocks);
  const buildingBlocks = useSimulationStore((state) => state.buildingBlocks);

  // Render selection highlights for all selected blocks
  const renderSelectionHighlights = useCallback(
    (graphics: PIXI.Graphics) => {
      graphics.clear();

      if (selectedBlocks.size === 0) return;

      // Draw a highlight for each selected block
      for (const key of selectedBlocks) {
        const block = buildingBlocks.get(key);
        if (!block) continue;

        // Use the helper function to convert grid coordinates to world coordinates
        const { x: worldX, y: worldY } = gridToWorld(
          block.gridX,
          block.gridY,
          cellSize
        );

        // Draw selection rectangle with blue outline (no radius)
        graphics.setStrokeStyle({ width: 3, color: 0x3b82f6, alpha: 0.8 });
        graphics.rect(worldX, worldY, cellSize, cellSize);
        graphics.stroke();
      }
    },
    [selectedBlocks, buildingBlocks, cellSize],
  );

  return <pixiGraphics draw={renderSelectionHighlights} />;
}



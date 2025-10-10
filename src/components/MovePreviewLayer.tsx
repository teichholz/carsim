"use client";

import { useSimulationStore } from "@/store/simulation-store";
import { gridToWorld } from "@/utils/coordinate-conversion";
import type * as PIXI from "pixi.js";
import { useCallback, useState, useEffect } from "react";
import { addBlocksMovePreviewListener } from "@/services/event-manager";

interface MovePreviewLayerProps {
  cellSize: number;
}

export default function MovePreviewLayer({ cellSize }: MovePreviewLayerProps) {
  const selectedBlocks = useSimulationStore((state) => state.selectedBlocks);
  const buildingBlocks = useSimulationStore((state) => state.buildingBlocks);
  const [moveOffset, setMoveOffset] = useState<{ x: number; y: number } | null>(null);

  // Listen for move preview events
  useEffect(() => {
    const cleanup = addBlocksMovePreviewListener((offsetX, offsetY) => {
      setMoveOffset({ x: offsetX, y: offsetY });
    });

    // Clear offset when mouse up or selection changes
    const handleMouseUp = () => {
      setMoveOffset(null);
    };

    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cleanup();
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Render move preview for all selected blocks
  const renderMovePreview = useCallback(
    (graphics: PIXI.Graphics) => {
      graphics.clear();

      if (!moveOffset || selectedBlocks.size === 0) return;

      // Draw a preview for each selected block at its new position
      for (const key of selectedBlocks) {
        const block = buildingBlocks.get(key);
        if (!block) continue;

        // Calculate new position
        const newGridX = block.gridX + moveOffset.x;
        const newGridY = block.gridY + moveOffset.y;

        // Use the helper function to convert grid coordinates to world coordinates
        const { x: worldX, y: worldY } = gridToWorld(
          newGridX,
          newGridY,
          cellSize
        );

        // Draw preview rectangle with semi-transparent blue fill
        graphics.setFillStyle({ color: 0x3b82f6, alpha: 0.2 });
        graphics.rect(worldX, worldY, cellSize, cellSize);
        graphics.fill();

        // Draw dashed line effect by drawing multiple small line segments
        const dashLength = 8;
        const gapLength = 4;
        const totalLength = cellSize;

        graphics.setStrokeStyle({ width: 2, color: 0x3b82f6, alpha: 0.8 });

        // Top edge
        for (let i = 0; i < totalLength; i += dashLength + gapLength) {
          const len = Math.min(dashLength, totalLength - i);
          graphics.moveTo(worldX + i, worldY);
          graphics.lineTo(worldX + i + len, worldY);
        }

        // Bottom edge
        for (let i = 0; i < totalLength; i += dashLength + gapLength) {
          const len = Math.min(dashLength, totalLength - i);
          graphics.moveTo(worldX + i, worldY + cellSize);
          graphics.lineTo(worldX + i + len, worldY + cellSize);
        }

        // Left edge
        for (let i = 0; i < totalLength; i += dashLength + gapLength) {
          const len = Math.min(dashLength, totalLength - i);
          graphics.moveTo(worldX, worldY + i);
          graphics.lineTo(worldX, worldY + i + len);
        }

        // Right edge
        for (let i = 0; i < totalLength; i += dashLength + gapLength) {
          const len = Math.min(dashLength, totalLength - i);
          graphics.moveTo(worldX + cellSize, worldY + i);
          graphics.lineTo(worldX + cellSize, worldY + i + len);
        }

        graphics.stroke();
      }
    },
    [moveOffset, selectedBlocks, buildingBlocks, cellSize],
  );

  return <pixiGraphics draw={renderMovePreview} />;
}


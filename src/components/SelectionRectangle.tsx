"use client";

import { extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { useSimulationStore } from "@/store/simulation-store";
import type * as PIXI from "pixi.js";

// Extend PIXI components to make them available as JSX
extend({ Graphics });

/**
 * SelectionRectangle component renders the selection rectangle when user Ctrl+drags
 */
export default function SelectionRectangle() {
  const selectionRectangle = useSimulationStore(
    (state) => state.selectionRectangle
  );

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      if (!selectionRectangle) {
        return;
      }

      // Calculate rectangle dimensions
      const x = Math.min(selectionRectangle.startX, selectionRectangle.endX);
      const y = Math.min(selectionRectangle.startY, selectionRectangle.endY);
      const width = Math.abs(selectionRectangle.endX - selectionRectangle.startX);
      const height = Math.abs(selectionRectangle.endY - selectionRectangle.startY);

      // Draw selection rectangle with a native feeling
      // Semi-transparent blue fill with modern styling
      g.setFillStyle({ color: 0x3b82f6, alpha: 0.1 });
      g.setStrokeStyle({ width: 1.5, color: 0x3b82f6, alpha: 0.8 });
      g.rect(x, y, width, height);
      g.fill();
      g.stroke();

      // Add a subtle inner glow effect
      g.setStrokeStyle({ width: 1, color: 0x60a5fa, alpha: 0.4 });
      g.rect(x + 1, y + 1, Math.max(0, width - 2), Math.max(0, height - 2));
      g.stroke();
    },
    [selectionRectangle]
  );

  return <pixiGraphics draw={draw} />;
}


import { useCallback } from 'react';
import type React from 'react';
import { Graphics } from 'pixi.js';
import { extend } from '@pixi/react';
import type * as PIXI from 'pixi.js';
import type { BuildingBlockComponentProps } from './BaseBuildingBlock';
import type { StreetBlock } from '@/types/building-blocks';
import { StreetType } from '@/types/building-blocks';

// Extend PIXI components to make them available as JSX
extend({ Graphics });

export interface StreetProps extends BuildingBlockComponentProps {
  block: StreetBlock;
}

const Street: React.FC<StreetProps> = ({ block, gridSize }) => {
  const streetType = block.streetType;

  // Street line properties
  const lineWidth = Math.max(2, gridSize * 0.08);
  const margin = gridSize * 0.15;

  const drawStreet = useCallback((graphics: PIXI.Graphics) => {
    graphics.clear();
    graphics.lineStyle(lineWidth, 0x333333, 1);

    const renderLonelyStreet = () => {
      // Lonely street is smaller and vertical by default
      const scaledSize = gridSize * 0.6;
      const centerX = gridSize / 2;
      const centerY = gridSize / 2;
      const halfWidth = scaledSize / 2;

      // Two parallel vertical lines for lonely street
      graphics.moveTo(centerX - halfWidth, centerY - halfWidth);
      graphics.lineTo(centerX - halfWidth, centerY + halfWidth);

      graphics.moveTo(centerX + halfWidth, centerY - halfWidth);
      graphics.lineTo(centerX + halfWidth, centerY + halfWidth);
    };

    const renderHorizontalStreet = () => {
      // Two parallel horizontal lines
      graphics.moveTo(margin, gridSize / 2 - lineWidth);
      graphics.lineTo(gridSize - margin, gridSize / 2 - lineWidth);

      graphics.moveTo(margin, gridSize / 2 + lineWidth);
      graphics.lineTo(gridSize - margin, gridSize / 2 + lineWidth);
    };

    const renderVerticalStreet = () => {
      // Two parallel vertical lines
      graphics.moveTo(gridSize / 2 - lineWidth, margin);
      graphics.lineTo(gridSize / 2 - lineWidth, gridSize - margin);

      graphics.moveTo(gridSize / 2 + lineWidth, margin);
      graphics.lineTo(gridSize / 2 + lineWidth, gridSize - margin);
    };

    const renderCurvedStreet = () => {
      // For now, render as straight lines - curves can be enhanced later with proper arc rendering
      graphics.moveTo(margin, gridSize / 2 - lineWidth);
      graphics.lineTo(gridSize - margin, gridSize / 2 - lineWidth);

      graphics.moveTo(gridSize / 2 - lineWidth, margin);
      graphics.lineTo(gridSize / 2 - lineWidth, gridSize - margin);
    };

    switch (streetType) {
      case StreetType.LONELY:
        renderLonelyStreet();
        break;
      case StreetType.HORIZONTAL:
        renderHorizontalStreet();
        break;
      case StreetType.VERTICAL:
        renderVerticalStreet();
        break;
      case StreetType.CURVE_TOP_LEFT:
      case StreetType.CURVE_TOP_RIGHT:
      case StreetType.CURVE_BOTTOM_LEFT:
      case StreetType.CURVE_BOTTOM_RIGHT:
        renderCurvedStreet();
        break;
      default:
        renderLonelyStreet();
    }
  }, [streetType, gridSize, lineWidth, margin]);

  return <pixiGraphics draw={drawStreet} />;
};

export default Street;

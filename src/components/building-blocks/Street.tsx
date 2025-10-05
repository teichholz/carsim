import { useCallback } from 'react';
import type React from 'react';
import { Graphics } from 'pixi.js';
import { extend } from '@pixi/react';
import type * as PIXI from 'pixi.js';
import type { BuildingBlockComponentProps } from './BaseBuildingBlock';
import type { StreetBlock } from '@/types/building-blocks';
import { determineStreetVisualType, StreetVisualType } from '@/utils/street-utils';

// Extend PIXI components to make them available as JSX
extend({ Graphics });

export interface StreetProps extends BuildingBlockComponentProps {
  block: StreetBlock;
}

const Street: React.FC<StreetProps> = ({ block, gridSize }) => {
  // Introspect the street's connections to determine visual representation
  const visualType = determineStreetVisualType(block.connections);

  // Street line properties
  const lineWidth = Math.max(2, gridSize * 0.08);
  const margin = gridSize * 0.15;

  const drawStreet = useCallback((graphics: PIXI.Graphics) => {
    graphics.clear();
    graphics.setStrokeStyle({ width: lineWidth, color: 0x333333, alpha: 1 });

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

      graphics.stroke();
    };

    const renderHorizontalStreet = () => {
      // Two parallel horizontal lines
      graphics.moveTo(margin, gridSize / 2 - lineWidth);
      graphics.lineTo(gridSize - margin, gridSize / 2 - lineWidth);

      graphics.moveTo(margin, gridSize / 2 + lineWidth);
      graphics.lineTo(gridSize - margin, gridSize / 2 + lineWidth);

      graphics.stroke();
    };

    const renderVerticalStreet = () => {
      // Two parallel vertical lines
      graphics.moveTo(gridSize / 2 - lineWidth, margin);
      graphics.lineTo(gridSize / 2 - lineWidth, gridSize - margin);

      graphics.moveTo(gridSize / 2 + lineWidth, margin);
      graphics.lineTo(gridSize / 2 + lineWidth, gridSize - margin);

      graphics.stroke();
    };

    const renderCurvedStreet = (curveType: StreetVisualType) => {
      const centerX = gridSize / 2;
      const centerY = gridSize / 2;
      const radius = Math.min(gridSize * 0.3, gridSize - margin * 2) / 2;
      const streetWidth = lineWidth * 2;

      // Draw curved street based on the curve type
      // Each curve has two parallel arcs representing the street edges
      switch (curveType) {
        case StreetVisualType.CURVE_TOP_LEFT:
          // Curve from top to left - draw outer arc first
          graphics.moveTo(centerX, centerY - radius);
          graphics.arc(centerX, centerY, radius, -Math.PI / 2, 0, false);
          graphics.stroke();
          // Then draw inner arc
          graphics.moveTo(centerX, centerY - radius + streetWidth);
          graphics.arc(centerX, centerY, radius - streetWidth, -Math.PI / 2, 0, false);
          graphics.stroke();
          break;
        case StreetVisualType.CURVE_TOP_RIGHT:
          // Curve from top to right - draw outer arc first
          graphics.moveTo(centerX, centerY - radius);
          graphics.arc(centerX, centerY, radius, Math.PI / 2, Math.PI, false);
          graphics.stroke();
          // Then draw inner arc
          graphics.moveTo(centerX, centerY - radius + streetWidth);
          graphics.arc(centerX, centerY, radius - streetWidth, Math.PI / 2, Math.PI, false);
          graphics.stroke();
          break;
        case StreetVisualType.CURVE_BOTTOM_LEFT:
          // Curve from bottom to left - draw outer arc first
          graphics.moveTo(centerX, centerY + radius);
          graphics.arc(centerX, centerY, radius, Math.PI, Math.PI * 1.5, false);
          graphics.stroke();
          // Then draw inner arc
          graphics.moveTo(centerX, centerY + radius - streetWidth);
          graphics.arc(centerX, centerY, radius - streetWidth, Math.PI, Math.PI * 1.5, false);
          graphics.stroke();
          break;
        case StreetVisualType.CURVE_BOTTOM_RIGHT:
          // Curve from bottom to right - draw outer arc first
          graphics.moveTo(centerX, centerY + radius);
          graphics.arc(centerX, centerY, radius, Math.PI * 1.5, Math.PI * 2, false);
          graphics.stroke();
          // Then draw inner arc
          graphics.moveTo(centerX, centerY + radius - streetWidth);
          graphics.arc(centerX, centerY, radius - streetWidth, Math.PI * 1.5, Math.PI * 2, false);
          graphics.stroke();
          break;
      }
    };

    switch (visualType) {
      case StreetVisualType.LONELY:
        renderLonelyStreet();
        break;
      case StreetVisualType.HORIZONTAL:
        renderHorizontalStreet();
        break;
      case StreetVisualType.VERTICAL:
        renderVerticalStreet();
        break;
      case StreetVisualType.CURVE_TOP_LEFT:
      case StreetVisualType.CURVE_TOP_RIGHT:
      case StreetVisualType.CURVE_BOTTOM_LEFT:
      case StreetVisualType.CURVE_BOTTOM_RIGHT:
        renderCurvedStreet(visualType);
        break;
      default:
        renderLonelyStreet();
    }

    // All render functions now handle their own stroking
  }, [visualType, gridSize, lineWidth, margin]);

  return <pixiGraphics draw={drawStreet} />;
};

export default Street;

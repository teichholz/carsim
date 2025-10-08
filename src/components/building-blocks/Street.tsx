import { memo } from 'react';
import type React from 'react';
import { Sprite as PixiSprite, Texture } from 'pixi.js';
import { extend } from '@pixi/react';
import type { BuildingBlockComponentProps } from './BaseBuildingBlock';
import type { StreetBlock } from '@/types/building-blocks';
import { determineStreetVisualType, StreetVisualType } from '@/utils/street-utils';

// Extend PIXI components to make them available as JSX
extend({ Sprite: PixiSprite });

export interface StreetProps extends BuildingBlockComponentProps {
  block: StreetBlock;
}

// Helper function to get sprite configuration for each visual type
const getSpriteConfig = (visualType: StreetVisualType) => {
  switch (visualType) {
    case StreetVisualType.VERTICAL:
      return { sprite: 'linear-street', rotation: 0 };
    case StreetVisualType.HORIZONTAL:
      return { sprite: 'linear-street', rotation: Math.PI / 2 };
    case StreetVisualType.CURVE_BOTTOM_RIGHT:
      return { sprite: 'curved-street', rotation: 0 };
    case StreetVisualType.CURVE_BOTTOM_LEFT:
      return { sprite: 'curved-street', rotation: Math.PI / 2 };
    case StreetVisualType.CURVE_TOP_LEFT:
      return { sprite: 'curved-street', rotation: Math.PI };
    case StreetVisualType.CURVE_TOP_RIGHT:
      return { sprite: 'curved-street', rotation: (Math.PI * 3) / 2 };
  }
};

const Street: React.FC<StreetProps> = memo(({ block, gridSize }) => {
  const visualType = determineStreetVisualType(block.connections);
  const spriteConfig = getSpriteConfig(visualType);

  return (
    <pixiSprite
      texture={Texture.from(spriteConfig.sprite)}
      width={gridSize}
      height={gridSize}
      rotation={spriteConfig.rotation}
      anchor={0.5}
      x={gridSize / 2}
      y={gridSize / 2}
    />
  );
});

export default Street;

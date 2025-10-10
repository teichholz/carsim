import { memo } from 'react';
import type React from 'react';
import { Sprite as PixiSprite, Texture } from 'pixi.js';
import { extend } from '@pixi/react';
import type { BuildingBlockComponentProps } from './BaseBuildingBlock';
import type { CarGeneratorBlock } from '@/types/building-blocks';
import { CarGeneratorDirection } from '@/types/building-blocks';

// Extend PIXI components to make them available as JSX
extend({ Sprite: PixiSprite });

export interface CarGeneratorProps extends BuildingBlockComponentProps {
  block: CarGeneratorBlock;
}

// Helper function to get sprite name based on direction
const getSpriteForDirection = (direction: CarGeneratorDirection): string => {
  switch (direction) {
    case CarGeneratorDirection.NORTH:
      return 'car-gen-n';
    case CarGeneratorDirection.SOUTH:
      return 'car-gen-s';
    case CarGeneratorDirection.EAST:
      return 'car-gen-e';
    case CarGeneratorDirection.WEST:
      return 'car-gen-w';
  }
};

const CarGenerator: React.FC<CarGeneratorProps> = memo(({ block, gridSize }) => {
  const spriteName = getSpriteForDirection(block.direction);

  return (
    <pixiSprite
      texture={Texture.from(spriteName)}
      width={gridSize}
      height={gridSize}
      anchor={0.5}
      x={gridSize / 2}
      y={gridSize / 2}
    />
  );
});

CarGenerator.displayName = 'CarGenerator';

export default CarGenerator;


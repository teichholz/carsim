import type React from 'react';
import type { PlacedBuildingBlock } from '@/types/building-blocks';

export interface BaseBuildingBlockProps {
  block: PlacedBuildingBlock;
  gridSize: number;
  gridX: number;
  gridY: number;
  scale: number;
}

export interface BuildingBlockComponentProps extends BaseBuildingBlockProps {
  // Additional props can be added by specific building block components
}

export abstract class BaseBuildingBlock {
  abstract render(props: BuildingBlockComponentProps): React.ReactElement;
  abstract getType(): string;
}

export default BaseBuildingBlock;

import type { PlacedBuildingBlock } from '@/types/building-blocks';

export interface BaseBuildingBlockProps {
  block: PlacedBuildingBlock;
  gridSize: number;
}

export interface BuildingBlockComponentProps extends BaseBuildingBlockProps {
  // Additional props can be added by specific building block components
}
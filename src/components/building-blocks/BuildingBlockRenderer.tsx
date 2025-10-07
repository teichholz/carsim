import type React from 'react';
import { memo } from 'react';
import Street from './Street';
import { BuildingBlockType } from '@/types/building-blocks';
import type { PlacedBuildingBlock, StreetBlock } from '@/types/building-blocks';
import type { BuildingBlockComponentProps } from './BaseBuildingBlock';

export interface BuildingBlockRendererProps {
  block: PlacedBuildingBlock;
  gridSize: number;
}

const BuildingBlockRenderer: React.FC<BuildingBlockRendererProps> = memo(({
  block,
  gridSize
}) => {
  console.log(`🔄 BuildingBlockRenderer render: ${block.type} at (${block.gridX},${block.gridY})`);
  const props: BuildingBlockComponentProps = {
    block,
    gridSize,
  };

  const renderBuildingBlock = () => {
    // Check if it's a street block
    if (isStreetType(block.type)) {
      return <Street {...props} block={block as StreetBlock} />;
    }

    // Add other building block types here as they are implemented
    return null;
  };

  return renderBuildingBlock();
});

// Helper function to check if a building block type is a street
const isStreetType = (type: BuildingBlockType): boolean => {
  return type === BuildingBlockType.STREET;
};

export default BuildingBlockRenderer;

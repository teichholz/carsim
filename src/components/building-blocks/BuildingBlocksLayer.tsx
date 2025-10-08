import { useBuildingBlocksState } from '@/hooks/useSimulationState';
import { extend } from '@pixi/react';
import { Container } from 'pixi.js';
import type React from 'react';
import BuildingBlockRenderer from './BuildingBlockRenderer';
import { memo } from 'react';

// Extend PIXI components to make them available as JSX
extend({ Container });

interface BuildingBlocksLayerProps {
  cellSize: number;
}

const BuildingBlocksLayer: React.FC<BuildingBlocksLayerProps> = memo(({ cellSize }) => {
  const { buildingBlocks } = useBuildingBlocksState();

  return (
    <pixiContainer>
      {Array.from(buildingBlocks.values()).map((block) => (
        <pixiContainer
          key={`${block.gridX},${block.gridY}`}
          x={block.gridX * cellSize}
          y={block.gridY * cellSize}
        >
          <BuildingBlockRenderer
            block={block}
            gridSize={cellSize}
          />
        </pixiContainer>
      ))}
    </pixiContainer>
  );
});

export default BuildingBlocksLayer;

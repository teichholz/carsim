import type React from 'react';
import { Container } from 'pixi.js';
import { extend } from '@pixi/react';
import BuildingBlockRenderer from './BuildingBlockRenderer';
import type { PlacedBuildingBlock } from '@/types/building-blocks';
import { getVisibleWorldBounds } from '@/utils/coordinate-conversion';
import { useGridState, useViewportState } from '@/hooks/useSimulationState';
import { useSimulationStore } from '@/store/simulation-store';

// Extend PIXI components to make them available as JSX
extend({ Container });

interface BuildingBlocksLayerProps {
  cellSize: number;
}

const BuildingBlocksLayer: React.FC<BuildingBlocksLayerProps> = ({ cellSize }) => {
  const { grid } = useGridState();
  const { viewport } = useViewportState();
  const buildingBlocks = useSimulationStore((state) => state.buildingBlocks);

  // Calculate visible world bounds
  const { startX, endX, startY, endY } = getVisibleWorldBounds(
    grid,
    viewport,
    cellSize,
    2 // padding multiplier
  );

  // Filter building blocks that are visible
  const visibleBlocks: PlacedBuildingBlock[] = [];

  for (const block of buildingBlocks.values()) {
    const worldX = block.gridX * cellSize;
    const worldY = block.gridY * cellSize;

    if (
      worldX >= startX &&
      worldX <= endX &&
      worldY >= startY &&
      worldY <= endY
    ) {
      visibleBlocks.push(block);
    }
  }

  return (
    <pixiContainer>
      {visibleBlocks.map((block) => (
        <pixiContainer
          key={`${block.gridX},${block.gridY}`}
          x={block.gridX * cellSize}
          y={block.gridY * cellSize}
        >
          <BuildingBlockRenderer
            block={block}
            gridSize={cellSize}
            scale={grid.scale}
          />
        </pixiContainer>
      ))}
    </pixiContainer>
  );
};

export default BuildingBlocksLayer;

import { useBuildingBlocksState, useGridState, useViewportState } from '@/hooks/useSimulationState';
import type { PlacedBuildingBlock } from '@/types/building-blocks';
import { getVisibleWorldBounds } from '@/utils/coordinate-conversion';
import { extend } from '@pixi/react';
import { Container } from 'pixi.js';
import type React from 'react';
import BuildingBlockRenderer from './BuildingBlockRenderer';
import { useMemo } from 'react';

// Extend PIXI components to make them available as JSX
extend({ Container });

interface BuildingBlocksLayerProps {
  cellSize: number;
}

const BuildingBlocksLayer: React.FC<BuildingBlocksLayerProps> = ({ cellSize }) => {
  console.log('🔄 BuildingBlocksLayer render');

  const { grid } = useGridState();
  const { viewport } = useViewportState();
  const { buildingBlocks } = useBuildingBlocksState();

  // Memoize visible world bounds calculation
  const visibleBounds = useMemo(() => {
    return getVisibleWorldBounds(grid, viewport, cellSize);
  }, [grid, viewport, cellSize]);

  // Memoize visible blocks filtering
  const visibleBlocks = useMemo(() => {
    const { startX, endX, startY, endY } = visibleBounds;
    const blocks: PlacedBuildingBlock[] = [];

    for (const block of buildingBlocks.values()) {
      const worldX = block.gridX * cellSize;
      const worldY = block.gridY * cellSize;

      if (
        worldX >= startX &&
        worldX <= endX &&
        worldY >= startY &&
        worldY <= endY
      ) {
        blocks.push(block);
      }
    }

    return blocks;
  }, [buildingBlocks, visibleBounds, cellSize]);

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

import { BuildingBlockType } from '@/types/building-blocks';
import type { StreetConnections, StreetBlock, PlacedBuildingBlock } from '@/types/building-blocks';

// Visual representation types for streets
export enum StreetVisualType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CURVE_TOP_LEFT = 'curve_top_left',
  CURVE_TOP_RIGHT = 'curve_top_right',
  CURVE_BOTTOM_LEFT = 'curve_bottom_left',
  CURVE_BOTTOM_RIGHT = 'curve_bottom_right',
}

export const isStreetType = (type: BuildingBlockType): boolean => {
  return type === BuildingBlockType.STREET;
};

export const getStreetConnections = (
  gridX: number,
  gridY: number,
  buildingBlocks: Map<string, PlacedBuildingBlock>
): StreetConnections => {
  const checkConnection = (x: number, y: number): boolean => {
    const key = `${x},${y}`;
    const block = buildingBlocks.get(key);
    return Boolean(block && isStreetType(block.type));
  };

  return {
    top: checkConnection(gridX, gridY - 1),
    right: checkConnection(gridX + 1, gridY),
    bottom: checkConnection(gridX, gridY + 1),
    left: checkConnection(gridX - 1, gridY),
  };
};

export const determineStreetVisualType = (connections: StreetConnections): StreetVisualType => {
  const { top, right, bottom, left } = connections;

  // Determine curve type based on connections
  if (top && left && !right && !bottom) {
    return StreetVisualType.CURVE_TOP_LEFT;
  }
  if (top && right && !left && !bottom) {
    return StreetVisualType.CURVE_TOP_RIGHT;
  }
  if (bottom && left && !right && !top) {
    return StreetVisualType.CURVE_BOTTOM_LEFT;
  }
  if (bottom && right && !left && !top) {
    return StreetVisualType.CURVE_BOTTOM_RIGHT;
  }

  // Vertical street if only top/bottom connections
  if (!left && !right && (top || bottom)) {
    return StreetVisualType.VERTICAL;
  }

  // Default to horizontal for all other cases (including no connections)
  return StreetVisualType.HORIZONTAL;
};

export const createStreetBlock = (
  id: string,
  gridX: number,
  gridY: number,
  buildingBlocks: Map<string, PlacedBuildingBlock>
): StreetBlock => {
  const connections = getStreetConnections(gridX, gridY, buildingBlocks);

  return {
    id,
    type: BuildingBlockType.STREET, // Single street type
    gridX,
    gridY,
    connections,
  };
};

// Update connections for existing streets when a new street is placed
export const updateStreetConnections = (
  gridX: number,
  gridY: number,
  buildingBlocks: Map<string, PlacedBuildingBlock>
): Map<string, PlacedBuildingBlock> => {
  const newMap = new Map(buildingBlocks);

  // Check all 4 directions around the new street
  const directions = [
    { x: gridX, y: gridY - 1 }, // top
    { x: gridX + 1, y: gridY }, // right
    { x: gridX, y: gridY + 1 }, // bottom
    { x: gridX - 1, y: gridY }, // left
  ];

  directions.forEach(({ x, y }) => {
    const key = `${x},${y}`;
    const existingBlock = newMap.get(key);

    // If there's a street at this position, update its connections
    if (existingBlock && isStreetType(existingBlock.type)) {
      const updatedConnections = getStreetConnections(x, y, newMap);
      const updatedBlock: StreetBlock = {
        ...existingBlock as StreetBlock,
        connections: updatedConnections,
      };
      newMap.set(key, updatedBlock);
    }
  });

  return newMap;
};

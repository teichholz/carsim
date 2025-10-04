import { BuildingBlockType, StreetType } from '@/types/building-blocks';
import type { StreetConnections, StreetBlock, PlacedBuildingBlock } from '@/types/building-blocks';

export const isStreetType = (type: BuildingBlockType): boolean => {
  return [
    BuildingBlockType.STREET_HORIZONTAL,
    BuildingBlockType.STREET_VERTICAL,
    BuildingBlockType.STREET_CURVE,
    BuildingBlockType.STREET_LONELY,
  ].includes(type);
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

export const determineStreetType = (connections: StreetConnections): StreetType => {
  const { top, right, bottom, left } = connections;
  const connectionCount = [top, right, bottom, left].filter(Boolean).length;

  // Lonely street if no connections
  if (connectionCount === 0) {
    return StreetType.LONELY;
  }

  // Horizontal street if only left/right connections
  if (!top && !bottom && (left || right)) {
    return StreetType.HORIZONTAL;
  }

  // Vertical street if only top/bottom connections
  if (!left && !right && (top || bottom)) {
    return StreetType.VERTICAL;
  }

  // Determine curve type based on connections
  if (top && left && !right && !bottom) {
    return StreetType.CURVE_TOP_LEFT;
  }
  if (top && right && !left && !bottom) {
    return StreetType.CURVE_TOP_RIGHT;
  }
  if (bottom && left && !right && !top) {
    return StreetType.CURVE_BOTTOM_LEFT;
  }
  if (bottom && right && !left && !top) {
    return StreetType.CURVE_BOTTOM_RIGHT;
  }

  // Default to lonely for complex connections (can be enhanced later)
  return StreetType.LONELY;
};

export const createStreetBlock = (
  id: string,
  gridX: number,
  gridY: number,
  buildingBlocks: Map<string, PlacedBuildingBlock>
): StreetBlock => {
  const connections = getStreetConnections(gridX, gridY, buildingBlocks);
  const streetType = determineStreetType(connections);

  return {
    id,
    type: BuildingBlockType.STREET_HORIZONTAL, // Base type, actual behavior determined by streetType
    gridX,
    gridY,
    streetType,
    connections,
  };
};

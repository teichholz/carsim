import type { PlacedBuildingBlock, CarGeneratorBlock } from '@/types/building-blocks';
import { BuildingBlockType, CarGeneratorDirection } from '@/types/building-blocks';

/**
 * Determines the appropriate direction for a car generator based on adjacent streets
 * Returns null if no valid placement is found
 */
export const determineCarGeneratorDirection = (
  gridX: number,
  gridY: number,
  buildingBlocks: Map<string, PlacedBuildingBlock>
): CarGeneratorDirection | null => {
  const top = buildingBlocks.get(`${gridX},${gridY - 1}`);
  const bottom = buildingBlocks.get(`${gridX},${gridY + 1}`);
  const left = buildingBlocks.get(`${gridX - 1},${gridY}`);
  const right = buildingBlocks.get(`${gridX + 1},${gridY}`);

  // Check if any adjacent cell has a street
  const hasTopStreet = top?.type === BuildingBlockType.STREET;
  const hasBottomStreet = bottom?.type === BuildingBlockType.STREET;
  const hasLeftStreet = left?.type === BuildingBlockType.STREET;
  const hasRightStreet = right?.type === BuildingBlockType.STREET;

  // Prioritize directions based on what makes sense:
  // - If there's a street below, generate cars going up (NORTH)
  // - If there's a street above, generate cars going down (SOUTH)
  // - If there's a street to the left, generate cars going right (EAST)
  // - If there's a street to the right, generate cars going left (WEST)

  if (hasBottomStreet) return CarGeneratorDirection.SOUTH;
  if (hasTopStreet) return CarGeneratorDirection.NORTH;
  if (hasLeftStreet) return CarGeneratorDirection.WEST;
  if (hasRightStreet) return CarGeneratorDirection.EAST;

  return null; // No adjacent streets
};

/**
 * Checks if a car generator can be placed at the given position
 * Car generators must be adjacent to at least one street
 */
export const canPlaceCarGenerator = (
  gridX: number,
  gridY: number,
  buildingBlocks: Map<string, PlacedBuildingBlock>
): boolean => {
  return determineCarGeneratorDirection(gridX, gridY, buildingBlocks) !== null;
};

/**
 * Creates a new car generator block with the appropriate direction
 */
export const createCarGeneratorBlock = (
  id: string,
  gridX: number,
  gridY: number,
  buildingBlocks: Map<string, PlacedBuildingBlock>,
  frequency = 1, // cars per tile (when connected tile is free)
  speed = 2      // tiles per second
): CarGeneratorBlock | null => {
  const direction = determineCarGeneratorDirection(gridX, gridY, buildingBlocks);

  if (!direction) {
    return null;
  }

  return {
    id,
    type: BuildingBlockType.CAR_GENERATOR,
    gridX,
    gridY,
    direction,
    frequency,
    speed,
  };
};


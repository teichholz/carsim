import type { PlacedBuildingBlock } from './building-blocks';

export enum OperationType {
  PLACE = 'place',
  DELETE = 'delete',
  MOVE = 'move',
}

export interface PlaceOperation {
  type: OperationType.PLACE;
  blocks: PlacedBuildingBlock[];
}

export interface DeleteOperation {
  type: OperationType.DELETE;
  blocks: PlacedBuildingBlock[];
}

export interface MoveOperation {
  type: OperationType.MOVE;
  blocks: PlacedBuildingBlock[];
  originalPositions: Array<{ gridX: number; gridY: number }>;
  newPositions: Array<{ gridX: number; gridY: number }>;
}

export type Operation = PlaceOperation | DeleteOperation | MoveOperation;

export interface HistoryState {
  operations: Operation[];
  currentIndex: number; // Points to the last executed operation (-1 if no operations)
}

export const MAX_HISTORY_SIZE = 50;


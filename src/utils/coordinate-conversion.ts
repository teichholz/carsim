import type { GridState, ViewportState, GridCell, GridTransform } from '@/types/simulation-state';

/**
 * Convert screen coordinates to grid coordinates
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  gridState: GridState,
  _viewportState: ViewportState
): { x: number; y: number } {
  const { scale, position, size } = gridState;
  const scaledCellSize = size * scale;

  // Calculate the offset to align with grid positioning
  const offsetX = ((position.x % scaledCellSize) + scaledCellSize) % scaledCellSize;
  const offsetY = ((position.y % scaledCellSize) + scaledCellSize) % scaledCellSize;

  // Convert to grid coordinates
  const gridX = Math.floor((screenX + offsetX) / scaledCellSize);
  const gridY = Math.floor((screenY + offsetY) / scaledCellSize);

  return { x: gridX, y: gridY };
}

/**
 * Convert grid coordinates to screen coordinates
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  gridState: GridState,
  _viewportState: ViewportState
): { x: number; y: number } {
  const { scale, position, size } = gridState;
  const scaledCellSize = size * scale;

  // Calculate the offset to align with grid positioning
  const offsetX = ((position.x % scaledCellSize) + scaledCellSize) % scaledCellSize;
  const offsetY = ((position.y % scaledCellSize) + scaledCellSize) % scaledCellSize;

  // Convert to screen coordinates
  const screenX = gridX * scaledCellSize - offsetX;
  const screenY = gridY * scaledCellSize - offsetY;

  return { x: screenX, y: screenY };
}

/**
 * Calculate visible grid bounds based on viewport and grid state
 */
export function getVisibleGridBounds(
  gridState: GridState,
  viewportState: ViewportState
): { minX: number; maxX: number; minY: number; maxY: number } {
  const { scale, position, size } = gridState;
  const { width, height } = viewportState;
  const scaledCellSize = size * scale;

  // Calculate the offset to align with grid positioning
  const offsetX = ((position.x % scaledCellSize) + scaledCellSize) % scaledCellSize;
  const offsetY = ((position.y % scaledCellSize) + scaledCellSize) % scaledCellSize;

  // Calculate visible bounds with some padding
  const padding = 2;
  const minX = Math.floor((0 - offsetX) / scaledCellSize) - padding;
  const maxX = Math.ceil((width - offsetX) / scaledCellSize) + padding;
  const minY = Math.floor((0 - offsetY) / scaledCellSize) - padding;
  const maxY = Math.ceil((height - offsetY) / scaledCellSize) + padding;

  return { minX, maxX, minY, maxY };
}

/**
 * Calculate grid cell information from screen coordinates
 */
export function getGridCellFromScreen(
  screenX: number,
  screenY: number,
  gridState: GridState,
  viewportState: ViewportState
): GridCell | null {
  const { scale, size } = gridState;
  const scaledCellSize = size * scale;

  const gridCoords = screenToGrid(screenX, screenY, gridState, viewportState);

  return {
    x: gridCoords.x,
    y: gridCoords.y,
    size: scaledCellSize,
  };
}

/**
 * Calculate zoom transformation around a specific point
 */
export function calculateZoomTransform(
  currentTransform: GridTransform,
  zoomFactor: number,
  centerX: number,
  centerY: number,
  minScale: number = 0.1,
  maxScale: number = 3.0
): GridTransform {
  const newScale = Math.max(minScale, Math.min(maxScale, currentTransform.scale * zoomFactor));

  if (newScale === currentTransform.scale) {
    return currentTransform;
  }

  // Calculate the point in the current coordinate system
  const pointInCurrent = {
    x: (centerX - currentTransform.x) / currentTransform.scale,
    y: (centerY - currentTransform.y) / currentTransform.scale,
  };

  // Calculate new position to keep the point under the cursor
  const newX = centerX - pointInCurrent.x * newScale;
  const newY = centerY - pointInCurrent.y * newScale;

  return {
    scale: newScale,
    x: newX,
    y: newY,
  };
}

/**
 * Calculate pan transformation
 */
export function calculatePanTransform(
  currentTransform: GridTransform,
  deltaX: number,
  deltaY: number
): GridTransform {
  return {
    scale: currentTransform.scale,
    x: currentTransform.x + deltaX,
    y: currentTransform.y + deltaY,
  };
}

/**
 * Check if a grid cell is visible in the viewport
 */
export function isGridCellVisible(
  gridX: number,
  gridY: number,
  gridState: GridState,
  viewportState: ViewportState
): boolean {
  const bounds = getVisibleGridBounds(gridState, viewportState);

  return (
    gridX >= bounds.minX &&
    gridX <= bounds.maxX &&
    gridY >= bounds.minY &&
    gridY <= bounds.maxY
  );
}

/**
 * Calculate the distance between two grid cells
 */
export function getGridDistance(
  cell1: { x: number; y: number },
  cell2: { x: number; y: number }
): number {
  const dx = cell2.x - cell1.x;
  const dy = cell2.y - cell1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get all grid cells within a certain radius of a center cell
 */
export function getGridCellsInRadius(
  centerX: number,
  centerY: number,
  radius: number,
  gridState: GridState,
  viewportState: ViewportState
): GridCell[] {
  const bounds = getVisibleGridBounds(gridState, viewportState);
  const { scale, size } = gridState;
  const scaledCellSize = size * scale;
  const cells: GridCell[] = [];

  for (let x = bounds.minX; x <= bounds.maxX; x++) {
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      const distance = getGridDistance({ x: centerX, y: centerY }, { x, y });
      if (distance <= radius) {
        cells.push({
          x,
          y,
          size: scaledCellSize,
        });
      }
    }
  }

  return cells;
}

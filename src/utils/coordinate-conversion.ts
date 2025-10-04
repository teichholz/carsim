import type { GridState, ViewportState, GridCell, GridTransform } from '@/types/simulation-state';

/**
 * Convert screen coordinates to grid coordinates
 * The grid container is transformed by position and scale, so we need to reverse that transformation
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  gridState: GridState,
  _viewportState: ViewportState
): { x: number; y: number } {
  const { scale, position, size } = gridState;
  const cellSize = size; // Use base cell size, not scaled

  // Reverse the container transformation: first subtract position, then divide by scale
  const transformedX = (screenX - position.x) / scale;
  const transformedY = (screenY - position.y) / scale;

  // Now convert to grid coordinates using the base cell size
  const gridX = Math.floor(transformedX / cellSize);
  const gridY = Math.floor(transformedY / cellSize);

  return { x: gridX, y: gridY };
}

/**
 * Convert grid coordinates to screen coordinates
 * Apply the container transformation: first multiply by cell size, then apply scale and position
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  gridState: GridState,
  _viewportState: ViewportState
): { x: number; y: number } {
  const { scale, position, size } = gridState;
  const cellSize = size; // Use base cell size

  // Convert to local coordinates first
  const localX = gridX * cellSize;
  const localY = gridY * cellSize;

  // Apply container transformation: scale then translate
  const screenX = localX * scale + position.x;
  const screenY = localY * scale + position.y;

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
  const cellSize = size; // Use base cell size

  // Transform viewport bounds to local grid coordinates
  const localMinX = (0 - position.x) / scale;
  const localMaxX = (width - position.x) / scale;
  const localMinY = (0 - position.y) / scale;
  const localMaxY = (height - position.y) / scale;

  // Calculate grid bounds with padding
  const padding = 2;
  const minX = Math.floor(localMinX / cellSize) - padding;
  const maxX = Math.ceil(localMaxX / cellSize) + padding;
  const minY = Math.floor(localMinY / cellSize) - padding;
  const maxY = Math.ceil(localMaxY / cellSize) + padding;

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
  minScale: number = 0.5,
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

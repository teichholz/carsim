"use client";

import type Konva from "konva";
import { useCallback, useRef, useState } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";

interface GridState {
  scale: number;
  x: number;
  y: number;
}

interface GridCell {
  x: number;
  y: number;
  size: number;
}

interface EquilateralGridProps {
  width: number;
  height: number;
  cellSize?: number;
  minScale?: number;
  maxScale?: number;
  showGridLines?: boolean;
}

export default function EquilateralGrid({
  width,
  height,
  cellSize = 50,
  minScale = 0.1,
  maxScale = 3.0,
  showGridLines = false,
}: EquilateralGridProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [gridState, setGridState] = useState<GridState>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({
    x: 0,
    y: 0,
  });

  // Calculate visible grid cells
  const getVisibleCells = useCallback((): GridCell[] => {
    const { scale, x, y } = gridState;
    const scaledCellSize = cellSize * scale;

    // Calculate bounds of visible area
    const left = -x / scaledCellSize;
    const top = -y / scaledCellSize;
    const right = (width - x) / scaledCellSize;
    const bottom = (height - y) / scaledCellSize;

    const cells: GridCell[] = [];

    // Add some padding to ensure smooth scrolling
    const padding = 2;
    const startX = Math.floor(left) - padding;
    const endX = Math.ceil(right) + padding;
    const startY = Math.floor(top) - padding;
    const endY = Math.ceil(bottom) + padding;

    for (let gridX = startX; gridX <= endX; gridX++) {
      for (let gridY = startY; gridY <= endY; gridY++) {
        cells.push({
          x: gridX,
          y: gridY,
          size: scaledCellSize,
        });
      }
    }

    return cells;
  }, [gridState, cellSize, width, height]);

  // Handle wheel events for zooming
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const oldScale = gridState.scale;
      const newScale =
        e.evt.deltaY > 0
          ? Math.max(minScale, oldScale * 0.9)
          : Math.min(maxScale, oldScale * 1.1);

      if (newScale === oldScale) return;

      const mousePointTo = {
        x: (pointer.x - gridState.x) / oldScale,
        y: (pointer.y - gridState.y) / oldScale,
      };

      setGridState({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [gridState, minScale, maxScale],
  );

  // Handle mouse move for panning and cell highlighting
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Handle panning when Ctrl is held and dragging
      if (isDragging && e.evt.ctrlKey) {
        const dx = pointer.x - lastPointerPosition.x;
        const dy = pointer.y - lastPointerPosition.y;

        setGridState((current) => ({
          ...current,
          x: current.x + dx,
          y: current.y + dy,
        }));
      }

      setLastPointerPosition(pointer);

      // Calculate which grid cell is being hovered
      const { scale, x, y } = gridState;
      const scaledCellSize = cellSize * scale;

      const gridX = Math.floor((pointer.x - x) / scaledCellSize);
      const gridY = Math.floor((pointer.y - y) / scaledCellSize);

      setHoveredCell({
        x: gridX,
        y: gridY,
        size: scaledCellSize,
      });
    },
    [isDragging, lastPointerPosition, gridState, cellSize],
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.ctrlKey) {
        setIsDragging(true);
        const stage = e.target.getStage();
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            setLastPointerPosition(pointer);
          }
        }
      }
    },
    [],
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle stage click to reset hover on click
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!e.evt.ctrlKey) {
        // Only reset hover if not panning
        setHoveredCell(null);
      }
    },
    [],
  );

  // Render grid lines for a cell
  const renderGridCell = useCallback(
    (cell: GridCell) => {
      const { x: gridX, y: gridY, size } = cell;
      const pixelX = gridX * size + gridState.x;
      const pixelY = gridY * size + gridState.y;

      const isHovered =
        hoveredCell && hoveredCell.x === gridX && hoveredCell.y === gridY;

      const opacity = isHovered ? 0.6 : 0.1;

      return (
        <Group key={`cell-${gridX}-${gridY}`}>
          {/* Cell background highlight when hovered */}
          {isHovered && (
            <Rect
              x={pixelX}
              y={pixelY}
              width={size}
              height={size}
              fill="#3b82f6"
              opacity={0.1}
              cornerRadius={5}
            />
          )}

          {/* Grid rectangle - single draw call instead of 4 lines */}
          {showGridLines && (
            <Rect
              x={pixelX}
              y={pixelY}
              width={size}
              height={size}
              fill="transparent"
              stroke="#6b7280"
              strokeWidth={Math.max(0.5, Math.min(2, gridState.scale))}
              opacity={opacity}
              perfectDrawEnabled={false}
              listening={false}
            />
          )}
        </Group>
      );
    },
    [gridState, hoveredCell, showGridLines],
  );

  const visibleCells = getVisibleCells();

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
        draggable={false}
      >
        <Layer>{visibleCells.map(renderGridCell)}</Layer>
      </Stage>

      {/* Grid info overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
        <div>Scale: {gridState.scale.toFixed(2)}x</div>
        <div>
          Position: ({Math.round(gridState.x)}, {Math.round(gridState.y)})
        </div>
        {hoveredCell && (
          <div>
            Cell: ({hoveredCell.x}, {hoveredCell.y})
          </div>
        )}
        <div className="text-xs mt-1 opacity-75">
          Ctrl + Drag to pan • Scroll to zoom
        </div>
      </div>
    </div>
  );
}

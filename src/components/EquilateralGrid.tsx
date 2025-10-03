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

  // Render the entire grid as a single geometry
  const renderGridLines = useCallback(() => {
    const { scale, x, y } = gridState;
    const scaledCellSize = cellSize * scale;
    const strokeWidth = Math.max(0.5, Math.min(2, scale));
    const opacity = 0.1;

    // Calculate the offset to align the grid properly
    const offsetX = ((x % scaledCellSize) + scaledCellSize) % scaledCellSize;
    const offsetY = ((y % scaledCellSize) + scaledCellSize) % scaledCellSize;

    return (
      <Group
        key="grid-lines"
        x={-offsetX}
        y={-offsetY}
        width={width + scaledCellSize}
        height={height + scaledCellSize}
      >
        {/* Vertical lines */}
        {Array.from({ length: Math.ceil((width + scaledCellSize) / scaledCellSize) + 1 }, (_, i) => (
          <Rect
            key={`vline-${i * scaledCellSize}`}
            x={i * scaledCellSize}
            y={0}
            width={strokeWidth}
            height={height + scaledCellSize}
            fill="#6b7280"
            opacity={opacity}
            listening={false}
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: Math.ceil((height + scaledCellSize) / scaledCellSize) + 1 }, (_, i) => (
          <Rect
            key={`hline-${i * scaledCellSize}`}
            x={0}
            y={i * scaledCellSize}
            width={width + scaledCellSize}
            height={strokeWidth}
            fill="#6b7280"
            opacity={opacity}
            listening={false}
          />
        ))}
      </Group>
    );
  }, [gridState, cellSize, width, height]);

  // Render highlighted grid cell
  const renderHighlightedCell = useCallback(() => {
    if (!hoveredCell) return null;

    const { scale, x, y } = gridState;
    const scaledCellSize = cellSize * scale;

    // Calculate the offset to align with grid lines
    const offsetX = ((x % scaledCellSize) + scaledCellSize) % scaledCellSize;
    const offsetY = ((y % scaledCellSize) + scaledCellSize) % scaledCellSize;

    // Calculate the pixel position of the hovered cell
    const pixelX = hoveredCell.x * scaledCellSize - offsetX;
    const pixelY = hoveredCell.y * scaledCellSize - offsetY;

    return (
      <Rect
        key={`highlight-${hoveredCell.x}-${hoveredCell.y}`}
        x={pixelX}
        y={pixelY}
        width={scaledCellSize}
        height={scaledCellSize}
        fill="#3b82f6"
        opacity={0.1}
        cornerRadius={5}
        listening={false}
      />
    );
  }, [gridState, hoveredCell, cellSize]);

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
        {/* Grid lines layer */}
        <Layer >
          {showGridLines && renderGridLines()}
        </Layer>

        {/* Highlighted grid layer */}
        <Layer>
          {renderHighlightedCell()}
        </Layer>
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

"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { BuildingBlock } from "@/types/building-blocks";
import { BUILDING_BLOCKS } from "@/types/building-blocks";

interface InventoryProps {
  onBlockSelect?: (block: BuildingBlock) => void;
  selectedBlock?: BuildingBlock | null;
}


export default function Inventory({ onBlockSelect, selectedBlock }: InventoryProps) {
  const [position, setPosition] = usePersistentState('inventory-position', { x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [dockSide, setDockSide] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartTime = useRef<number>(0);
  const lastDragPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });


  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // Only allow dragging from the header area
    const isDragHandle = (e.target as HTMLElement).closest(".drag-handle");
    if (!isDragHandle) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartTime.current = Date.now();

    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      lastDragPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const checkDocking = useCallback((x: number, y: number) => {
    const panelWidth = 300;
    const panelHeight = 200;

    // Check if we should dock (only when dragging is ending)
    if (!isDragging) {
      let shouldDock = false;
      let dockPosition = { x, y };
      let newDockSide: 'left' | 'right' | 'top' | 'bottom' | null = null;

      // Check left edge
      if (x <= 80) {
        shouldDock = true;
        dockPosition = { x: 0, y };
        newDockSide = 'left';
      }
      // Check right edge
      else if (x >= window.innerWidth - 80) {
        shouldDock = true;
        dockPosition = { x: window.innerWidth - panelWidth, y };
        newDockSide = 'right';
      }
      // Check top edge
      else if (y <= 80) {
        shouldDock = true;
        dockPosition = { x, y: 0 };
        newDockSide = 'top';
      }
      // Check bottom edge
      else if (y >= window.innerHeight - 80) {
        shouldDock = true;
        dockPosition = { x, y: window.innerHeight - panelHeight };
        newDockSide = 'bottom';
      }

      if (shouldDock && newDockSide !== dockSide) {
        setIsDocked(true);
        setDockSide(newDockSide);
        return dockPosition;
      }
    }

    // If currently docked and dragging away, undock
    if (isDocked && isDragging) {
      const distanceFromDock = Math.sqrt(
        Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)
      );
      if (distanceFromDock > 120) {
        setIsDocked(false);
        setDockSide(null);
      }
    }

    return { x, y };
  }, [isDocked, isDragging, dockSide, position]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep panel within viewport bounds
      const panelWidth = panelRef.current?.offsetWidth || 300;
      const panelHeight = panelRef.current?.offsetHeight || 200;
      const maxX = window.innerWidth - panelWidth;
      const maxY = window.innerHeight - panelHeight;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      // Update position immediately for smooth dragging
      setPosition({ x: boundedX, y: boundedY });
      lastDragPosition.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging, dragOffset, setPosition],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // Check for docking when drag ends
      const finalPosition = checkDocking(position.x, position.y);
      if (finalPosition.x !== position.x || finalPosition.y !== position.y) {
        setPosition(finalPosition);
      }
    }
  }, [isDragging, position, checkDocking, setPosition]);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBlockClick = (block: BuildingBlock) => {
    onBlockSelect?.(block);
  };

  const handleBlockHover = (blockId: string | null) => {
    setHoveredBlock(blockId);
  };

  return (
    <div
      ref={panelRef}
      className={`fixed bg-white rounded-lg border select-none z-20 ${
        isDragging
          ? 'shadow-2xl border-blue-300 scale-105'
          : isDocked
            ? 'shadow-xl border-gray-300'
            : 'shadow-lg border-gray-200'
      }`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
        minWidth: "300px",
        maxWidth: "320px",
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseDown={handleMouseDown}
      role="dialog"
      aria-label="Building Blocks Inventory"
    >
      {/* Header with drag handle */}
      <div className={`drag-handle flex items-center justify-between p-4 border-b border-gray-200 transition-colors duration-200 ${
        isDragging
          ? 'bg-blue-50 border-blue-200'
          : 'hover:bg-gray-50'
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Building Blocks</h3>
        </div>
        <div className="flex items-center gap-2">
          {isDocked && (
            <div className="text-xs text-blue-600 font-medium">
              Docked to {dockSide}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
            aria-label={isCollapsed ? "Expand inventory" : "Collapse inventory"}
          >
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {BUILDING_BLOCKS.map((block) => (
              <button
                key={block.id}
                type="button"
                className={`relative group cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md w-full ${
                  selectedBlock?.id === block.id
                    ? 'border-blue-500 bg-blue-50'
                    : hoveredBlock === block.id
                    ? 'border-blue-300 bg-blue-25'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleBlockClick(block)}
                onMouseEnter={() => handleBlockHover(block.id)}
                onMouseLeave={() => handleBlockHover(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBlockClick(block);
                  }
                }}
                aria-label={`Select ${block.name}`}
              >
                {/* Block Icon */}
                <div className="text-2xl mb-2 text-center">
                  {block.icon}
                </div>

                {/* Block Name */}
                <div className="text-sm font-medium text-gray-800 text-center mb-1">
                  {block.name}
                </div>

                {/* Block Description */}
                <div className="text-xs text-gray-500 text-center">
                  {block.description}
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                {/* Selection Indicator */}
                {selectedBlock?.id === block.id && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Click to select a building block</div>
              <div>• Drag to move inventory</div>
              <div>• Drag near edges to dock</div>
              <div>• Hover for smooth animations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

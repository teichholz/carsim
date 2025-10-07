"use client";

import { useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { BuildingBlock } from "@/types/building-blocks";
import { BUILDING_BLOCKS } from "@/types/building-blocks";

interface InventoryProps {
  onBlockSelect?: (block: BuildingBlock) => void;
  selectedBlock?: BuildingBlock | null;
}

type DockSide = "left" | "right" | "top" | "bottom" | null;

export default function Inventory({
  onBlockSelect,
  selectedBlock,
}: InventoryProps) {
  const [position, setPosition] = usePersistentState("inventory-position", {
    x: 20,
    y: 20,
  });

  const [isCollapsed, setIsCollapsed] = usePersistentState(
    "inventory-collapsed",
    false
  );

  const [isDocked, setIsDocked] = useState(false);
  const [dockSide, setDockSide] = useState<DockSide>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);

  const checkDocking = (x: number, y: number) => {
    const DOCK_THRESHOLD = 80;
    const panelWidth = 320;
    const panelHeight = 400;

    // Check left edge
    if (x <= DOCK_THRESHOLD) {
      setIsDocked(true);
      setDockSide("left");
      return { x: 0, y };
    }
    // Check right edge
    if (x >= window.innerWidth - DOCK_THRESHOLD) {
      setIsDocked(true);
      setDockSide("right");
      return { x: window.innerWidth - panelWidth, y };
    }
    // Check top edge
    if (y <= DOCK_THRESHOLD) {
      setIsDocked(true);
      setDockSide("top");
      return { x, y: 0 };
    }
    // Check bottom edge
    if (y >= window.innerHeight - DOCK_THRESHOLD) {
      setIsDocked(true);
      setDockSide("bottom");
      return { x, y: window.innerHeight - panelHeight };
    }

    // Not near any edge - undock
    setIsDocked(false);
    setDockSide(null);
    return { x, y };
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 400;

    const boundedPosition = {
      x: Math.max(0, Math.min(newPosition.x, maxX)),
      y: Math.max(0, Math.min(newPosition.y, maxY)),
    };

    // Check for docking
    const finalPosition = checkDocking(boundedPosition.x, boundedPosition.y);
    setPosition(finalPosition);
  };

  const handleBlockClick = (block: BuildingBlock) => {
    onBlockSelect?.(block);
  };

  const handleBlockHover = (blockId: string | null) => {
    setHoveredBlock(blockId);
  };

  return (
    <motion.div
      key={`${position.x}-${position.y}`}
      ref={panelRef}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      animate={{
        borderColor: isDocked ? "rgb(209, 213, 219)" : "rgb(229, 231, 235)",
      }}
      transition={{
        borderColor: { duration: 0.3 },
      }}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      className={`fixed bg-white rounded-lg border select-none z-20 ${
        isDocked ? "shadow-xl" : "shadow-lg"
      }`}
      style={{
        left: position.x,
        top: position.y,
        minWidth: "300px",
        maxWidth: "320px",
        touchAction: "none",
      }}
      role="dialog"
      aria-label="Building Blocks Inventory"
    >
      {/* Header with drag handle */}
      <motion.div
        className="drag-handle flex items-center justify-between p-4 border-b border-gray-200 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) {
            return;
          }
          dragControls.start(e);
        }}
        whileHover={{
          backgroundColor: "rgb(249, 250, 251)",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Building Blocks
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isDocked && (
            <motion.div
              className="text-xs text-blue-600 font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              Docked to {dockSide}
            </motion.div>
          )}
          <motion.button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
            title={isCollapsed ? "Expand" : "Collapse"}
            aria-label={isCollapsed ? "Expand inventory" : "Collapse inventory"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={false}
        animate={{
          height: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{
          height: { duration: 0.3, ease: "easeInOut" },
          opacity: { duration: 0.2, delay: isCollapsed ? 0 : 0.1 },
        }}
        style={{ overflow: "hidden" }}
      >
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {BUILDING_BLOCKS.map((block, index) => (
              <motion.button
                key={block.id}
                type="button"
                className={`relative group cursor-pointer p-3 rounded-lg border-2 w-full ${
                  selectedBlock?.id === block.id
                    ? "border-blue-500 bg-blue-50"
                    : hoveredBlock === block.id
                      ? "border-blue-300 bg-blue-25"
                      : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleBlockClick(block)}
                onMouseEnter={() => handleBlockHover(block.id)}
                onMouseLeave={() => handleBlockHover(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleBlockClick(block);
                  }
                }}
                aria-label={`Select ${block.name}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Block Icon */}
                <motion.div
                  className="text-2xl mb-2 text-center"
                  animate={{
                    scale: hoveredBlock === block.id ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {block.icon}
                </motion.div>

                {/* Block Name */}
                <div className="text-sm font-medium text-gray-800 text-center mb-1">
                  {block.name}
                </div>

                {/* Block Description */}
                <div className="text-xs text-gray-500 text-center">
                  {block.description}
                </div>

                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredBlock === block.id ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />

                {/* Selection Indicator */}
                {selectedBlock?.id === block.id && (
                  <motion.div
                    className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Instructions */}
          <motion.div
            className="mt-4 p-3 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Click to select a building block</div>
              <div>• Drag to move inventory</div>
              <div>• Drag near edges to dock</div>
              <div>• Hover for smooth animations</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

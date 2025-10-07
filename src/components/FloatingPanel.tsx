"use client";

import { motion, useDragControls } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { usePersistentState } from "@/hooks/usePersistentState";

interface FloatingPanelProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  className?: string;
}

export default function FloatingPanel({
  title,
  children,
  initialPosition = { x: 20, y: 20 },
  className = "",
}: FloatingPanelProps) {
  const [position, setPosition] = usePersistentState(
    `${title}-position`,
    initialPosition
  );

  const [isCollapsed, setIsCollapsed] = usePersistentState(
    `${title}-collapsed`,
    false
  );

  const dragControls = useDragControls();

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Calculate the final position and persist it
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - 280;
    const maxY = window.innerHeight - 200;

    setPosition({
      x: Math.max(0, Math.min(newPosition.x, maxX)),
      y: Math.max(0, Math.min(newPosition.y, maxY)),
    });
  };

  return (
    <motion.div
      key={`${position.x}-${position.y}`}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      className={`fixed bg-white rounded-lg border border-gray-200 select-none z-10 shadow-lg ${className}`}
      style={{
        left: position.x,
        top: position.y,
        minWidth: "280px",
        touchAction: "none",
      }}
      role="dialog"
      aria-label={title}
    >
      {/* Header with drag handle */}
      <motion.div
        className="drag-handle flex items-center justify-between p-4 border-b border-gray-200 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          // Don't start dragging if clicking on the collapse button
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
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
            title={isCollapsed ? "Expand" : "Collapse"}
            aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
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
        <div className="p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

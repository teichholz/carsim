"use client";

import EquilateralGrid from "@/components/EquilateralGrid";
import FloatingPanel from "@/components/FloatingPanel";
import Inventory from "@/components/Inventory";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useEffect, useState } from "react";
import type { BuildingBlock } from "@/types/building-blocks";

export default function Home() {
  const [gridSize, setGridSize] = usePersistentState('grid-size', 50);
  const [showGridLines, setShowGridLines] = usePersistentState('show-grid-lines', false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [selectedBlock, setSelectedBlock] = useState<BuildingBlock | null>(null);


  // Update viewport size on mount and resize
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  // Don't render until viewport size is available
  if (viewportSize.width === 0 || viewportSize.height === 0) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* Fullscreen Grid */}
      <EquilateralGrid
        width={viewportSize.width}
        height={viewportSize.height}
        cellSize={gridSize}
        showGridLines={showGridLines}
      />

      {/* Building Blocks Inventory */}
      <Inventory
        onBlockSelect={setSelectedBlock}
        selectedBlock={selectedBlock}
      />

      {/* Floating Grid Controls Panel */}
      <FloatingPanel
        title="Grid Controls"
        initialPosition={{ x: 20, y: 200 }}
        className="min-w-[280px]"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="gridSizeSlider"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cell Size: {gridSize}px
            </label>
            <input
              id="gridSizeSlider"
              type="range"
              min="20"
              max="100"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Adjust cell size with slider</div>
            <div>• Grid scales with cell size</div>
            <div>• Maintains equilateral properties</div>
          </div>

          {/* Grid Lines Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="gridLinesToggle"
              className="text-sm font-medium text-gray-700"
            >
              Show Grid Lines
            </label>
            <button
              id="gridLinesToggle"
              type="button"
              onClick={() => setShowGridLines(!showGridLines)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showGridLines ? "bg-blue-600" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={showGridLines}
              aria-label="Toggle grid lines visibility"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showGridLines ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Debug Info */}
          <div className="text-xs text-gray-500 space-y-1 pt-3">
            <div>Grid Size: {gridSize}px</div>
            <div>
              Viewport: {viewportSize.width}×{viewportSize.height}
            </div>
            <div>Grid Lines: {showGridLines ? "Enabled" : "Disabled"}</div>
            <div>Selected Block: {selectedBlock?.name || "None"}</div>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}

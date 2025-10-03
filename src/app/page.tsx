"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EquilateralGrid from "../components/EquilateralGrid";
import FloatingPanel from "../components/FloatingPanel";

export default function Home() {
  const [gridSize, setGridSize] = useState(50);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Update viewport size on mount and resize
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Don't render until viewport size is available
  if (viewportSize.width === 0 || viewportSize.height === 0) {
    return <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* Fullscreen Grid */}
      <EquilateralGrid
        width={viewportSize.width}
        height={viewportSize.height}
        cellSize={gridSize}
        showGridLines={true}
      />

      {/* Floating Title Panel */}
      <FloatingPanel
        title="Car Simulation Grid"
        initialPosition={{ x: 20, y: 20 }}
        className="min-w-[300px]"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Equilateral grid system for traffic simulation
          </p>
          <Link
            href="/demo"
            className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            Advanced Demo →
          </Link>
        </div>
      </FloatingPanel>

      {/* Floating Grid Controls Panel */}
      <FloatingPanel
        title="Grid Controls"
        initialPosition={{ x: 20, y: 200 }}
        className="min-w-[280px]"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="gridSizeSlider" className="block text-sm font-medium text-gray-700 mb-2">
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
        </div>
      </FloatingPanel>

      {/* Floating Features Panel */}
      <FloatingPanel
        title="Grid Features"
        initialPosition={{ x: viewportSize.width - 320, y: 20 }}
        className="min-w-[300px]"
      >
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Equilateral grid cells</span>
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Zoom in/out with mouse wheel</span>
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <span>Pan with Ctrl + Mouse drag</span>
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span>Hover highlighting</span>
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span>Infinite grid rendering</span>
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
            <span>Performance optimized</span>
          </li>
        </ul>
      </FloatingPanel>

      {/* Floating Instructions Panel */}
      <FloatingPanel
        title="Instructions"
        initialPosition={{ x: viewportSize.width - 320, y: 300 }}
        className="min-w-[300px]"
      >
        <div className="text-sm text-gray-600 space-y-2">
          <div className="font-medium text-gray-800">Controls:</div>
          <div>• Hover over grid cells to highlight</div>
          <div>• Ctrl + Drag to pan around</div>
          <div>• Scroll to zoom in/out</div>
          <div>• Drag panels to reposition</div>
          <div>• Click collapse button to minimize</div>
        </div>
      </FloatingPanel>

      {/* Floating Next Steps Panel */}
      <FloatingPanel
        title="Development Progress"
        initialPosition={{ x: viewportSize.width - 320, y: 500 }}
        className="min-w-[300px]"
      >
        <div className="text-sm text-gray-600 space-y-1">
          <div>✅ Equilateral grid system</div>
          <div>✅ Fullscreen layout</div>
          <div>✅ Floating UI panels</div>
          <div>⏳ Building blocks (streets, roundabouts)</div>
          <div>⏳ Car generators and simulation</div>
          <div>⏳ Traffic behavior modeling</div>
          <div>⏳ Sound effects</div>
        </div>
      </FloatingPanel>
    </div>
  );
}

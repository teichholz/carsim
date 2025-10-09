"use client";

import { Application, extend } from "@pixi/react";
import { Container, type FederatedPointerEvent } from "pixi.js";
import { useState, useEffect, useRef } from "react";
import AnimatedSphere from "@/components/building-blocks/car/AnimatedSphere";
import SimpleSphere from "@/components/building-blocks/car/SimpleSphere";
import OptimizedSphere from "@/components/building-blocks/car/OptimizedSphere";
import UltraOptimizedSpheres from "@/components/building-blocks/car/UltraOptimizedSpheres";

extend({ Container });

export default function SphereDemo() {
  const [spheres, setSpheres] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
  }>>([]);

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [radius, setRadius] = useState(15);
  const [selectedColor, setSelectedColor] = useState("#4488ff");
  const [sphereType, setSphereType] = useState<'animated' | 'simple' | 'optimized' | 'ultra'>('ultra');
  const [fps, setFps] = useState(60);

  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const spheresRef = useRef(spheres);

  // Keep spheresRef in sync
  useEffect(() => {
    spheresRef.current = spheres;
  }, [spheres]);

  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = (currentTime: number) => {
      const delta = currentTime - lastFrameTimeRef.current;
      const currentFps = Math.round(1000 / delta);
      setFps(currentFps);
      lastFrameTimeRef.current = currentTime;

      setSpheres(prev => prev.map(sphere => {
        let newX = sphere.x + sphere.vx * speed;
        let newY = sphere.y + sphere.vy * speed;
        let newVx = sphere.vx;
        let newVy = sphere.vy;

        // Bounce off walls
        if (newX < radius || newX > window.innerWidth - radius) {
          newVx = -newVx;
          newX = Math.max(radius, Math.min(window.innerWidth - radius, newX));
        }
        if (newY < radius || newY > window.innerHeight - radius) {
          newVy = -newVy;
          newY = Math.max(radius, Math.min(window.innerHeight - radius, newY));
        }

        return {
          ...sphere,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      }));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, speed, radius]);

  const addSphere = (e: FederatedPointerEvent) => {
    const x = e.global.x;
    const y = e.global.y;

    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle);
    const vy = Math.sin(angle);

    setSpheres(prev => [...prev, {
      id: Date.now() + Math.random(),
      x,
      y,
      vx,
      vy,
      color: selectedColor,
    }]);
  };

  const clearSpheres = () => {
    setSpheres([]);
  };

  const addRandomSpheres = (count: number = 10) => {
    const newSpheres = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const colors = ["#4488ff", "#ff4488", "#44ff88", "#ffaa44", "#aa44ff", "#44ffff"];
      return {
        id: Date.now() + i + Math.random(),
        x: Math.random() * (window.innerWidth - 2 * radius) + radius,
        y: Math.random() * (window.innerHeight - 2 * radius) + radius,
        vx: Math.cos(angle),
        vy: Math.sin(angle),
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });
    setSpheres(prev => [...prev, ...newSpheres]);
  };

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-gray-800 rounded-lg p-4 shadow-lg z-10 text-white space-y-4 min-w-[280px]">
        <h2 className="text-xl font-bold mb-4">
          {sphereType === 'animated' ? 'AnimatedSphere' : sphereType === 'simple' ? 'SimpleSphere' : sphereType === 'optimized' ? 'OptimizedSphere' : 'UltraOptimized'} Demo
        </h2>

        <div className="space-y-2">
          <span className="block">Implementation:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSphereType('animated')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors text-sm ${
                sphereType === 'animated' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Animated
            </button>
            <button
              type="button"
              onClick={() => setSphereType('simple')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors text-sm ${
                sphereType === 'simple' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setSphereType('optimized')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors text-sm ${
                sphereType === 'optimized' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Optimized
            </button>
            <button
              type="button"
              onClick={() => setSphereType('ultra')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors text-sm ${
                sphereType === 'ultra' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Ultra ⚡
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Speed: {speed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Radius: {radius}px</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <span className="block">Color:</span>
          <div className="flex gap-2 flex-wrap">
            {["#4488ff", "#ff4488", "#44ff88", "#ffaa44", "#aa44ff", "#44ffff"].map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedColor === color ? "border-white scale-110" : "border-gray-600"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-700">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
              isRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isRunning ? "⏸ Pause" : "▶ Start"}
          </button>

          <button
            type="button"
            onClick={() => addRandomSpheres(10)}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
          >
            + Add 10 Spheres
          </button>

          <button
            type="button"
            onClick={() => addRandomSpheres(100)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            + Add 100 Spheres
          </button>

          <button
            type="button"
            onClick={() => addRandomSpheres(1000)}
            className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold transition-colors"
          >
            + Add 1,000 Spheres
          </button>

          <button
            type="button"
            onClick={() => addRandomSpheres(5000)}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
          >
            + Add 5,000 Spheres ⚡
          </button>

          <button
            type="button"
            onClick={() => addRandomSpheres(10000)}
            className="w-full px-4 py-2 bg-indigo-700 hover:bg-indigo-800 rounded-lg font-semibold transition-colors"
          >
            + Add 10,000 Spheres 🚀
          </button>

          <button
            type="button"
            onClick={clearSpheres}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
          <p>Spheres: {spheres.length}</p>
          <p className={`mt-1 font-semibold ${fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
            FPS: {fps}
          </p>
          <p className="mt-1 text-xs">Click anywhere to add a sphere</p>
        </div>
      </div>

      {/* PixiJS Canvas */}
      <Application
        width={window.innerWidth}
        height={window.innerHeight}
        backgroundColor={0x1a1a2e}
      >
        <pixiContainer
          eventMode="static"
          onPointerDown={addSphere}
        >
          {sphereType === 'ultra' ? (
            <UltraOptimizedSpheres
              spheres={spheres}
              radius={radius}
            />
          ) : (
            spheres.map((sphere) => {
              if (sphereType === 'animated') {
                return (
                  <AnimatedSphere
                    key={sphere.id}
                    x={sphere.x}
                    y={sphere.y}
                    radius={radius}
                    velocityX={sphere.vx * speed}
                    velocityY={sphere.vy * speed}
                    color={sphere.color}
                  />
                );
              } else if (sphereType === 'simple') {
                return (
                  <SimpleSphere
                    key={sphere.id}
                    x={sphere.x}
                    y={sphere.y}
                    radius={radius}
                    color={sphere.color}
                  />
                );
              } else {
                return (
                  <OptimizedSphere
                    key={sphere.id}
                    x={sphere.x}
                    y={sphere.y}
                    radius={radius}
                    color={sphere.color}
                  />
                );
              }
            })
          )}
        </pixiContainer>
      </Application>
    </div>
  );
}

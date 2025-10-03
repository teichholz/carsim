"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text, Star, RegularPolygon } from "react-konva";
import Link from "next/link";

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
}

export default function DemoPage() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animation, setAnimation] = useState({ time: 0, rotation: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<number[]>([]);
  const [shapes, setShapes] = useState([
    { id: "star1", x: 100, y: 100, type: "star", color: "#ff6b6b" },
    { id: "hex1", x: 300, y: 150, type: "hexagon", color: "#4ecdc4" },
    { id: "rect1", x: 500, y: 100, type: "rectangle", color: "#45b7d1" },
  ]);
  const stageRef = useRef<Konva.Stage>(null);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimation(prev => ({
        time: prev.time + 1,
        rotation: prev.rotation + 2
      }));

      // Update particles
      setParticles(prev =>
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.02,
            vx: particle.vx * 0.98,
            vy: particle.vy * 0.98 + 0.1, // gravity
          }))
          .filter(particle => particle.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
      setMousePos(pointerPosition);

      if (isDrawing) {
        setDrawingPath(prev => [...prev, pointerPosition.x, pointerPosition.y]);
      }
    }
  };

  const handleMouseDown = () => {
    setIsDrawing(true);
    setDrawingPath([]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const createParticle = (x: number, y: number) => {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"];
    const newParticle: Particle = {
      id: `particle_${Date.now()}_${Math.random()}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      radius: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    };
    setParticles(prev => [...prev, newParticle]);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
      createParticle(pointerPosition.x, pointerPosition.y);
    }
  };

  const addRandomShape = () => {
    const types = ["star", "hexagon", "rectangle", "circle"];
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"];
    const newShape = {
      id: `shape_${Date.now()}`,
      x: Math.random() * 600 + 50,
      y: Math.random() * 300 + 50,
      type: types[Math.floor(Math.random() * types.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setShapes(prev => [...prev, newShape]);
  };

  const clearAll = () => {
    setParticles([]);
    setShapes([]);
    setDrawingPath([]);
  };

  const renderShape = (shape: { id: string; x: number; y: number; type: string; color: string }) => {
    const commonProps = {
      x: shape.x,
      y: shape.y,
      fill: shape.color,
      stroke: "#374151",
      strokeWidth: 2,
      shadowColor: "black",
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 }
    };

    switch (shape.type) {
      case "star":
        return <Star {...commonProps} numPoints={5} innerRadius={20} outerRadius={40} />;
      case "hexagon":
        return <RegularPolygon {...commonProps} sides={6} radius={30} />;
      case "circle":
        return <Circle {...commonProps} radius={30} />;
      case "rectangle":
      default:
        return <Rect {...commonProps} width={60} height={60} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">
              Advanced React Konva Demo
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Advanced 2D graphics with particles, drawing, and complex shapes
          </p>
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={addRandomShape}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Add Random Shape
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Canvas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Interactive Canvas</h2>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <Stage
                ref={stageRef}
                width={700}
                height={500}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onClick={handleStageClick}
              >
                <Layer>
                  {/* Background pattern */}
                  {Array.from({ length: 14 }, (_, i) => (
                    <Line
                      key={`vertical-pattern-${i * 50}`}
                      points={[i * 50, 0, i * 50, 500]}
                      stroke="#f3f4f6"
                      strokeWidth={1}
                    />
                  ))}
                  {Array.from({ length: 10 }, (_, i) => (
                    <Line
                      key={`horizontal-pattern-${i * 50}`}
                      points={[0, i * 50, 700, i * 50]}
                      stroke="#f3f4f6"
                      strokeWidth={1}
                    />
                  ))}

                  {/* Complex animated shape */}
                  <Group
                    x={350}
                    y={250}
                    rotation={animation.rotation}
                    offsetX={50}
                    offsetY={50}
                  >
                    <Rect
                      width={100}
                      height={100}
                      fill="rgba(139, 92, 246, 0.3)"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      cornerRadius={10}
                    />
                    <Circle
                      x={50}
                      y={50}
                      radius={30}
                      fill="rgba(236, 72, 153, 0.5)"
                      stroke="#ec4899"
                      strokeWidth={2}
                    />
                    <Star
                      x={50}
                      y={50}
                      numPoints={6}
                      innerRadius={15}
                      outerRadius={25}
                      fill="rgba(251, 191, 36, 0.8)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </Group>

                  {/* Draggable shapes */}
                  {shapes.map((shape) => (
                    <Group
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      draggable
                      onDragEnd={(e) => {
                        setShapes(prev => prev.map(s =>
                          s.id === shape.id
                            ? { ...s, x: e.target.x(), y: e.target.y() }
                            : s
                        ));
                      }}
                    >
                      {renderShape(shape)}
                    </Group>
                  ))}

                  {/* Particles */}
                  {particles.map((particle) => (
                    <Circle
                      key={particle.id}
                      x={particle.x}
                      y={particle.y}
                      radius={particle.radius}
                      fill={particle.color}
                      opacity={particle.life}
                    />
                  ))}

                  {/* Drawing path */}
                  {drawingPath.length > 0 && (
                    <Line
                      points={drawingPath}
                      stroke="#ef4444"
                      strokeWidth={3}
                      lineCap="round"
                      lineJoin="round"
                    />
                  )}

                  {/* Mouse follower with trail */}
                  <Circle
                    x={mousePos.x}
                    y={mousePos.y}
                    radius={12}
                    fill="rgba(239, 68, 68, 0.6)"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Circle
                    x={mousePos.x}
                    y={mousePos.y}
                    radius={6}
                    fill="#ef4444"
                  />

                  {/* Animated text */}
                  <Text
                    x={50}
                    y={450}
                    text="Click to create particles • Drag to draw • Move shapes around"
                    fontSize={14}
                    fill="#6b7280"
                    fontFamily="Arial"
                    rotation={Math.sin(animation.time * 0.05) * 2}
                  />
                </Layer>
              </Stage>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Mouse: ({Math.round(mousePos.x)}, {Math.round(mousePos.y)}) •
              Particles: {particles.length} •
              Shapes: {shapes.length}
            </p>
          </div>

          {/* Features Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Advanced Features</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span>Particle system with physics</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                  <span>Freehand drawing with mouse</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span>Complex shape combinations</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span>Real-time mouse tracking</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span>Interactive click events</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span>Opacity and transparency effects</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                  <span>Complex grouped animations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active particles:</span>
                  <span className="font-mono text-green-600">{particles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shapes on canvas:</span>
                  <span className="font-mono text-blue-600">{shapes.length + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drawing points:</span>
                  <span className="font-mono text-purple-600">{Math.floor(drawingPath.length / 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Animation FPS:</span>
                  <span className="font-mono text-orange-600">~60</span>
                </div>
                <div className="flex justify-between">
                  <span>Canvas size:</span>
                  <span className="font-mono text-gray-600">700x500px</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• <strong>Click</strong> anywhere to create particles</p>
                <p>• <strong>Drag</strong> to draw freehand lines</p>
                <p>• <strong>Move</strong> shapes by dragging them</p>
                <p>• <strong>Add</strong> random shapes with the button</p>
                <p>• <strong>Clear</strong> everything to start fresh</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-12 text-gray-600">
          <p>
            Advanced demo built with <span className="text-purple-500">♥</span> using React Konva
          </p>
        </footer>
      </div>
    </div>
  );
}

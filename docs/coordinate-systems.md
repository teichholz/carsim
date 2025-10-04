## Coordinate Systems in the Car Simulation

This project uses **4 distinct coordinate systems** that work together to create a smooth, zoomable, and pannable infinite grid system:

### 1. **Screen Coordinates** 📱
- **Origin**: Top-left corner of the browser viewport
- **Units**: Pixels
- **Purpose**: Raw mouse/touch input, browser viewport dimensions
- **Example**: `(100, 200)` means 100px from left, 200px from top of viewport

### 2. **Grid Coordinates** 🔲
- **Origin**: Top-left corner of the infinite grid
- **Units**: Grid cells (discrete integers)
- **Purpose**: Logical positioning of building blocks (streets, roundabouts, etc.)
- **Example**: `(5, 3)` means 5th column, 3rd row in the grid
- **Key Feature**: These are **discrete** coordinates - you can only place items at whole grid positions

### 3. **World Coordinates** 🌍
- **Origin**: Top-left corner of the grid in world space
- **Units**: Pixels (but in world space, not screen space)
- **Purpose**: Local coordinates within the transformed PIXI container
- **Example**: `(250, 150)` means 250px from grid origin, 150px down
- **Key Feature**: Used for rendering within the transformed container

### 4. **Local Coordinates** (within transformed container) 🎯
- **Origin**: Top-left corner of the transformed container
- **Units**: Pixels (scaled and positioned)
- **Purpose**: Intermediate step in coordinate transformations
- **Key Feature**: These are world coordinates after applying scale/position transformations

## How They Transform Into Each Other

```typescript
// The transformation chain:
Screen ←→ Local ←→ World ←→ Grid

// Key transformation functions:

// 1. Screen → Grid (for mouse input)
screenToGrid(screenX, screenY) → { x: gridX, y: gridY }

// 2. Grid → Screen (for positioning UI elements)
gridToScreen(gridX, gridY) → { x: screenX, y: screenY }

// 3. Grid → World (for rendering in PIXI container)
gridToWorld(gridX, gridY, cellSize) → { x: worldX, y: worldY }
```

## Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│                    SCREEN COORDINATES                       │
│  (0,0) ──────────────────────────────────────────── (800,0) │
│    │                                                 │       │
│    │  ┌─────────────────────────────────────────┐    │       │
│    │  │         VIEWPORT                        │    │       │
│    │  │                                         │    │       │
│    │  │  ┌─────────────────────────────────┐    │    │       │
│    │  │  │     TRANSFORMED CONTAINER       │    │    │       │
│    │  │  │  (position: 100,50, scale: 1.5) │    │    │       │
│    │  │  │                                 │    │    │       │
│    │  │  │  ┌─────────────────────────┐    │    │    │       │
│    │  │  │  │   WORLD COORDINATES     │    │    │    │       │
│    │  │  │  │                         │    │    │    │       │
│    │  │  │  │  ┌─────────────────┐    │    │    │    │       │
│    │  │  │  │  │ GRID COORDINATES│    │    │    │    │       │
│    │  │  │  │  │  (0,0) (1,0)    │    │    │    │    │       │
│    │  │  │  │  │  (0,1) (1,1)    │    │    │    │    │       │
│    │  │  │  │  └─────────────────┘    │    │    │    │       │
│    │  │  │  └─────────────────────────┘    │    │    │       │
│    │  │  └─────────────────────────────────┘    │    │       │
│    │  └─────────────────────────────────────────┘    │       │
│    │                                                 │       │
│    │                                                 │       │
│ (0,600) ──────────────────────────────────────── (800,600)   │
└─────────────────────────────────────────────────────────────┘
```

## Key Features of This System

### **Infinite Grid** ♾️
- The grid extends infinitely in all directions
- Only visible portions are calculated and rendered
- Uses `getVisibleGridBounds()` to determine what to draw

### **Smooth Zooming & Panning** 🔍
- **Zoom**: Changes the `scale` factor (0.5x to 3.0x)
- **Pan**: Changes the `position` offset
- **Zoom around cursor**: Uses `calculateZoomTransform()` to maintain cursor position

### **Coordinate System Conversions** 🔄

```typescript
// Mouse click on screen → Grid cell selection
const gridCell = screenToGrid(mouseX, mouseY, gridState, viewportState);

// Building block placement → Screen position for UI
const screenPos = gridToScreen(blockX, blockY, gridState, viewportState);

// Grid rendering → World coordinates for PIXI
const worldPos = gridToWorld(cellX, cellY, cellSize);
```

## Why This Architecture?

1. **Performance**: Only renders visible grid cells
2. **Precision**: Discrete grid coordinates prevent placement errors
3. **Flexibility**: Smooth zoom/pan with infinite grid
4. **Modularity**: Each coordinate system has a specific purpose
5. **Rendering**: Optimized for PIXI.js transformed containers

This multi-layered coordinate system allows the simulation to have a clean, infinite grid where users can place building blocks precisely while maintaining smooth performance and intuitive user interactions.
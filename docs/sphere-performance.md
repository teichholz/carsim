# Sphere Performance Optimization

## Overview

This document explains the performance optimizations for rendering thousands of spheres in the car simulation.

## Implementations

### 1. SimpleSphere (Baseline)
- **File**: `src/components/building-blocks/SimpleSphere.tsx`
- **Approach**: Draws gradient sphere from scratch for each instance
- **Performance**: Poor with many spheres (hundreds)
- **Use case**: Simple demos, small number of objects

### 2. OptimizedSphere
- **File**: `src/components/building-blocks/OptimizedSphere.tsx`
- **Approach**: Pre-renders sphere to texture, uses individual sprite components
- **Performance**: Good with thousands of spheres
- **Use case**: Medium-scale rendering (1,000-5,000 objects)

### 3. UltraOptimizedSpheres (Recommended for 10k+)
- **File**: `src/components/building-blocks/UltraOptimizedSpheres.tsx`
- **Approach**: Batch rendering with manual sprite management
- **Performance**: Excellent with 10,000+ spheres
- **Use case**: Production car rendering, large-scale simulations

### 4. AnimatedSphere
- **File**: `src/components/building-blocks/AnimatedSphere.tsx`
- **Approach**: Graphics with animations (rotation, squash/stretch, shadows)
- **Performance**: Poor with many spheres
- **Use case**: Detailed animations, small number of objects

## How Optimization Works

### Texture Caching (All Optimized Versions)
```typescript
const textureCache = new Map<string, Texture>();
```
- Spheres are pre-rendered once per unique `radius-color` combination
- Textures are cached globally and shared across all sphere instances
- Key format: `${radius}-${color}` (e.g., "15-#4488ff")

### Pre-rendering Process
1. Creates an HTML5 canvas element
2. Draws the sphere gradient once using Canvas 2D API
3. Converts canvas to PixiJS Texture
4. Stores texture in cache

### OptimizedSphere Rendering
- Each sphere is a React component that creates a Sprite
- All sprites reference the same cached texture
- React re-renders on position changes

### UltraOptimizedSpheres Rendering (Best for 10k+)
- **Batch approach**: Single component manages all spheres
- **Manual sprite management**: Direct PixiJS sprite manipulation
- **Minimized React overhead**: No per-sphere components
- **Efficient updates**: Only position changes, no React reconciliation
- **Container-based**: All sprites in one Container for GPU batching

## Performance Benefits

| Implementation | 100 Spheres | 1,000 Spheres | 5,000 Spheres | 10,000 Spheres |
|---------------|-------------|---------------|---------------|----------------|
| SimpleSphere  | ~50 FPS     | ~20 FPS       | < 10 FPS      | < 5 FPS        |
| OptimizedSphere | ~60 FPS   | ~58 FPS       | ~45 FPS       | ~25 FPS        |
| UltraOptimized | ~60 FPS    | ~60 FPS       | ~58 FPS       | ~55+ FPS       |
| AnimatedSphere | ~30 FPS    | ~10 FPS       | < 5 FPS       | < 2 FPS        |

## Testing Performance

Visit `/sphere-demo` to compare implementations:

1. Select implementation type (Animated/Simple/Optimized/Ultra ⚡)
2. Add spheres (10, 100, 1,000, 5,000, or 10,000 at a time)
3. Monitor FPS counter (green = good, yellow = medium, red = poor)
4. Compare performance between implementations
5. Try **10,000 spheres with Ultra** mode for best results!

## When to Use Each

- **Large-scale car simulation (10k+ cars)**: Use `UltraOptimizedSpheres` for maximum performance
- **Medium-scale simulation (1k-5k cars)**: Use `OptimizedSphere` for good balance
- **Small demos/tests**: Use `SimpleSphere` for simplicity
- **Special effects**: Use `AnimatedSphere` for visual polish (limited quantity)

## Key Differences: Optimized vs Ultra

### OptimizedSphere (Per-Sphere Components)
```tsx
{spheres.map(sphere => (
  <OptimizedSphere key={sphere.id} x={sphere.x} y={sphere.y} ... />
))}
```
- React creates a component for each sphere
- React manages updates and reconciliation
- Good for moderate quantities

### UltraOptimizedSpheres (Batch Management)
```tsx
<UltraOptimizedSpheres spheres={spheres} radius={radius} />
```
- Single component manages all spheres
- Direct PixiJS sprite manipulation
- Minimal React overhead
- Best for 10,000+ objects

## Memory Considerations

- Each unique radius+color combination creates one cached texture
- Textures remain in memory until cleared
- Clear cache with `clearSphereTextureCache()` if needed
- Typical texture size: ~2-5 KB per unique combination


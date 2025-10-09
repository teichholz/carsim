import { extend } from '@pixi/react';
import { Container, Sprite, Texture } from 'pixi.js';
import { useEffect, useRef, useState } from 'react';

extend({ Container, Sprite });

interface OptimizedSphereProps {
  x: number;
  y: number;
  radius?: number;
  color?: string;
}

// Global texture cache to share textures across all sphere instances
// Uses Canvas 2D to pre-render, which is more efficient than PixiJS Graphics
const textureCache = new Map<string, Texture>();

// Pre-render sphere to canvas and create texture
function createSphereTexture(radius: number, color: string): Texture {
  const key = `${radius}-${color}`;

  const cached = textureCache.get(key);
  if (cached) {
    return cached;
  }

  // Create canvas
  const size = Math.ceil(radius * 2.5);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  const centerX = size / 2;
  const centerY = size / 2;

  // Draw sphere with radial gradient
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const currentRadius = radius * (1 - ratio);
    const brightness = 1 - ratio * 0.7;

    // Adjust color brightness
    const hexColor = parseInt(color.replace('#', ''), 16);
    const r = Math.floor(((hexColor >> 16) & 0xff) * brightness);
    const g = Math.floor(((hexColor >> 8) & 0xff) * brightness);
    const b = Math.floor((hexColor & 0xff) * brightness);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.2, centerY - radius * 0.2, currentRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Create PixiJS texture from canvas
  const texture = Texture.from(canvas);
  textureCache.set(key, texture);

  return texture;
}

function OptimizedSphere({ x, y, radius = 15, color = '#4488ff' }: OptimizedSphereProps) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const textureCreated = useRef(false);

  useEffect(() => {
    if (!textureCreated.current) {
      const tex = createSphereTexture(radius, color);
      setTexture(tex);
      textureCreated.current = true;
    }
  }, [radius, color]);

  if (!texture) {
    return null;
  }

  return (
    <pixiContainer x={x} y={y}>
      <pixiSprite
        texture={texture}
        anchor={{ x: 0.5, y: 0.5 }}
      />
    </pixiContainer>
  );
}

// Export function to clear texture cache if needed (e.g., when changing settings)
export function clearSphereTextureCache() {
  textureCache.forEach(texture => {
    texture.destroy();
  });
  textureCache.clear();
}

export default OptimizedSphere;


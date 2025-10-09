import { extend } from '@pixi/react';
import { Container, Sprite, Texture } from 'pixi.js';
import { useEffect, useRef } from 'react';

extend({ Container });

interface Sphere {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

interface UltraOptimizedSpheresProps {
  spheres: Sphere[];
  radius?: number;
}

// Global texture cache
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

function UltraOptimizedSpheres({ spheres, radius = 30 }: UltraOptimizedSpheresProps) {
  const containerRef = useRef<Container | null>(null);
  const spritesRef = useRef<Map<number, Sprite>>(new Map());
  const texturesRef = useRef<Map<string, Texture>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const currentSprites = spritesRef.current;

    // Get all current sphere IDs
    const sphereIds = new Set(spheres.map(s => s.id));

    // Remove sprites that no longer exist
    const spritesToRemove: number[] = [];
    for (const [id, sprite] of currentSprites.entries()) {
      if (!sphereIds.has(id)) {
        container.removeChild(sprite);
        sprite.destroy();
        spritesToRemove.push(id);
      }
    }
    for (const id of spritesToRemove) {
      currentSprites.delete(id);
    }

    // Update or create sprites
    for (const sphere of spheres) {
      const key = `${radius}-${sphere.color}`;

      // Get or create texture
      let texture = texturesRef.current.get(key);
      if (!texture) {
        texture = createSphereTexture(radius, sphere.color);
        texturesRef.current.set(key, texture);
      }

      let sprite = currentSprites.get(sphere.id);

      if (!sprite) {
        // Create new sprite
        sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        container.addChild(sprite);
        currentSprites.set(sphere.id, sprite);
      }

      // Update sprite position
      sprite.x = sphere.x;
      sprite.y = sphere.y;

      // Update texture if radius/color changed
      if (sprite.texture !== texture) {
        sprite.texture = texture;
      }
    }
  }, [spheres, radius]);


  return (
    <pixiContainer
      ref={containerRef}
    />
  );
}

// Export function to clear texture cache if needed
export function clearUltraSphereTextureCache() {
  for (const texture of textureCache.values()) {
    texture.destroy();
  }
  textureCache.clear();
}

export default UltraOptimizedSpheres;


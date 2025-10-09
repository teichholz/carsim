import { extend } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';

extend({ Container, Graphics });

interface SimpleSphereProps {
  x: number;
  y: number;
  radius?: number;
  color?: string;
}

function SimpleSphere({ x, y, radius = 15, color = '#4488ff' }: SimpleSphereProps) {
  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={(g) => drawSphere(g, radius, color)} />
    </pixiContainer>
  );
}

// Helper function for sphere gradient
function drawSphere(g: Graphics, radius: number, color: string) {
  g.clear();

  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const currentRadius = radius * (1 - ratio);
    const brightness = 1 - ratio * 0.7;

    // Adjust color brightness (assuming hex color string)
    const hexColor = parseInt(color.replace('#', ''), 16);
    const r = ((hexColor >> 16) & 0xff) * brightness;
    const g_val = ((hexColor >> 8) & 0xff) * brightness;
    const b = (hexColor & 0xff) * brightness;
    const adjustedColor = (r << 16) | (g_val << 8) | b;

    g.circle(-radius * 0.2, -radius * 0.2, currentRadius).fill({ color: adjustedColor });
  }
}

export default SimpleSphere;


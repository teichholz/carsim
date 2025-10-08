import { extend } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useEffect, useState } from 'react';

extend({ Container, Graphics });

interface AnimatedSphereProps {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  color?: string;
}

function AnimatedSphere({ x, y, radius, velocityX, velocityY, color = '#4488ff' }: AnimatedSphereProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [shadowScale, setShadowScale] = useState(1);

  useEffect(() => {
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (velocityX !== 0 || velocityY !== 0) {
      const angle = Math.atan2(velocityY, velocityX);
      setRotation(angle);

      // Add subtle squash/stretch
      const stretchAmount = Math.min(speed * 0.03, 0.15);
      setScale({
        x: 1 + stretchAmount,
        y: 1 - stretchAmount * 0.3
      });

      // Pulse shadow when moving
      setShadowScale(1 + speed * 0.05);
    } else {
      setScale({ x: 1, y: 1 });
      setShadowScale(1);
    }
  }, [velocityX, velocityY]);

  return (
    <pixiContainer x={x} y={y}>
      {/* Shadow */}
      <pixiGraphics
        y={radius + 5}
        alpha={0.3}
        scale={{ x: shadowScale, y: shadowScale * 0.5 }}
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000);
          g.drawEllipse(0, 0, radius * 0.8, radius * 0.3);
          g.endFill();
        }}
      />

      {/* Sphere with squash/stretch */}
      <pixiContainer rotation={rotation} scale={scale}>
        <pixiGraphics draw={(g) => drawSphere(g, radius, color)} />

        {/* Arrow */}
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.lineStyle(2, 0x000000, 0.8);
            g.beginFill(0x000000, 0.8);

            g.moveTo(0, 0);
            g.lineTo(radius * 0.6, 0);
            g.lineTo(radius * 0.5, -4);
            g.lineTo(radius * 0.6, 0);
            g.lineTo(radius * 0.5, 4);

            g.endFill();
          }}
        />
      </pixiContainer>
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

    g.fill(adjustedColor);
    g.circle(-radius * 0.2, -radius * 0.2, currentRadius);
  }

  // Highlight
  g.fill(0xffffff, 0.5)
  g.circle(-radius * 0.3, -radius * 0.3, radius * 0.2);
}
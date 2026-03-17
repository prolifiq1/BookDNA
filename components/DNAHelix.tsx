'use client';

import { useRef, useEffect } from 'react';

interface DNAHelixProps {
  rhythm: number[];
  emotion: number[];
  vocabulary: number[];
  structure: number[];
  width?: number;
  height?: number;
  animated?: boolean;
}

const COLORS = {
  rhythm: '#3ecf8e',
  emotion: '#f43f5e',
  vocabulary: '#38bdf8',
  structure: '#c084fc',
};

/**
 * Renders the BookDNA fingerprint as an animated double helix.
 * Each of the 4 dimensions is drawn as a sinusoidal strand,
 * with amplitude modulated by the dimension's signal values.
 */
export default function DNAHelix({
  rhythm,
  emotion,
  vocabulary,
  structure,
  width = 700,
  height = 400,
  animated = true,
}: DNAHelixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const strands = [
      { data: rhythm, color: COLORS.rhythm, phase: 0 },
      { data: emotion, color: COLORS.emotion, phase: Math.PI * 0.5 },
      { data: vocabulary, color: COLORS.vocabulary, phase: Math.PI },
      { data: structure, color: COLORS.structure, phase: Math.PI * 1.5 },
    ];

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      const amplitude = height * 0.3;
      const resolution = rhythm.length || 64;

      // Draw connecting rungs first (behind strands)
      for (let i = 0; i < resolution; i++) {
        const x = (i / (resolution - 1)) * width;
        const progress = i / resolution;

        // Draw rungs between strand pairs
        for (let s = 0; s < strands.length; s += 2) {
          if (s + 1 >= strands.length) break;
          const a = strands[s];
          const b = strands[s + 1];

          const valA = a.data[i] || 0.5;
          const valB = b.data[i] || 0.5;

          const yA = centerY + Math.sin(progress * Math.PI * 4 + a.phase + offsetRef.current) * amplitude * valA;
          const yB = centerY + Math.sin(progress * Math.PI * 4 + b.phase + offsetRef.current) * amplitude * valB;

          ctx.beginPath();
          ctx.moveTo(x, yA);
          ctx.lineTo(x, yB);
          ctx.strokeStyle = `rgba(255, 255, 255, 0.04)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw each strand
      for (const strand of strands) {
        ctx.beginPath();
        ctx.strokeStyle = strand.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = strand.color;
        ctx.shadowBlur = 12;

        for (let i = 0; i < resolution; i++) {
          const x = (i / (resolution - 1)) * width;
          const progress = i / resolution;
          const value = strand.data[i] || 0.5;

          const y =
            centerY +
            Math.sin(progress * Math.PI * 4 + strand.phase + offsetRef.current) *
              amplitude *
              value;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw data points
        for (let i = 0; i < resolution; i += 4) {
          const x = (i / (resolution - 1)) * width;
          const progress = i / resolution;
          const value = strand.data[i] || 0.5;

          const y =
            centerY +
            Math.sin(progress * Math.PI * 4 + strand.phase + offsetRef.current) *
              amplitude *
              value;

          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = strand.color;
          ctx.fill();
        }
      }

      if (animated) {
        offsetRef.current += 0.008;
        animationRef.current = requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rhythm, emotion, vocabulary, structure, width, height, animated]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="rounded-xl"
      />
      {/* Legend */}
      <div className="flex gap-6 justify-center mt-4 font-mono text-xs">
        {Object.entries(COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
            <span className="text-helix-muted capitalize">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

interface SparklineProps {
  data1?: number[];
  data2?: number[];
  width?: number;
  height?: number;
  color1?: string;
  color2?: string;
  isRealData?: boolean;
}

export function Sparkline({
  data1 = [0, 1, 0.5, 0.7, 0.9, 0.8, 1, 0.5],
  data2 = [0.5, 0.6, 0.4, 0.7, 0.5, 0.8, 0.6, 0.7],
  width = 80,
  height = 20,
  color1 = "#666666",
  color2 = "#4CAF50",
  isRealData = false,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set proper scaling for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Set canvas size in CSS pixels
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const drawSparkline = (data: number[], startX: number, endX: number, color: string) => {
      if (!data || data.length === 0) return;

      const xScale = (endX - startX) / (data.length - 1);
      const yMin = Math.min(...data);
      const yMax = Math.max(...data);
      const yRange = yMax - yMin || 1;

      // Scale to leave some padding
      const padding = height * 0.1;
      const yScale = (height - 2 * padding) / yRange;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      data.forEach((value, i) => {
        const x = startX + i * xScale;
        const y = height - padding - (value - yMin) * yScale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw first sparkline (gray)
    drawSparkline(data1, 0, width / 2, color1);

    // Draw second sparkline (colored)
    drawSparkline(data2, width / 2, width, color2);

    // If using real data, add a small indicator
    if (isRealData) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "6px sans-serif";
      ctx.fillText("R", width - 6, 6);
    }
  }, [data1, data2, width, height, color1, color2, isRealData]);

  return <canvas ref={canvasRef} width={width} height={height} className="inline-block" />;
}

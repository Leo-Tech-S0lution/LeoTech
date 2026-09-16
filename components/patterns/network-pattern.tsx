"use client";

import { useEffect, useRef } from "react";

interface NetworkPatternProps {
  className?: string;
  nodeColor?: string;
  lineColor?: string;
  density?: number; // approx nodes per 10,000 px^2
  interactive?: boolean;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Canvas-based animated network of nodes and connecting lines, echoing the
 * logo's central-node / satellite-node geometry. Subtle, GPU-light, and
 * fully paused when the user prefers reduced motion.
 */
export function NetworkPattern({
  className,
  nodeColor = "rgba(46, 140, 255, 0.9)",
  lineColor = "rgba(46, 140, 255, 0.18)",
  density = 0.9,
  interactive = true,
}: NetworkPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / 10000 * density);
      nodes = Array.from({ length: Math.max(12, Math.min(count, 70)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      const maxDist = Math.max(width, height) * 0.14;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < maxDist) {
            ctx!.strokeStyle = lineColor;
            ctx!.globalAlpha = 1 - dist / maxDist;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }

        if (interactive) {
          const self = nodes[i]!;
          const dm = Math.hypot(self.x - mouse.x, self.y - mouse.y);
          if (dm < maxDist * 1.4) {
            ctx!.strokeStyle = nodeColor;
            ctx!.globalAlpha = 1 - dm / (maxDist * 1.4);
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(self.x, self.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }
      }

      ctx!.globalAlpha = 1;
      for (const node of nodes) {
        ctx!.fillStyle = nodeColor;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);
    resize();

    if (interactive) window.addEventListener("mousemove", onMouseMove);

    draw(); // first frame always renders; loop continues only if motion is allowed

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) window.removeEventListener("mousemove", onMouseMove);
    };
  }, [nodeColor, lineColor, density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}

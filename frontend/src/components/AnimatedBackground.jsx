// ============================================================================
// AnimatedBackground.jsx — QGenix Animated Background Component
// ============================================================================
// Full-screen animated background that creates an AI-inspired visual atmosphere
// for the QGenix platform. Combines CSS-based decorative layers (glow orbs,
// light rays, glass reflections, vignette) with a <canvas>-driven animation
// layer that renders:
//   1. Sine-wave ocean-like undulations at the bottom of the viewport
//   2. A floating neural-network graph (nodes + proximity connections)
//   3. Soft ambient particles that drift upward with a breathing pulse
//
// The canvas is theme-aware: it reads `body.light-mode` at every frame to
// switch color palettes (dark = neon purple/violet, light = sky-blue bokeh).
//
// Mouse interactivity: nodes are pushed away from the cursor for a living,
// responsive feel.
//
// Performance notes:
//   - Entity counts scale down on smaller viewports (<768px, <1024px)
//   - `requestAnimationFrame` ensures smooth 60fps rendering
//   - Canvas is cleared each frame (transparent) so the underlying CSS
//     mesh-gradient background shows through
// ============================================================================

import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

/**
 * AnimatedBackground
 * ------------------
 * Renders the full-page animated backdrop used behind QGenix's landing and
 * dashboard pages. The component is purely decorative — it has no props,
 * emits no events, and sets `pointer-events: none` so it never blocks UI.
 *
 * Architecture:
 *   <div.bg-system-container>        ← CSS background, glow orbs, rays, etc.
 *     <div.glow-orb> × 3             ← Ambient color blobs (CSS-animated)
 *     <div.light-rays-layer>         ← Vertical shimmer rays
 *     <div.glass-reflection>         ← Floating glass highlight
 *     <canvas>                       ← JS-driven particles, nodes, waves
 *     <div.cinematic-vignette>       ← Edge darkening overlay
 */
export default function AnimatedBackground() {
  // Ref to the outermost container div (used for potential future sizing logic)
  const containerRef = useRef(null);
  // Ref to the <canvas> element where all JS-driven animation is painted
  const canvasRef = useRef(null);

  // ── Main animation effect ────────────────────────────────────────────────
  // Runs once on mount; sets up canvas, event listeners, entity pools, and
  // the render loop. Returns a cleanup function that tears everything down.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Safety guard — should never happen in practice

    const ctx = canvas.getContext('2d');
    let animationFrameId; // Stores the rAF handle for cancellation on unmount

    // Match canvas resolution to window size so 1 canvas pixel = 1 CSS pixel
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // ── Mouse interaction state ──────────────────────────────────────────
    // Tracks the cursor position. Nodes within `mouse.radius` px are pushed
    // away, creating an interactive "force field" effect.
    const mouse = { x: null, y: null, radius: 150 };

    // Update mouse coordinates on every move
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // Nullify coordinates when the cursor leaves the viewport so nodes
    // stop being repelled
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // ── Entity pools ─────────────────────────────────────────────────────
    // Three distinct visual systems rendered on the canvas:
    let nodes = [];      // Neural-network graph nodes (circles + connecting lines)
    let particles = [];  // Soft ambient particles that float upward
    let waves = [];      // Sine-wave fills drawn along the bottom edge

    /**
     * initEntities()
     * Rebuilds all entity pools from scratch. Called on mount and on every
     * window resize so counts and positions stay appropriate for the viewport.
     */
    const initEntities = () => {
      // Re-sync canvas dimensions to current window size
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Reset pools
      nodes = [];
      particles = [];

      // ── Responsive entity counts ───────────────────────────────────────
      // Fewer entities on smaller screens to maintain smooth frame rates
      // and avoid visual clutter on mobile.
      let nodeCount = 65;       // Desktop default
      let particleCount = 75;

      if (width < 768) {
        // Mobile / small tablet
        nodeCount = 20;
        particleCount = 25;
      } else if (width < 1024) {
        // Tablet / small laptop
        nodeCount = 40;
        particleCount = 45;
      }

      // ── Generate neural-network nodes ──────────────────────────────────
      // Each node has a random position, a very slow drift velocity, a
      // random radius (1–2.5 px), and a random base opacity.
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,              // Random horizontal position
          y: Math.random() * height,             // Random vertical position
          vx: (Math.random() - 0.5) * 0.25,     // Horizontal drift (±0.125 px/frame)
          vy: (Math.random() - 0.5) * 0.25,     // Vertical drift (±0.125 px/frame)
          radius: Math.random() * 1.5 + 1,       // Visual size: 1–2.5 px
          alpha: Math.random() * 0.5 + 0.2,      // Base opacity: 0.2–0.7
        });
      }

      // ── Generate floating ambient particles ────────────────────────────
      // Particles drift slowly upward (negative vy) and reset to the bottom
      // edge when they leave the top of the screen, creating a perpetual
      // upward float.
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,      // Gentle horizontal wobble
          vy: -Math.random() * 0.2 - 0.05,        // Always drifts upward
          radius: Math.random() * 1.2 + 0.6,      // Smaller than nodes: 0.6–1.8 px
          alpha: Math.random() * 0.4 + 0.1,        // Current opacity (animated)
          baseAlpha: Math.random() * 0.3 + 0.1,    // Resting opacity for pulse calc
        });
      }

      // ── Setup sine-wave layers ─────────────────────────────────────────
      // Three overlapping sine waves are drawn as filled shapes along the
      // bottom edge, giving a gentle "ocean" or "aurora" effect.
      // Each wave has its own amplitude, frequency, phase offset, scroll
      // speed, and a color function that returns the appropriate fill for
      // the current theme.
      waves = [
        {
          amplitude: 28,          // Wave height in pixels
          frequency: 0.003,       // How "wide" each sine period is
          phase: 0,               // Starting phase offset
          speed: 0.004,           // Phase increment per frame (scrolls right)
          // Light mode: near-transparent sky blue; Dark mode: faint purple glow
          color: (isLight) => (isLight ? 'rgba(180, 215, 255, 0.08)' : 'rgba(139, 92, 246, 0.04)'),
        },
        {
          amplitude: 18,
          frequency: 0.005,
          phase: Math.PI / 3,     // Offset so waves don't align
          speed: -0.006,          // Scrolls in the opposite direction
          color: (isLight) => (isLight ? 'rgba(255, 255, 255, 0.06)' : 'rgba(99, 102, 241, 0.03)'),
        },
        {
          amplitude: 10,
          frequency: 0.007,
          phase: Math.PI / 1.5,
          speed: 0.003,
          color: (isLight) => (isLight ? 'rgba(200, 230, 255, 0.05)' : 'rgba(6, 182, 212, 0.02)'),
        },
      ];
    };

    // Initialize entities on first mount
    initEntities();

    // Re-initialize on window resize so entity counts and canvas size adapt
    const handleResize = () => {
      initEntities();
    };

    window.addEventListener('resize', handleResize);

    // ══════════════════════════════════════════════════════════════════════
    //  RENDER LOOP — runs every frame via requestAnimationFrame
    // ══════════════════════════════════════════════════════════════════════
    const render = () => {
      // Detect current theme by checking the body class toggle
      const isLightMode = document.body.classList.contains('light-mode');
      
      // Clear canvas with full transparency so the CSS mesh-gradient
      // background beneath remains visible
      ctx.clearRect(0, 0, width, height);

      // ── LAYER 1: Sine Waves (drawn first — behind everything else) ────
      waves.forEach((wave) => {
        wave.phase += wave.speed; // Advance the wave's scroll position
        ctx.beginPath();
        ctx.moveTo(0, height);   // Start at bottom-left corner
        
        // Trace the sine curve across the full width (step = 10px for perf)
        for (let x = 0; x <= width; x += 10) {
          const y = height - 120 + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height); // Close to bottom-right corner
        ctx.closePath();
        ctx.fillStyle = wave.color(isLightMode); // Theme-aware color
        ctx.fill();
      });

      // ── LAYER 2: Neural Network (nodes + proximity connections) ────────

      // 2a. Draw connection lines between nearby nodes
      const connectionDist = 135; // Max pixel distance to draw a line

      // Line opacity multiplier — light mode uses higher values so the
      // soft sky-blue lines are visible against the bright background;
      // dark mode keeps them subtler to avoid overwhelming the neon glow.
      const lineAlphaMultiplier = isLightMode ? 0.18 : 0.12;

      // Primary RGB color string used for both lines AND node fills.
      // Light mode: sky-blue (150, 200, 240) for an airy feel
      // Dark mode:  violet  (139, 92, 246)   for the neon aesthetic
      const primaryColor = isLightMode ? '150, 200, 240' : '139, 92, 246';

      // O(n²) pairwise distance check — acceptable because n ≤ 65
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.hypot(dx, dy);

          // Only connect nodes within the threshold distance
          if (dist < connectionDist) {
            // Opacity fades linearly to 0 at the threshold distance
            const alpha = (1 - dist / connectionDist) * lineAlphaMultiplier;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 2b. Update and draw each node
      nodes.forEach((node) => {
        // ── Physics: drift ────────────────────────────────────────────
        node.x += node.vx;
        node.y += node.vy;

        // ── Physics: mouse repulsion ──────────────────────────────────
        // When the cursor is within `mouse.radius` of a node, push the
        // node away proportionally (closer = stronger push).
        if (mouse.x !== null && mouse.y !== null) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            // Push away from cursor along the node→cursor vector
            node.x += (dx / dist) * force * 0.7;
            node.y += (dy / dist) * force * 0.7;
          }
        }

        // ── Physics: boundary bounce ──────────────────────────────────
        // Reverse velocity when a node hits the edge of the viewport
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Clamp position to viewport bounds (prevent stuck-outside-edge)
        if (node.x < 0) node.x = 0;
        if (node.x > width) node.x = width;
        if (node.y < 0) node.y = 0;
        if (node.y > height) node.y = height;

        // ── Draw the node circle ──────────────────────────────────────
        ctx.beginPath();
        // Light mode nodes are slightly larger (+0.5px) for visibility
        ctx.arc(node.x, node.y, node.radius + (isLightMode ? 0.5 : 0), 0, Math.PI * 2);

        if (isLightMode) {
          // Light mode: bright white fill with a soft sky-blue glow halo
          // Creates the dreamy "bokeh dot" look against the blue sky bg
          ctx.fillStyle = `rgba(255, 255, 255, ${node.alpha + 0.3})`;
          ctx.shadowBlur  = 10;
          ctx.shadowColor = 'rgba(180, 215, 250, 0.6)';
        } else {
          // Dark mode: violet fill with a matching neon glow
          ctx.fillStyle = `rgba(${primaryColor}, ${node.alpha})`;
          ctx.shadowBlur  = 4;
          ctx.shadowColor = `rgba(${primaryColor}, 0.5)`;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow to prevent bleeding to next draw call
      });

      // ── LAYER 3: Floating Ambient Particles ────────────────────────────
      particles.forEach((p) => {
        // ── Physics: upward drift ─────────────────────────────────────
        p.x += p.vx;
        p.y += p.vy;

        // Reset particle to bottom when it exits the top or sides
        if (p.y < 0 || p.x < 0 || p.x > width) {
          p.y = height + 10;           // Just below the visible area
          p.x = Math.random() * width; // Random horizontal re-entry
        }

        // ── Breathing pulse: sinusoidal opacity oscillation ───────────
        // The pulse speed varies per particle (tied to its radius) so
        // particles don't all blink in sync.
        p.alpha = p.baseAlpha + Math.sin(Date.now() * 0.001 * p.radius) * 0.05;

        // ── Draw the particle ─────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (isLightMode) {
          // Light mode — Bokeh-style particles:
          // Alternate between bright white highlights and soft pink/salmon
          // circles using a deterministic hash of the particle's baseAlpha
          // to keep the assignment stable across frames.
          const isWhite = Math.sin(p.baseAlpha * 50) > 0;
          if (isWhite) {
            // White bokeh highlight — strong glow for specular lens effect
            ctx.fillStyle  = `rgba(255, 255, 255, ${Math.min(p.alpha * 3, 0.9)})`;
            ctx.shadowBlur  = 18;   // Heavy blur = key to bokeh look
            ctx.shadowColor = 'rgba(220, 240, 255, 0.7)';
          } else {
            // Pink/salmon bokeh circle — adds warmth to the cool sky palette
            ctx.fillStyle  = `rgba(255, 180, 195, ${Math.min(p.alpha * 2.5, 0.75)})`;
            ctx.shadowBlur  = 20;
            ctx.shadowColor = 'rgba(255, 150, 170, 0.5)';
          }
        } else {
          // Dark mode: simple white glowing dots
          ctx.fillStyle   = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowBlur  = 3;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        }

        ctx.fill();
        ctx.shadowBlur = 0; // Always reset after drawing
      });

      // Schedule the next frame
      animationFrameId = requestAnimationFrame(render);
    };

    // Kick off the render loop
    render();

    // ── Cleanup on unmount ───────────────────────────────────────────────
    // Remove all global listeners and cancel the animation frame to avoid
    // memory leaks and orphaned render loops when the component unmounts.
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array → runs once on mount

  // ══════════════════════════════════════════════════════════════════════════
  //  JSX — Layered background structure
  // ══════════════════════════════════════════════════════════════════════════
  // The visual stack from back to front:
  //   z-index 0 : .bg-system-container (CSS gradient base)
  //   z-index ~  : .glow-orb (ambient color blobs, CSS blur + animation)
  //   z-index 2  : .glass-reflection (floating glass highlight)
  //   z-index 3  : <canvas> (JS-driven particles, nodes, waves)
  //   z-index 4  : .cinematic-vignette (edge darkening overlay)
  return (
    <div ref={containerRef} className="bg-system-container">
      {/* Mesh Glow Elements — large, heavily-blurred color blobs that drift
          slowly across the background. In dark mode they emit purple/indigo/cyan;
          in light mode CSS overrides transform them into white/pink bokeh orbs. */}
      <div className="glow-orb glow-orb-purple"></div>
      <div className="glow-orb glow-orb-indigo"></div>
      <div className="glow-orb glow-orb-cyan"></div>

      {/* Light Rays — three thin vertical shimmers that drift side-to-side.
          In dark mode they're indigo/purple; in light mode they become white. */}
      <div className="light-rays-layer">
        <div className="light-ray"></div>
        <div className="light-ray"></div>
        <div className="light-ray"></div>
      </div>

      {/* Glass Reflection — a single rotated rectangle with a subtle gradient
          that floats slowly across the viewport, simulating a lens flare or
          glass surface reflection. */}
      <div className="glass-reflection"></div>

      {/* Interactive Canvas Overlay — all JS-driven animation (neural network,
          particles, waves) is painted here. Positioned absolutely over the
          CSS layers with z-index 3 so it sits above glow orbs but below the
          cinematic vignette. */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 3,
        }}
      />

      {/* Cinematic Vignette — radial gradient overlay that darkens the edges
          of the viewport, drawing the user's eye toward the center content.
          z-index 4 places it above everything including the canvas. */}
      <div className="cinematic-vignette"></div>
    </div>
  );
}

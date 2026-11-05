/**
 * fireworks.js
 * High-performance, pooled canvas fireworks engine.
 * Cap: <= 300 active particles.
 * Zero GC in hot render loop. No canvas blur in render loop.
 * Debounced resize (150ms), DPR capped at 2, paused when tab is hidden.
 */

const MAX_PARTICLES = 300;
const COLOR_PALETTES = [
  { r: 212, g: 175, b: 55 },   // Gold (#d4af37)
  { r: 240, g: 215, b: 140 },  // Gold-soft (#f0d78c)
  { r: 255, g: 179, b: 71 },   // Warm amber (#ffb347)
  { r: 255, g: 220, b: 120 },  // Bright gold
  { r: 255, g: 255, b: 240 }   // Shimmer white
];

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.alpha = 1;
    this.decay = 0.015;
    this.size = 2;
    this.friction = 0.96;
    this.gravity = 0.06;
    this.r = 212;
    this.g = 175;
    this.b = 55;
    this.active = false;
  }

  init(x, y, vx, vy, color, size, decay) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.alpha = 1;
    this.decay = decay || (0.012 + Math.random() * 0.015);
    this.size = size || (2 + Math.random() * 2);
    this.friction = 0.96;
    this.gravity = 0.07;
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.active = true;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }
}

// Particle pool pre-allocation (avoids allocations during render)
const particlePool = [];
for (let i = 0; i < MAX_PARTICLES; i++) {
  particlePool.push(new Particle());
}

const activeParticles = [];

let canvas = null;
let ctx = null;
let animationFrameId = null;
let isRunning = false;
let isTabHidden = false;
let width = 0;
let height = 0;
let dpr = 1;
let resizeTimeout = null;

function updateDimensions() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
  height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function onDebouncedResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    updateDimensions();
  }, 150);
}

function onVisibilityChange() {
  if (document.hidden) {
    isTabHidden = true;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  } else {
    isTabHidden = false;
    if (isRunning && !animationFrameId && activeParticles.length > 0) {
      animationFrameId = requestAnimationFrame(render);
    }
  }
}

function render() {
  if (!ctx || isTabHidden) {
    animationFrameId = null;
    return;
  }

  ctx.clearRect(0, 0, width, height);

  // Iterate backwards to allow in-place removal and return to pool
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    p.update();

    // Check expiration or out-of-bounds
    if (p.alpha <= 0 || p.x < -20 || p.x > width + 20 || p.y > height + 20) {
      p.active = false;
      particlePool.push(p);
      activeParticles.splice(i, 1);
      continue;
    }

    // Fast fillRect rendering without shadowBlur
    const safeAlpha = Math.max(0, Math.min(1, p.alpha));
    ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${safeAlpha.toFixed(2)})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  if (activeParticles.length > 0) {
    animationFrameId = requestAnimationFrame(render);
  } else {
    animationFrameId = null;
  }
}

function ensureLoop() {
  if (!animationFrameId && !isTabHidden && activeParticles.length > 0) {
    animationFrameId = requestAnimationFrame(render);
  }
}

/**
 * Initializes the fireworks canvas and binds event listeners.
 * @param {HTMLCanvasElement} canvasElement 
 */
export function init(canvasElement) {
  if (!canvasElement) return;
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  isRunning = true;

  updateDimensions();

  window.addEventListener('resize', onDebouncedResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
}

/**
 * Triggers a burst of fireworks particles at specified coordinates.
 * @param {number} x Coordinate in CSS pixels
 * @param {number} y Coordinate in CSS pixels
 */
export function burst(x, y) {
  if (!isRunning || !ctx) return;

  const count = 42; // particles per burst
  for (let i = 0; i < count; i++) {
    if (activeParticles.length >= MAX_PARTICLES || particlePool.length === 0) {
      break;
    }

    const p = particlePool.pop();
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const color = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const size = 1.5 + Math.random() * 2.5;
    const decay = 0.012 + Math.random() * 0.016;

    p.init(x, y, vx, vy, color, size, decay);
    activeParticles.push(p);
  }

  ensureLoop();
}

/**
 * Triggers a firework burst at a random pleasant position within the upper viewport.
 */
export function burstRandom() {
  if (!width || !height) return;
  const x = width * (0.2 + Math.random() * 0.6);
  const y = height * (0.15 + Math.random() * 0.45);
  burst(x, y);
}

/**
 * Stops the fireworks engine, clears the canvas, and returns all particles to the pool.
 */
export function stop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  while (activeParticles.length > 0) {
    const p = activeParticles.pop();
    p.reset();
    particlePool.push(p);
  }

  if (ctx && canvas) {
    ctx.clearRect(0, 0, width, height);
  }
}

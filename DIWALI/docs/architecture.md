# Architecture Specification: THE DIWALI EXPERIENCE

## 1. Directory & File Organization
```
/
├── index.html                           # Semantic DOM structure and screen definitions
├── css/
│   └── style.css                        # Mobile-first CSS, CSS variables, typography, animations
├── js/
│   ├── main.js                          # State orchestrator, transition timelines, UI bindings
│   ├── fireworks.js                     # High-performance canvas fireworks engine (pool-based)
│   ├── diya.js                          # Hand-coded SVG Diya component & ignition choreography
│   └── wishes.js                        # Curated Diwali blessings & non-repeating random picker
└── docs/                                # Technical specifications, design, and testing guides
```

## 2. Module Boundaries & Responsibilities

### `js/fireworks.js`
- **Responsibilities:**
  - Manages the fullscreen 2D canvas context.
  - Maintains a pre-allocated object pool of particles (`MAX_PARTICLES = 300`).
  - Spawns explosion bursts using trigonometric velocity dispersion (`cos(θ)`, `sin(θ)`).
  - Updates particle kinetics (`gravity`, `friction`, `alpha decay`).
  - Renders particles using high-performance `fillRect` without expensive `ctx.shadowBlur`.
  - Automatically suspends animation loop when page visibility is hidden (`document.hidden`).
  - Debounces window resize events by 150ms and caps device pixel ratio at 2.
- **Exported API:**
  - `init(canvasElement)`
  - `burst(x, y)`
  - `burstRandom()`
  - `stop()`

### `js/diya.js`
- **Responsibilities:**
  - Injects a hand-crafted scalable SVG Diya with terracotta gradient body, golden rim, decorative filigree beads, oil wick, and separate flame/aura layers.
  - Manages flame states: Unlit (`scale: 0.1, opacity: 0`) -> Ignited (`scale: 1, opacity: 1`) -> Intensified -> Reset.
  - Executes organic GSAP flame flicker and subtle floating animations.
- **Exported API:**
  - `init(containerElement)`
  - `ignite()`: Returns a Promise resolving upon flare completion.
  - `intensify()`: Amplifies glow and scale during Screen 2 reveal.
  - `reset()`: Returns the flame and aura to pristine unlit state.

### `js/wishes.js`
- **Responsibilities:**
  - Encapsulates 8 distinct festive wishes covering joy, prosperity, friendship, peace, dreams, and success.
  - Prevents immediate consecutive repetition of wishes across user clicks.
  - Pure data and logic module with zero DOM dependencies.
- **Exported API:**
  - `getRandomWish()`
  - `getAllWishes()`

### `js/main.js`
- **Responsibilities:**
  - App state management (`currentScreen`, `recipientName`, `musicPlaying`, `isTransitioning`).
  - URL parameter extraction and strict sanitization.
  - Screen transitions (Intro -> Reveal -> Card) with GSAP timelines.
  - Web Audio API generative synthesizer (Oscillator 220Hz + 330Hz + 0.15Hz LFO).
  - Web Share API and Clipboard API fallback orchestration.
  - Replay lifecycle coordination.
  - Respect for `prefers-reduced-motion: reduce`.

## 3. Memory & Garbage Collection Strategy
1. **Particle Object Pooling:** Zero particle object allocations inside `requestAnimationFrame`. When bursts occur, inactive particles are popped from the pool. Dead particles are spliced backwards and returned to the pool.
2. **Audio Nodes Lifecycle:** AudioContext is initialized once upon first user action, avoiding browser autoplay blocking. During stop/pause, oscillators remain connected while gain ramps to zero, and the context is suspended to eliminate CPU consumption.
3. **DOM Node Continuity:** The single instantiated Diya SVG element is dynamically moved between screen mounts via `appendChild`, preserving flame animations and preventing DOM thrashing.

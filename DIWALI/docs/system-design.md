# System Design: THE DIWALI EXPERIENCE

## 1. Product Overview
"THE DIWALI EXPERIENCE" is an interactive, personalized festive website designed to be shared via a public URL containing a query parameter (e.g. `?name=Susmita`). When a recipient opens the link, they are welcomed by a serene, dark atmospheric introduction with an unlit Indian earthen lamp (Diya).

Upon user interaction ("Open Your Surprise"), the experience ignites the diya flame, intensifies atmospheric lighting, launches celebratory fireworks, reveals a vibrant festive greeting ("Happy Diwali"), and seamlessly transitions into an elegant personalized greeting card featuring interactive festive wishes, sky illumination, ambient meditative audio, and one-click sharing.

## 2. Core User Flows & State Machine
The experience follows a single-page state machine with three well-defined screens:

```
[ SCREEN 1: INTRO ]
   ├── State: unlit diya, subtle floating particles, idle state
   └── Action: Click "Open Your Surprise"
            │
            ▼
       diya.ignite() + initial firework burst
            │ (800ms GSAP transition)
            ▼
[ SCREEN 2: REVEAL ]
   ├── State: brightly glowing diya, letter-spacing heading animation
   ├── Choreography: 3 staggered fireworks bursts (~400ms intervals)
   └── Transition: Auto-advances after 3.2s without requiring clicks
            │
            ▼
[ SCREEN 3: GREETING CARD ]
   ├── State: Personalized "Happy Diwali, [Name]!", lit diya, wish container
   └── Interactive Controls:
         ├── Make a Wish ✨ (8 distinct wishes, anti-consecutive repeat)
         ├── Light Up the Sky ✨ (random celebratory fireworks)
         ├── Music Toggle (Web Audio API ambient synthesizer 220Hz + 330Hz)
         ├── Share ❤️ (Web Share API + Clipboard API fallback with toast)
         └── Replay Experience (Full reset back to unlit intro screen)
```

## 3. Design System & Aesthetic Principles
- **Color Identity:**
  - `--ink: #0a0a0f;` (Absolute deep contrast background)
  - `--midnight: #1a0a2e;` (Atmospheric radial aura)
  - `--gold: #d4af37;` (Metallic primary festive accent)
  - `--gold-soft: #f0d78c;` (Glowing text and particle shimmer)
  - `--warm: #ffb347;` (Diya flame and spark tone)
  - `--text: #f4efe4;` (Warm ivory readable body text)
  - `--text-dim: #b8a889;` (Secondary muted typography)
- **Typography:**
  - Headings: `Cormorant Garamond` (weight 600, serif elegance)
  - Body: `Inter` (weights 400 & 500, crisp legibility across mobile & desktop)
- **Glow & Atmospheric Lighting:**
  - `text-shadow: 0 0 24px rgba(212,175,55,0.45);` for celestial gold luminescence.
  - Radial gradient backdrop mimicking twilight darkness pierced by candlelight.

## 4. Hardware Acceleration & Rendering Boundaries
- **Canvas Fireworks:** Rendered on a dedicated fullscreen `<canvas>` layer positioned fixed with `pointer-events: none` at `z-index: 5`.
- **DOM Content:** Clean semantic elements positioned at `z-index: 10`.
- **Diya Lamp:** Scalable Vector Graphics (SVG) with SVG gradient defs and transform-origin geometry, completely vector-rendered to prevent pixelation on Retina/4K displays.

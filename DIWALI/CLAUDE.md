# CLAUDE.md - Technical Guidelines for THE DIWALI EXPERIENCE

## Project Overview
"THE DIWALI EXPERIENCE" is an interactive, personalized Diwali greeting web application built with pure Vanilla HTML5, CSS3, and ES Modules.

## Non-Negotiable Rules
- **No Build Tools & No Frameworks:** Pure static files (`index.html`, `css/style.css`, `js/*.js`). No npm, no node_modules, no package.json.
- **Privacy & Zero-Tracking:** No cookies, no `localStorage`, no `sessionStorage`, no analytics, no geolocation, no telemetry, no external backend.
- **Security & XSS Prevention:** All URL parameters sanitized and injected strictly via `textContent`. Never use `innerHTML` for dynamic content.
- **Audio:** Web Audio API only (synthesized ambient drone at 220Hz + 330Hz with gentle LFO modulation). No autoplay; starts only on explicit user click.
- **Animation & Canvas:** GSAP 3.12.5 via CDN for choreography. Canvas API for fireworks with strict object pooling, `fillRect` rendering, max 300 particles, paused when tab is hidden.
- **Accessibility:** Semantic HTML, ARIA live regions, `aria-pressed`, visible focus outlines, full keyboard navigation, and full support for `prefers-reduced-motion: reduce`.
- **Target Deployment:** Vercel static hosting (zero build command, root entry point `index.html`).

## Code Architecture
- `index.html`: Semantic markup containing the 3 screens (`data-screen="intro"`, `data-screen="reveal"`, `data-screen="card"`), canvas, background particles container, and SVG diya container.
- `css/style.css`: Mobile-first responsive styles, color variables (`--ink`, `--midnight`, `--gold`, etc.), gold text glow, focus rings, accessibility styles, media queries.
- `js/fireworks.js`: Independent canvas fireworks engine with object pooling, max 300 particles, debounced resize, tab visibility handling.
- `js/diya.js`: Hand-coded detailed SVG diya component with ignition, glow intensification, flame flicker, and reset capabilities.
- `js/wishes.js`: 8 curated Diwali wishes with duplicate prevention on consecutive calls.
- `js/main.js`: Application orchestrator, URL personalization, screen transitions, Web Audio synthesizer, event listeners, toast notifications, replay logic.

# Architectural Decision Record (ADR) 0001: Static Vanilla JavaScript Architecture

## Status
Accepted

## Context
When architecting "THE DIWALI EXPERIENCE", the objective was to produce a high-fidelity, high-emotion personalized greeting website that loads instantaneously on mobile and desktop devices globally, requires zero ongoing infrastructure cost or maintenance, and protects recipient privacy unconditionally.

Modern web workflows often default to React, Next.js, Vite, or Vue. However, festive greeting pages have unique operational characteristics:
1. Recipients open links on a wide range of mobile devices (Android, iOS) over varying network connections (3G, 4G, 5G, Wi-Fi).
2. The page lifecycle is interactive and visual, not data-dense or form-heavy.
3. The greeting must remain functional for years without dependency decay or framework obsolescence.
4. User tracking, storage, and server vulnerabilities must be strictly non-existent.

## Decision
We decided to build the entire application using **pure Vanilla HTML5, CSS3, and ES Modules**, paired with **GSAP 3.12.5 via CDN** for animation choreography, the **HTML5 Canvas API** for fireworks, and the **Web Audio API** for real-time generative music synthesis.

### Key Factors:
1. **Zero Bundle Overhead:** No multi-megabyte JavaScript bundles, no hydration delays, no virtual DOM diffing penalties. The page achieves near-instant First Contentful Paint (FCP) and Largest Contentful Paint (LCP).
2. **Deterministic Longevity:** Modern browser standards (ES Modules, Web Audio, Canvas 2D) are backward-compatible. This page will render identically ten years from now without requiring `npm audit fix` or framework upgrades.
3. **Zero Attack Surface:** Without npm dependencies or a backend server, the application is impervious to software supply chain attacks, SQL injection, SSRF, or credential harvesting.
4. **Instant Static Deployment:** Deployable anywhere on Vercel, GitHub Pages, or any web server without complex CI/CD build scripts.

## Consequences
- **Positive:** Sub-second load times, lightweight memory footprint, smooth 60fps animations on mid-tier mobile hardware, absolute privacy, and trivial zero-configuration hosting.
- **Negative:** Component reuse must be handled through modular JavaScript functions rather than JSX/templates. For a three-screen application, this trade-off is optimal.

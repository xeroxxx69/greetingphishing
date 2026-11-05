# Testing & Verification Guide: THE DIWALI EXPERIENCE

## 1. Verification Strategy
This document defines the 12 non-negotiable verification gates required to certify that "THE DIWALI EXPERIENCE" is production-ready, performant, accessible, and secure.

---

### Gate 1: Local Server Verification
- **Command:** `python -m http.server 8000`
- **Validation:** `curl -I http://localhost:8000/index.html`
- **Pass Criteria:** HTTP Status 200 OK, valid content-type `text/html`.

### Gate 2: Screen Structure & Data Attributes
- **Validation:** Inspect DOM for all 3 required screens:
  - `data-screen="intro"`
  - `data-screen="reveal"`
  - `data-screen="card"`
- **Pass Criteria:** All three screen elements exist in the DOM with proper ARIA attributes.

### Gate 3: URL Personalization
- **URL Tested:** `http://localhost:8000/?name=TestUser`
- **Expected Outcome:** `#recipient-name` element displays `TestUser`. Greeting card displays `Happy Diwali, TestUser!`.
- **Pass Criteria:** Text matches query parameter accurately.

### Gate 4: Personalization Fallback
- **URL Tested:** `http://localhost:8000/` (no query parameter) or `?name=` (empty parameter)
- **Expected Outcome:** `#recipient-name` element displays `Friend`.
- **Pass Criteria:** Default fallback is applied when parameter is missing or empty.

### Gate 5: XSS & Injection Prevention
- **URL Tested:** `http://localhost:8000/?name=<script>alert(1)</script>`
- **Expected Outcome:** Script tag is rendered literally as text content; no JavaScript execution occurs, no alert dialog appears.
- **Pass Criteria:** Injected HTML/script is completely inert and rendered via `textContent`.

### Gate 6: Particle Engine Constraints
- **Validation:** Inspect `fireworks.js` module constant `MAX_PARTICLES`.
- **Pass Criteria:** `MAX_PARTICLES <= 300`. Active particle count never exceeds pool size.

### Gate 7: Animation & Rendering Integrity
- **Validation:**
  - `requestAnimationFrame` used for all canvas rendering.
  - No `setInterval` used for animations.
  - Particles are recycled through pre-allocated pool.
  - Tab visibility change halts loop (`document.hidden` check).
- **Pass Criteria:** Smooth 60fps rendering without garbage collection pauses; idle when tab is hidden.

### Gate 8: Accessibility & Reduced Motion
- **Validation:**
  - Test with `@media (prefers-reduced-motion: reduce)`.
  - Fireworks canvas and floating particles disabled.
  - Fireworks trigger button hidden.
  - Focus outlines clearly visible (`2px solid var(--gold)`).
  - ARIA attributes present (`aria-pressed`, `aria-live="polite"`).
- **Pass Criteria:** Full accessibility compliance without motion sickness hazards.

### Gate 9: Responsive Layout Testing
- **Viewport Widths Tested:**
  - 375px (iPhone SE / compact mobile)
  - 390px (iPhone 13/14/15)
  - 768px (iPad / Tablet portrait)
  - 1024px (Laptop)
  - 1440px (Desktop / 4K)
- **Pass Criteria:** Zero horizontal overflow (`scrollWidth === clientWidth`), readable fonts, touch targets >= 44px.

### Gate 10: Functional Controls Testing
- **Controls Tested:**
  1. `Open Your Surprise`: Flame ignites, initial burst fires, transitions to reveal.
  2. `Make a Wish ✨`: Displays non-repeating festive wish with smooth fade.
  3. `Light Up the Sky ✨`: Fires random golden bursts on demand.
  4. `Music: Off / On`: Toggles 220Hz+330Hz ambient drone, updates `aria-pressed`.
  5. `Share ❤️`: Copies URL with query parameter and shows toast notification.
  6. `Replay Experience`: Full reset, stops music/fireworks, unlights Diya, returns to intro.
- **Pass Criteria:** All 6 interactions function flawlessly with zero uncaught errors.

### Gate 11: Browser Console Audit
- **Validation:** Check developer console across all user interactions.
- **Pass Criteria:** Zero errors, zero unhandled promise rejections, zero failed asset requests.

### Gate 12: Zero Tracking & Privacy Audit
- **Validation:** Inspect storage APIs and network traffic:
  - `localStorage.length === 0`
  - `sessionStorage.length === 0`
  - `document.cookie === ""`
  - No geolocation requests.
  - No external tracking or telemetry requests.
- **Pass Criteria:** Absolute user privacy preserved.

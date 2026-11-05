# Threat Model & Security Specification: THE DIWALI EXPERIENCE

## 1. Threat Profile & Trust Boundaries
The application is a client-side static web application with an untrusted input channel: the URL query string (`?name=...`). Since users share links publicly (via WhatsApp, iMessage, Instagram, Email), arbitrary strings can be passed in the `name` parameter.

### Trust Boundaries:
- **Untrusted:** URL query string parameters (`location.search`).
- **Trusted:** First-party static application code (`index.html`, `style.css`, `js/*.js`).
- **External Verified Assets:** Google Fonts CDN (`fonts.googleapis.com`, `fonts.gstatic.com`), GSAP CDN (`cdnjs.cloudflare.com`).

---

## 2. Identified Threats & Mitigations

### Threat 1: Cross-Site Scripting (XSS) via Name Parameter
- **Attack Vector:** An attacker sends a link like `https://site/?name=<script>stealData()</script>` or `?name=<img src=x onerror=alert(1)>`.
- **Mitigation:**
  1. The parameter is extracted strictly using `URLSearchParams.get('name')`.
  2. Input is stripped of ASCII control characters (`/[\x00-\x1F\x7F]/g`).
  3. Truncated to a maximum length of 30 characters (`.slice(0, 30)`).
  4. Rendered to the DOM **exclusively via `textContent`**. Never inserted via `innerHTML`, `outerHTML`, or `document.write`.
  5. The Content Security Policy explicitly forbids inline script execution.

### Threat 2: Content Injection & UI Defacement
- **Attack Vector:** Providing extremely long strings (e.g. 50,000 characters) or unicode directional override characters to break the layout.
- **Mitigation:**
  1. Hard cutoff at 30 characters prevents DOM buffer attacks and horizontal layout breaks.
  2. Fallback to `"Friend"` if sanitized input is empty or composed solely of whitespace.

### Threat 3: Data Harvesting & Privacy Leakage
- **Attack Vector:** Unintended exfiltration of user IP, location, or device identifiers.
- **Mitigation:**
  1. Zero cookies set or read.
  2. Zero usage of `localStorage` or `sessionStorage`.
  3. Zero analytics scripts (no Google Analytics, Facebook Pixel, Mixpanel, etc.).
  4. Zero geolocation queries (`navigator.geolocation` is completely untouched).
  5. Zero tracking pixels or background telemetry requests.

### Threat 4: Browser Resource Exhaustion (DoS)
- **Attack Vector:** Rapid clicking of "Light Up the Sky" to spawn thousands of particles, freezing the browser.
- **Mitigation:**
  1. The fireworks engine strictly enforces `MAX_PARTICLES = 300`.
  2. Object pooling reuses pre-allocated particle instances.
  3. If active particle count hits 300, further burst requests are gracefully dropped until particles expire.
  4. Rendering automatically halts when tab visibility changes (`document.hidden`).

---

## 3. Content Security Policy (CSP) Implementation
The application includes the following strict CSP meta header:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'none';
  script-src 'self' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self';
">
```
- **`default-src 'none'`**: Disallows all unspecified fetches by default.
- **`script-src`**: Strictly permits local modules and the pinned GSAP CDN library.
- **`style-src`**: Permits local stylesheets and Google Fonts CSS.
- **`font-src`**: Permits font binaries from Google's static CDN.
- **`img-src`**: Restricts images to local assets and data URIs.
- **`connect-src 'self'`**: Prevents unauthorized outgoing network requests.

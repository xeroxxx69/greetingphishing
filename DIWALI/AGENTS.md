# AGENTS.md - Development Rules for AI Agents

## Mission
You are working on "THE DIWALI EXPERIENCE", a high-aesthetic, production-ready static web application celebrating Diwali with interactive personalization, ambient audio, fireworks, and wishes.

## Core Rules for Agents
1. **Never introduce dependencies:** Do not add npm packages, Vite, Webpack, React, Vue, or Tailwind.
2. **Never store user data:** Do not use `localStorage`, `sessionStorage`, `IndexedDB`, or cookies.
3. **Escaping & Injection:** Never write URL data into `innerHTML`. Only use `textContent`.
4. **CSS & Styling:** Respect design system palette:
   - `--ink: #0a0a0f;`
   - `--midnight: #1a0a2e;`
   - `--gold: #d4af37;`
   - `--gold-soft: #f0d78c;`
   - `--warm: #ffb347;`
   - `--text: #f4efe4;`
   - `--text-dim: #b8a889;`
5. **Fireworks Performance:** Keep particle limit `<= 300`, pool objects, avoid garbage collection inside the loop, avoid `ctx.shadowBlur` in hot render loops, use `fillRect`.
6. **Screen Flow:**
   - Screen 1: `intro` (unlit diya, "A Little Light, A Lot of Happiness.", "Open Your Surprise" button)
   - Screen 2: `reveal` (bright glowing diya, 3 staggered firework bursts, "Happy Diwali", auto transitions after ~3.2s)
   - Screen 3: `card` (personalized greeting, "Make a Wish ✨", "Light Up the Sky ✨", "Music: Off/On", "Share ❤️", "Replay Experience")
7. **Verification:** Must pass all 12 verification gates defined in the project specification before completion.

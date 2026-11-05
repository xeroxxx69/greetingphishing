/**
 * diya.js
 * Hand-coded SVG Diya Component with ignition, flicker, and glow choreography.
 * ViewBox: 0 0 200 200.
 */

let diyaElement = null;
let flameGroup = null;
let flameGlow = null;
let flameFlickerTween = null;
let floatTween = null;

const SVG_MARKUP = `
<svg class="diya-svg" viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Traditional Indian Diya lamp">
  <defs>
    <!-- Aura & Flame Glow -->
    <radialGradient id="diyaAuraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd56b" stop-opacity="0.85"/>
      <stop offset="35%" stop-color="#ff9d2e" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#d4af37" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0a0a0f" stop-opacity="0"/>
    </radialGradient>

    <!-- Clay Body Gradient -->
    <linearGradient id="clayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b85324"/>
      <stop offset="45%" stop-color="#8a3014"/>
      <stop offset="100%" stop-color="#481607"/>
    </linearGradient>

    <!-- Gold Accent Gradient -->
    <linearGradient id="goldRimGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d4af37"/>
      <stop offset="50%" stop-color="#fff2b2"/>
      <stop offset="100%" stop-color="#aa8210"/>
    </linearGradient>

    <!-- Flame Gradient (Outer) -->
    <linearGradient id="flameOuterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#e65100"/>
      <stop offset="35%" stop-color="#ff9800"/>
      <stop offset="75%" stop-color="#ffeb3b"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>

    <!-- Flame Gradient (Inner Core) -->
    <linearGradient id="flameInnerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#ffb347"/>
      <stop offset="60%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>

  <!-- Ambient Light Reflection on Ground -->
  <ellipse class="diya-ground-shadow" cx="100" cy="180" rx="60" ry="12" fill="#000000" opacity="0.6"/>
  <ellipse class="diya-ground-glow" cx="100" cy="178" rx="64" ry="10" fill="url(#diyaAuraGlow)" opacity="0"/>

  <!-- Flame & Glow Group -->
  <g class="diya-flame-group" transform-origin="100 110" style="opacity: 0; transform: scale(0.1);">
    <!-- Large Radiant Halo -->
    <circle class="diya-halo" cx="100" cy="85" r="75" fill="url(#diyaAuraGlow)" opacity="0.6"/>

    <!-- Outer Teardrop Flame -->
    <path class="diya-flame-outer" d="M 100 40 C 86 68 76 88 78 108 C 80 126 90 134 100 134 C 110 134 120 126 122 108 C 124 88 114 68 100 40 Z" fill="url(#flameOuterGrad)"/>

    <!-- Inner Bright Core -->
    <path class="diya-flame-inner" d="M 100 62 C 92 82 86 96 87 114 C 88 126 94 130 100 130 C 106 130 112 126 113 114 C 114 96 108 82 100 62 Z" fill="url(#flameInnerGrad)" opacity="0.95"/>
  </g>

  <!-- Base Pedestal -->
  <ellipse cx="100" cy="170" rx="34" ry="8" fill="#5c1f0e" stroke="#aa8210" stroke-width="1.5"/>

  <!-- Diya Clay Lamp Body -->
  <path class="diya-body" d="M 28 125 C 32 165 72 174 100 174 C 128 174 168 165 172 125 C 174 121 166 118 100 118 C 34 118 26 121 28 125 Z" fill="url(#clayGradient)" stroke="#260b03" stroke-width="1.5"/>

  <!-- Golden Ornate Rim -->
  <path class="diya-rim" d="M 26 123 C 32 133 72 138 100 138 C 128 138 168 133 174 123 C 168 115 128 112 100 112 C 72 112 32 115 26 123 Z" fill="url(#goldRimGradient)" stroke="#876605" stroke-width="1.2"/>

  <!-- Diya Oil Pool -->
  <ellipse cx="100" cy="122" rx="64" ry="8" fill="#381005" opacity="0.85"/>

  <!-- Traditional Decorative Gold Filigree Beads -->
  <g class="diya-beads" fill="#fff2b2" stroke="#aa8210" stroke-width="0.6">
    <circle cx="50" cy="144" r="2.8"/>
    <circle cx="68" cy="153" r="3.2"/>
    <circle cx="88" cy="158" r="3.4"/>
    <circle cx="100" cy="159" r="3.6"/>
    <circle cx="112" cy="158" r="3.4"/>
    <circle cx="132" cy="153" r="3.2"/>
    <circle cx="150" cy="144" r="2.8"/>
  </g>

  <!-- Wick Tip Resting at Center-Top -->
  <path class="diya-wick" d="M 98 123 C 99 116 100 112 100 108 C 101 112 102 116 103 123 Z" fill="#1b120c"/>
</svg>
`;

/**
 * Mounts the Diya SVG into the specified container element.
 * @param {HTMLElement} container 
 */
export function init(container) {
  if (!container) return;
  container.innerHTML = SVG_MARKUP;
  diyaElement = container.querySelector('.diya-svg');
  flameGroup = container.querySelector('.diya-flame-group');
  flameGlow = container.querySelector('.diya-ground-glow');

  startIdleFloat();
}

/**
 * Gentle floating animation for the unlit lamp.
 */
function startIdleFloat() {
  if (!diyaElement || typeof gsap === 'undefined') return;

  if (floatTween) floatTween.kill();

  floatTween = gsap.to(diyaElement, {
    y: -8,
    duration: 2.4,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1
  });
}

/**
 * Ignites the diya flame with smooth organic flare.
 * @returns {Promise<void>} Resolves when ignition completes.
 */
export function ignite() {
  return new Promise((resolve) => {
    if (!flameGroup || typeof gsap === 'undefined') {
      if (flameGroup) {
        flameGroup.style.opacity = '1';
        flameGroup.style.transform = 'scale(1)';
      }
      resolve();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        startFlicker();
        resolve();
      }
    });

    // Ignition burst: grow from tiny spark to full flame with bounce
    tl.to(flameGroup, {
      opacity: 1,
      scale: 1.15,
      duration: 0.65,
      ease: "back.out(2)"
    })
    .to(flameGroup, {
      scale: 1,
      duration: 0.35,
      ease: "power2.inOut"
    }, "-=0.15")
    .to(flameGlow, {
      opacity: 0.75,
      duration: 0.8,
      ease: "power1.out"
    }, "-=0.6");
  });
}

/**
 * Starts continuous organic flickering of the flame.
 */
function startFlicker() {
  if (!flameGroup || typeof gsap === 'undefined') return;

  if (flameFlickerTween) flameFlickerTween.kill();

  const outerFlame = flameGroup.querySelector('.diya-flame-outer');
  const innerFlame = flameGroup.querySelector('.diya-flame-inner');
  const halo = flameGroup.querySelector('.diya-halo');

  flameFlickerTween = gsap.timeline({ repeat: -1 });

  flameFlickerTween
    .to([outerFlame, innerFlame], {
      scaleY: 1.07,
      scaleX: 0.96,
      duration: 0.18,
      ease: "sine.inOut"
    })
    .to([outerFlame, innerFlame], {
      scaleY: 0.94,
      scaleX: 1.04,
      duration: 0.22,
      ease: "sine.inOut"
    })
    .to([outerFlame, innerFlame], {
      scaleY: 1.02,
      scaleX: 0.98,
      duration: 0.15,
      ease: "sine.inOut"
    });

  if (halo) {
    gsap.to(halo, {
      opacity: 0.8,
      scale: 1.08,
      transformOrigin: "center center",
      duration: 0.7,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }
}

/**
 * Intensifies glow during the reveal transition.
 */
export function intensify() {
  if (typeof gsap === 'undefined') return;

  if (flameGroup) {
    gsap.to(flameGroup, {
      scale: 1.25,
      duration: 0.8,
      ease: "power2.out"
    });
  }

  if (flameGlow) {
    gsap.to(flameGlow, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    });
  }
}

/**
 * Resets the Diya lamp to unlit state.
 */
export function reset() {
  if (flameFlickerTween) {
    flameFlickerTween.kill();
    flameFlickerTween = null;
  }

  if (typeof gsap !== 'undefined' && flameGroup) {
    gsap.killTweensOf(flameGroup);
    if (flameGlow) gsap.killTweensOf(flameGlow);

    gsap.set(flameGroup, {
      opacity: 0,
      scale: 0.1
    });

    if (flameGlow) {
      gsap.set(flameGlow, { opacity: 0 });
    }
  } else if (flameGroup) {
    flameGroup.style.opacity = '0';
    flameGroup.style.transform = 'scale(0.1)';
    if (flameGlow) flameGlow.style.opacity = '0';
  }

  startIdleFloat();
}

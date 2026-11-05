/**
 * main.js
 * Master Application Orchestration Module
 * Handles URL personalization, screen transitions, GSAP choreography,
 * Web Audio ambient synthesizer, wishes integration, fireworks, and share/replay.
 */

import * as fireworks from './fireworks.js';
import * as diya from './diya.js';
import { getRandomWish } from './wishes.js';

/* ==========================================================================
   CONSTANTS & DOM REFERENCES
   ========================================================================== */

const MAX_PARTICLES_BG = 36;
const REVEAL_DURATION_MS = 3200;

// Screens
const screenIntro = document.getElementById('screen-intro');
const screenReveal = document.getElementById('screen-reveal');
const screenCard = document.getElementById('screen-card');

// Mounts
const introDiyaMount = document.getElementById('intro-diya-mount');
const revealDiyaMount = document.getElementById('reveal-diya-mount');
const cardDiyaMount = document.getElementById('card-diya-mount');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const ambientContainer = document.getElementById('ambient-particles');

// Controls
const btnOpenSurprise = document.getElementById('btn-open-surprise');
const btnWish = document.getElementById('btn-wish');
const btnFireworks = document.getElementById('btn-fireworks');
const btnMusic = document.getElementById('btn-music');
const musicLabel = document.getElementById('music-label');
const musicIcon = document.getElementById('music-icon');
const btnShare = document.getElementById('btn-share');
const btnReplay = document.getElementById('btn-replay');

// Display elements
const recipientNameSpan = document.getElementById('recipient-name');
const revealHeading = document.getElementById('reveal-heading');
const wishBox = document.getElementById('wish-box');
const wishText = document.getElementById('wish-text');
const toastElement = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

/* ==========================================================================
   STATE
   ========================================================================== */

const state = {
  currentScreen: 'intro', // 'intro' | 'reveal' | 'card'
  recipientName: 'Friend',
  isTransitioning: false,
  musicPlaying: false,
  audioContext: null,
  masterGain: null,
  oscillator1: null,
  oscillator2: null,
  lfoOsc: null,
  toastTimeout: null,
  prefersReducedMotion: false
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initReducedMotionCheck();
  initPersonalization();
  initAmbientParticles();
  initDiya();
  initFireworks();
  bindEventListeners();
});

/**
 * Checks and monitors prefers-reduced-motion setting.
 */
function initReducedMotionCheck() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  state.prefersReducedMotion = mediaQuery.matches;

  mediaQuery.addEventListener('change', (e) => {
    state.prefersReducedMotion = e.matches;
    if (state.prefersReducedMotion) {
      fireworks.stop();
    }
  });
}

/**
 * Parses and strictly sanitizes recipient name from URLSearchParams.
 * Uses textContent only to prevent XSS.
 */
function initPersonalization() {
  const params = new URLSearchParams(window.location.search);
  const rawName = params.get('name');

  if (!rawName) {
    state.recipientName = 'Friend';
  } else {
    // Remove control characters (ASCII 0-31 and 127)
    let sanitized = rawName.replace(/[\x00-\x1F\x7F]/g, '').trim();

    // Limit length to maximum 30 characters
    sanitized = sanitized.slice(0, 30);

    state.recipientName = sanitized.length > 0 ? sanitized : 'Friend';
  }

  // Safe insertion via textContent
  if (recipientNameSpan) {
    recipientNameSpan.textContent = state.recipientName;
  }
}

/**
 * Spawns up to 36 ambient golden floating particles in the background.
 */
function initAmbientParticles() {
  if (!ambientContainer || state.prefersReducedMotion) return;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < MAX_PARTICLES_BG; i++) {
    const dot = document.createElement('div');
    dot.className = 'ambient-dot';

    const size = (Math.random() * 2.5 + 1.5).toFixed(1);
    const left = (Math.random() * 100).toFixed(1);
    const duration = (Math.random() * 6 + 7).toFixed(1);
    const delay = (Math.random() * 8).toFixed(1);

    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${left}%`;
    dot.style.animationDuration = `${duration}s`;
    dot.style.animationDelay = `-${delay}s`;

    fragment.appendChild(dot);
  }

  ambientContainer.appendChild(fragment);
}

/**
 * Initializes the SVG Diya in the intro screen.
 */
function initDiya() {
  if (introDiyaMount) {
    diya.init(introDiyaMount);
  }
}

/**
 * Initializes the fireworks canvas.
 */
function initFireworks() {
  if (fireworksCanvas && !state.prefersReducedMotion) {
    fireworks.init(fireworksCanvas);
  }
}

/**
 * Binds DOM event listeners.
 */
function bindEventListeners() {
  if (btnOpenSurprise) {
    btnOpenSurprise.addEventListener('click', handleOpenSurprise);
  }

  if (btnWish) {
    btnWish.addEventListener('click', handleMakeWish);
  }

  if (btnFireworks) {
    btnFireworks.addEventListener('click', handleLightUpSky);
  }

  if (btnMusic) {
    btnMusic.addEventListener('click', toggleMusic);
  }

  if (btnShare) {
    btnShare.addEventListener('click', handleShare);
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', handleReplay);
  }
}

/* ==========================================================================
   SCREEN TRANSITIONS & FLOW
   ========================================================================== */

/**
 * Step 1: Open Your Surprise
 * Ignites flame, triggers fireworks burst, transitions to Reveal Screen.
 */
async function handleOpenSurprise() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;
  btnOpenSurprise.disabled = true;

  // 1. Ignite the Diya
  await diya.ignite();

  // 2. Initial celebratory burst
  if (!state.prefersReducedMotion) {
    fireworks.burstRandom();
  }

  // Brief pause to admire the lit flame (~400ms)
  await delay(400);

  // 3. Transition to Reveal Screen
  transitionToReveal();
}

/**
 * Transitions from Screen 1 (Intro) to Screen 2 (Reveal).
 */
function transitionToReveal() {
  state.currentScreen = 'reveal';

  // Move the lit Diya SVG into reveal screen
  moveDiyaTo(revealDiyaMount);
  diya.intensify();

  if (typeof gsap !== 'undefined' && !state.prefersReducedMotion) {
    const tl = gsap.timeline({
      onComplete: () => {
        screenIntro.classList.remove('active');
        screenIntro.setAttribute('aria-hidden', 'true');
        screenReveal.classList.add('active');
        screenReveal.setAttribute('aria-hidden', 'false');

        runRevealSequence();
      }
    });

    tl.to(screenIntro, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    });
  } else {
    screenIntro.classList.remove('active');
    screenIntro.setAttribute('aria-hidden', 'true');
    screenReveal.classList.add('active');
    screenReveal.setAttribute('aria-hidden', 'false');
    runRevealSequence();
  }
}

/**
 * Runs the festive reveal sequence:
 * Staggered fireworks bursts (~400ms apart), text animation, auto-advancing after ~3.2s.
 */
function runRevealSequence() {
  // Reveal screen text animation
  if (typeof gsap !== 'undefined' && !state.prefersReducedMotion) {
    gsap.fromTo(revealHeading, 
      { opacity: 0, letterSpacing: '0.25em', scale: 0.95 },
      { opacity: 1, letterSpacing: '0.06em', scale: 1, duration: 1.2, ease: "power2.out" }
    );
    gsap.fromTo('.reveal-subtext',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: "power2.out" }
    );
  } else {
    revealHeading.style.opacity = '1';
    revealHeading.style.letterSpacing = '0.06em';
    const subtext = document.querySelector('.reveal-subtext');
    if (subtext) subtext.style.opacity = '1';
  }

  // Staggered 3 initial firework bursts (~400ms apart)
  if (!state.prefersReducedMotion) {
    setTimeout(() => fireworks.burstRandom(), 100);
    setTimeout(() => fireworks.burstRandom(), 500);
    setTimeout(() => fireworks.burstRandom(), 900);
    setTimeout(() => fireworks.burstRandom(), 1800);
  }

  // Automatically advance to Greeting Card after ~3.2s
  setTimeout(() => {
    transitionToCard();
  }, REVEAL_DURATION_MS);
}

/**
 * Transitions from Screen 2 (Reveal) to Screen 3 (Greeting Card).
 */
function transitionToCard() {
  state.currentScreen = 'card';

  // Move the lit Diya to the greeting card mount
  moveDiyaTo(cardDiyaMount);

  if (typeof gsap !== 'undefined' && !state.prefersReducedMotion) {
    const tl = gsap.timeline({
      onComplete: () => {
        screenReveal.classList.remove('active');
        screenReveal.setAttribute('aria-hidden', 'true');
        screenCard.classList.add('active');
        screenCard.setAttribute('aria-hidden', 'false');
        state.isTransitioning = false;

        animateCardEntrance();
      }
    });

    tl.to(screenReveal, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    });
  } else {
    screenReveal.classList.remove('active');
    screenReveal.setAttribute('aria-hidden', 'true');
    screenCard.classList.add('active');
    screenCard.setAttribute('aria-hidden', 'false');
    state.isTransitioning = false;
  }
}

/**
 * Elegant staggered reveal of card elements.
 */
function animateCardEntrance() {
  if (typeof gsap === 'undefined' || state.prefersReducedMotion) return;

  gsap.fromTo('.greeting-card',
    { opacity: 0, y: 25, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
  );

  gsap.fromTo('.card-heading, .card-message, .wish-container, .controls-grid',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 0.2 }
  );
}

/**
 * Moves the existing live SVG Diya lamp element between screen mounts,
 * preserving its lit state and continuous flame flicker.
 * @param {HTMLElement} targetMount 
 */
function moveDiyaTo(targetMount) {
  const existingSvg = document.querySelector('.diya-svg');
  if (existingSvg && targetMount) {
    targetMount.appendChild(existingSvg);
  }
}

/* ==========================================================================
   FEATURE 1: MAKE A WISH
   ========================================================================== */

function handleMakeWish() {
  const wish = getRandomWish();
  if (!wishText || !wishBox) return;

  if (typeof gsap !== 'undefined' && !state.prefersReducedMotion) {
    // Fade out current wish
    gsap.to(wishText, {
      opacity: 0,
      y: -6,
      duration: 0.2,
      ease: "power1.in",
      onComplete: () => {
        wishText.textContent = wish;
        wishBox.classList.add('highlight');

        // Fade in new wish with warm glow
        gsap.to(wishText, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out"
        });

        setTimeout(() => {
          wishBox.classList.remove('highlight');
        }, 1200);
      }
    });
  } else {
    wishText.textContent = wish;
  }
}

/* ==========================================================================
   FEATURE 2: LIGHT UP THE SKY
   ========================================================================== */

function handleLightUpSky() {
  if (state.prefersReducedMotion) return;

  // Trigger two random golden bursts
  fireworks.burstRandom();
  setTimeout(() => {
    fireworks.burstRandom();
  }, 220);
}

/* ==========================================================================
   FEATURE 3: WEB AUDIO AMBIENT SYNTHESIZER
   ========================================================================== */

/**
 * Initializes and starts the Web Audio API ambient drone.
 * Sine 220Hz + Sine 330Hz, gain ~0.015, gentle LFO modulation.
 * Starts only on explicit user interaction.
 */
function startAmbientMusic() {
  if (!state.audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser.');
      return;
    }

    state.audioContext = new AudioContextClass();

    // Master Gain Node
    state.masterGain = state.audioContext.createGain();
    state.masterGain.gain.setValueAtTime(0.0001, state.audioContext.currentTime);
    state.masterGain.connect(state.audioContext.destination);

    // Oscillator 1: 220Hz (A3 warm root)
    state.oscillator1 = state.audioContext.createOscillator();
    state.oscillator1.type = 'sine';
    state.oscillator1.frequency.setValueAtTime(220, state.audioContext.currentTime);

    // Oscillator 2: 330Hz (E4 perfect fifth)
    state.oscillator2 = state.audioContext.createOscillator();
    state.oscillator2.type = 'sine';
    state.oscillator2.frequency.setValueAtTime(330, state.audioContext.currentTime);

    // Subtle LFO (0.15Hz) for gentle organic breathing modulation
    state.lfoOsc = state.audioContext.createOscillator();
    state.lfoOsc.type = 'sine';
    state.lfoOsc.frequency.setValueAtTime(0.15, state.audioContext.currentTime);

    const lfoGain = state.audioContext.createGain();
    lfoGain.gain.setValueAtTime(0.004, state.audioContext.currentTime);

    state.lfoOsc.connect(lfoGain);
    lfoGain.connect(state.masterGain.gain);

    // Connect oscillators to master gain
    state.oscillator1.connect(state.masterGain);
    state.oscillator2.connect(state.masterGain);

    state.oscillator1.start();
    state.oscillator2.start();
    state.lfoOsc.start();
  }

  if (state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }

  // Smooth fade-in to ~0.015 gain
  const now = state.audioContext.currentTime;
  state.masterGain.gain.cancelScheduledValues(now);
  state.masterGain.gain.setValueAtTime(state.masterGain.gain.value, now);
  state.masterGain.gain.linearRampToValueAtTime(0.015, now + 1.2);

  state.musicPlaying = true;
  updateMusicButtonUI(true);
}

/**
 * Pauses / fades out the ambient drone.
 */
function stopAmbientMusic() {
  if (!state.audioContext || !state.masterGain) return;

  const now = state.audioContext.currentTime;
  state.masterGain.gain.cancelScheduledValues(now);
  state.masterGain.gain.setValueAtTime(state.masterGain.gain.value, now);
  state.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);

  setTimeout(() => {
    if (state.audioContext && state.audioContext.state === 'running') {
      state.audioContext.suspend();
    }
  }, 650);

  state.musicPlaying = false;
  updateMusicButtonUI(false);
}

function toggleMusic() {
  if (state.musicPlaying) {
    stopAmbientMusic();
  } else {
    startAmbientMusic();
  }
}

function updateMusicButtonUI(isPlaying) {
  if (btnMusic) {
    btnMusic.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  }
  if (musicLabel) {
    musicLabel.textContent = isPlaying ? 'Music: On' : 'Music: Off';
  }
  if (musicIcon) {
    musicIcon.textContent = isPlaying ? '🎶' : '🎵';
  }
}

/* ==========================================================================
   FEATURE 4: SHARE WITH URL PRESERVATION
   ========================================================================== */

async function handleShare() {
  const shareUrl = window.location.href;
  const shareData = {
    title: 'The Diwali Experience',
    text: `A special Diwali surprise prepared for ${state.recipientName}! ✨`,
    url: shareUrl
  };

  // Try Web Share API first
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // If user cancelled, do nothing. If error, proceed to clipboard fallback
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback to Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied successfully!');
      return;
    } catch {
      // Fallback to manual selection
    }
  }

  fallbackCopyText(shareUrl);
}

/**
 * Fallback clipboard copy for restricted environments.
 * @param {string} text 
 */
function fallbackCopyText(text) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.style.position = 'fixed';
  tempInput.style.left = '-9999px';
  document.body.appendChild(tempInput);
  tempInput.select();

  try {
    const success = document.execCommand('copy');
    if (success) {
      showToast('Link copied successfully!');
    } else {
      showToast('Please copy the URL from your address bar.');
    }
  } catch {
    showToast('Please copy the URL from your address bar.');
  } finally {
    document.body.removeChild(tempInput);
  }
}

/**
 * Displays a non-intrusive toast notification.
 * @param {string} msg 
 */
function showToast(msg) {
  if (!toastElement || !toastMessage) return;

  toastMessage.textContent = msg;
  toastElement.classList.add('show');

  if (state.toastTimeout) {
    clearTimeout(state.toastTimeout);
  }

  state.toastTimeout = setTimeout(() => {
    toastElement.classList.remove('show');
  }, 2800);
}

/* ==========================================================================
   FEATURE 5: REPLAY EXPERIENCE
   ========================================================================== */

function handleReplay() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  // 1. Stop active fireworks
  fireworks.stop();

  // 2. Stop or suspend music
  if (state.musicPlaying) {
    stopAmbientMusic();
  }

  // 3. Move Diya back to intro screen and reset to unlit state
  moveDiyaTo(introDiyaMount);
  diya.reset();

  // 4. Reset wish box text
  if (wishText) {
    wishText.textContent = 'Press "Make a Wish" to unveil special festive blessings.';
  }

  // 5. Reset button state
  if (btnOpenSurprise) {
    btnOpenSurprise.disabled = false;
  }

  // 6. Smooth transition back to Intro Screen
  if (typeof gsap !== 'undefined' && !state.prefersReducedMotion) {
    const tl = gsap.timeline({
      onComplete: () => {
        screenCard.classList.remove('active');
        screenCard.setAttribute('aria-hidden', 'true');
        screenIntro.classList.add('active');
        screenIntro.setAttribute('aria-hidden', 'false');

        gsap.to(screenIntro, { opacity: 1, duration: 0.6, ease: "power2.out" });
        state.currentScreen = 'intro';
        state.isTransitioning = false;
      }
    });

    tl.to(screenCard, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut"
    });
  } else {
    screenCard.classList.remove('active');
    screenCard.setAttribute('aria-hidden', 'true');
    screenIntro.classList.add('active');
    screenIntro.setAttribute('aria-hidden', 'false');
    screenIntro.style.opacity = '1';
    state.currentScreen = 'intro';
    state.isTransitioning = false;
  }
}

/**
 * Utility promise delay helper.
 * @param {number} ms 
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

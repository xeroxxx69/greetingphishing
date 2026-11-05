/**
 * wishes.js
 * Diwali Wish Generator Module
 * Stores curated Diwali wishes and provides non-consecutive random wish retrieval.
 */

const WISHES = [
  "May your heart be filled with endless joy and every corner of your home glow with genuine warmth.",
  "May every endeavor you undertake this year blossom into rewarding milestones and remarkable achievements.",
  "May boundless abundance, good health, and flourishing fortune illuminate your path today and always.",
  "May the bond of affection and cherished memories we share shine as bright as a golden constellation.",
  "May every new dawn bring fresh inspiration, untamed courage, and wonderful opportunities to your doorstep.",
  "May deep tranquility, inner calm, and serene harmony soothe your spirit in all seasons of life.",
  "May every dream you hold close find the wings of passion and the light of perseverance to come true.",
  "May celestial blessings and good fortune guide your steps, filling your days with light and safety."
];

let lastWishIndex = -1;

/**
 * Returns a random wish from the collection, ensuring no immediate consecutive repeats.
 * @returns {string} The wish text.
 */
export function getRandomWish() {
  if (WISHES.length <= 1) {
    return WISHES[0] || "";
  }

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * WISHES.length);
  } while (newIndex === lastWishIndex);

  lastWishIndex = newIndex;
  return WISHES[newIndex];
}

/**
 * Returns all available wishes as a read-only copy (useful for testing and verification).
 * @returns {string[]}
 */
export function getAllWishes() {
  return [...WISHES];
}

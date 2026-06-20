import type { SpinPair } from '../data/selectors';

/** Mulberry32 — small, fast, seedable PRNG so spins are reproducible in tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Choose one pair uniformly from the valid set. `rng` defaults to Math.random. */
export function spin(pairs: SpinPair[], rng: () => number = Math.random): SpinPair {
  if (pairs.length === 0) throw new Error('No valid spin pairs available');
  const i = Math.floor(rng() * pairs.length);
  return pairs[Math.min(i, pairs.length - 1)];
}

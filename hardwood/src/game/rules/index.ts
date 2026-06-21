// Single source of truth for every tunable number. Playtest here, never inline
// magic numbers into the engine. See docs/02_SIMULATION_ENGINE.md.

import type { Stat, Benchmarks } from '../data/types';
import { STATS } from '../data/types';
import benchmarksJson from '../../../assets/data/benchmarks.json';

export const DRAFT_MODE: 'FIVE_SLOT' | 'ERA_SPREAD' = 'FIVE_SLOT';
export const POSITION_RULE: 'lenient' | 'strict' = 'strict';

export const SKIPS = { team: 1, decade: 1 } as const;

// The slot machine tries to land only on a (team, decade) that can currently
// offer at least this many player choices. It relaxes automatically (down to 1)
// late in a draft when filled slots thin the available pool.
export const MIN_CHOICES = 4;

// --- Scoring (engine Step 1-4) ---
export const ADJ_CLAMP = 1.6;               // caps any single era-adjusted stat
// Ceilings = the achievable "frontier" totals of a near-optimal *legal* lineup
// (one player per PG/SG/SF/PF/C, calibrated from the dataset). Under strict
// positions blocks are the natural bottleneck (only one true center allowed).
// A lineup that maxes every category against these reaches S~1 and can chase 82-0.
export const CEIL: Record<Stat, number> = { PTS: 4.8, REB: 3.9, AST: 3.1, STL: 3.7, BLK: 2.6 };
// How much each category counts toward the final score (applied in the strength
// blend, not normalization). PTS/REB/AST are what basketball is won on, so they
// carry full weight. Steals count less and blocks least — they're the strict-mode
// bottleneck (one true center), so a stacked-offense roster with thin rim
// protection shouldn't be dragged to a poor record. A fully balanced roster still
// maxes everything, so a perfect 82-0 remains reachable.
export const WEIGHT: Record<Stat, number> = { PTS: 1, REB: 1, AST: 1, STL: 0.4, BLK: 0.25 };
export const ALPHA = 0.6;                    // imbalance penalty strength (geomean blend)

// --- Win curve (engine Step 5) ---
// Calibrated against measured play: random drafts land at a ~44-win median, while
// 82-0 is gated at S_PERFECT so it can't happen by luck (random tops out ~76) but
// is reachable by skilled drafting (~0.5-1% of strong, balanced lineups clear it).
export const WIN_FLOOR = 20;
export const MAX_WINS = 82;
export const WIN_GAIN = 78;                 // tuned so S=S_PERFECT maps to a literal 82
export const CURVE_P = 2.2;
export const S_PERFECT = 0.9;               // strength needed to unlock a literal 82

export const BENCHMARKS = benchmarksJson as Benchmarks;

// Re-export for convenience
export { STATS };

export interface Rules {
  ADJ_CLAMP: number;
  CEIL: Record<Stat, number>;
  WEIGHT: Record<Stat, number>;
  ALPHA: number;
  WIN_FLOOR: number;
  MAX_WINS: number;
  WIN_GAIN: number;
  CURVE_P: number;
  S_PERFECT: number;
  benchmarks: Benchmarks;
}

export const RULES: Rules = {
  ADJ_CLAMP, CEIL, WEIGHT, ALPHA, WIN_FLOOR, MAX_WINS, WIN_GAIN, CURVE_P, S_PERFECT,
  benchmarks: BENCHMARKS,
};

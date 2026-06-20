// Single source of truth for every tunable number. Playtest here, never inline
// magic numbers into the engine. See docs/02_SIMULATION_ENGINE.md.

import type { Stat, Benchmarks } from '../data/types';
import { STATS } from '../data/types';
import benchmarksJson from '../../../assets/data/benchmarks.json';

export const DRAFT_MODE: 'FIVE_SLOT' | 'ERA_SPREAD' = 'FIVE_SLOT';
export const POSITION_RULE: 'lenient' | 'strict' = 'lenient';

export const SKIPS = { team: 1, decade: 1 } as const;

// --- Scoring (engine Step 1-4) ---
export const ADJ_CLAMP = 1.6;               // caps any single era-adjusted stat
// Ceilings = the achievable "frontier" totals of a near-optimal balanced roster
// (calibrated from the dataset; assists are the natural bottleneck). A lineup that
// maxes every category against these reaches S~1 and can chase 82-0.
export const CEIL: Record<Stat, number> = { PTS: 4.6, REB: 4.6, AST: 3.2, STL: 3.7, BLK: 3.5 };
export const WEIGHT: Record<Stat, number> = { PTS: 1, REB: 1, AST: 1, STL: 1, BLK: 1 };
export const ALPHA = 0.6;                    // imbalance penalty strength (geomean blend)

// --- Win curve (engine Step 5) ---
export const WIN_FLOOR = 20;
export const MAX_WINS = 82;
export const WIN_GAIN = 64;                 // > (MAX-FLOOR) so S~0.985+ can reach 82, then clamp
export const CURVE_P = 2.2;
export const S_PERFECT = 0.985;             // strength needed to unlock a literal 82

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

import type { Player, StatLine, Benchmarks } from '../data/types';
import { STATS } from '../data/types';

/**
 * Era-adjust a player's stat line: each value becomes "how elite is this number
 * for its era", where ~1.0 means era-elite. Clamped so one freak outlier can't
 * dominate. See docs/02_SIMULATION_ENGINE.md Step 1.
 */
export function eraAdjust(
  player: Pick<Player, 'decade' | 'stats'>,
  benchmarks: Benchmarks,
  clamp: number,
): StatLine {
  const B = benchmarks[player.decade];
  if (!B) throw new Error(`No benchmark for decade ${player.decade}`);
  const out = {} as StatLine;
  for (const c of STATS) {
    const ratio = player.stats[c] / B[c];
    out[c] = Math.min(clamp, ratio);
  }
  return out;
}

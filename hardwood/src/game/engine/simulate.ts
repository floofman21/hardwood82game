import type { Player, StatLine, SimResult, Stat, CategoryResult } from '../data/types';
import { STATS } from '../data/types';
import type { Rules } from '../rules/index';
import { eraAdjust } from './eraAdjust';
import { projectWins, clamp01 } from './winCurve';

/**
 * Run a complete roster through the engine. Pure & deterministic: same input
 * always yields the same SimResult. See docs/02_SIMULATION_ENGINE.md.
 */
export function simulate(
  roster: Pick<Player, 'id' | 'decade' | 'stats'>[],
  rules: Rules,
): SimResult {
  // Step 1: era-adjust each player
  const perPlayer = roster.map((p) => ({
    playerId: p.id,
    adjusted: eraAdjust(p, rules.benchmarks, rules.ADJ_CLAMP),
  }));

  // Step 2: team category totals
  const totals = {} as StatLine;
  for (const c of STATS) {
    totals[c] = perPlayer.reduce((s, p) => s + p.adjusted[c], 0);
  }

  // Step 3: normalize per category against the ceiling (weighted)
  const N = {} as StatLine;
  for (const c of STATS) {
    N[c] = clamp01((totals[c] / rules.CEIL[c]) * rules.WEIGHT[c]);
  }

  // Step 4: imbalance-penalized strength (blend mean + geometric mean)
  const vals = STATS.map((c) => N[c]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const product = vals.reduce((a, b) => a * b, 1);
  const geomean = Math.pow(product, 1 / vals.length);
  const S = rules.ALPHA * geomean + (1 - rules.ALPHA) * mean;

  // Step 5: win curve
  const wins = projectWins(S, rules);

  const categories = {} as Record<Stat, CategoryResult>;
  for (const c of STATS) {
    categories[c] = { total: totals[c], normalized: N[c] };
  }

  return {
    wins,
    losses: rules.MAX_WINS - wins,
    strength: Math.round(S * 1000),
    categories,
    perPlayer,
    perfect: wins === rules.MAX_WINS,
  };
}

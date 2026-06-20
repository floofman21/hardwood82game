import type { Rules } from '../rules/index';

/**
 * Map strength S in [0,1] to projected wins. A floor (any legendary roster wins
 * a lot) plus a steep climb that only near-perfect S reaches. The literal 82 is
 * gated behind S_PERFECT so it must be earned, not rounded into.
 * See docs/02_SIMULATION_ENGINE.md Step 5.
 */
export function projectWins(S: number, rules: Rules): number {
  const raw = rules.WIN_FLOOR + rules.WIN_GAIN * Math.pow(clamp01(S), rules.CURVE_P);
  let wins = Math.min(rules.MAX_WINS, Math.round(raw));
  if (wins >= rules.MAX_WINS && S < rules.S_PERFECT) wins = rules.MAX_WINS - 1;
  return wins;
}

export function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

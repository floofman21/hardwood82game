import { PLAYERS } from './load';
import type { Player } from './types';

/** Most-common value in a list (first one wins ties), or undefined if empty. */
function mode<T>(values: T[]): T | undefined {
  const counts = new Map<T, number>();
  let best: T | undefined;
  let bestN = 0;
  for (const v of values) {
    const n = (counts.get(v) ?? 0) + 1;
    counts.set(v, n);
    if (n > bestN) { bestN = n; best = v; }
  }
  return best;
}

/**
 * A short "Team / Decade" identity for a finished roster, derived from the
 * players (the dominant team and decade). Used for the Personal Best card meta.
 */
export function rosterIdentity(rosterIds: string[]): { team?: string; decade?: string } {
  const players = rosterIds
    .map((id) => PLAYERS.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
  return { team: mode(players.map((p) => p.team)), decade: mode(players.map((p) => p.decade)) };
}

import { PLAYERS } from './load';
import type { Player } from './types';
import type { GameSummary } from '../../services/social';

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

/** Surnames of a roster, in slot order, for compact banner display. */
export function rosterSurnames(rosterIds: string[]): string[] {
  return rosterIds
    .map((id) => PLAYERS.find((p) => p.id === id))
    .filter((p): p is Player => !!p)
    .map((p) => p.name.split(' ').slice(-1)[0]);
}

// Flavor names hung in "The Rafters". Chosen deterministically per lineup so a
// given roster always gets the same banner name.
const LINEUP_NAMES = [
  'The Showtime Five', 'Lockdown Era', 'Run & Gun', 'The Twin Towers', 'Old School',
  'The Dynasty', 'Positionless', 'The Glass Eaters', 'Court Vision', 'The Iron Five',
  'Hardwood Royalty', 'The Closers', 'Full-Court Press', 'The Architects', 'Downtown',
  'The Enforcers', 'Fast Break', 'The Franchise',
];

export function lineupName(rosterIds: string[]): string {
  const s = rosterIds.join('|');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return LINEUP_NAMES[h % LINEUP_NAMES.length];
}

export interface RafterEntry {
  id: string;
  name: string;
  surnames: string[];
  wins: number;
  losses: number;
  perfect: boolean;
}

/**
 * The top `n` lineups across saved history — best record first (ties broken by
 * fewer losses, then most recent). Read-only view over the persisted history.
 */
export function topLineups(history: GameSummary[], n = 5): RafterEntry[] {
  return [...history]
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.playedAt - a.playedAt)
    .slice(0, n)
    .map((g) => ({
      id: g.id,
      name: lineupName(g.rosterIds),
      surnames: rosterSurnames(g.rosterIds),
      wins: g.wins,
      losses: g.losses,
      perfect: g.wins === 82,
    }));
}

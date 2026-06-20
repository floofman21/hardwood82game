import type { Player, Position, Decade } from './types';

export interface SpinPair {
  team: string;
  decade: Decade;
}

/** True if `player` can fill at least one of the open slots under the position rule. */
export function isEligibleForSlots(
  player: Player,
  openSlots: Position[],
  positionRule: 'lenient' | 'strict',
): boolean {
  if (openSlots.length === 0) return false;
  if (positionRule === 'lenient') return true;
  return player.positions.some((p) => openSlots.includes(p));
}

/** Players in a (team, decade) who aren't already drafted and can fill an open slot. */
export function eligiblePlayers(
  players: Player[],
  team: string,
  decade: Decade,
  openSlots: Position[],
  alreadyDraftedIds: Set<string>,
  positionRule: 'lenient' | 'strict',
): Player[] {
  return players.filter(
    (p) =>
      p.team === team &&
      p.decade === decade &&
      !alreadyDraftedIds.has(p.id) &&
      isEligibleForSlots(p, openSlots, positionRule),
  );
}

/**
 * Every (team, decade) pair the slot machine may legally land on: pairs that
 * contain at least one player who can fill a currently-open slot and isn't taken.
 * This guarantees the spinner never produces an empty or unfillable result.
 */
export function validSpinPairs(
  players: Player[],
  openSlots: Position[],
  alreadyDraftedIds: Set<string>,
  positionRule: 'lenient' | 'strict',
): SpinPair[] {
  const seen = new Map<string, SpinPair>();
  for (const p of players) {
    if (alreadyDraftedIds.has(p.id)) continue;
    if (!isEligibleForSlots(p, openSlots, positionRule)) continue;
    const key = `${p.team}|${p.decade}`;
    if (!seen.has(key)) seen.set(key, { team: p.team, decade: p.decade });
  }
  return [...seen.values()];
}

export function listTeamsForDecade(players: Player[], decade: Decade): string[] {
  return [...new Set(players.filter((p) => p.decade === decade).map((p) => p.team))];
}

export function listDecadesForTeam(players: Player[], team: string): Decade[] {
  return [...new Set(players.filter((p) => p.team === team).map((p) => p.decade))];
}

export function playerById(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

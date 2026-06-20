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

/**
 * Like validSpinPairs, but only returns pairs that can currently offer at least
 * `target` distinct picks. If no pair meets `target`, it relaxes the requirement
 * one step at a time (target-1, target-2, ... 1) and returns the best tier that
 * still has pairs. This keeps the slot machine from landing on a team/era with
 * too few choices early, while degrading gracefully once slots fill up late.
 */
export function validSpinPairsWithChoices(
  players: Player[],
  openSlots: Position[],
  alreadyDraftedIds: Set<string>,
  positionRule: 'lenient' | 'strict',
  target: number,
): SpinPair[] {
  const counts = new Map<string, { pair: SpinPair; n: number }>();
  for (const p of players) {
    if (alreadyDraftedIds.has(p.id)) continue;
    if (!isEligibleForSlots(p, openSlots, positionRule)) continue;
    const key = `${p.team}|${p.decade}`;
    const entry = counts.get(key);
    if (entry) entry.n += 1;
    else counts.set(key, { pair: { team: p.team, decade: p.decade }, n: 1 });
  }
  const all = [...counts.values()];
  for (let min = Math.max(1, target); min >= 1; min--) {
    const tier = all.filter((e) => e.n >= min);
    if (tier.length) return tier.map((e) => e.pair);
  }
  return [];
}

/**
 * Choose the candidate pairs for a reroll that locks one axis. `lock` names the
 * axis that must stay fixed ('team' keeps the team and changes the decade; 'decade'
 * keeps the decade and changes the team). It prefers choice-rich pairs, then any
 * valid pair, and only abandons the lock if the locked value has no alternative
 * left at all. Keeping this pure makes the axis-lock behaviour unit-testable.
 */
export function rerollPool(
  rich: SpinPair[],
  any: SpinPair[],
  current: SpinPair,
  lock: 'team' | 'decade',
): SpinPair[] {
  const keep = (ps: SpinPair[]) =>
    lock === 'team'
      ? ps.filter((p) => p.team === current.team && p.decade !== current.decade)
      : ps.filter((p) => p.decade === current.decade && p.team !== current.team);
  const change = (ps: SpinPair[]) =>
    lock === 'team'
      ? ps.filter((p) => p.decade !== current.decade)
      : ps.filter((p) => p.team !== current.team);
  if (keep(rich).length) return keep(rich);
  if (keep(any).length) return keep(any);
  if (change(rich).length) return change(rich);
  return change(any);
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

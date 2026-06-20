// Core domain types. Type-only module (safe under Node --experimental-strip-types).

export type Decade =
  | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type Stat = 'PTS' | 'REB' | 'AST' | 'STL' | 'BLK';

export type StatLine = Record<Stat, number>;

export interface Player {
  id: string;
  name: string;
  team: string;
  decade: Decade;
  positions: Position[];
  stats: StatLine;
  estimated?: { STL?: boolean; BLK?: boolean };
}

/** A player committed to a specific lineup slot during a draft. */
export interface DraftedPlayer extends Player {
  slot: Position;
}

export interface Benchmarks {
  // per-decade "era-elite" reference values the engine divides by
  [decade: string]: StatLine;
}

export interface CategoryResult {
  total: number;       // summed era-adjusted output across the roster
  normalized: number;  // 0..1 vs the per-category ceiling
}

export interface SimResult {
  wins: number;
  losses: number;
  strength: number;                       // round(S * 1000), for display
  categories: Record<Stat, CategoryResult>;
  perPlayer: Array<{ playerId: string; adjusted: StatLine }>;
  perfect: boolean;
}

export const STATS: Stat[] = ['PTS', 'REB', 'AST', 'STL', 'BLK'];
export const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];
export const DECADES: Decade[] = [
  '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s',
];

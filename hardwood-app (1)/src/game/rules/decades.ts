import type { Decade, Position } from '../data/types';

// Decades available in the draft pool (1950s excluded, matching the format).
export const DECADES_IN_POOL: Decade[] = [
  '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s',
];

export const LINEUP_SLOTS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

// Pre-1974 seasons had no official STL/BLK; values for these decades may be estimated.
export const ESTIMATED_ERAS: Decade[] = ['1960s', '1970s'];

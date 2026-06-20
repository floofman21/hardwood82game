// Validates assets/data/players.json against the invariants in docs/03_DATA_MODEL.md.
// Run: node --experimental-strip-types scripts/build-data.ts   (exits non-zero on failure)

import { PLAYERS } from '../src/game/data/load';
import { BENCHMARKS } from '../src/game/rules/index';
import { validSpinPairs, eligiblePlayers } from '../src/game/data/selectors';
import { STATS, POSITIONS, DECADES } from '../src/game/data/types';
import { LINEUP_SLOTS, ESTIMATED_ERAS } from '../src/game/rules/decades';

const errors: string[] = [];
const warn: string[] = [];

// 1. unique ids
const ids = new Set<string>();
for (const p of PLAYERS) {
  if (ids.has(p.id)) errors.push(`Duplicate id: ${p.id}`);
  ids.add(p.id);
}

// 2. well-formed entries
for (const p of PLAYERS) {
  if (!p.name) errors.push(`Missing name: ${p.id}`);
  if (!DECADES.includes(p.decade)) errors.push(`Bad decade on ${p.id}: ${p.decade}`);
  if (!p.positions?.length) errors.push(`No positions: ${p.id}`);
  for (const pos of p.positions)
    if (!POSITIONS.includes(pos)) errors.push(`Bad position on ${p.id}: ${pos}`);
  for (const c of STATS) {
    const v = p.stats?.[c];
    if (typeof v !== 'number' || v < 0 || Number.isNaN(v))
      errors.push(`Bad ${c} on ${p.id}: ${v}`);
  }
  if (p.estimated && !ESTIMATED_ERAS.includes(p.decade))
    warn.push(`estimated flag on non-estimated era: ${p.id} (${p.decade})`);
}

// 3. benchmarks present for every decade
for (const d of DECADES)
  if (!BENCHMARKS[d]) errors.push(`Missing benchmark for decade ${d}`);

// 4. every offered (team, decade) is draftable at the start, with depth >= 2
const startPairs = validSpinPairs(PLAYERS, LINEUP_SLOTS, new Set(), 'lenient');
let thin = 0;
for (const pair of startPairs) {
  const n = eligiblePlayers(
    PLAYERS, pair.team, pair.decade, LINEUP_SLOTS, new Set(), 'lenient',
  ).length;
  if (n < 1) errors.push(`Unfillable pair: ${pair.team} ${pair.decade}`);
  if (n < 2) { thin++; warn.push(`Thin pair (<2 players): ${pair.team} ${pair.decade} = ${n}`); }
}

// report
console.log(`Players: ${PLAYERS.length}`);
console.log(`Valid (team, decade) spin pairs at start: ${startPairs.length}`);
console.log(`Pairs with <2 players: ${thin}`);
if (warn.length) console.log('\nWarnings:\n' + warn.map((w) => '  - ' + w).join('\n'));
if (errors.length) {
  console.error('\nERRORS:\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log('\nAll invariants passed.');

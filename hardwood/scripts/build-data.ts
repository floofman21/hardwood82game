// Validates assets/data/players.json against the invariants in docs/03_DATA_MODEL.md,
// including strict-position invariants: position coverage and no draftable dead-ends.
// Run: npm run build-data   (exits non-zero on failure)

import { PLAYERS } from '../src/game/data/load';
import { BENCHMARKS, POSITION_RULE } from '../src/game/rules/index';
import { validSpinPairs, eligiblePlayers } from '../src/game/data/selectors';
import { spin, mulberry32 } from '../src/game/spin/slotMachine';
import { STATS, POSITIONS, DECADES } from '../src/game/data/types';
import { LINEUP_SLOTS, ESTIMATED_ERAS } from '../src/game/rules/decades';
import type { Position } from '../src/game/data/types';

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
    if (typeof v !== 'number' || v < 0 || Number.isNaN(v)) errors.push(`Bad ${c} on ${p.id}: ${v}`);
  }
  if (p.estimated && !ESTIMATED_ERAS.includes(p.decade))
    warn.push(`estimated flag on non-estimated era: ${p.id} (${p.decade})`);
}

// 3. benchmarks present for every decade
for (const d of DECADES) if (!BENCHMARKS[d]) errors.push(`Missing benchmark for decade ${d}`);

// 4. position coverage (strict mode needs a healthy supply at every slot)
const posCount: Record<Position, number> = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 };
for (const p of PLAYERS) for (const s of p.positions) posCount[s]++;
const MIN_PER_POSITION = 15;
for (const s of LINEUP_SLOTS)
  if (posCount[s] < MIN_PER_POSITION)
    errors.push(`Thin position pool ${s}: ${posCount[s]} (< ${MIN_PER_POSITION})`);

// 5. every offered (team, decade) is draftable at the start
const startPairs = validSpinPairs(PLAYERS, LINEUP_SLOTS, new Set(), POSITION_RULE);
for (const pair of startPairs) {
  const n = eligiblePlayers(PLAYERS, pair.team, pair.decade, LINEUP_SLOTS, new Set(), POSITION_RULE).length;
  if (n < 1) errors.push(`Unfillable pair: ${pair.team} ${pair.decade}`);
}

// 6. NO DEAD-ENDS: simulate many strict drafts; every one must fill 5 distinct slots
const TRIALS = 5000;
const rng = mulberry32(99);
let deadEnds = 0;
for (let i = 0; i < TRIALS; i++) {
  const taken = new Set<string>();
  let open: Position[] = [...LINEUP_SLOTS];
  let ok = true;
  for (let r = 0; r < LINEUP_SLOTS.length; r++) {
    const pairs = validSpinPairs(PLAYERS, open, taken, POSITION_RULE);
    if (pairs.length === 0) { ok = false; break; }
    const pair = spin(pairs, rng);
    const choices = eligiblePlayers(PLAYERS, pair.team, pair.decade, open, taken, POSITION_RULE);
    if (choices.length === 0) { ok = false; break; }
    const pick = choices[Math.floor(rng() * choices.length)];
    taken.add(pick.id);
    const valid = POSITION_RULE === 'strict' ? open.filter((s) => pick.positions.includes(s)) : open;
    const slot = valid[Math.floor(rng() * valid.length)];
    open = open.filter((s) => s !== slot);
  }
  if (!ok || taken.size !== LINEUP_SLOTS.length) deadEnds++;
}
if (deadEnds > 0) errors.push(`Dead-ends in ${deadEnds}/${TRIALS} strict drafts`);

// report
console.log(`Players: ${PLAYERS.length}`);
console.log(`Position rule: ${POSITION_RULE}`);
console.log(`Position pool: ${LINEUP_SLOTS.map((s) => `${s}=${posCount[s]}`).join('  ')}`);
console.log(`Valid (team, decade) spin pairs at start: ${startPairs.length}`);
console.log(`Dead-ends over ${TRIALS} strict drafts: ${deadEnds}`);
if (warn.length) console.log('\nWarnings:\n' + warn.map((w) => '  - ' + w).join('\n'));
if (errors.length) {
  console.error('\nERRORS:\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log('\nAll invariants passed.');

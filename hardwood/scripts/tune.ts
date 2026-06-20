// Plays N random *valid, position-legal* drafts through the engine and prints the
// win distribution, so balance constants can be tuned by data instead of vibes.
// Run: npm run tune [N]

import { PLAYERS } from '../src/game/data/load';
import { RULES, POSITION_RULE, MIN_CHOICES } from '../src/game/rules/index';
import { LINEUP_SLOTS } from '../src/game/rules/decades';
import { validSpinPairsWithChoices, eligiblePlayers } from '../src/game/data/selectors';
import { spin, mulberry32 } from '../src/game/spin/slotMachine';
import { simulate } from '../src/game/engine/index';
import type { Player, Position } from '../src/game/data/types';

const N = Number(process.argv[2] ?? 5000);
const rng = mulberry32(1234);

function randomDraft(): Player[] {
  const drafted: Player[] = [];
  const taken = new Set<string>();
  let open: Position[] = [...LINEUP_SLOTS];
  for (let round = 0; round < LINEUP_SLOTS.length; round++) {
    const pairs = validSpinPairsWithChoices(PLAYERS, open, taken, POSITION_RULE, MIN_CHOICES);
    const pair = spin(pairs, rng);
    const choices = eligiblePlayers(PLAYERS, pair.team, pair.decade, open, taken, POSITION_RULE);
    const pick = choices[Math.floor(rng() * choices.length)];
    drafted.push(pick);
    taken.add(pick.id);
    // assign to a random VALID open slot for this player (strict-aware)
    const validSlots =
      POSITION_RULE === 'strict' ? open.filter((s) => pick.positions.includes(s)) : open;
    const slot = validSlots[Math.floor(rng() * validSlots.length)];
    open = open.filter((s) => s !== slot);
  }
  return drafted;
}

const wins: number[] = [];
let perfects = 0;
for (let i = 0; i < N; i++) {
  const r = simulate(randomDraft(), RULES);
  wins.push(r.wins);
  if (r.perfect) perfects++;
}

wins.sort((a, b) => a - b);
const q = (p: number) => wins[Math.floor(p * (wins.length - 1))];
const mean = wins.reduce((a, b) => a + b, 0) / wins.length;

console.log(`Simulated ${N} random ${POSITION_RULE} rosters\n`);
console.log(`min   : ${wins[0]}`);
console.log(`p10   : ${q(0.1)}`);
console.log(`median: ${q(0.5)}`);
console.log(`mean  : ${mean.toFixed(1)}`);
console.log(`p90   : ${q(0.9)}`);
console.log(`p99   : ${q(0.99)}`);
console.log(`max   : ${wins[wins.length - 1]}`);
console.log(`82-0  : ${perfects} (${((perfects / N) * 100).toFixed(2)}%)`);

console.log('\nDistribution:');
const buckets: Record<string, number> = {};
for (const w of wins) {
  const lo = Math.floor(w / 5) * 5;
  buckets[`${lo}-${lo + 4}`] = (buckets[`${lo}-${lo + 4}`] ?? 0) + 1;
}
for (const key of Object.keys(buckets).sort((a, b) => parseInt(a) - parseInt(b))) {
  const n = buckets[key];
  console.log(`${key.padStart(7)} | ${'█'.repeat(Math.round((n / N) * 80))} ${n}`);
}

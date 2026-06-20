// Finds the maximum-strength *legal* lineup the dataset allows (one player per
// PG/SG/SF/PF/C, each in a position they actually play), via hill-climb from many
// random starts. Use to confirm 82-0 stays reachable after dataset/scoring edits.
// Run: npm run calibrate

import { PLAYERS } from '../src/game/data/load';
import { RULES } from '../src/game/rules/index';
import { simulate } from '../src/game/engine/index';
import { LINEUP_SLOTS } from '../src/game/rules/decades';
import type { Player, Position } from '../src/game/data/types';

const byPos: Record<Position, Player[]> = { PG: [], SG: [], SF: [], PF: [], C: [] };
for (const p of PLAYERS) for (const s of p.positions) byPos[s].push(p);

function strengthOf(lineup: Record<Position, Player>): number {
  return simulate(LINEUP_SLOTS.map((s) => lineup[s]), RULES).strength;
}

function climb(): Record<Position, Player> {
  const used = new Set<string>();
  const lineup = {} as Record<Position, Player>;
  for (const s of LINEUP_SLOTS) {
    const pool = byPos[s].filter((p) => !used.has(p.id));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lineup[s] = pick;
    used.add(pick.id);
  }
  let improved = true;
  while (improved) {
    improved = false;
    for (const s of LINEUP_SLOTS) {
      const others = new Set(LINEUP_SLOTS.filter((x) => x !== s).map((x) => lineup[x].id));
      let best = strengthOf(lineup);
      let bestP = lineup[s];
      for (const cand of byPos[s]) {
        if (others.has(cand.id)) continue;
        const trial = { ...lineup, [s]: cand };
        const v = strengthOf(trial);
        if (v > best) { best = v; bestP = cand; improved = true; }
      }
      lineup[s] = bestP;
    }
  }
  return lineup;
}

let best: Record<Position, Player> | null = null;
let bestS = -1;
for (let k = 0; k < 600; k++) {
  const l = climb();
  const s = strengthOf(l);
  if (s > bestS) { bestS = s; best = l; }
}
const r = simulate(LINEUP_SLOTS.map((s) => best![s]), RULES);
console.log('MAX-strength legal lineup:');
for (const s of LINEUP_SLOTS) console.log(`  ${s}: ${best![s].name} (${best![s].team} ${best![s].decade})`);
console.log(`\nrecord: ${r.wins}-${r.losses} | strength ${r.strength} (S=${r.strength / 1000}) | perfect: ${r.perfect}`);
console.log('normalized:', Object.fromEntries(Object.entries(r.categories).map(([k, v]) => [k, +v.normalized.toFixed(3)])));

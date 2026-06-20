import { PLAYERS } from '../src/game/data/load';
import { RULES } from '../src/game/rules/index';
import { simulate } from '../src/game/engine/index';
import type { Player } from '../src/game/data/types';

// Finds the maximum-strength roster the dataset allows (hill-climb from many
// random starts). Use to confirm 82-0 stays reachable after dataset/scoring edits.
// Run: npm run calibrate
function strengthOf(roster: Player[]): number { return simulate(roster, RULES).strength; }
let best: Player[] = [], bestS = -1;
for (let start = 0; start < 600; start++) {
  const used = new Set<string>(); const cur: Player[] = [];
  while (cur.length < 5) { const p = PLAYERS[Math.floor(Math.random()*PLAYERS.length)]; if(!used.has(p.id)){cur.push(p);used.add(p.id);} }
  let improved = true;
  while (improved) { improved = false;
    for (let i=0;i<5;i++){ let bs=strengthOf(cur), bp=cur[i];
      for (const c of PLAYERS){ if(cur.some((x,j)=>j!==i&&x.id===c.id))continue;
        const t=cur.slice(); t[i]=c; const s=strengthOf(t); if(s>bs){bs=s;bp=c;improved=true;} }
      cur[i]=bp; } }
  const s=strengthOf(cur); if(s>bestS){bestS=s;best=cur.slice();}
}
const r = simulate(best, RULES);
console.log('MAX-strength roster:', best.map(p=>p.name).join(', '));
console.log('record:', r.wins+'-'+r.losses, '| strength', r.strength, '(S='+(r.strength/1000)+') | perfect:', r.perfect);
console.log('normalized:', Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,+v.normalized.toFixed(3)])));

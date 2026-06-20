import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate, eraAdjust, projectWins } from '../src/game/engine/index';
import { RULES } from '../src/game/rules/index';
import { PLAYERS } from '../src/game/data/load';
import {
  validSpinPairs,
  validSpinPairsWithChoices,
  eligiblePlayers,
  isEligibleForSlots,
} from '../src/game/data/selectors';
import { LINEUP_SLOTS } from '../src/game/rules/decades';
import type { Player } from '../src/game/data/types';
import { POSITIONS } from '../src/game/data/types';

const byId = (id: string): Player => {
  const p = PLAYERS.find((x) => x.id === id);
  if (!p) throw new Error('missing fixture ' + id);
  return p;
};

test('era adjustment puts different eras on a comparable scale', () => {
  // Bill Russell 1960s rebounding vs a modern era-elite rebounder
  const russell = eraAdjust(byId('bill-russell-celtics-1960s'), RULES.benchmarks, RULES.ADJ_CLAMP);
  const jokic = eraAdjust(byId('nikola-jokic-nuggets-2020s'), RULES.benchmarks, RULES.ADJ_CLAMP);
  // both are strong rebounders for their era -> adjusted REB within a reasonable band
  assert.ok(russell.REB > 0.8 && russell.REB <= RULES.ADJ_CLAMP);
  assert.ok(jokic.REB > 0.8 && jokic.REB <= RULES.ADJ_CLAMP);
});

test('a single stat is clamped', () => {
  const adj = eraAdjust({ decade: '1960s', stats: { PTS: 999, REB: 0, AST: 0, STL: 0, BLK: 0 } }, RULES.benchmarks, RULES.ADJ_CLAMP);
  assert.equal(adj.PTS, RULES.ADJ_CLAMP);
});

test('imbalance is punished: a one-category team scores far below a balanced one of equal mean', () => {
  // Lopsided: huge PTS, near-zero elsewhere
  const lopsided = [
    byId('michael-jordan-bulls-1980s'),
    byId('wilt-chamberlain-warriors-1960s'),
    byId('james-harden-rockets-2010s'),
    byId('kobe-bryant-lakers-2000s'),
    byId('luka-doncic-mavericks-2020s'),
  ];
  const balanced = [
    byId('wilt-chamberlain-warriors-1960s'),
    byId('kareem-abdul-jabbar-bucks-1970s'),
    byId('hakeem-olajuwon-rockets-1990s'),
    byId('oscar-robertson-royals-1960s'),
    byId('nikola-jokic-nuggets-2020s'),
  ];
  const a = simulate(lopsided, RULES);
  const b = simulate(balanced, RULES);
  // Compare strength, not wins: the win curve saturates near the top, so two
  // elite lineups can tie at 82 even though the imbalance penalty separates them.
  assert.ok(b.strength > a.strength, `balanced (${b.strength}) should beat lopsided (${a.strength})`);
});

test('monotonicity: improving one category never reduces wins', () => {
  const base = [
    byId('john-stockton-jazz-1990s'),
    byId('robert-parish-celtics-1980s'),
    byId('serge-ibaka-thunder-2010s'),
    byId('shawn-marion-suns-2000s'),
    byId('aaron-gordon-nuggets-2020s'),
  ];
  const baseRes = simulate(base, RULES);
  const better = base.map((p) => ({ ...p, stats: { ...p.stats, STL: p.stats.STL + 0.5 } }));
  const betterRes = simulate(better, RULES);
  assert.ok(betterRes.wins >= baseRes.wins);
});

test('82 is gated behind S_PERFECT', () => {
  // a sub-threshold strength must not yield 82
  const wins = projectWins(RULES.S_PERFECT - 0.01, RULES);
  assert.ok(wins < 82);
});

test('determinism: same roster yields identical result', () => {
  const roster = [
    byId('stephen-curry-warriors-2010s'),
    byId('larry-bird-celtics-1980s'),
    byId('tim-duncan-spurs-2000s'),
    byId('giannis-antetokounmpo-bucks-2020s'),
    byId('bill-russell-celtics-1960s'),
  ];
  assert.deepEqual(simulate(roster, RULES), simulate(roster, RULES));
});

test('selectors: spinner only offers fillable pairs and eligible players exist', () => {
  const pairs = validSpinPairs(PLAYERS, LINEUP_SLOTS, new Set(), 'lenient');
  assert.ok(pairs.length > 0);
  for (const pair of pairs) {
    const elig = eligiblePlayers(PLAYERS, pair.team, pair.decade, LINEUP_SLOTS, new Set(), 'lenient');
    assert.ok(elig.length >= 1, `${pair.team} ${pair.decade} had no eligible players`);
  }
});

test('selectors: drafted players are excluded from later eligibility', () => {
  const taken = new Set([PLAYERS[0].id]);
  const elig = eligiblePlayers(PLAYERS, PLAYERS[0].team, PLAYERS[0].decade, LINEUP_SLOTS, taken, 'lenient');
  assert.ok(!elig.some((p) => p.id === PLAYERS[0].id));
});

// --- strict position enforcement (selector level) ---

test('strict: a player is ineligible for a slot they do not play', () => {
  const mitchell = byId('donovan-mitchell-cavaliers-2020s'); // SG only
  assert.equal(isEligibleForSlots(mitchell, ['C'], 'strict'), false);
  assert.equal(isEligibleForSlots(mitchell, ['SG'], 'strict'), true);
  assert.equal(isEligibleForSlots(mitchell, ['PF', 'SG'], 'strict'), true);
});

test('lenient: any player can fill any open slot', () => {
  const mitchell = byId('donovan-mitchell-cavaliers-2020s'); // SG only
  assert.equal(isEligibleForSlots(mitchell, ['C'], 'lenient'), true);
});

test('strict: eligiblePlayers for a single open slot only returns players who play it', () => {
  // when only C is open, every eligible player across the pool must list C
  for (const slot of POSITIONS) {
    const elig = PLAYERS.flatMap((p) =>
      eligiblePlayers(PLAYERS, p.team, p.decade, [slot], new Set(), 'strict'),
    );
    assert.ok(elig.length > 0, `no eligible players for open slot ${slot}`);
    for (const p of elig) assert.ok(p.positions.includes(slot));
  }
});

test('strict: spinner never offers a pair that cannot fill the open slot', () => {
  for (const slot of POSITIONS) {
    const pairs = validSpinPairs(PLAYERS, [slot], new Set(), 'strict');
    assert.ok(pairs.length > 0, `no spin pairs for open slot ${slot}`);
    for (const pair of pairs) {
      const elig = eligiblePlayers(PLAYERS, pair.team, pair.decade, [slot], new Set(), 'strict');
      assert.ok(elig.length >= 1);
    }
  }
});

// --- min-choices spinner guard ---

test('guard: at the first pick every offered pair has >= 4 choices', () => {
  const pairs = validSpinPairsWithChoices(PLAYERS, LINEUP_SLOTS, new Set(), 'strict', 4);
  assert.ok(pairs.length > 0);
  for (const pair of pairs) {
    const n = eligiblePlayers(PLAYERS, pair.team, pair.decade, LINEUP_SLOTS, new Set(), 'strict').length;
    assert.ok(n >= 4, `${pair.team} ${pair.decade} offered with only ${n} choices`);
  }
});

test('guard: relaxes gracefully when no pair can meet the target', () => {
  // A single open, hard-to-fill slot late in a draft: the guard must still
  // return at least one pair rather than nothing (falls back below the target).
  const pairs = validSpinPairsWithChoices(PLAYERS, ['C'], new Set(), 'strict', 4);
  assert.ok(pairs.length > 0);
  // and it never returns a pair with zero eligible players
  for (const pair of pairs) {
    const n = eligiblePlayers(PLAYERS, pair.team, pair.decade, ['C'], new Set(), 'strict').length;
    assert.ok(n >= 1);
  }
});

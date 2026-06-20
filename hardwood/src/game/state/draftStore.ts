import { create } from 'zustand';
import type { Player, DraftedPlayer, Position, SimResult } from '../data/types';
import { PLAYERS } from '../data/load';
import { RULES, POSITION_RULE } from '../rules/index';
import { SKIPS, MIN_CHOICES } from '../rules/index';
import { LINEUP_SLOTS } from '../rules/decades';
import {
  validSpinPairsWithChoices,
  eligiblePlayers,
  type SpinPair,
} from '../data/selectors';
import { spin as spinPairs, mulberry32 } from '../spin/slotMachine';
import { simulate } from '../engine/index';

export type GameMode = 'classic' | 'hoopiq';
export type DraftStatus = 'idle' | 'spinning' | 'picking' | 'assigning' | 'complete';

interface DraftState {
  mode: GameMode;
  status: DraftStatus;
  currentSpin: SpinPair | null;
  choices: Player[];
  pendingPlayer: Player | null;
  roster: Record<Position, DraftedPlayer | null>;
  taken: string[];
  skips: { team: number; decade: number };
  result: SimResult | null;

  // derived helpers
  openSlots: () => Position[];
  assignableSlots: (player: Player) => Position[];
  filledCount: () => number;

  // actions
  startGame: (mode: GameMode, seed?: number) => void;
  spin: () => void;
  useTeamSkip: () => void;
  useDecadeSkip: () => void;
  selectPlayer: (player: Player) => void;
  assignSlot: (slot: Position) => void;
  completeGame: () => void;
  reset: () => void;
}

const emptyRoster = (): Record<Position, DraftedPlayer | null> => ({
  PG: null, SG: null, SF: null, PF: null, C: null,
});

// RNG lives outside serializable state (we never persist mid-draft).
let rng: () => number = Math.random;

export const useDraftStore = create<DraftState>((set, get) => ({
  mode: 'classic',
  status: 'idle',
  currentSpin: null,
  choices: [],
  pendingPlayer: null,
  roster: emptyRoster(),
  taken: [],
  skips: { team: SKIPS.team, decade: SKIPS.decade },
  result: null,

  openSlots: () => LINEUP_SLOTS.filter((p) => get().roster[p] === null),

  assignableSlots: (player) => {
    const open = get().openSlots();
    if (POSITION_RULE === 'lenient') return open;
    return open.filter((slot) => player.positions.includes(slot));
  },

  filledCount: () => LINEUP_SLOTS.filter((p) => get().roster[p] !== null).length,

  startGame: (mode, seed) => {
    rng = seed != null ? mulberry32(seed) : Math.random;
    set({
      mode,
      status: 'spinning',
      currentSpin: null,
      choices: [],
      pendingPlayer: null,
      roster: emptyRoster(),
      taken: [],
      skips: { team: SKIPS.team, decade: SKIPS.decade },
      result: null,
    });
    get().spin();
  },

  spin: () => {
    const { roster } = get();
    const open = LINEUP_SLOTS.filter((p) => roster[p] === null);
    if (open.length === 0) {
      get().completeGame();
      return;
    }
    const taken = new Set(get().taken);
    const pairs = validSpinPairsWithChoices(PLAYERS, open, taken, POSITION_RULE, MIN_CHOICES);
    const pair = spinPairs(pairs, rng);
    const choices = eligiblePlayers(PLAYERS, pair.team, pair.decade, open, taken, POSITION_RULE);
    set({ currentSpin: pair, choices, status: 'picking', pendingPlayer: null });
  },

  useTeamSkip: () => {
    const { skips, currentSpin } = get();
    if (skips.team <= 0 || !currentSpin) return;
    const open = get().openSlots();
    const taken = new Set(get().taken);
    const pairs = validSpinPairsWithChoices(PLAYERS, open, taken, POSITION_RULE, MIN_CHOICES);
    // Reroll the TEAM only: keep the same decade, swap to a different team.
    // Fall back gracefully if that decade has no other valid team.
    const sameDecade = pairs.filter(
      (p) => p.decade === currentSpin.decade && p.team !== currentSpin.team,
    );
    const otherTeam = pairs.filter((p) => p.team !== currentSpin.team);
    const pool = sameDecade.length ? sameDecade : otherTeam.length ? otherTeam : pairs;
    const pair = spinPairs(pool, rng);
    const choices = eligiblePlayers(PLAYERS, pair.team, pair.decade, open, taken, POSITION_RULE);
    set({
      currentSpin: pair,
      choices,
      status: 'picking',
      pendingPlayer: null,
      skips: { ...skips, team: skips.team - 1 },
    });
  },

  useDecadeSkip: () => {
    const { skips, currentSpin } = get();
    if (skips.decade <= 0 || !currentSpin) return;
    const open = get().openSlots();
    const taken = new Set(get().taken);
    const pairs = validSpinPairsWithChoices(PLAYERS, open, taken, POSITION_RULE, MIN_CHOICES);
    // Reroll the DECADE only: keep the same team, swap to a different decade.
    // Fall back gracefully if that team has no other valid decade.
    const sameTeam = pairs.filter(
      (p) => p.team === currentSpin.team && p.decade !== currentSpin.decade,
    );
    const otherDecade = pairs.filter((p) => p.decade !== currentSpin.decade);
    const pool = sameTeam.length ? sameTeam : otherDecade.length ? otherDecade : pairs;
    const pair = spinPairs(pool, rng);
    const choices = eligiblePlayers(PLAYERS, pair.team, pair.decade, open, taken, POSITION_RULE);
    set({
      currentSpin: pair,
      choices,
      status: 'picking',
      pendingPlayer: null,
      skips: { ...skips, decade: skips.decade - 1 },
    });
  },

  selectPlayer: (player) => {
    const slots = get().assignableSlots(player);
    if (slots.length === 1) {
      // only one legal slot -> assign immediately
      set({ pendingPlayer: player });
      get().assignSlot(slots[0]);
      return;
    }
    set({ pendingPlayer: player, status: 'assigning' });
  },

  assignSlot: (slot) => {
    const { pendingPlayer, roster, taken } = get();
    if (!pendingPlayer) return;
    if (roster[slot] !== null) return;
    // Enforce the position rule at the store, not just the UI.
    if (!get().assignableSlots(pendingPlayer).includes(slot)) return;
    const drafted: DraftedPlayer = { ...pendingPlayer, slot };
    const nextRoster = { ...roster, [slot]: drafted };
    const nextTaken = [...taken, pendingPlayer.id];
    const stillOpen = LINEUP_SLOTS.some((p) => nextRoster[p] === null);
    set({
      roster: nextRoster,
      taken: nextTaken,
      pendingPlayer: null,
      status: stillOpen ? 'spinning' : 'complete',
    });
    if (!stillOpen) get().completeGame();
  },

  completeGame: () => {
    const { roster } = get();
    const lineup = LINEUP_SLOTS.map((p) => roster[p]).filter(
      (p): p is DraftedPlayer => p !== null,
    );
    if (lineup.length < LINEUP_SLOTS.length) return;
    const result = simulate(lineup, RULES);
    set({ result, status: 'complete' });
  },

  reset: () => {
    rng = Math.random;
    set({
      status: 'idle',
      currentSpin: null,
      choices: [],
      pendingPlayer: null,
      roster: emptyRoster(),
      taken: [],
      skips: { team: SKIPS.team, decade: SKIPS.decade },
      result: null,
    });
  },
}));

import { create } from 'zustand';
import { storage, KEYS } from '../../storage/index';
import type { GameSummary } from '../../services/social';

export interface Settings {
  haptics: boolean;
}

interface MetaState {
  history: GameSummary[];
  settings: Settings;
  best: GameSummary | null;
  hydrate: () => void;
  recordGame: (summary: GameSummary) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  clearHistory: () => void;
}

const defaultSettings: Settings = { haptics: true };

function computeBest(history: GameSummary[]): GameSummary | null {
  return history.reduce<GameSummary | null>(
    (best, g) => (best === null || g.wins > best.wins ? g : best),
    null,
  );
}

export const useMetaStore = create<MetaState>((set, get) => ({
  history: [],
  settings: defaultSettings,
  best: null,

  hydrate: () => {
    const history = storage.getJSON<GameSummary[]>(KEYS.history, []);
    const settings = storage.getJSON<Settings>(KEYS.meta, defaultSettings);
    set({ history, settings, best: computeBest(history) });
  },

  recordGame: (summary) => {
    const history = [summary, ...get().history].slice(0, 100);
    storage.setJSON(KEYS.history, history);
    set({ history, best: computeBest(history) });
  },

  setSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value };
    storage.setJSON(KEYS.meta, settings);
    set({ settings });
  },

  clearHistory: () => {
    storage.remove(KEYS.history);
    set({ history: [], best: null });
  },
}));

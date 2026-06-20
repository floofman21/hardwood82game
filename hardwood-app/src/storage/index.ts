import { MMKV } from 'react-native-mmkv';

// MMKV is synchronous and fast. If the native module isn't present (e.g. running
// in a bare JS context), fall back to an in-memory map so the app never crashes.
let store: {
  set: (k: string, v: string) => void;
  getString: (k: string) => string | undefined;
  delete: (k: string) => void;
  clearAll: () => void;
};

try {
  store = new MMKV({ id: 'hardwood' });
} catch {
  const mem = new Map<string, string>();
  store = {
    set: (k, v) => void mem.set(k, v),
    getString: (k) => mem.get(k),
    delete: (k) => void mem.delete(k),
    clearAll: () => mem.clear(),
  };
}

export const storage = {
  getJSON<T>(key: string, fallback: T): T {
    const raw = store.getString(key);
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON(key: string, value: unknown): void {
    store.set(key, JSON.stringify(value));
  },
  remove(key: string): void {
    store.delete(key);
  },
  clear(): void {
    store.clearAll();
  },
};

export const KEYS = {
  meta: 'meta:v1',
  history: 'history:v1',
} as const;

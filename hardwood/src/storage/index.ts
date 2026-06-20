// MMKV is synchronous and fast, but its native module is NOT bundled in Expo Go.
// We lazily require it inside try/catch and fall back to an in-memory store, so the
// app runs everywhere:
//   - Expo Go:             in-memory (history won't persist across reloads)
//   - dev / release build: real MMKV persistence
type KVStore = {
  set: (k: string, v: string) => void;
  getString: (k: string) => string | undefined;
  delete: (k: string) => void;
  clearAll: () => void;
};

let store: KVStore;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv');
  store = new MMKV({ id: 'hardwood' }) as KVStore;
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

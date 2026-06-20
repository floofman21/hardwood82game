# Hardwood

An all-time NBA roster drafting game for mobile. Spin a team + decade, draft five
players to fill PG/SG/SF/PF/C, and a deterministic, era-adjusted engine projects
your season. A flawless **82–0** is reachable but rare — it takes a roster with no
weak category (steals are usually the wall).

Built with **Expo + React Native + TypeScript**, Zustand for state, MMKV for
persistence. Offline-first, no backend in v1.

> Independent project. Player names and stats are factual historical data. Not
> affiliated with or endorsed by the NBA; no logos, photos, or trademarks are used.

---

## Run it

```bash
npm install
npx expo start          # press i (iOS), a (Android), or scan the QR in Expo Go
```

If Expo reports version mismatches for your installed SDK, let it align them:

```bash
npx expo install --fix
```

## Project layout

```
src/
  app/                 # expo-router screens (index, draft, results, history, how-to-play, settings)
  components/          # SlotMachine, PlayerCard, RosterStrip, StatBars, SkipButtons, Avatar, ScreenHeader
  game/
    data/              # types, dataset loader, selectors
    rules/             # ALL tunable constants live here (scoring, win curve, draft rules)
    engine/            # pure simulate(): roster -> SimResult (era-adjust -> normalize -> strength -> wins)
    spin/              # seedable slot-machine RNG
    state/             # zustand draftStore + metaStore
  services/            # SocialService interface + local stub (real backend = later phase)
  storage/             # MMKV wrapper with in-memory fallback
  theme/               # design tokens
assets/data/           # players.json (116), benchmarks.json, meta.json
scripts/               # build-data (validate), tune (win distribution), calibrate (find optimal roster)
__tests__/             # engine + selector unit tests
```

## Engine scripts

```bash
npm run build-data     # validate dataset invariants (unique ids, fillable pairs, benchmarks)
npm run tune 8000      # simulate N random drafts and print the win distribution
npm run calibrate      # hill-climb the max-strength roster (confirms 82-0 stays reachable)
npm test               # engine + selector unit tests
```

The scripts run on Node via `tsx`. They were used to calibrate scoring so that:
random rosters land around a **median ~44** wins, the best balanced lineup reaches
**82–0**, and 82–0 effectively never happens by luck.

## Tuning the game

Everything balance-related is in `src/game/rules/index.ts` — per-category ceilings,
the imbalance penalty (`ALPHA`), and the win curve (`WIN_FLOOR`, `WIN_GAIN`,
`CURVE_P`, `S_PERFECT`). Change a number, run `npm run tune` and `npm run calibrate`,
and watch the distribution shift. No magic numbers live in the engine itself.

## Heads-up before release

- **Stats are approximate peak-season lines** and 1960s/early-70s steals & blocks
  are estimated (flagged in `meta.json`). Verify against a reference before shipping.
- **Persistence in Expo Go** is in-memory only (MMKV's native module isn't in Expo Go), so history resets on reload. A dev/release build gives real persistence.
- **Branding** ("Hardwood", amber `#F4A23B`) is a placeholder — swap in `src/theme/tokens.ts`.
- **Social** (feed/leaderboard/challenges) is stubbed behind `SocialService`; wire a
  backend there when ready.
- Custom fonts (Fraunces/Inter) aren't loaded yet — system fonts are used for now.

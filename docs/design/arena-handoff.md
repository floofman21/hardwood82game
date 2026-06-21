# Handoff: HoopLore — "Arena" Visual Redesign (Direction B)

## Overview
HoopLore is an all-time NBA roster-drafting game (Expo + React Native + TypeScript,
Zustand, MMKV). The player spins a **team + era**, drafts five players into
**PG / SG / SF / PF / C**, and a deterministic engine projects the season — chasing a
perfect **82–0**. This handoff covers a full visual redesign ("Arena" direction) of
three core screens — **Home, Draft, Results** — including both the perfect-season and
the fell-short Results states.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype
showing the intended look, layout, and content. They are **not production code to copy
directly**. The task is to **recreate these designs in the existing HoopLore React
Native codebase**, using its established components (`SlotMachine`, `PlayerCard`,
`RosterStrip`, `StatBars`, `SkipButtons`, `Avatar`, `ScreenHeader`), its
`expo-router` screens (`index`, `draft`, `results`), its Zustand stores
(`draftStore`, `metaStore`), and its theme tokens (`src/theme/tokens.ts`). Translate
the HTML/CSS into React Native `StyleSheet` equivalents (flex layout maps directly;
`box-shadow` → `shadow*`/`elevation`; CSS gradients → `expo-linear-gradient`).

## ⚠️ Preserve the existing per-team color schemes
This is a top priority from the product owner. The codebase already defines **team
color palettes** (in `src/theme/tokens.ts` and/or `assets/data/*.json`). Those remain
the **source of truth** for anything team-specific:

- The new brand palette below (**amber `#F4A23B`, blue `#5B9DF0`, green `#3FC98A`,
  red `#E2603F`**) is reserved for **app-level semantics only**:
  amber = primary action / highlight, blue = secondary & data, green = win /
  perfect season, red = danger / weakest category.
- **Do not** overwrite, hardcode, or replace any team's colors with brand amber.
- Where the mock shows amber on the **selected team/era** in the spin reel or on a
  filled **roster slot**, you *may* tint those with the drawn team's primary color
  pulled from the existing team palette (falling back to amber when none exists). The
  rest of the chrome stays on the brand palette.
- Net effect: the global look becomes "Arena," while each team still reads in its own
  colors wherever team identity is shown.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and component structure.
Recreate pixel-accurately with the codebase's libraries. Exact values are in
**Design Tokens** below. Frames are designed at **390 × 844 pt** (iPhone logical
points); the device bezel/Dynamic Island in the mock is presentation chrome — ignore
it and build to the safe-area content.

---

## Screens / Views

### 0. Splash / Loading (animated)
**Purpose:** First frame on app open while the engine/dataset initialize.

**Layout:** Full-bleed `#0B0D12`. A soft amber radial glow (`rgba(244,162,59,.11)`,
~400px) sits behind center. Vertically centered: a `.34em`-tracked eyebrow
"DRAFT THE ALL-TIME TEAM" (`#565E6E`, 11px Barlow 800) above the **HOOPLORE wordmark**
(same basketball + hoop construction as Home, here at 60px). Pinned ~92px from bottom:
three amber `#F4A23B` pulsing dots (8px) above a "LOADING SEASON" micro-label
(`#3a4150`, 10px, .3em).

**Signature animation — the dunk (loops, ~2.8s):** the **basketball O** leaves its
slot in the word, arcs up-right toward the hoop, **drops through the rim/net**,
reaches a low point, then **bounces back up and settles into its original O position**
(with a small squash on landing and a full 360° spin across the trip). The net does a
subtle swish as the ball passes. While the ball is away, the word reads "HO_P LORE";
it's whole again at rest. Keyframe timing used in the prototype (`ballDunk`):
`0–9%` hold at origin · `26%` up-right arc `translate(26,-22) rot85` · `42%` enter rim
`translate(50,2) rot175 scale.92` · `54–62%` through net to low point
`translate(50,42) rot290 scale.78` · `74%` rebound arc `translate(28,-18) rot338` ·
`86%` land squash `translate(2,7) scaleY.8 scaleX1.14` · `93%` micro-rebound ·
`100%` home `translate(0,0) rot360`. Dots: staggered `dotPulse` (opacity .22→1,
-4px, 0/.18s/.36s delays). **Through-the-hoop occlusion:** the rim is drawn as **two
layers** — a back/far arc (+ net) *behind* the ball and a near/front arc *in front* of
it, with the ball z-between — so the rim visibly covers the ball as it drops through
(rather than floating over the hoop). Front rim full amber `#F4A23B`, back rim a darker
`#C9821F` for depth.

**RN implementation:** use `expo-splash-screen` for the OS-level static splash
(`app.json` already sets splash bg `#0E0F12`), then keep this *animated* logo as an
in-app loading component shown until ready. Drive the ball with `react-native-reanimated`
(a single `withRepeat(withSequence(...))` on a transform translate/rotate/scale) or a
Lottie export. Honor the `reduce motion` accessibility setting by falling back to the
static logo. Reuse the basketball/hoop SVG glyphs (see Assets).

### 1. Home (`src/app/index.tsx`)
**Purpose:** Brand moment, show personal best, pick mode, start a draft.

**Layout:** Single column, screen side padding **26**. Vertical rhythm top→bottom:
brand block → Personal Best card → Mode toggle → (spacer `margin-top:auto`) → Start
button → text links row.

**Components:**
- **Eyebrow pill** "ALL-TIME DRAFT": Barlow 800, 11px, letter-spacing .16em, uppercase,
  color `#0B0D12` on amber `#F4A23B` background, padding 5×9, radius 5.
- **Wordmark "HOOPLORE":** Barlow Condensed 800, 54px, uppercase, letter-spacing
  -.012em. Letters `#EEF1F6`; the suffix **"lore" is amber `#F4A23B`**. The two O's of
  "HOOP" are replaced by **two icons**: (1) a **basketball** — amber `#F4A23B` filled
  circle, `#0B0D12` seams (vertical + horizontal lines + two curved meridians); (2) a
  **hoop/rim** — amber `#F4A23B` ellipse rim with faint `#8B93A3` net lines. Render
  each as a ~46px inline SVG (or a small RN SVG component / asset), vertically centered
  with the text. Provided as inline SVG in the prototype.
- **Tagline:** Barlow 400, 15px, `#8B93A3`, max-width ~250.
- **Personal Best card:** rounded 18, linear-gradient 135° `#15202f → #11161f`,
  1px border `rgba(91,157,240,.22)`, padding 20. Label "PERSONAL BEST" Barlow 800 11px
  .18em uppercase `#5B9DF0`. Record "79–3" Barlow Condensed 800, 58px, `#EEF1F6` with
  blue `#5B9DF0` dash (single line, no wrap). Right-aligned meta "Lakers / 1980s"
  Barlow 600 12px `#8B93A3`.
- **Mode toggle (segmented):** container `#12161e`, 1px border `rgba(255,255,255,.07)`,
  radius 14, padding 5, two equal segments. Active segment ("CLASSIC") filled amber
  `#F4A23B`, radius 10; title Barlow 800 15px uppercase `#0B0D12`, sub "Stats shown"
  10px `rgba(11,13,18,.7)`. Inactive ("SCOUT'S EYE") transparent; title `#8B93A3`, sub
  `#565E6E`. (Scout's Eye = stats hidden mode.)
- **Start button:** full-width amber `#F4A23B`, radius 16, padding 19, label
  "START DRAFTING" Barlow 800 19px uppercase letter-spacing .05em `#0B0D12`.
- **Links row:** centered, gap 26 — "How to play · History · Settings", Barlow 600 14px
  `#8B93A3`.

### 2. Draft (`src/app/draft.tsx`) — Classic mode
**Purpose:** Spin team+era, see a candidate, draft into the current position slot.

**Layout:** side padding 24. Top→bottom: header row → slot machine panel → roster
strip → candidate card (`flex:1`) → action row.

**Components:**
- **Header:** left back chevron (34×34, 1px border `rgba(255,255,255,.1)`, radius 10,
  `#8B93A3`). Center scorebug pill "PICK 2 / 5 · SG": `#12161e`, 1px border
  `rgba(255,255,255,.08)`, radius 8, padding 7×14, Barlow 800 12px .14em uppercase
  `#5B9DF0`. Right 34px spacer.
- **Slot machine panel:** radius 20, linear-gradient 180° `#12161e → #0d1118`, 1px
  border `rgba(255,255,255,.08)`, padding 18/16/20. Two column labels "TEAM"/"ERA"
  (Barlow 800 10px .2em uppercase `#565E6E`). Two **reels** side by side (gap 12,
  height 148): each `#080a0e`, 1px border `rgba(255,255,255,.06)`, radius 13,
  3 stacked items centered. Center item is the result — **Team** "BULLS" Barlow
  Condensed 800 30px `#EEF1F6`; **Era** "1990s" same in amber `#F4A23B`. Off-center
  items dimmed `#3a4150` opacity .55, slight blur. A **payline** band spans both reels
  at center: 46px tall, top+bottom 2px borders `rgba(244,162,59,.7)`.
  **Spin button** below: amber `#F4A23B`, radius 13, padding 15, "⟳ SPIN" Barlow 800
  18px uppercase .08em `#0B0D12`.
- **Roster strip:** 5 equal chips, gap 6. Filled (PG "Magic"): `#12161e`, 1px border.
  Current (SG): `#1c1408` fill, **1.5px amber border**, label amber, "NOW" amber.
  Empty (SF/PF/C): 1px dashed `rgba(255,255,255,.12)`, "+" `#3a4150`. Position label
  Barlow 800 10px `#565E6E`; name Barlow 600 9px `#8B93A3`.
- **Candidate carousel (horizontally scrollable):** the eligible players for the
  current slot are a **horizontal pager** — the user swipes through them and taps to
  draft. Implement with a horizontal `FlatList`/`ScrollView` with `pagingEnabled`
  (snap to card width + gap). Above it: a caption row — left "ELIGIBLE AT SG" (Barlow
  800 10px .2em uppercase `#565E6E`), right an index "**01** / 06" (amber current,
  `#3a4150` total). Cards are **288pt wide**, gap 12; the next card **peeks ~34pt** at
  the right edge under a **fade overlay** (`linear-gradient(90deg, transparent, #0B0D12)`,
  ~46pt) to signal more. Below: **page dots** — active is an 18×6 amber pill, the rest
  6×6 `#2b3340` — plus a "SWIPE" hint (`#3a4150`).
  - **Card (refined, compact):** radius 15, padding 14×15. Active card bg `#12161e`,
    1px border `rgba(244,162,59,.4)`, soft amber ring `box-shadow 0 0 0 3px rgba(244,162,59,.05)`.
    Off-screen/next cards bg `#0f131b`, border `rgba(255,255,255,.06)`, `opacity .5`.
    Header: 38×38 avatar (radius 10, diagonal-stripe placeholder, initials Barlow
    Condensed 800 14px amber) + name (Barlow Condensed 800 **21px** uppercase `#EEF1F6`)
    over meta (Barlow 600 10px `#8B93A3`). Hairline divider `rgba(255,255,255,.06)`.
  - **Stat rows (Classic mode):** 5 rows (PTS/REB/AST/STL/BLK), row gap 8. Each row =
    26pt label (Barlow 700 10px `#8B93A3`; **STL label amber**) + a **slim track bar**
    (`flex:1`, height 5, radius 3, track `#1b2433`, fill amber `#F4A23B` to the stat %)
    + a 30pt right-aligned value (Barlow Condensed 600 11px `#C2C8D2`). Jordan demo:
    PTS 35.0 (97%), REB 5.5 (38%), AST 5.9 (50%), STL 3.2 (91%), BLK 1.6 (40%).
    (In **Scout's Eye** mode hide the bars **and** values — show name/meta only.)
- **Action row:** "Skip" pill (54px, 1px border, `#8B93A3`) + full-width amber
  "DRAFT JORDAN" (radius 15, padding 15, Barlow 800 17px uppercase `#0B0D12`).

### 3. Results — Perfect Season (`src/app/results.tsx`, win state)
**Purpose:** Celebrate an 82–0 run.

**Layout:** side padding 26. A green radial glow `radial-gradient(120% 80% at 50% 0%,
rgba(63,201,138,.20), transparent 70%)` fills the top 300px behind content.
Top→bottom: badge → hero record → category gauges → roster row → action row.

**Components:**
- **Badge "PERFECT SEASON":** Barlow 800 11px .22em uppercase `#0B0D12` on green
  `#3FC98A`, padding 6×12, radius 6.
- **Hero record "82–0":** Barlow Condensed 800, 110px, green `#3FC98A`, text-shadow
  `0 0 40px rgba(63,201,138,.4)`. Subtitle "NO WEAK CATEGORY. THEY RAN THE TABLE."
  Barlow 600 15px uppercase .08em `#8B93A3`.
- **Category gauges:** 5 rows (Scoring/Rebounding/Playmaking/Steals/Blocks). 78px label
  (Barlow 600 12px `#C2C8D2`) + **12-segment meter**, height 10, gap 3, **all 12 filled
  green `#3FC98A`** (all maxed).
- **Roster row:** 5 chips `#12161e`, 1px border `rgba(63,201,138,.25)`, radius 10.
  Curry / Jordan / LeBron / Duncan / Hakeem. Position Barlow 800 9px `#565E6E`; name
  Barlow 700 10px `#C2C8D2`.
- **Action row:** "Share" pill + full-width **green** "DRAFT AGAIN" (`#3FC98A`,
  text `#06140d`).

### 4. Results — Fell Short (`src/app/results.tsx`, non-win state)
**Purpose:** Show a strong-but-imperfect season and name the limiting category.

**Same layout as #3** with these differences:
- Top glow uses **amber** `radial-gradient(... rgba(244,162,59,.13) ...)` instead of green.
- Badge "SEASON PROJECTION": `#8B93A3` text, **outline** style — 1px border
  `rgba(255,255,255,.14)`, transparent bg (not a filled green pill).
- **Hero record "76–6":** Barlow Condensed 800 110px, **`#EEF1F6`** (white) with amber
  `#F4A23B` dash, no glow text-shadow. Subtitle "TITLE CONTENDER — NOT YET IMMORTAL."
- **Weakness callout:** 1px border `rgba(226,96,63,.4)`, bg `#1d1311`, radius 13,
  padding 13×16, an 8px red `#E2603F` dot + text (Barlow 500 13px `#d8a99a`) reading
  "**Steals** were the wall — six games slipped away there." ("Steals" `#E2603F` 700.)
- **Category gauges (12 seg each):** Scoring 11/12, Rebounding 10/12, Playmaking 11/12,
  Blocks 10/12 — filled **amber** `#F4A23B`. **Steals 6/12 filled red `#E2603F`**, and
  its label is red. Empty segments `#222b39`.
- **Roster row:** neutral border `rgba(255,255,255,.08)`. Stockton / Kobe / Bird /
  Malone / Shaq.
- **Action row:** "Share" pill + full-width **amber** "DRAFT AGAIN" (`#F4A23B`,
  text `#0B0D12`).

> **Choosing win vs. fell-short:** drive purely off the engine's `SimResult` (wins ===
> 82 → perfect variant; else → fell-short variant). The weakness callout should name the
> engine's lowest-scoring category (the README notes steals are usually the wall).

---

## Interactions & Behavior
- **Spin:** tapping SPIN animates both reels (recommend a quick ease-out settle,
  ~600–900ms, with `expo-haptics` impact on stop — gated by the `haptics` setting).
  Result populates Team + Era; the current position slot is highlighted.
- **Mode toggle (Home) — sliding selection:** switches `draftStore` mode
  `classic` ↔ `scoutseye`. On tap (or swipe across the control) the amber selection pill
  **slides horizontally** by one segment width — **320ms, cubic-bezier(.4, 0, .2, 1)**,
  no scale/bounce — while the two labels **crossfade** (180ms): active `#0B0D12` on
  amber, inactive `#8B93A3`. Light haptic on change (gated by the Haptics setting).
  Reanimated: `withTiming(index, {duration: 320})`, pill `translateX = index × segW`;
  reduce-motion → snap (no slide). A live demo + full spec is in the design under the
  **"Motion study — Mode toggle"** section (a reference block, not an app screen).
  In Scout's Eye, the candidate stat-gauge block on Draft is hidden.
- **Draft / Skip:** "Draft <player>" fills the current slot and advances PICK n/5;
  "Skip" passes the candidate; "Re-spin" (Direction A had it; optional here) re-rolls.
- **Results reveal:** count-up on the hero record is a nice touch; gauges can grow-in
  left→right (stagger ~60ms). Keep durations ≤ 700ms.
- **Buttons:** pressed state `opacity: 0.9` (matches current codebase convention).
- **Navigation:** Home → Draft (`router.push('/draft')`), Draft → Results on 5th pick,
  Results "Draft again" → new game.

## State Management
Use existing stores — no new architecture needed.
- `draftStore`: `mode` ('classic' | 'scoutseye'), current spin (team, era), current
  position index, roster slots, candidate, `startGame()`, draft/skip/spin actions.
- `metaStore`: `best` record, `settings.haptics`, `clearHistory()`, history list.
- Results derives entirely from the engine's `SimResult` (wins/losses + per-category
  scores). Do not store presentation colors in state — derive variant from `wins`.

## Design Tokens (Direction B — "Arena")
**Colors**
| Token | Hex | Use |
|---|---|---|
| bg | `#0B0D12` | screen background |
| surface | `#12161e` | cards, chips, scorebug |
| surfaceGradA / B | `#15202f` / `#11161f` | Personal Best card gradient |
| reelWell | `#080a0e` | reel background |
| border | `rgba(255,255,255,.07–.08)` | card/chip borders |
| borderDash | `rgba(255,255,255,.12)` | empty roster slots |
| text | `#EEF1F6` | primary text |
| textMid | `#C2C8D2` | secondary labels |
| textDim | `#8B93A3` | body / muted |
| textFaint | `#565E6E` | micro-labels |
| reelInactive | `#3a4150` | off-center reel items |
| **accent (amber)** | `#F4A23B` | primary action / highlight |
| onAmber | `#0B0D12` | text/icons on amber |
| **secondary (blue)** | `#5B9DF0` | data / secondary accents |
| **win (green)** | `#3FC98A` | perfect season / win CTA |
| onGreen | `#06140d` | text on green |
| **bad (red)** | `#E2603F` | weakest category / danger |
| segmentEmpty | `#222b39` | unfilled gauge segments |

> Add these as **app/brand** tokens. Keep **team** palettes separate and untouched
> (see the preservation note up top).

**Typography**
- Display: **Barlow Condensed** 800, UPPERCASE, letter-spacing ~ -0.01em — wordmark,
  record numbers, player names, reel values.
- UI / body: **Barlow** 400/500/600/700/800. Buttons & section labels are 800 UPPERCASE.
- Load via `expo-font` (README notes custom fonts aren't loaded yet). Scale:
  hero record 110 · best record 58 · wordmark 54 · player/reel 26–30 · button 17–19 ·
  body 15 · pill/section label 10–12 (.14–.22em tracking).

**Radius:** screen content cards 18 · inner panels/reels 13 · buttons 15–16 · chips 10 ·
pills/badges 5–8.

**Spacing:** screen side padding 24–26 · card padding 18–20 · gauge segment gaps 2–3 ·
roster chip gaps 6 · section gaps 13–16.

**Shadow (RN):** cards sit on flat fills; rely on borders + the top radial glow rather
than drop shadows inside the app.

## Assets
- **Logo glyphs** (basketball + hoop): provided as inline SVG in the prototype. Re-draw
  as `react-native-svg` components or export PNG/SVG assets. No third-party logos or
  trademarks are used (consistent with the app's About copy).
- **Player avatars:** diagonal-stripe placeholders with initials in the mock — wire to
  the existing `Avatar` component / data source.

## Files
- `HoopLore Screens.dc.html` — editable source prototype (all 4 Direction-B screens
  plus Direction A for reference). Opens inside this design project.
- `HoopLore Screens (standalone).html` — self-contained build that opens in any browser
  offline. Use this to view the designs without the project.

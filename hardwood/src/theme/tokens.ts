import type { Decade } from '../game/data/types';

// "Arena" brand palette (Direction B). App-level semantics only:
// amber = primary action / highlight, blue = data / secondary,
// green = win / perfect season, red = danger / weakest category.
// NOTE: per-team colors live in src/theme/cosmetics.ts and remain the source of
// truth for anything team-specific — never overwrite them with brand amber.
export const colors = {
  bg: '#0B0D12',
  surface: '#12161e',
  surfaceAlt: '#1b2433',
  reelWell: '#080a0e',
  border: 'rgba(255,255,255,0.08)',
  borderDash: 'rgba(255,255,255,0.12)',

  text: '#EEF1F6',
  textMid: '#C2C8D2',
  textDim: '#8B93A3',
  textFaint: '#565E6E',
  reelInactive: '#3a4150',

  accent: '#F4A23B',     // primary action / highlight (amber)
  accentDim: '#9c6a26',
  onAmber: '#0B0D12',

  secondary: '#5B9DF0',  // data / secondary accents (blue)

  good: '#3FC98A',       // kept name for legacy StatBars
  win: '#3FC98A',        // perfect season / win CTA (green)
  onGreen: '#06140d',

  bad: '#E2603F',        // weakest category / danger (red)
  perfect: '#3FC98A',

  segmentEmpty: '#222b39',

  // Personal Best card gradient
  surfaceGradA: '#15202f',
  surfaceGradB: '#11161f',

  // top-of-screen radial-ish glows (used with LinearGradient -> transparent)
  glowGreen: 'rgba(63,201,138,0.20)',
  glowAmber: 'rgba(244,162,59,0.13)',
  glowAmberSoft: 'rgba(244,162,59,0.11)',
} as const;

// One color per decade for the slot machine + cards.
export const decadeColor: Record<Decade, string> = {
  '1960s': '#C9772E',
  '1970s': '#D98C3B',
  '1980s': '#E0556B',
  '1990s': '#7C6BD1',
  '2000s': '#3FA7D6',
  '2010s': '#3FBF8F',
  '2020s': '#E8B84B',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 36 } as const;

export const radius = {
  sm: 8, md: 14, lg: 22, pill: 999,
  // Arena scale
  card: 18, panel: 13, btn: 15, chip: 10, badge: 6,
} as const;

// Custom font families (loaded in src/app/_layout.tsx). If a build hasn't loaded
// them yet, RN falls back to the system font + the fontWeight below.
export const font = {
  display: 'BarlowCondensed_800ExtraBold', // wordmark, records, names, reel values
  displaySemi: 'BarlowCondensed_600SemiBold',
  r: 'Barlow_400Regular',
  m: 'Barlow_500Medium',
  sb: 'Barlow_600SemiBold',
  b: 'Barlow_700Bold',
  xb: 'Barlow_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: font.display, fontSize: 40, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontFamily: font.display, fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.3 },
  heading: { fontFamily: font.xb, fontSize: 19, fontWeight: '700' as const },
  body: { fontFamily: font.m, fontSize: 15, fontWeight: '500' as const },
  label: { fontFamily: font.xb, fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.3 },
  mono: { fontFamily: font.sb, fontSize: 13, fontWeight: '600' as const },
  stat: { fontFamily: font.display, fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
};

export const statLabels: Record<string, string> = {
  PTS: 'PTS', REB: 'REB', AST: 'AST', STL: 'STL', BLK: 'BLK',
};

// Human-friendly category names used by the Arena Results gauges.
export const categoryNames: Record<string, string> = {
  PTS: 'Scoring', REB: 'Rebounding', AST: 'Playmaking', STL: 'Steals', BLK: 'Blocks',
};

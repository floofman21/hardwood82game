import type { Decade } from '../game/data/types';

export const colors = {
  bg: '#0E0F12',
  surface: '#16181D',
  surfaceAlt: '#1E2127',
  border: '#2A2E36',
  text: '#F5F6F8',
  textDim: '#9aa0ab',
  textFaint: '#5c626d',
  accent: '#F4A23B', // parquet amber
  accentDim: '#9c6a26',
  good: '#5BD49B',
  bad: '#E5604D',
  perfect: '#FFD15C',
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

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 } as const;

export const type = {
  display: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.3 },
  heading: { fontSize: 19, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.3 },
  mono: { fontSize: 13, fontWeight: '600' as const },
  stat: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
};

export const statLabels: Record<string, string> = {
  PTS: 'PTS', REB: 'REB', AST: 'AST', STL: 'STL', BLK: 'BLK',
};

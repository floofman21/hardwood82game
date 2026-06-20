// Cosmetic-only data: team color schemes / logo-style marks and per-decade era
// themes. None of this is read by the simulation — it is pure flavor for the UI.
// Keep it free of game logic so it can never affect drafting or scoring.

import type { Decade } from '../game/data/types';
import { colors, decadeColor } from './tokens';

export interface TeamLook {
  /** Primary brand color — used for badges, reel tint, accents. */
  primary: string;
  /** Secondary brand color — used for rings / contrast details. */
  secondary: string;
  /** Short logo-style mark shown in the team badge. */
  abbr: string;
}

// Real color schemes for every franchise in the dataset, including the historical
// ones (Royals, Sonics, Braves, Bullets). Colors are approximate brand hues.
const TEAM_LOOKS: Record<string, TeamLook> = {
  Braves:        { primary: '#E56020', secondary: '#000000', abbr: 'BUF' },
  Bucks:         { primary: '#00471B', secondary: '#EEE1C6', abbr: 'MIL' },
  Bullets:       { primary: '#E31837', secondary: '#002B5C', abbr: 'BUL' },
  Bulls:         { primary: '#CE1141', secondary: '#000000', abbr: 'CHI' },
  Cavaliers:     { primary: '#860038', secondary: '#FDBB30', abbr: 'CLE' },
  Celtics:       { primary: '#007A33', secondary: '#BA9653', abbr: 'BOS' },
  Clippers:      { primary: '#C8102E', secondary: '#1D428A', abbr: 'LAC' },
  Grizzlies:     { primary: '#5D76A9', secondary: '#12173F', abbr: 'MEM' },
  Hawks:         { primary: '#E03A3E', secondary: '#C1D32F', abbr: 'ATL' },
  Heat:          { primary: '#98002E', secondary: '#F9A01B', abbr: 'MIA' },
  Hornets:       { primary: '#1D1160', secondary: '#00788C', abbr: 'CHA' },
  Jazz:          { primary: '#5C2D91', secondary: '#00A14B', abbr: 'UTA' },
  Kings:         { primary: '#5A2D81', secondary: '#C4CED4', abbr: 'SAC' },
  Knicks:        { primary: '#006BB6', secondary: '#F58426', abbr: 'NYK' },
  Lakers:        { primary: '#552583', secondary: '#FDB927', abbr: 'LAL' },
  Magic:         { primary: '#0077C0', secondary: '#C4CED4', abbr: 'ORL' },
  Mavericks:     { primary: '#00538C', secondary: '#0B2240', abbr: 'DAL' },
  Nets:          { primary: '#1A1A1A', secondary: '#C4CED4', abbr: 'NJN' },
  Nuggets:       { primary: '#0E2240', secondary: '#FEC524', abbr: 'DEN' },
  Pacers:        { primary: '#002D62', secondary: '#FDBB30', abbr: 'IND' },
  Pelicans:      { primary: '#0C2340', secondary: '#C8102E', abbr: 'NOP' },
  Pistons:       { primary: '#C8102E', secondary: '#1D42BA', abbr: 'DET' },
  Raptors:       { primary: '#CE1141', secondary: '#1A1A1A', abbr: 'TOR' },
  Rockets:       { primary: '#CE1141', secondary: '#1A1A1A', abbr: 'HOU' },
  Royals:        { primary: '#E03A3E', secondary: '#002B5C', abbr: 'CIN' },
  Sixers:        { primary: '#006BB6', secondary: '#ED174C', abbr: 'PHI' },
  Sonics:        { primary: '#00653A', secondary: '#FFC200', abbr: 'SEA' },
  Spurs:         { primary: '#9EA2A2', secondary: '#1A1A1A', abbr: 'SAS' },
  Suns:          { primary: '#1D1160', secondary: '#E56020', abbr: 'PHX' },
  Thunder:       { primary: '#007AC1', secondary: '#EF3B24', abbr: 'OKC' },
  Timberwolves:  { primary: '#236192', secondary: '#9EA2A2', abbr: 'MIN' },
  'Trail Blazers': { primary: '#E03A3E', secondary: '#1A1A1A', abbr: 'POR' },
  Warriors:      { primary: '#1D428A', secondary: '#FFC72C', abbr: 'GSW' },
  Wizards:       { primary: '#002B5C', secondary: '#E31837', abbr: 'WAS' },
};

const FALLBACK_LOOK: TeamLook = {
  primary: colors.accent,
  secondary: colors.accentDim,
  abbr: '••',
};

/** Team look with a safe fallback for any team missing from the map. */
export function teamLook(team: string): TeamLook {
  const look = TEAM_LOOKS[team];
  if (look) return look;
  // Derive a readable abbreviation from the name so nothing ever renders blank.
  const abbr = team.replace(/[^A-Za-z ]/g, '').slice(0, 3).toUpperCase() || '••';
  return { ...FALLBACK_LOOK, abbr };
}

export interface EraTheme {
  /** Accent color for the decade (mirrors the existing decadeColor token). */
  color: string;
  /** Short flavor tagline shown under the decade. */
  label: string;
}

// A short identity for each decade. The color reuses the existing decadeColor so
// the rest of the UI stays consistent; the label adds era flavor.
export const eraTheme: Record<Decade, EraTheme> = {
  '1960s': { color: decadeColor['1960s'], label: 'Hardwood Classic' },
  '1970s': { color: decadeColor['1970s'], label: 'Funk Era' },
  '1980s': { color: decadeColor['1980s'], label: 'Showtime' },
  '1990s': { color: decadeColor['1990s'], label: 'Golden Age' },
  '2000s': { color: decadeColor['2000s'], label: 'Iso Ball' },
  '2010s': { color: decadeColor['2010s'], label: 'Pace & Space' },
  '2020s': { color: decadeColor['2020s'], label: 'Positionless' },
};

/** Append a low-opacity alpha to a #RRGGBB color for translucent tints. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

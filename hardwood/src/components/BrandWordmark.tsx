import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Ellipse } from 'react-native-svg';
import { colors, font } from '../theme/tokens';

/**
 * The HOOPLORE wordmark: the two O's of "HOOP" are replaced by a basketball and a
 * hoop glyph; the "LORE" suffix is amber. No third-party logos/trademarks — the
 * glyphs are drawn from scratch with react-native-svg.
 */
export function BrandWordmark({ size = 54 }: { size?: number }) {
  const glyph = Math.round(size * 0.82);
  const letter = { fontFamily: font.display, fontSize: size, color: colors.text };
  return (
    <View style={styles.row}>
      <Text style={[styles.letter, letter]}>H</Text>
      <Basketball size={glyph} />
      <Hoop size={glyph} />
      <Text style={[styles.letter, letter]}>P</Text>
      <Text style={[styles.letter, letter, { color: colors.accent }]}>LORE</Text>
    </View>
  );
}

function Basketball({ size }: { size: number }) {
  const s = size;
  const c = s / 2;
  const r = s * 0.46;
  const seam = colors.bg;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={styles.glyph}>
      <Circle cx={c} cy={c} r={r} fill={colors.accent} />
      <Line x1={c} y1={c - r} x2={c} y2={c + r} stroke={seam} strokeWidth={s * 0.05} />
      <Line x1={c - r} y1={c} x2={c + r} y2={c} stroke={seam} strokeWidth={s * 0.05} />
      <Path
        d={`M ${c - r} ${c} Q ${c} ${c - r * 0.9} ${c + r} ${c}`}
        stroke={seam}
        strokeWidth={s * 0.045}
        fill="none"
      />
      <Path
        d={`M ${c - r} ${c} Q ${c} ${c + r * 0.9} ${c + r} ${c}`}
        stroke={seam}
        strokeWidth={s * 0.045}
        fill="none"
      />
    </Svg>
  );
}

function Hoop({ size }: { size: number }) {
  const s = size;
  const cx = s / 2;
  const rimY = s * 0.42;
  const rx = s * 0.4;
  const ry = s * 0.13;
  const net = '#8B93A3';
  const bottom = s * 0.86;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={styles.glyph}>
      {/* net lines */}
      <Line x1={cx - rx} y1={rimY} x2={cx - rx * 0.45} y2={bottom} stroke={net} strokeWidth={s * 0.03} />
      <Line x1={cx - rx * 0.5} y1={rimY + ry} x2={cx - rx * 0.18} y2={bottom} stroke={net} strokeWidth={s * 0.03} />
      <Line x1={cx + rx * 0.5} y1={rimY + ry} x2={cx + rx * 0.18} y2={bottom} stroke={net} strokeWidth={s * 0.03} />
      <Line x1={cx + rx} y1={rimY} x2={cx + rx * 0.45} y2={bottom} stroke={net} strokeWidth={s * 0.03} />
      <Line x1={cx} y1={rimY + ry} x2={cx} y2={bottom} stroke={net} strokeWidth={s * 0.03} />
      {/* rim */}
      <Ellipse cx={cx} cy={rimY} rx={rx} ry={ry} stroke={colors.accent} strokeWidth={s * 0.07} fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  letter: { letterSpacing: -0.6, fontWeight: '800', includeFontPadding: false },
  glyph: { marginHorizontal: -1 },
});

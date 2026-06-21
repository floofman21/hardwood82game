import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandWordmark } from './BrandWordmark';
import { colors, space, radius, font, categoryNames } from '../theme/tokens';
import { STATS, type Stat, type DraftedPlayer, type Position, type SimResult } from '../game/data/types';
import { LINEUP_SLOTS } from '../game/rules/decades';

/**
 * Self-contained, branded results card rendered off-screen and captured to an
 * image for sharing. Shows the record, the lineup, and the HoopLore wordmark.
 */
export const SHARE_CARD_WIDTH = 360;

export function ShareCard({
  result,
  roster,
}: {
  result: SimResult;
  roster: Record<Position, DraftedPlayer | null>;
}) {
  const perfect = result.perfect;
  let weak: Stat = STATS[0];
  for (const c of STATS) if (result.categories[c].normalized < result.categories[weak].normalized) weak = c;

  return (
    <View style={styles.card}>
      <LinearGradient
        pointerEvents="none"
        colors={[perfect ? colors.glowGreen : colors.glowAmber, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glow}
      />

      <View style={styles.brandTop}>
        <BrandWordmark size={26} />
      </View>

      {perfect ? (
        <View style={styles.badgeWin}><Text style={styles.badgeWinTxt}>PERFECT SEASON</Text></View>
      ) : (
        <View style={styles.badgeOutline}><Text style={styles.badgeOutlineTxt}>SEASON PROJECTION</Text></View>
      )}

      <Text style={[styles.record, { color: perfect ? colors.win : colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {result.wins}<Text style={{ color: perfect ? colors.win : colors.accent }}>–</Text>{result.losses}
      </Text>
      <Text style={styles.subtitle}>
        {perfect ? 'NO WEAK CATEGORY. THEY RAN THE TABLE.' : `${categoryNames[weak].toUpperCase()} WAS THE WALL.`}
      </Text>

      <View style={styles.lineup}>
        {LINEUP_SLOTS.map((slot) => {
          const p = roster[slot];
          if (!p) return null;
          return (
            <View key={slot} style={styles.row}>
              <Text style={styles.rowPos}>{slot}</Text>
              <Text style={styles.rowName} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{p.team} · {p.decade}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTxt}>HOOPLORE</Text>
        <Text style={styles.footerSub}>Draft the all-time team. Chase 82–0.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: SHARE_CARD_WIDTH, backgroundColor: colors.bg, borderRadius: radius.card, paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.lg, overflow: 'hidden', alignItems: 'center' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  brandTop: { marginBottom: space.md },
  badgeWin: { backgroundColor: colors.win, borderRadius: radius.badge, paddingHorizontal: 12, paddingVertical: 6 },
  badgeWinTxt: { fontFamily: font.xb, color: colors.onAmber, fontSize: 11, letterSpacing: 2.2, fontWeight: '800' },
  badgeOutline: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: radius.badge, paddingHorizontal: 12, paddingVertical: 6 },
  badgeOutlineTxt: { fontFamily: font.xb, color: colors.textDim, fontSize: 11, letterSpacing: 2.2, fontWeight: '800' },
  record: { fontFamily: font.display, fontSize: 92, fontWeight: '800', letterSpacing: -2, lineHeight: 98, marginTop: space.sm },
  subtitle: { fontFamily: font.sb, color: colors.textDim, fontSize: 13, letterSpacing: 0.6, textAlign: 'center', fontWeight: '600', marginBottom: space.md },
  lineup: { alignSelf: 'stretch', gap: 6, marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 9, gap: 10 },
  rowPos: { fontFamily: font.xb, color: colors.textFaint, fontSize: 11, width: 24, fontWeight: '800' },
  rowName: { fontFamily: font.display, color: colors.text, fontSize: 16, fontWeight: '800', flex: 1, minWidth: 0 },
  rowMeta: { fontFamily: font.sb, color: colors.textDim, fontSize: 11, fontWeight: '600' },
  footer: { marginTop: space.lg, alignItems: 'center', gap: 2 },
  footerTxt: { fontFamily: font.display, color: colors.accent, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  footerSub: { fontFamily: font.m, color: colors.textFaint, fontSize: 11 },
});

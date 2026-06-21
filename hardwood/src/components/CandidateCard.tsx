import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font } from '../theme/tokens';
import { teamLook } from '../theme/cosmetics';
import { STATS, type Stat, type Player } from '../game/data/types';

// Display-only maxima for the candidate stat bars (league-leading-ish ceilings).
// Purely cosmetic — the engine's real scoring is unaffected.
const BAR_MAX: Record<Stat, number> = { PTS: 36, REB: 16, AST: 12, STL: 3.5, BLK: 4 };

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CandidateCard({
  player,
  width,
  active = true,
  hideStats = false,
}: {
  player: Player;
  width: number;
  active?: boolean;
  hideStats?: boolean;
}) {
  const look = teamLook(player.team);
  return (
    <View style={[styles.card, { width }, active ? styles.active : styles.inactive]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: look.primary }]}>
          <Text style={styles.avatarTxt}>{initials(player.name)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>{player.name.toUpperCase()}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {player.team} · {player.decade} · {player.positions.join('/')}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {hideStats ? (
        <View style={styles.hidden}>
          <Text style={styles.hiddenTxt}>HOOPIQ</Text>
          <Text style={styles.hiddenSub}>stats hidden — draft on knowledge</Text>
        </View>
      ) : (
        <View style={styles.stats}>
          {STATS.map((c) => {
            const pct = Math.max(2, Math.min(100, Math.round((player.stats[c] / BAR_MAX[c]) * 100)));
            const amber = c === 'STL';
            return (
              <View key={c} style={styles.statRow}>
                <Text style={[styles.statLabel, amber && { color: colors.accent }]}>{c}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.statVal}>{player.stats[c].toFixed(1)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.panel, padding: 15, borderWidth: 1 },
  active: { backgroundColor: '#12161e', borderColor: 'rgba(244,162,59,0.4)' },
  inactive: { backgroundColor: '#0f131b', borderColor: 'rgba(255,255,255,0.06)', opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: font.display, color: colors.onAmber, fontSize: 14, fontWeight: '800' },
  name: { fontFamily: font.display, color: colors.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.2 },
  meta: { fontFamily: font.sb, color: colors.textDim, fontSize: 10, marginTop: 1, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 12 },
  stats: { gap: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statLabel: { width: 26, fontFamily: font.b, color: colors.textDim, fontSize: 10, fontWeight: '700' },
  track: { flex: 1, height: 5, backgroundColor: '#1b2433', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  statVal: { width: 30, textAlign: 'right', fontFamily: font.displaySemi, color: colors.textMid, fontSize: 11, fontWeight: '600' },
  hidden: { paddingVertical: 18, alignItems: 'center', gap: 2 },
  hiddenTxt: { fontFamily: font.xb, color: colors.accent, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  hiddenSub: { fontFamily: font.m, color: colors.textFaint, fontSize: 11 },
});

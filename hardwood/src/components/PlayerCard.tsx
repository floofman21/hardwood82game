import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { TeamBadge } from './TeamBadge';
import { colors, space, radius, decadeColor } from '../theme/tokens';
import { STATS } from '../game/data/types';
import type { Player } from '../game/data/types';

export function PlayerCard({
  player,
  hideStats = false,
  onPress,
  selected = false,
}: {
  player: Player;
  hideStats?: boolean;
  onPress?: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Avatar name={player.name} decade={player.decade} team={player.team} size={46} />
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
        <View style={styles.metaRow}>
          <TeamBadge team={player.team} size={18} />
          <Text style={styles.team} numberOfLines={1}>{player.team}</Text>
          <View style={[styles.decadeChip, { borderColor: decadeColor[player.decade] }]}>
            <Text style={[styles.decadeTxt, { color: decadeColor[player.decade] }]}>
              {player.decade}
            </Text>
          </View>
          <Text style={styles.pos}>{player.positions.join('/')}</Text>
        </View>
      </View>
      {!hideStats && (
        <View style={styles.stats}>
          {STATS.map((c) => (
            <View key={c} style={styles.statCol}>
              <Text style={styles.statVal}>{player.stats[c]}</Text>
              <Text style={styles.statKey}>{c}</Text>
            </View>
          ))}
        </View>
      )}
      {hideStats && (
        <View style={styles.hidden}>
          <Text style={styles.hiddenTxt}>HoopIQ</Text>
          <Text style={styles.hiddenSub}>stats hidden</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: space.md, borderWidth: 1, borderColor: colors.border,
  },
  selected: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  mid: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 3 },
  team: { color: colors.textDim, fontSize: 12, flexShrink: 1 },
  decadeChip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  decadeTxt: { fontSize: 10, fontWeight: '700' },
  pos: { color: colors.textFaint, fontSize: 11, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8 },
  statCol: { alignItems: 'center', width: 26 },
  statVal: { color: colors.text, fontWeight: '700', fontSize: 13 },
  statKey: { color: colors.textFaint, fontSize: 9, fontWeight: '700', marginTop: 1 },
  hidden: { alignItems: 'flex-end' },
  hiddenTxt: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  hiddenSub: { color: colors.textFaint, fontSize: 10 },
});

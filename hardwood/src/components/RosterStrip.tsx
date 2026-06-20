import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { colors, space, radius } from '../theme/tokens';
import { LINEUP_SLOTS } from '../game/rules/decades';
import type { DraftedPlayer, Position } from '../game/data/types';

export function RosterStrip({
  roster,
  highlight,
}: {
  roster: Record<Position, DraftedPlayer | null>;
  highlight?: Position[];
}) {
  return (
    <View style={styles.row}>
      {LINEUP_SLOTS.map((slot) => {
        const p = roster[slot];
        const isHot = highlight?.includes(slot);
        return (
          <View key={slot} style={styles.col}>
            <View
              style={[
                styles.slot,
                p ? styles.filled : styles.empty,
                isHot && styles.hot,
              ]}
            >
              {p ? (
                <Avatar name={p.name} decade={p.decade} team={p.team} size={40} />
              ) : (
                <Text style={styles.slotLabel}>{slot}</Text>
              )}
            </View>
            <Text style={styles.caption} numberOfLines={1}>
              {p ? p.name.split(' ').slice(-1)[0] : slot}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  slot: {
    width: '100%', aspectRatio: 1, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  filled: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  empty: {
    backgroundColor: 'transparent', borderWidth: 1.5,
    borderColor: colors.border, borderStyle: 'dashed',
  },
  hot: { borderColor: colors.accent },
  slotLabel: { color: colors.textFaint, fontWeight: '800', fontSize: 14 },
  caption: { color: colors.textDim, fontSize: 10, fontWeight: '600' },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font } from '../theme/tokens';
import { teamLook } from '../theme/cosmetics';
import { LINEUP_SLOTS } from '../game/rules/decades';
import type { DraftedPlayer, Position } from '../game/data/types';

/**
 * The five-slot roster strip as Arena chips. Filled slots show position + surname
 * (tinted with the team's primary color); slots in `highlight` read "NOW"; empty
 * slots are dashed with a "+".
 */
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
        const isNow = highlight?.includes(slot) && !p;
        const tint = p ? teamLook(p.team).primary : undefined;
        return (
          <View
            key={slot}
            style={[
              styles.chip,
              p && styles.filled,
              p && tint ? { borderColor: tint } : null,
              isNow && styles.now,
              !p && !isNow && styles.empty,
            ]}
          >
            <Text style={[styles.pos, isNow && { color: colors.accent }]}>{slot}</Text>
            {p ? (
              <Text style={styles.name} numberOfLines={1}>{p.name.split(' ').slice(-1)[0]}</Text>
            ) : isNow ? (
              <Text style={[styles.name, { color: colors.accent }]}>NOW</Text>
            ) : (
              <Text style={styles.plus}>+</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  chip: {
    flex: 1, borderRadius: radius.chip, paddingVertical: 8, paddingHorizontal: 4,
    alignItems: 'center', gap: 2, minHeight: 44, justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  filled: { backgroundColor: colors.surface },
  now: { backgroundColor: '#1c1408', borderWidth: 1.5, borderColor: colors.accent },
  empty: { backgroundColor: 'transparent', borderStyle: 'dashed', borderColor: colors.borderDash },
  pos: { fontFamily: font.xb, color: colors.textFaint, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  name: { fontFamily: font.sb, color: colors.textDim, fontSize: 9, fontWeight: '600' },
  plus: { color: colors.reelInactive, fontSize: 14, fontWeight: '700' },
});

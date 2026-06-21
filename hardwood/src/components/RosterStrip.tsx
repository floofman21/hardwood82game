import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, radius, font } from '../theme/tokens';
import { teamLook } from '../theme/cosmetics';
import { LINEUP_SLOTS } from '../game/rules/decades';
import { useReduceMotion } from '../hooks/useReduceMotion';
import type { DraftedPlayer, Position } from '../game/data/types';

/**
 * The five-slot roster strip as Arena chips. Filled slots show position + surname
 * (tinted with the team's primary color); slots in `highlight` read "NOW"; empty
 * slots are dashed with a "+". A slot pops (scale) the moment it's filled.
 */
export function RosterStrip({
  roster,
  highlight,
}: {
  roster: Record<Position, DraftedPlayer | null>;
  highlight?: Position[];
}) {
  const reduced = useReduceMotion();
  const scales = useRef(
    LINEUP_SLOTS.reduce((m, slot) => { m[slot] = new Animated.Value(1); return m; }, {} as Record<Position, Animated.Value>),
  ).current;
  const prevFilled = useRef<Record<string, boolean>>({});

  useEffect(() => {
    for (const slot of LINEUP_SLOTS) {
      const filled = !!roster[slot];
      if (filled && !prevFilled.current[slot] && !reduced) {
        scales[slot].setValue(1.25);
        Animated.spring(scales[slot], { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();
      }
      prevFilled.current[slot] = filled;
    }
  }, [roster, reduced, scales]);

  return (
    <View style={styles.row}>
      {LINEUP_SLOTS.map((slot) => {
        const p = roster[slot];
        const isNow = highlight?.includes(slot) && !p;
        const tint = p ? teamLook(p.team).primary : undefined;
        return (
          <Animated.View
            key={slot}
            style={[
              styles.chip,
              p && styles.filled,
              p && tint ? { borderColor: tint } : null,
              isNow && styles.now,
              !p && !isNow && styles.empty,
              { transform: [{ scale: scales[slot] }] },
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
          </Animated.View>
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

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { decadeColor, colors } from '../theme/tokens';
import { teamLook } from '../theme/cosmetics';
import type { Decade } from '../game/data/types';

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  decade,
  team,
  size = 44,
}: {
  name: string;
  decade: Decade;
  /** When provided, the avatar gets a ring in the team's primary color. */
  team?: string;
  size?: number;
}) {
  const bg = decadeColor[decade];
  const ring = team ? teamLook(team).primary : undefined;
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        ring && { borderWidth: Math.max(2, size * 0.07), borderColor: ring },
      ]}
    >
      <Text style={[styles.txt, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  txt: { color: colors.bg, fontWeight: '800', letterSpacing: 0.5 },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { decadeColor, colors } from '../theme/tokens';
import type { Decade } from '../game/data/types';

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  decade,
  size = 44,
}: {
  name: string;
  decade: Decade;
  size?: number;
}) {
  const bg = decadeColor[decade];
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
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

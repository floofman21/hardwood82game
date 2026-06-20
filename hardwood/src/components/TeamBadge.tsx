import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { teamLook } from '../theme/cosmetics';

/**
 * A logo-style team mark: a rounded shield in the team's primary color with a
 * secondary-color ring and the team's short abbreviation. A lightweight stand-in
 * for real logos (no external assets), used wherever a team is shown.
 */
export function TeamBadge({ team, size = 40 }: { team: string; size?: number }) {
  const look = teamLook(team);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: look.primary,
          borderColor: look.secondary,
          borderWidth: Math.max(2, size * 0.06),
        },
      ]}
    >
      <Text
        style={[styles.txt, { fontSize: size * 0.32, color: look.secondary }]}
        numberOfLines={1}
      >
        {look.abbr}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  txt: { fontWeight: '900', letterSpacing: 0.5 },
});

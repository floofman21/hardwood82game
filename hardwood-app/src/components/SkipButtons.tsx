import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, space, radius } from '../theme/tokens';

export function SkipButtons({
  skips,
  onTeamSkip,
  onDecadeSkip,
  disabled,
}: {
  skips: { team: number; decade: number };
  onTeamSkip: () => void;
  onDecadeSkip: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <SkipBtn
        label="Reroll team"
        count={skips.team}
        onPress={onTeamSkip}
        disabled={disabled || skips.team <= 0}
      />
      <SkipBtn
        label="Reroll decade"
        count={skips.decade}
        onPress={onDecadeSkip}
        disabled={disabled || skips.decade <= 0}
      />
    </View>
  );
}

function SkipBtn({
  label, count, onPress, disabled,
}: {
  label: string; count: number; onPress: () => void; disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.btnDisabled,
        pressed && !disabled && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      <View style={[styles.badge, disabled && styles.badgeDisabled]}>
        <Text style={styles.badgeTxt}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: space.sm, paddingVertical: space.md, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  btnDisabled: { opacity: 0.45 },
  label: { color: colors.text, fontWeight: '700', fontSize: 13 },
  labelDisabled: { color: colors.textDim },
  badge: {
    minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: radius.pill,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  badgeDisabled: { backgroundColor: colors.textFaint },
  badgeTxt: { color: colors.bg, fontWeight: '800', fontSize: 11 },
});

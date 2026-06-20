import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, space, type } from '../theme/tokens';

export function ScreenHeader({
  title,
  back = true,
  right,
}: {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Text style={styles.chev}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.md,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  chev: { color: colors.text, fontSize: 34, lineHeight: 36, marginTop: -4 },
  title: { ...type.heading, color: colors.text, flex: 1 },
  right: { minWidth: 32, alignItems: 'flex-end' },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

/**
 * A discrete N-segment meter (Results category gauges). `filled` segments take
 * `color`; the rest use the empty token.
 */
export function SegmentMeter({
  segments = 12,
  filled,
  color,
}: {
  segments?: number;
  filled: number;
  color: string;
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[styles.seg, { backgroundColor: i < filled ? color : colors.segmentEmpty }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 3, flex: 1 },
  seg: { flex: 1, height: 10, borderRadius: 2 },
});

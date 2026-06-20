import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, space, radius, statLabels } from '../theme/tokens';
import { STATS } from '../game/data/types';
import type { SimResult } from '../game/data/types';

export function StatBars({ result }: { result: SimResult }) {
  return (
    <View style={styles.wrap}>
      {STATS.map((c) => {
        const n = result.categories[c].normalized;
        const pct = Math.round(n * 100);
        const weak = n < 0.6;
        return (
          <View key={c} style={styles.row}>
            <Text style={styles.label}>{statLabels[c]}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.max(2, pct)}%`, backgroundColor: weak ? colors.bad : colors.good },
                ]}
              />
            </View>
            <Text style={styles.pct}>{pct}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  label: { width: 38, color: colors.textDim, fontWeight: '700', fontSize: 13 },
  track: {
    flex: 1, height: 10, backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  pct: { width: 28, textAlign: 'right', color: colors.text, fontWeight: '700', fontSize: 13 },
});

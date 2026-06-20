import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMetaStore } from '../game/state/metaStore';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, space, radius } from '../theme/tokens';

export default function History() {
  const history = useMetaStore((s) => s.history);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="History" />
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No games yet</Text>
          <Text style={styles.emptySub}>Your past drafts and records will show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(g) => g.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.record}>{item.wins}–{item.losses}</Text>
                <Text style={styles.meta}>
                  {item.mode === 'hoopiq' ? 'HoopIQ' : 'Classic'} · {fmt(item.playedAt)}
                </Text>
              </View>
              {item.wins === 82 && <Text style={styles.perfect}>PERFECT</Text>}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function fmt(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm, padding: space.xl },
  emptyTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
  emptySub: { color: colors.textDim, textAlign: 'center', fontSize: 14 },
  list: { padding: space.lg, gap: space.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: space.lg,
  },
  record: { color: colors.text, fontWeight: '800', fontSize: 22 },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  perfect: { color: colors.perfect, fontWeight: '800', letterSpacing: 1, fontSize: 12 },
});

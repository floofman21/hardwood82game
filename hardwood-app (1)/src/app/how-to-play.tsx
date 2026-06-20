import React from 'react';
import { Text, ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, space } from '../theme/tokens';

const RULES: Array<{ h: string; b: string }> = [
  { h: 'Draft five greats', b: 'You fill five positions — PG, SG, SF, PF, C — one player per round, five rounds total.' },
  { h: 'Spin the reel', b: 'Each round spins a team and a decade. You then pick one eligible player from that team and era.' },
  { h: 'One reroll each', b: 'You get a single team reroll and a single decade reroll per game. Spend them wisely.' },
  { h: 'Five stats matter', b: 'Points, rebounds, assists, steals and blocks are all weighed — and adjusted for the era each player came from, so a 1960s line is comparable to a 2020s one.' },
  { h: 'Balance wins titles', b: 'A roster that dominates one category but ignores another gets capped. The weakest category is your ceiling. A balanced, complete team is what chases a perfect season.' },
  { h: 'Chase 82–0', b: 'A flawless 82–0 is rare by design. It takes a roster strong everywhere — including the categories most lineups forget, like steals.' },
  { h: 'Classic vs HoopIQ', b: 'Classic shows stat lines as you draft. HoopIQ hides them — you draft on knowledge alone and the numbers are revealed at the end.' },
];

export default function HowToPlay() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="How to play" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {RULES.map((r, i) => (
          <View key={i} style={styles.block}>
            <Text style={styles.num}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>{r.h}</Text>
              <Text style={styles.b}>{r.b}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space.lg, gap: space.xl, paddingBottom: space.xxl },
  block: { flexDirection: 'row', gap: space.md },
  num: { color: colors.accent, fontWeight: '800', fontSize: 18, width: 22 },
  h: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  b: { color: colors.textDim, fontSize: 14, lineHeight: 21 },
});

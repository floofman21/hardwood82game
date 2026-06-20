import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDraftStore } from '../game/state/draftStore';
import { useMetaStore } from '../game/state/metaStore';
import { StatBars } from '../components/StatBars';
import { PlayerCard } from '../components/PlayerCard';
import { colors, space, radius, statLabels } from '../theme/tokens';
import { STATS } from '../game/data/types';
import { LINEUP_SLOTS } from '../game/rules/decades';
import { social } from '../services/social';

export default function Results() {
  const { result, roster, mode, reset, startGame } = useDraftStore();
  const recordGame = useMetaStore((s) => s.recordGame);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (!result || recordedRef.current) return;
    recordedRef.current = true;
    const lineup = LINEUP_SLOTS.map((p) => roster[p]).filter((p) => p !== null);
    const summary = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      playedAt: Date.now(),
      mode,
      wins: result.wins,
      losses: result.losses,
      rosterIds: lineup.map((p) => p!.id),
    };
    recordGame(summary);
    void social.submitScore(summary);
  }, [result]);

  if (!result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.dim}>No result yet.</Text>
          <Pressable onPress={() => router.replace('/')}>
            <Text style={styles.link}>Back to home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const perfect = result.perfect;
  // weakest category becomes "your wall"
  let weak = STATS[0];
  for (const c of STATS) if (result.categories[c].normalized < result.categories[weak].normalized) weak = c;
  const weakPct = Math.round(result.categories[weak].normalized * 100);

  const playAgain = () => {
    reset();
    startGame(mode);
    router.replace('/draft');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>{perfect ? 'PERFECT SEASON' : 'FINAL RECORD'}</Text>
        <Text style={[styles.record, perfect && { color: colors.perfect }]}>
          {result.wins}<Text style={styles.dash}>–</Text>{result.losses}
        </Text>

        {perfect ? (
          <Text style={styles.verdict}>
            82–0. Flawless. You built a roster with no weaknesses to exploit.
          </Text>
        ) : (
          <Text style={styles.verdict}>
            Your wall was <Text style={{ color: colors.bad, fontWeight: '800' }}>{statLabels[weak]}</Text>
            {' '}at {weakPct}%. Shore up the weak category to push toward 82–0.
          </Text>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category strength</Text>
          <StatBars result={result} />
        </View>

        <Text style={styles.cardTitle}>Your lineup</Text>
        <View style={styles.lineup}>
          {LINEUP_SLOTS.map((slot) => {
            const p = roster[slot];
            if (!p) return null;
            return (
              <View key={slot} style={styles.lineupRow}>
                <Text style={styles.slotTag}>{slot}</Text>
                <View style={{ flex: 1 }}>
                  <PlayerCard player={p} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={playAgain} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
            <Text style={styles.primaryTxt}>Play again</Text>
          </Pressable>
          <Pressable onPress={() => { reset(); router.replace('/'); }} style={styles.secondary}>
            <Text style={styles.secondaryTxt}>Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space.lg, gap: space.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  dim: { color: colors.textDim },
  link: { color: colors.accent, fontWeight: '700' },
  kicker: {
    color: colors.textFaint, fontWeight: '700', letterSpacing: 2, fontSize: 12,
    textAlign: 'center', marginTop: space.md,
  },
  record: { color: colors.accent, fontSize: 72, fontWeight: '800', textAlign: 'center', letterSpacing: -2 },
  dash: { color: colors.textDim },
  verdict: { color: colors.text, fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: space.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: space.lg, gap: space.md, marginTop: space.sm,
  },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  lineup: { gap: space.sm },
  lineupRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  slotTag: { width: 26, color: colors.textFaint, fontWeight: '800', fontSize: 12 },
  actions: { gap: space.sm, marginTop: space.md },
  primary: { backgroundColor: colors.accent, borderRadius: radius.lg, paddingVertical: space.lg, alignItems: 'center' },
  primaryTxt: { color: colors.bg, fontWeight: '800', fontSize: 16 },
  secondary: { paddingVertical: space.md, alignItems: 'center' },
  secondaryTxt: { color: colors.textDim, fontWeight: '700', fontSize: 15 },
});

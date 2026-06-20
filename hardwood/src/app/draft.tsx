import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDraftStore } from '../game/state/draftStore';
import { SlotMachine } from '../components/SlotMachine';
import { RosterStrip } from '../components/RosterStrip';
import { SkipButtons } from '../components/SkipButtons';
import { PlayerCard } from '../components/PlayerCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, space, radius } from '../theme/tokens';

export default function Draft() {
  const s = useDraftStore();
  const {
    status, currentSpin, choices, roster, skips, pendingPlayer, mode,
  } = s;

  const [cycleToken, setCycleToken] = useState(0);
  const [reeling, setReeling] = useState(false);
  const spinIdRef = useRef<string | undefined>(undefined);

  // No active game -> bounce home.
  useEffect(() => {
    if (status === 'idle') router.replace('/');
  }, [status]);

  // After an assignment the store enters 'spinning'; kick off the next spin.
  useEffect(() => {
    if (status === 'spinning') s.spin();
  }, [status]);

  // Each new spin result drives a reel animation.
  useEffect(() => {
    if (!currentSpin) return;
    const id = `${currentSpin.team}|${currentSpin.decade}|${s.taken.length}`;
    if (spinIdRef.current === id) return;
    spinIdRef.current = id;
    setReeling(true);
    setCycleToken((t) => t + 1);
  }, [currentSpin]);

  // Lineup full -> results.
  useEffect(() => {
    if (status === 'complete') router.replace('/results');
  }, [status]);

  const round = s.filledCount() + 1;
  const open = s.openSlots();
  const assignSlots = pendingPlayer ? s.assignableSlots(pendingPlayer) : open;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={`Round ${Math.min(round, 5)} of 5`} />

      <View style={styles.rosterBox}>
        <RosterStrip roster={roster} highlight={pendingPlayer ? assignSlots : undefined} />
      </View>

      <View style={styles.reelBox}>
        <SlotMachine
          pair={currentSpin}
          cycleToken={cycleToken}
          onLocked={() => setReeling(false)}
        />
        <View style={styles.skipBox}>
          <SkipButtons
            skips={skips}
            onTeamSkip={s.useTeamSkip}
            onDecadeSkip={s.useDecadeSkip}
            disabled={reeling || status === 'assigning'}
          />
        </View>
      </View>

      <View style={styles.panel}>
        {reeling ? (
          <View style={styles.center}>
            <Text style={styles.dim}>Spinning…</Text>
          </View>
        ) : status === 'assigning' && pendingPlayer ? (
          <View style={styles.assign}>
            <Text style={styles.assignTitle}>Assign {pendingPlayer.name}</Text>
            <Text style={styles.dim}>Choose an open position</Text>
            <View style={styles.slotRow}>
              {assignSlots.map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => s.assignSlot(slot)}
                  style={({ pressed }) => [styles.slotBtn, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.slotBtnTxt}>{slot}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.pickTitle}>
              Pick your {currentSpin?.team} · {currentSpin?.decade} player
            </Text>
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {choices.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  hideStats={mode === 'hoopiq'}
                  onPress={() => s.selectPlayer(p)}
                />
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  rosterBox: { paddingHorizontal: space.lg, paddingBottom: space.md },
  reelBox: { paddingHorizontal: space.lg, gap: space.md },
  skipBox: {},
  panel: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dim: { color: colors.textDim, fontSize: 14 },
  pickTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: space.md },
  list: { gap: space.sm, paddingBottom: space.xl },
  assign: { gap: space.sm, paddingTop: space.sm },
  assignTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
  slotRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md, flexWrap: 'wrap' },
  slotBtn: {
    width: 58, height: 58, borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  slotBtnTxt: { color: colors.accent, fontWeight: '800', fontSize: 17 },
});

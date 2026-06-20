import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDraftStore, type GameMode } from '../game/state/draftStore';
import { useMetaStore } from '../game/state/metaStore';
import { colors, space, radius, type } from '../theme/tokens';

export default function Home() {
  const [mode, setMode] = useState<GameMode>('classic');
  const startGame = useDraftStore((s) => s.startGame);
  const best = useMetaStore((s) => s.best);

  const play = () => {
    startGame(mode);
    router.push('/draft');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Text style={styles.brand}>HARDWOOD</Text>
        <Text style={styles.tagline}>Draft five all-time greats. Chase 82–0.</Text>
      </View>

      {best && (
        <View style={styles.bestCard}>
          <Text style={styles.bestLabel}>YOUR BEST</Text>
          <Text style={styles.bestRecord}>
            {best.wins}<Text style={styles.bestDash}>–</Text>{best.losses}
          </Text>
        </View>
      )}

      <View style={styles.modeWrap}>
        <Text style={styles.modeHeading}>MODE</Text>
        <ModeRow
          title="Classic"
          sub="Stats visible while you draft"
          active={mode === 'classic'}
          onPress={() => setMode('classic')}
        />
        <ModeRow
          title="HoopIQ"
          sub="Stats hidden — draft on knowledge alone"
          active={mode === 'hoopiq'}
          onPress={() => setMode('hoopiq')}
        />
      </View>

      <View style={styles.bottom}>
        <Pressable onPress={play} style={({ pressed }) => [styles.play, pressed && { opacity: 0.9 }]}>
          <Text style={styles.playTxt}>Start drafting</Text>
        </Pressable>
        <View style={styles.links}>
          <Link label="How to play" onPress={() => router.push('/how-to-play')} />
          <Link label="History" onPress={() => router.push('/history')} />
          <Link label="Settings" onPress={() => router.push('/settings')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ModeRow({ title, sub, active, onPress }: { title: string; sub: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeRow, active && styles.modeActive]}>
      <View style={styles.radio}>{active && <View style={styles.radioDot} />}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.modeTitle}>{title}</Text>
        <Text style={styles.modeSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.lg },
  top: { marginTop: space.xxl, marginBottom: space.xl },
  brand: { ...type.display, color: colors.text, letterSpacing: 2 },
  tagline: { color: colors.textDim, fontSize: 15, marginTop: space.sm },
  bestCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: space.lg, marginBottom: space.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bestLabel: { color: colors.textFaint, fontWeight: '700', letterSpacing: 1.5, fontSize: 12 },
  bestRecord: { color: colors.accent, fontSize: 30, fontWeight: '800' },
  bestDash: { color: colors.textDim },
  modeWrap: { gap: space.sm },
  modeHeading: { color: colors.textFaint, fontWeight: '700', letterSpacing: 1.5, fontSize: 12, marginBottom: 4 },
  modeRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  modeActive: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.accent },
  modeTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  modeSub: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  bottom: { marginTop: 'auto', marginBottom: space.lg, gap: space.lg },
  play: {
    backgroundColor: colors.accent, borderRadius: radius.lg,
    paddingVertical: space.lg, alignItems: 'center',
  },
  playTxt: { color: colors.bg, fontWeight: '800', fontSize: 17 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: space.xl },
  link: { color: colors.textDim, fontWeight: '600', fontSize: 14 },
});

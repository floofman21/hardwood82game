import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet, LayoutChangeEvent } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDraftStore, type GameMode } from '../game/state/draftStore';
import { useMetaStore } from '../game/state/metaStore';
import { BrandWordmark } from '../components/BrandWordmark';
import { rosterIdentity } from '../game/data/rosterMeta';
import { colors, space, radius, font } from '../theme/tokens';

export default function Home() {
  const [mode, setMode] = useState<GameMode>('classic');
  const startGame = useDraftStore((s) => s.startGame);
  const best = useMetaStore((s) => s.best);
  const haptics = useMetaStore((s) => s.settings.haptics);

  const play = () => {
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGame(mode);
    router.push('/draft');
  };

  const bestMeta = best ? rosterIdentity(best.rosterIds) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.eyebrow}>
          <Text style={styles.eyebrowTxt}>ALL-TIME DRAFT</Text>
        </View>
        <BrandWordmark size={54} />
        <Text style={styles.tagline}>Spin a team and era. Draft five legends. Run the table — 82 and 0.</Text>
      </View>

      {best && (
        <LinearGradient
          colors={[colors.surfaceGradA, colors.surfaceGradB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bestCard}
        >
          <View style={styles.bestLeft}>
            <Text style={styles.bestLabel}>PERSONAL BEST</Text>
            <Text style={styles.bestRecord} numberOfLines={1}>
              {best.wins}<Text style={styles.bestDash}>–</Text>{best.losses}
            </Text>
          </View>
          {bestMeta?.team && (
            <Text style={styles.bestMeta}>
              {bestMeta.team}{bestMeta.decade ? `\n${bestMeta.decade}` : ''}
            </Text>
          )}
        </LinearGradient>
      )}

      <ModeToggle mode={mode} onChange={(m) => { if (haptics && m !== mode) void Haptics.selectionAsync(); setMode(m); }} />

      <View style={styles.bottom}>
        <Pressable onPress={play} style={({ pressed }) => [styles.play, pressed && { opacity: 0.9 }]}>
          <Text style={styles.playTxt}>START DRAFTING</Text>
        </Pressable>
        <View style={styles.links}>
          <Link label="How to play" onPress={() => router.push('/how-to-play')} />
          <Text style={styles.linkDot}>·</Text>
          <Link label="History" onPress={() => router.push('/history')} />
          <Text style={styles.linkDot}>·</Text>
          <Link label="Settings" onPress={() => router.push('/settings')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ModeToggle({ mode, onChange }: { mode: GameMode; onChange: (m: GameMode) => void }) {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const index = mode === 'classic' ? 0 : 1;

  useEffect(() => {
    Animated.timing(x, {
      toValue: index,
      duration: 320,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [index, x]);

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const segW = w > 0 ? (w - 10) / 2 : 0; // container padding 5 each side

  return (
    <View style={styles.toggle} onLayout={onLayout}>
      {w > 0 && (
        <Animated.View
          style={[
            styles.togglePill,
            { width: segW, transform: [{ translateX: Animated.multiply(x, segW) }] },
          ]}
        />
      )}
      <Segment title="CLASSIC" sub="Stats shown" active={index === 0} onPress={() => onChange('classic')} />
      <Segment title="SCOUT'S EYE" sub="Stats hidden" active={index === 1} onPress={() => onChange('scoutseye')} />
    </View>
  );
}

function Segment({ title, sub, active, onPress }: { title: string; sub: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.segment} onPress={onPress}>
      <Text style={[styles.segTitle, { color: active ? colors.onAmber : colors.textDim }]}>{title}</Text>
      <Text style={[styles.segSub, { color: active ? 'rgba(11,13,18,0.7)' : colors.textFaint }]}>{sub}</Text>
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
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl },
  top: { marginTop: space.xxl, marginBottom: space.xl, gap: space.md },
  eyebrow: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: 5, paddingHorizontal: 9, paddingVertical: 5 },
  eyebrowTxt: { fontFamily: font.xb, color: colors.onAmber, fontSize: 11, letterSpacing: 1.6, fontWeight: '800' },
  tagline: { fontFamily: font.r, color: colors.textDim, fontSize: 15, maxWidth: 250, lineHeight: 21 },

  bestCard: {
    borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(91,157,240,0.22)',
    padding: 20, marginBottom: space.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bestLeft: { flexShrink: 1 },
  bestLabel: { fontFamily: font.xb, color: colors.secondary, fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  bestRecord: { fontFamily: font.display, color: colors.text, fontSize: 58, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  bestDash: { color: colors.secondary },
  bestMeta: { fontFamily: font.sb, color: colors.textDim, fontSize: 12, textAlign: 'right', fontWeight: '600' },

  toggle: {
    flexDirection: 'row', backgroundColor: '#12161e', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 5,
  },
  togglePill: { position: 'absolute', top: 5, bottom: 5, left: 5, backgroundColor: colors.accent, borderRadius: 10 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  segTitle: { fontFamily: font.xb, fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
  segSub: { fontFamily: font.m, fontSize: 10 },

  bottom: { marginTop: 'auto', marginBottom: space.lg, gap: space.lg },
  play: { backgroundColor: colors.accent, borderRadius: radius.btn, paddingVertical: 19, alignItems: 'center' },
  playTxt: { fontFamily: font.xb, color: colors.onAmber, fontSize: 19, fontWeight: '800', letterSpacing: 0.95 },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.lg },
  link: { fontFamily: font.sb, color: colors.textDim, fontWeight: '600', fontSize: 14 },
  linkDot: { color: colors.textFaint },
});

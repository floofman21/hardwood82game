import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useDraftStore, type GameMode } from '../game/state/draftStore';
import { useMetaStore } from '../game/state/metaStore';
import { BrandWordmark } from '../components/BrandWordmark';
import { Trophy } from '../components/Trophy';
import { colors, space, radius, font } from '../theme/tokens';

export default function Home() {
  const [mode, setMode] = useState<GameMode>('classic');
  const startGame = useDraftStore((s) => s.startGame);
  const best = useMetaStore((s) => s.best);
  const history = useMetaStore((s) => s.history);
  const haptics = useMetaStore((s) => s.settings.haptics);

  // Margin of the best record over the next-best game (honest "+N" lead).
  const wins = history.map((g) => g.wins).sort((a, b) => b - a);
  const delta = wins.length >= 2 ? wins[0] - wins[1] : 0;

  const play = () => {
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGame(mode);
    router.push('/draft');
  };

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
          colors={['#1a2740', '#10141d']}
          locations={[0, 0.6]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bestCard}
        >
          {/* diagonal sheen */}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']}
            locations={[0.38, 0.47, 0.56]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bestLabelRow}>
            <Trophy size={14} color={colors.accent} strokeWidth={1.6} />
            <Text style={styles.bestLabel}>PERSONAL BEST</Text>
          </View>
          <View style={styles.bestBottom}>
            <Text style={styles.bestRecord} numberOfLines={1}>
              {best.wins}<Text style={styles.bestDash}>–</Text>{best.losses}
            </Text>
            {delta > 0 && (
              <View style={styles.deltaRow}>
                <TrendUp />
                <Text style={styles.deltaTxt}>+{delta}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      )}

      <Pressable onPress={() => router.push('/rafters')} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
        <LinearGradient colors={['#1c160a', '#13110b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rafters}>
          <LinearGradient colors={['#e9b53c', '#fff3c4', '#d8a634']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.raftersIcon}>
            <Trophy size={20} color="#15110a" />
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.raftersTitle}>THE RAFTERS</Text>
            <Text style={styles.raftersSub}>Your top 5 all-time lineups</Text>
          </View>
          <Text style={styles.raftersChev}>›</Text>
        </LinearGradient>
      </Pressable>

      <ModeToggle mode={mode} onChange={(m) => { if (haptics && m !== mode) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode(m); }} />

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
  const index = mode === 'classic' ? 0 : 1;
  // Pill slide runs on the native driver (transform); the label color crossfade
  // must run on the JS driver (color isn't native-animatable). Two values, two
  // durations — exactly the motion-study spec.
  const pillX = useRef(new Animated.Value(index)).current;
  const fade = useRef(new Animated.Value(index)).current;
  const reduce = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { reduce.current = !!v; });
  }, []);

  useEffect(() => {
    Animated.timing(pillX, {
      toValue: index,
      duration: reduce.current ? 0 : 320,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    Animated.timing(fade, {
      toValue: index,
      duration: reduce.current ? 0 : 180,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [index, pillX, fade]);

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const segW = w > 0 ? (w - 10) / 2 : 0; // container padding 5 each side

  return (
    <View style={styles.toggle} onLayout={onLayout}>
      {w > 0 && (
        <Animated.View
          style={[
            styles.togglePill,
            { width: segW, transform: [{ translateX: Animated.multiply(pillX, segW) }] },
          ]}
        />
      )}
      <Segment seg={0} fade={fade} title="CLASSIC" sub="Stats shown" onPress={() => onChange('classic')} />
      <Segment seg={1} fade={fade} title="SCOUT'S EYE" sub="Stats hidden" onPress={() => onChange('scoutseye')} />
    </View>
  );
}

function Segment({
  seg, fade, title, sub, onPress,
}: {
  seg: 0 | 1; fade: Animated.Value; title: string; sub: string; onPress: () => void;
}) {
  // active = on amber (#0B0D12), inactive = #8B93A3; subs crossfade in step.
  const titleColor = fade.interpolate({
    inputRange: [0, 1],
    outputRange: seg === 0 ? [colors.onAmber, colors.textDim] : [colors.textDim, colors.onAmber],
  });
  const subColor = fade.interpolate({
    inputRange: [0, 1],
    outputRange: seg === 0 ? ['rgba(11,13,18,0.7)', colors.textFaint] : [colors.textFaint, 'rgba(11,13,18,0.7)'],
  });
  return (
    <Pressable style={styles.segment} onPress={onPress}>
      <Animated.Text style={[styles.segTitle, { color: titleColor }]}>{title}</Animated.Text>
      <Animated.Text style={[styles.segSub, { color: subColor }]}>{sub}</Animated.Text>
    </Pressable>
  );
}

function TrendUp() {
  return (
    <Svg viewBox="0 0 24 24" width={11} height={11}>
      <Path d="M3 17l6-6 4 4 8-8" fill="none" stroke={colors.win} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 7h5v5" fill="none" stroke={colors.win} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
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
  tagline: { fontFamily: font.r, color: '#FFFFFF', fontSize: 15, maxWidth: 250, lineHeight: 21 },

  bestCard: {
    borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(244,162,59,0.3)',
    padding: 20, marginBottom: space.xl, overflow: 'hidden',
  },
  bestLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  bestLabel: { fontFamily: font.xb, color: colors.accent, fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  bestBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 14 },
  bestRecord: {
    fontFamily: font.display, color: colors.text, fontSize: 60, fontWeight: '800', letterSpacing: -1,
    textShadowColor: 'rgba(244,162,59,0.45)', textShadowRadius: 24, textShadowOffset: { width: 0, height: 0 },
  },
  bestDash: { color: colors.secondary },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingBottom: 9 },
  deltaTxt: { fontFamily: font.xb, color: colors.win, fontSize: 12, fontWeight: '800' },

  rafters: {
    flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1,
    borderColor: 'rgba(233,181,60,0.4)', marginBottom: space.xl,
  },
  raftersIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  raftersTitle: { fontFamily: font.display, color: colors.text, fontSize: 20, fontWeight: '800' },
  raftersSub: { fontFamily: font.m, color: '#E9B53C', fontSize: 11, marginTop: 3 },
  raftersChev: { color: colors.textDim, fontSize: 18, fontWeight: '700' },

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

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDraftStore } from '../game/state/draftStore';
import { colors, space, radius, font } from '../theme/tokens';
import { LINEUP_SLOTS } from '../game/rules/decades';

const SIM_MS = 4500;

export default function Simulating() {
  const { result, roster } = useDraftStore();
  const anim = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(false);
  const [counts, setCounts] = useState({ w: 0, l: 0, g: 0 });
  const [flash, setFlash] = useState(false);

  const finalWins = result?.wins ?? 0;
  const finalLosses = result?.losses ?? 0;

  const goResults = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    router.replace('/results');
  };

  useEffect(() => {
    if (!result) { router.replace('/'); return; }

    const id = anim.addListener(({ value }) => {
      const g = Math.round(value * 82);
      const w = Math.round(value * finalWins);
      const l = Math.round(value * finalLosses);
      setCounts((prev) => (prev.w === w && prev.l === l && prev.g === g ? prev : { w, l, g }));
    });
    Animated.timing(anim, { toValue: 1, duration: SIM_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      .start(({ finished }) => { if (finished) goResults(); });

    const beat = setInterval(() => setFlash((f) => !f), 320);
    return () => { anim.removeListener(id); clearInterval(beat); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) return null;

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(62,201,138,0.12)', 'rgba(62,201,138,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glow}
      />
      <View style={styles.body}>
        <View style={styles.liveRow}>
          <View style={[styles.liveDot, { opacity: flash ? 1 : 0.3 }]} />
          <Text style={styles.liveTxt}>RUNNING THE SEASON</Text>
        </View>

        <Text style={styles.gameTxt}>
          Game <Text style={styles.gameNum}>{counts.g}</Text> of 82
        </Text>

        <Text style={styles.record} numberOfLines={1} adjustsFontSizeToFit>
          <Text style={{ color: colors.win }}>{counts.w}</Text>
          <Text style={{ color: colors.reelInactive }}>–</Text>
          <Text style={{ color: colors.bad }}>{counts.l}</Text>
        </Text>

        <View style={styles.tags}>
          <View style={styles.tag}>
            <View style={[styles.tagDot, { backgroundColor: colors.win }]} />
            <Text style={[styles.tagTxt, { color: colors.win }]}>WINS</Text>
          </View>
          <View style={styles.flashBox}>
            <Text style={[styles.flashLetter, { color: flash ? colors.win : colors.bad }]}>
              {flash ? 'W' : 'L'}
            </Text>
          </View>
          <View style={styles.tag}>
            <View style={[styles.tagDot, { backgroundColor: colors.bad }]} />
            <Text style={[styles.tagTxt, { color: colors.bad }]}>LOSSES</Text>
          </View>
        </View>

        <View style={styles.barWrap}>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>TIP-OFF</Text>
            <Text style={styles.barLabel}>82 GAMES</Text>
          </View>
        </View>

        <View style={styles.chips}>
          {LINEUP_SLOTS.map((slot) => {
            const p = roster[slot];
            return (
              <View key={slot} style={styles.chip}>
                <Text style={styles.chipPos}>{slot}</Text>
                <Text style={styles.chipName} numberOfLines={1}>
                  {p ? p.name.split(' ').slice(-1)[0] : '—'}
                </Text>
              </View>
            );
          })}
        </View>

        <Pressable onPress={goResults} hitSlop={10} style={styles.skip}>
          <Text style={styles.skipTxt}>Skip simulation</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  body: { flex: 1, paddingHorizontal: 26, paddingBottom: space.xl },

  liveRow: { marginTop: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.win },
  liveTxt: { fontFamily: font.xb, color: colors.textDim, fontSize: 11, letterSpacing: 2.8, fontWeight: '800' },

  gameTxt: { marginTop: 30, textAlign: 'center', fontFamily: font.b, color: colors.textFaint, fontSize: 13, fontWeight: '700' },
  gameNum: { fontFamily: font.xb, color: colors.textMid, fontWeight: '800' },

  record: { marginTop: 14, textAlign: 'center', fontFamily: font.display, fontSize: 120, fontWeight: '800', letterSpacing: -2 },

  tags: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  tagDot: { width: 7, height: 7, borderRadius: 4 },
  tagTxt: { fontFamily: font.xb, fontSize: 12, letterSpacing: 1.6, fontWeight: '800' },
  flashBox: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  flashLetter: { fontFamily: font.display, fontSize: 28, fontWeight: '800' },

  barWrap: { marginTop: 40 },
  barTrack: { height: 12, borderRadius: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 7, backgroundColor: colors.win },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  barLabel: { fontFamily: font.b, color: colors.textFaint, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },

  chips: { marginTop: 34, flexDirection: 'row', gap: 6 },
  chip: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: radius.chip, paddingVertical: 9 },
  chipPos: { fontFamily: font.xb, color: colors.textFaint, fontSize: 9, fontWeight: '800' },
  chipName: { fontFamily: font.b, color: colors.textMid, fontSize: 10, marginTop: 4, fontWeight: '700' },

  skip: { marginTop: 'auto', paddingTop: 18, alignItems: 'center' },
  skipTxt: { fontFamily: font.sb, color: colors.textFaint, fontSize: 13, fontWeight: '600' },
});

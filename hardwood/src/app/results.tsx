import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Share, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDraftStore } from '../game/state/draftStore';
import { useMetaStore } from '../game/state/metaStore';
import { SegmentMeter } from '../components/SegmentMeter';
import { colors, space, radius, font, categoryNames } from '../theme/tokens';
import { STATS, type Stat } from '../game/data/types';
import { LINEUP_SLOTS } from '../game/rules/decades';

export default function Results() {
  const { result, roster, mode, reset, startGame } = useDraftStore();
  const recordGame = useMetaStore((s) => s.recordGame);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (!result || recordedRef.current) return;
    recordedRef.current = true;
    const lineup = LINEUP_SLOTS.map((p) => roster[p]).filter((p) => p !== null);
    recordGame({
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      playedAt: Date.now(),
      mode,
      wins: result.wins,
      losses: result.losses,
      rosterIds: lineup.map((p) => p!.id),
    });
  }, [result]);

  if (!result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.dim}>No result yet.</Text>
          <Pressable onPress={() => router.replace('/')}><Text style={styles.link}>Back to home</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const perfect = result.perfect;
  // weakest category (lowest normalized) -> "the wall"
  let weak: Stat = STATS[0];
  for (const c of STATS) if (result.categories[c].normalized < result.categories[weak].normalized) weak = c;

  const playAgain = () => { reset(); startGame(mode); router.replace('/draft'); };
  const onShare = () => {
    void Share.share({
      message: `HoopLore — I went ${result.wins}–${result.losses}${perfect ? ' (PERFECT SEASON 🏆)' : ''}. Can you run the table?`,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient
        pointerEvents="none"
        colors={[perfect ? colors.glowGreen : colors.glowAmber, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.glow}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Badge */}
        {perfect ? (
          <View style={styles.badgeWin}><Text style={styles.badgeWinTxt}>PERFECT SEASON</Text></View>
        ) : (
          <View style={styles.badgeOutline}><Text style={styles.badgeOutlineTxt}>SEASON PROJECTION</Text></View>
        )}

        {/* Hero record */}
        <Text style={[styles.record, perfect ? styles.recordWin : styles.recordShort]}>
          {result.wins}<Text style={{ color: perfect ? colors.win : colors.accent }}>–</Text>{result.losses}
        </Text>
        <Text style={styles.subtitle}>
          {perfect ? 'NO WEAK CATEGORY. THEY RAN THE TABLE.' : 'TITLE CONTENDER — NOT YET IMMORTAL.'}
        </Text>

        {/* Weakness callout (fell short only) */}
        {!perfect && (
          <View style={styles.callout}>
            <View style={styles.calloutDot} />
            <Text style={styles.calloutTxt}>
              <Text style={styles.calloutWord}>{categoryNames[weak]}</Text> were the wall — {result.losses} game{result.losses === 1 ? '' : 's'} slipped away there.
            </Text>
          </View>
        )}

        {/* Category gauges */}
        <Text style={styles.sectionLabel}>TEAM CATEGORIES{perfect ? ' — ALL MAXED' : ''}</Text>
        <View style={styles.gauges}>
          {STATS.map((c) => {
            const n = result.categories[c].normalized;
            const filled = perfect ? 12 : Math.max(1, Math.min(12, Math.round(n * 12)));
            const isWeak = !perfect && c === weak;
            const color = perfect ? colors.win : isWeak ? colors.bad : colors.accent;
            return (
              <View key={c} style={styles.gaugeRow}>
                <Text style={[styles.gaugeLabel, isWeak && { color: colors.bad }]}>{categoryNames[c]}</Text>
                <SegmentMeter filled={filled} color={color} />
              </View>
            );
          })}
        </View>

        {/* Roster row */}
        <View style={styles.rosterRow}>
          {LINEUP_SLOTS.map((slot) => {
            const p = roster[slot];
            if (!p) return null;
            return (
              <View key={slot} style={[styles.rosterChip, perfect ? styles.rosterChipWin : styles.rosterChipNeutral]}>
                <Text style={styles.rosterPos}>{slot}</Text>
                <Text style={styles.rosterName} numberOfLines={1}>{p.name.split(' ').slice(-1)[0]}</Text>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable onPress={onShare} style={({ pressed }) => [styles.share, pressed && { opacity: 0.85 }]}>
            <Text style={styles.shareTxt}>Share</Text>
          </Pressable>
          <Pressable
            onPress={playAgain}
            style={({ pressed }) => [styles.again, { backgroundColor: perfect ? colors.win : colors.accent }, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.againTxt, { color: perfect ? colors.onGreen : colors.onAmber }]}>DRAFT AGAIN</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => { reset(); router.replace('/'); }} style={styles.homeBtn}>
          <Text style={styles.homeTxt}>Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xl, gap: space.md, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  dim: { fontFamily: font.m, color: colors.textDim },
  link: { fontFamily: font.b, color: colors.accent, fontWeight: '700' },

  badgeWin: { backgroundColor: colors.win, borderRadius: radius.badge, paddingHorizontal: 12, paddingVertical: 6, marginTop: space.sm },
  badgeWinTxt: { fontFamily: font.xb, color: colors.onAmber, fontSize: 11, letterSpacing: 2.2, fontWeight: '800' },
  badgeOutline: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: radius.badge, paddingHorizontal: 12, paddingVertical: 6, marginTop: space.sm },
  badgeOutlineTxt: { fontFamily: font.xb, color: colors.textDim, fontSize: 11, letterSpacing: 2.2, fontWeight: '800' },

  record: { fontFamily: font.display, fontSize: 110, fontWeight: '800', letterSpacing: -2, lineHeight: 118 },
  recordWin: { color: colors.win, textShadowColor: 'rgba(63,201,138,0.4)', textShadowRadius: 40, textShadowOffset: { width: 0, height: 0 } },
  recordShort: { color: colors.text },
  subtitle: { fontFamily: font.sb, color: colors.textDim, fontSize: 15, letterSpacing: 0.8, textAlign: 'center', fontWeight: '600' },

  callout: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1d1311', borderWidth: 1, borderColor: 'rgba(226,96,63,0.4)', borderRadius: radius.panel, paddingVertical: 13, paddingHorizontal: 16, marginTop: space.sm },
  calloutDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bad },
  calloutTxt: { flex: 1, fontFamily: font.m, color: '#d8a99a', fontSize: 13, lineHeight: 19 },
  calloutWord: { fontFamily: font.b, color: colors.bad, fontWeight: '700' },

  sectionLabel: { alignSelf: 'flex-start', fontFamily: font.xb, color: colors.textFaint, fontSize: 11, letterSpacing: 1.8, fontWeight: '800', marginTop: space.md },
  gauges: { alignSelf: 'stretch', gap: space.sm },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  gaugeLabel: { width: 78, fontFamily: font.sb, color: colors.textMid, fontSize: 12, fontWeight: '600' },

  rosterRow: { flexDirection: 'row', gap: 6, alignSelf: 'stretch', marginTop: space.md },
  rosterChip: { flex: 1, borderRadius: radius.chip, borderWidth: 1, paddingVertical: 8, alignItems: 'center', gap: 2, backgroundColor: colors.surface },
  rosterChipWin: { borderColor: 'rgba(63,201,138,0.25)' },
  rosterChipNeutral: { borderColor: colors.border },
  rosterPos: { fontFamily: font.xb, color: colors.textFaint, fontSize: 9, fontWeight: '800' },
  rosterName: { fontFamily: font.b, color: colors.textMid, fontSize: 10, fontWeight: '700' },

  actions: { flexDirection: 'row', gap: space.md, alignSelf: 'stretch', marginTop: space.lg },
  share: { paddingHorizontal: 22, borderRadius: radius.btn, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  shareTxt: { fontFamily: font.sb, color: colors.textDim, fontSize: 14, fontWeight: '600' },
  again: { flex: 1, borderRadius: radius.btn, paddingVertical: 16, alignItems: 'center' },
  againTxt: { fontFamily: font.xb, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  homeBtn: { paddingVertical: space.md, alignItems: 'center' },
  homeTxt: { fontFamily: font.sb, color: colors.textDim, fontWeight: '600', fontSize: 15 },
});

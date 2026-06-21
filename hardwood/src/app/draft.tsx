import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  NativeSyntheticEvent, NativeScrollEvent, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDraftStore } from '../game/state/draftStore';
import { useMetaStore } from '../game/state/metaStore';
import { SpinReels } from '../components/SpinReels';
import { RosterStrip } from '../components/RosterStrip';
import { CandidateCard } from '../components/CandidateCard';
import { colors, space, radius, font } from '../theme/tokens';

const SIDE = space.xl; // 24
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = Math.min(288, SCREEN_W - SIDE * 2 - 30);
const GAP = 12;

export default function Draft() {
  const s = useDraftStore();
  const { status, currentSpin, choices, roster, skips, pendingPlayer, mode } = s;
  const haptics = useMetaStore((st) => st.settings.haptics);

  const [cycleToken, setCycleToken] = useState(0);
  const [reeling, setReeling] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const spinIdRef = useRef<string | undefined>(undefined);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { if (status === 'idle') router.replace('/'); }, [status]);
  useEffect(() => { if (status === 'spinning') s.spin(); }, [status]);
  useEffect(() => { if (status === 'complete') router.replace('/results'); }, [status]);

  // Each new spin result drives a reel animation + resets the carousel.
  useEffect(() => {
    if (!currentSpin) return;
    const id = `${currentSpin.team}|${currentSpin.decade}|${s.taken.length}`;
    if (spinIdRef.current === id) return;
    spinIdRef.current = id;
    setReeling(true);
    setCardIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
    setCycleToken((t) => t + 1);
  }, [currentSpin]);

  const onLocked = () => {
    setReeling(false);
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const round = Math.min(s.filledCount() + 1, 5);
  const open = s.openSlots();
  const assignSlots = pendingPlayer ? s.assignableSlots(pendingPlayer) : open;
  const candidate = choices[cardIndex];

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + GAP));
    setCardIndex(Math.max(0, Math.min(choices.length - 1, i)));
  };

  const skipCandidate = () => {
    if (choices.length < 2) return;
    const next = (cardIndex + 1) % choices.length;
    setCardIndex(next);
    scrollRef.current?.scrollTo({ x: next * (CARD_W + GAP), animated: true });
  };

  const draftCandidate = () => {
    if (!candidate) return;
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    s.selectPlayer(candidate);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.chev}>
          <Text style={styles.chevTxt}>‹</Text>
        </Pressable>
        <View style={styles.scorebug}>
          <Text style={styles.scorebugTxt}>
            PICK {round} / 5{!pendingPlayer && open.length ? ` · ${open.join('/')}` : ''}
          </Text>
        </View>
        <View style={styles.chev} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SpinReels pair={currentSpin} cycleToken={cycleToken} onLocked={onLocked} />

        {/* Reroll row (limited skips) */}
        <View style={styles.rerollRow}>
          <RerollBtn
            label="REROLL TEAM"
            count={skips.team}
            disabled={reeling || status === 'assigning' || skips.team <= 0}
            onPress={s.useTeamSkip}
          />
          <RerollBtn
            label="REROLL ERA"
            count={skips.decade}
            disabled={reeling || status === 'assigning' || skips.decade <= 0}
            onPress={s.useDecadeSkip}
          />
        </View>

        <View style={styles.rosterBox}>
          <RosterStrip roster={roster} highlight={pendingPlayer ? assignSlots : undefined} />
        </View>

        {reeling ? (
          <View style={styles.center}><Text style={styles.dim}>Spinning…</Text></View>
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
            <View style={styles.captionRow}>
              <Text style={styles.caption}>ELIGIBLE AT {open.join('/')}</Text>
              <Text style={styles.index}>
                <Text style={{ color: colors.accent }}>{String(cardIndex + 1).padStart(2, '0')}</Text>
                <Text style={{ color: colors.reelInactive }}> / {String(choices.length).padStart(2, '0')}</Text>
              </Text>
            </View>

            <View>
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_W + GAP}
                decelerationRate="fast"
                onMomentumScrollEnd={onScrollEnd}
                contentContainerStyle={{ gap: GAP, paddingRight: 46 }}
              >
                {choices.map((p, i) => (
                  <Pressable key={p.id} onPress={() => { setCardIndex(i); scrollRef.current?.scrollTo({ x: i * (CARD_W + GAP), animated: true }); }}>
                    <CandidateCard player={p} width={CARD_W} active={i === cardIndex} hideStats={mode === 'hoopiq'} />
                  </Pressable>
                ))}
              </ScrollView>
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', colors.bg]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fade}
              />
            </View>

            {/* page dots */}
            <View style={styles.dots}>
              {choices.map((_, i) => (
                <View key={i} style={[i === cardIndex ? styles.dotActive : styles.dot]} />
              ))}
              <Text style={styles.swipe}>SWIPE</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action row */}
      {!reeling && status === 'picking' && candidate && (
        <View style={styles.actions}>
          <Pressable onPress={skipCandidate} style={({ pressed }) => [styles.skip, pressed && { opacity: 0.85 }]}>
            <Text style={styles.skipTxt}>Skip</Text>
          </Pressable>
          <Pressable onPress={draftCandidate} style={({ pressed }) => [styles.draft, pressed && { opacity: 0.9 }]}>
            <Text style={styles.draftTxt}>DRAFT {candidate.name.split(' ').slice(-1)[0].toUpperCase()}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function RerollBtn({ label, count, disabled, onPress }: { label: string; count: number; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.reroll, disabled && styles.rerollDisabled, pressed && !disabled && { opacity: 0.85 }]}
    >
      <Text style={[styles.rerollTxt, disabled && { color: colors.textFaint }]}>⟳ {label}</Text>
      <View style={[styles.rerollBadge, disabled && { backgroundColor: colors.textFaint }]}>
        <Text style={styles.rerollBadgeTxt}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE, paddingVertical: space.md },
  chev: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  chevTxt: { color: colors.textDim, fontSize: 22, lineHeight: 24, marginTop: -2 },
  scorebug: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  scorebugTxt: { fontFamily: font.xb, color: colors.secondary, fontSize: 12, letterSpacing: 1.4, fontWeight: '800' },

  body: { paddingHorizontal: SIDE, paddingBottom: space.xl, gap: space.md },

  rerollRow: { flexDirection: 'row', gap: space.md },
  reroll: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: space.md, borderRadius: radius.panel, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  rerollDisabled: { opacity: 0.5 },
  rerollTxt: { fontFamily: font.xb, color: colors.text, fontSize: 11, letterSpacing: 0.8, fontWeight: '800' },
  rerollBadge: { minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  rerollBadgeTxt: { fontFamily: font.xb, color: colors.onAmber, fontSize: 10, fontWeight: '800' },

  rosterBox: { marginTop: 2 },

  center: { paddingVertical: space.xxl, alignItems: 'center' },
  dim: { fontFamily: font.m, color: colors.textDim, fontSize: 14 },

  captionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: space.sm },
  caption: { fontFamily: font.xb, color: colors.textFaint, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  index: { fontFamily: font.xb, fontSize: 12, fontWeight: '800' },

  fade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 46 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2b3340' },
  dotActive: { width: 18, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  swipe: { fontFamily: font.b, color: colors.reelInactive, fontSize: 10, letterSpacing: 1.5, marginLeft: 'auto' },

  assign: { gap: space.sm, paddingTop: space.sm },
  assignTitle: { fontFamily: font.xb, color: colors.text, fontWeight: '800', fontSize: 18 },
  slotRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md, flexWrap: 'wrap' },
  slotBtn: { width: 58, height: 58, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  slotBtnTxt: { fontFamily: font.xb, color: colors.accent, fontWeight: '800', fontSize: 17 },

  actions: { flexDirection: 'row', gap: space.md, paddingHorizontal: SIDE, paddingTop: space.sm, paddingBottom: space.md },
  skip: { paddingHorizontal: 20, borderRadius: radius.btn, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  skipTxt: { fontFamily: font.sb, color: colors.textDim, fontSize: 14, fontWeight: '600' },
  draft: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.btn, paddingVertical: 15, alignItems: 'center' },
  draftTxt: { fontFamily: font.xb, color: colors.onAmber, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});

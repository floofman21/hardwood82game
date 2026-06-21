import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useMetaStore } from '../game/state/metaStore';
import { useDraftStore } from '../game/state/draftStore';
import { Trophy } from '../components/Trophy';
import { topLineups, type RafterEntry } from '../game/data/rosterMeta';
import { colors, space, radius, font } from '../theme/tokens';

const RAFTER_BG = '#06070a';
const GOLD_DARK = '#15110a';
const GOLD_DIM = '#4a3a12';
// Diagonal "championship banner" gold.
const HERO_GOLD = ['#6f4f12', '#e9b53c', '#fff3c4', '#e9b53c', '#9a7423', '#6f4f12'] as const;
const HERO_LOC = [0, 0.22, 0.4, 0.58, 0.82, 1] as const;
const ROW_GOLD = ['#5e430f', '#d8a634', '#f4e29a', '#d8a634', '#7c5d1a'] as const;
const ROW_LOC = [0, 0.24, 0.42, 0.6, 1] as const;

export default function Rafters() {
  const history = useMetaStore((s) => s.history);
  const startGame = useDraftStore((s) => s.startGame);
  const entries = topLineups(history, 5);

  const newDraft = () => { startGame('classic'); router.push('/draft'); };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* arena ceiling glow (soft, top-down) */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(246,212,105,0.16)', 'rgba(246,212,105,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glow}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.chev}>
          <Text style={styles.chevTxt}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.kicker}>HALL OF FAME</Text>
            <Text style={styles.title}>THE RAFTERS</Text>
          </View>
          <Text style={styles.topMeta}>Top 5{'\n'}all-time</Text>
        </View>

        {/* rafter beam + cords */}
        <View style={styles.beamWrap}>
          <View style={styles.beam} />
          <View style={[styles.cord, { left: '18%' }]} />
          <View style={[styles.cord, { left: '50%' }]} />
          <View style={[styles.cord, { left: '82%' }]} />
        </View>

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Trophy size={40} color={colors.accent} strokeWidth={1.4} />
            <Text style={styles.emptyTitle}>No banners yet</Text>
            <Text style={styles.emptySub}>Win games to hang your best lineups in the rafters.</Text>
          </View>
        ) : (
          <>
            <HeroBanner entry={entries[0]} />
            <View style={styles.rows}>
              {entries.slice(1).map((e, i) => (
                <RowBanner key={e.id} rank={i + 2} entry={e} />
              ))}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/history')} style={({ pressed }) => [styles.compare, pressed && { opacity: 0.85 }]}>
            <Text style={styles.compareTxt}>COMPARE</Text>
          </Pressable>
          <Pressable onPress={newDraft} style={({ pressed }) => [pressed && { opacity: 0.9 }, { flex: 1 }]}>
            <LinearGradient colors={['#e9b53c', '#fff3c4', '#d8a634']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.newDraft}>
              <Text style={styles.newDraftTxt}>NEW DRAFT</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroBanner({ entry }: { entry: RafterEntry }) {
  return (
    <LinearGradient colors={HERO_GOLD} locations={HERO_LOC} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.heroRankRow}>
          <Text style={styles.heroRank}>#1</Text>
          {entry.perfect ? (
            <View style={styles.perfectPill}><Text style={styles.perfectPillTxt}>PERFECT 82–0</Text></View>
          ) : (
            <View style={styles.recordPill}><Text style={styles.recordPillTxt}>{entry.wins}–{entry.losses}</Text></View>
          )}
        </View>
        <Trophy size={22} color={GOLD_DARK} />
      </View>
      <Text style={styles.heroName}>{entry.name}</Text>
      <Text style={styles.heroPlayers} numberOfLines={1}>{entry.surnames.join(' · ')}</Text>
    </LinearGradient>
  );
}

function RowBanner({ rank, entry }: { rank: number; entry: RafterEntry }) {
  return (
    <LinearGradient colors={ROW_GOLD} locations={ROW_LOC} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.row}>
      <Text style={styles.rowRank}>#{rank}</Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.rowName} numberOfLines={1}>{entry.name}</Text>
        <Text style={styles.rowPlayers} numberOfLines={1}>{entry.surnames.join(' · ')}</Text>
      </View>
      <Text style={styles.rowRecord}>{entry.wins}<Text style={{ opacity: 0.55 }}>–{entry.losses}</Text></Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: RAFTER_BG },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.sm },
  chev: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  chevTxt: { color: colors.textDim, fontSize: 22, lineHeight: 24, marginTop: -2 },
  scroll: { paddingHorizontal: 22, paddingBottom: space.xl, gap: 0 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  kicker: { fontFamily: font.xb, color: '#E9B53C', fontSize: 10, letterSpacing: 2.6, fontWeight: '800' },
  title: { fontFamily: font.display, color: colors.text, fontSize: 34, lineHeight: 32, fontWeight: '800', marginTop: 5 },
  topMeta: { fontFamily: font.sb, color: colors.textDim, fontSize: 11, textAlign: 'right', fontWeight: '600', paddingBottom: 4 },

  beamWrap: { marginTop: 22, position: 'relative' },
  beam: { height: 9, borderRadius: 3, backgroundColor: '#21242b' },
  cord: { position: 'absolute', top: 9, width: 2, height: 16, backgroundColor: '#9c823f' },

  hero: { marginTop: 13, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18, borderWidth: 2, borderColor: 'rgba(0,0,0,0.55)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroRankRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroRank: { fontFamily: font.display, color: GOLD_DARK, fontSize: 30, fontWeight: '800' },
  perfectPill: { backgroundColor: GOLD_DARK, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  perfectPillTxt: { fontFamily: font.xb, color: '#fff3c4', fontSize: 9, letterSpacing: 1.6, fontWeight: '800' },
  recordPill: { backgroundColor: GOLD_DARK, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  recordPillTxt: { fontFamily: font.xb, color: '#fff3c4', fontSize: 11, fontWeight: '800' },
  heroName: { fontFamily: font.display, color: GOLD_DARK, fontSize: 27, fontWeight: '800', marginTop: 13 },
  heroPlayers: { fontFamily: font.sb, color: GOLD_DIM, fontSize: 12, marginTop: 6, fontWeight: '600' },

  rows: { marginTop: 16, gap: 9 },
  row: { borderRadius: 5, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.5)' },
  rowRank: { fontFamily: font.display, color: GOLD_DARK, fontSize: 26, fontWeight: '800', width: 34 },
  rowName: { fontFamily: font.display, color: GOLD_DARK, fontSize: 19, fontWeight: '800' },
  rowPlayers: { fontFamily: font.sb, color: GOLD_DIM, fontSize: 10, marginTop: 3, fontWeight: '600' },
  rowRecord: { fontFamily: font.display, color: GOLD_DARK, fontSize: 22, fontWeight: '800' },

  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl },
  emptyTitle: { fontFamily: font.display, color: colors.text, fontSize: 22, fontWeight: '800', marginTop: space.sm },
  emptySub: { fontFamily: font.m, color: colors.textDim, fontSize: 14, textAlign: 'center', maxWidth: 240 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  compare: { flex: 1, borderWidth: 1, borderColor: 'rgba(233,181,60,0.45)', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  compareTxt: { fontFamily: font.xb, color: '#E9B53C', fontSize: 14, fontWeight: '800', letterSpacing: 0.6 },
  newDraft: { borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  newDraftTxt: { fontFamily: font.xb, color: GOLD_DARK, fontSize: 14, fontWeight: '800', letterSpacing: 0.6 },
});

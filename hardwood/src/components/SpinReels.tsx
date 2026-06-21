import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, radius, font } from '../theme/tokens';
import { teamLook } from '../theme/cosmetics';
import { PLAYERS } from '../game/data/load';
import { DECADES, type Decade } from '../game/data/types';
import type { SpinPair } from '../game/data/selectors';

const TEAM_POOL = [...new Set(PLAYERS.map((p) => p.team))];

function neighborDecades(d: Decade): [Decade, Decade] {
  const i = DECADES.indexOf(d);
  const above = DECADES[(i - 1 + DECADES.length) % DECADES.length];
  const below = DECADES[(i + 1) % DECADES.length];
  return [above, below];
}

function neighborTeams(team: string): [string, string] {
  const i = Math.max(0, TEAM_POOL.indexOf(team));
  const above = TEAM_POOL[(i - 1 + TEAM_POOL.length) % TEAM_POOL.length];
  const below = TEAM_POOL[(i + 1) % TEAM_POOL.length];
  return [above, below];
}

/**
 * The Arena slot-machine panel: TEAM and ERA reels, each showing three stacked
 * items behind a center payline. The reels flicker while spinning and settle on
 * `pair`. The drawn team's primary color tints the payline (falling back to amber).
 */
export function SpinReels({
  pair,
  cycleToken,
  onLocked,
}: {
  pair: SpinPair | null;
  cycleToken: number;
  onLocked?: () => void;
}) {
  const [display, setDisplay] = useState<SpinPair | null>(pair);
  const [locked, setLocked] = useState(true);
  const lockedRef = useRef(onLocked);
  lockedRef.current = onLocked;

  useEffect(() => {
    if (cycleToken === 0 || !pair) {
      setDisplay(pair);
      return;
    }
    setLocked(false);
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      if (n >= 12) {
        clearInterval(id);
        setDisplay(pair);
        setLocked(true);
        lockedRef.current?.();
      } else {
        setDisplay({
          team: TEAM_POOL[Math.floor(Math.random() * TEAM_POOL.length)],
          decade: DECADES[Math.floor(Math.random() * DECADES.length)],
        });
      }
    }, 55);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleToken]);

  const team = display ? teamLook(display.team) : null;
  const payline = locked && team ? team.primary : colors.accent;
  const [tAbove, tBelow] = display ? neighborTeams(display.team) : ['—', '—'];
  const [dAbove, dBelow] = display ? neighborDecades(display.decade) : ['—' as Decade, '—' as Decade];

  return (
    <LinearGradient
      colors={['#12161e', '#0d1118']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.panel}
    >
      <View style={styles.labels}>
        <Text style={styles.colLabel}>TEAM</Text>
        <Text style={styles.colLabel}>ERA</Text>
      </View>

      <View style={styles.reelRow}>
        <Reel
          above={String(tAbove).toUpperCase()}
          center={display?.team?.toUpperCase() ?? '—'}
          below={String(tBelow).toUpperCase()}
          locked={locked}
          centerColor={colors.text}
        />
        <Reel
          above={String(dAbove)}
          center={display?.decade ?? '—'}
          below={String(dBelow)}
          locked={locked}
          centerColor={colors.accent}
        />
        {/* payline band over the center row */}
        <View pointerEvents="none" style={[styles.payline, { borderColor: payline }]} />
      </View>
    </LinearGradient>
  );
}

function Reel({
  above, center, below, locked, centerColor,
}: {
  above: string; center: string; below: string; locked: boolean; centerColor: string;
}) {
  return (
    <View style={styles.reel}>
      <Text style={styles.dim} numberOfLines={1}>{above}</Text>
      <Text style={[styles.center, { color: centerColor }, !locked && styles.blur]} numberOfLines={1}>
        {center}
      </Text>
      <Text style={styles.dim} numberOfLines={1}>{below}</Text>
    </View>
  );
}

const REEL_H = 148;

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.card, borderWidth: 1, borderColor: colors.border,
    paddingTop: 18, paddingHorizontal: 16, paddingBottom: 20,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 10 },
  colLabel: { fontFamily: font.xb, color: colors.textFaint, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  reelRow: { flexDirection: 'row', gap: 12, height: REEL_H, position: 'relative' },
  reel: {
    flex: 1, backgroundColor: colors.reelWell, borderRadius: radius.panel,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'space-around', paddingVertical: 14,
  },
  dim: { fontFamily: font.display, color: colors.reelInactive, opacity: 0.55, fontSize: 22, fontWeight: '800' },
  center: { fontFamily: font.display, fontSize: 30, fontWeight: '800', letterSpacing: -0.3 },
  blur: { opacity: 0.5 },
  payline: {
    position: 'absolute', left: 0, right: 0, top: REEL_H / 2 - 23, height: 46,
    borderTopWidth: 2, borderBottomWidth: 2,
  },
});

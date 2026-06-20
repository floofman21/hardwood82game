import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, space, radius, decadeColor } from '../theme/tokens';
import { PLAYERS } from '../game/data/load';
import { DECADES } from '../game/data/types';
import type { SpinPair } from '../game/data/selectors';

const TEAM_POOL = [...new Set(PLAYERS.map((p) => p.team))];

/**
 * Visual reel. `cycleToken` changes to trigger a fresh spin animation; when the
 * reel settles it shows `pair` and fires onLocked. Pure flourish — the actual
 * spin result is decided in the store before this animates.
 */
export function SlotMachine({
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

  const accent = display ? decadeColor[display.decade] : colors.border;

  return (
    <View style={[styles.wrap, { borderColor: locked ? accent : colors.border }]}>
      <View style={styles.reel}>
        <Text style={styles.kicker}>TEAM</Text>
        <Text style={[styles.team, !locked && styles.blur]} numberOfLines={1}>
          {display?.team ?? '—'}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.reel}>
        <Text style={styles.kicker}>DECADE</Text>
        <Text style={[styles.decade, { color: accent }, !locked && styles.blur]}>
          {display?.decade ?? '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 2, paddingVertical: space.xl, paddingHorizontal: space.lg,
  },
  reel: { flex: 1, alignItems: 'center', gap: 6 },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: space.sm },
  kicker: { color: colors.textFaint, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  team: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  decade: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  blur: { opacity: 0.55 },
});

import React, { useRef, useState } from 'react';
import { Pressable, Animated, Easing, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, font } from '../theme/tokens';

/**
 * The primary "Draft" action. The tap commits instantly in spirit — the commit
 * is the reward, not a toll gate — but on release a fast amber sweep floods the
 * button and a crisp haptic fires, then onCommit runs. Reduce-motion commits
 * immediately with no animation.
 */
export function DraftButton({
  label,
  onCommit,
  disabled,
  reduced,
  haptics,
}: {
  label: string;
  onCommit: () => void;
  disabled?: boolean;
  reduced: boolean;
  haptics: boolean;
}) {
  const [w, setW] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);

  const press = () => {
    if (disabled || busy.current) return;
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (reduced || w === 0) { onCommit(); return; }
    busy.current = true;
    sweep.setValue(0);
    Animated.parallel([
      Animated.timing(sweep, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.97, duration: 90, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
      ]),
    ]).start(() => {
      busy.current = false;
      sweep.setValue(0);
      scale.setValue(1);
      onCommit();
    });
  };

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={press}
        disabled={disabled}
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
        style={styles.btn}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.sweep, { transform: [{ translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-w, 0] }) }] }]}
        />
        <Text style={styles.txt}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  btn: { backgroundColor: colors.accent, borderRadius: radius.btn, paddingVertical: 15, alignItems: 'center', overflow: 'hidden' },
  sweep: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFE7B8' },
  txt: { fontFamily: font.xb, color: colors.onAmber, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, AccessibilityInfo } from 'react-native';
import { BrandWordmark } from './BrandWordmark';
import { colors, font } from '../theme/tokens';

/**
 * In-app animated loading screen shown while fonts/data initialize. The OS-level
 * static splash (app.json) covers the very first frame; this takes over until the
 * app is ready. Honors reduce-motion by falling back to the static logo + dots.
 */
export function SplashLogo() {
  const dots = [useRef(new Animated.Value(0.22)).current, useRef(new Animated.Value(0.22)).current, useRef(new Animated.Value(0.22)).current];
  const reduceMotion = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.().then((on) => {
      reduceMotion.current = !!on;
      if (cancelled || on) return;
      dots.forEach((d, i) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.delay(i * 180),
            Animated.timing(d, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(d, { toValue: 0.22, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          ]),
        );
        loop.start();
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <View style={styles.center}>
        <Text style={styles.eyebrow}>DRAFT THE ALL-TIME TEAM</Text>
        <BrandWordmark size={56} />
      </View>
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {dots.map((d, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: d, transform: [{ translateY: d.interpolate({ inputRange: [0.22, 1], outputRange: [0, -4] }) }] }]} />
          ))}
        </View>
        <Text style={styles.loading}>LOADING SEASON</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute', width: 400, height: 400, borderRadius: 200,
    backgroundColor: colors.glowAmberSoft, top: '24%',
  },
  center: { alignItems: 'center', gap: 14 },
  eyebrow: { fontFamily: font.xb, color: colors.textFaint, fontSize: 11, letterSpacing: 3.4, fontWeight: '800' },
  bottom: { position: 'absolute', bottom: 92, alignItems: 'center', gap: 12 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  loading: { fontFamily: font.b, color: '#3a4150', fontSize: 10, letterSpacing: 3, fontWeight: '700' },
});

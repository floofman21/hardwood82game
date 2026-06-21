import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet, AccessibilityInfo } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors, font } from '../theme/tokens';

const DUNK_MS = 2800;

// Keyframe timeline for the dunk (fractions of the ball size for translate).
const T  = [0,    0.09, 0.26, 0.42, 0.54, 0.62, 0.74, 0.86, 0.93, 1];
const TX = [0,    0,    0.5,  1.45, 1.45, 1.45, 0.75, 0.05, 0,    0];
const TY = [0,    0,   -0.5,  0.05, 0.5,  0.95,-0.4,  0.16,-0.05, 0];
const ROT= [0,    0,    85,   175,  230,  290,  338,  352,  356,  360];
const SX = [1,    1,    1,    0.92, 0.85, 0.78, 0.9,  1.14, 0.98, 1];
const SY = [1,    1,    1,    0.92, 0.85, 0.78, 0.9,  0.8,  1.02, 1];

/**
 * In-app animated loading screen. The signature animation is "the dunk": the
 * basketball O leaves the wordmark, arcs into the hoop, drops through the rim
 * (which occludes it via separate back/front arcs), rebounds, and settles back
 * into its slot — looping. Honors reduce-motion with a static logo.
 */
export function SplashLogo({ size = 58 }: { size?: number }) {
  const ball = Math.round(size * 0.82);
  const t = useRef(new Animated.Value(0)).current;
  const dots = [useRef(new Animated.Value(0.22)).current, useRef(new Animated.Value(0.22)).current, useRef(new Animated.Value(0.22)).current];
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.().then((on) => {
      if (cancelled) return;
      setReduced(!!on);
      if (on) return;
      Animated.loop(
        Animated.timing(t, { toValue: 1, duration: DUNK_MS, easing: Easing.linear, useNativeDriver: true }),
      ).start();
      dots.forEach((d, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 180),
            Animated.timing(d, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(d, { toValue: 0.22, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          ]),
        ).start();
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const interp = (out: number[]) => t.interpolate({ inputRange: T, outputRange: out });
  const ballStyle = reduced
    ? undefined
    : {
        transform: [
          { translateX: interp(TX.map((v) => v * ball)) },
          { translateY: interp(TY.map((v) => v * ball)) },
          { rotate: interp(ROT).interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
          { scaleX: interp(SX) },
          { scaleY: interp(SY) },
        ],
      };

  const zoneW = ball * 2.1;
  const zoneH = ball * 1.3;
  const ballTop = (zoneH - ball) / 2;
  const hoopLeft = ball * 0.95;
  const letter = { fontFamily: font.display, fontSize: size, color: colors.text };

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />

      <View style={styles.center}>
        <Text style={styles.eyebrow}>DRAFT THE ALL-TIME TEAM</Text>

        <View style={styles.logoRow}>
          <Text style={[styles.letter, letter]}>H</Text>
          <View style={{ width: zoneW, height: zoneH }}>
            {/* back rim + net (behind the ball) */}
            <View style={[styles.abs, { left: hoopLeft, top: ballTop }]}>
              <RimBack size={ball} />
            </View>
            {/* the animated basketball O */}
            <Animated.View style={[styles.abs, { left: 0, top: ballTop }, ballStyle]}>
              <Basketball size={ball} />
            </Animated.View>
            {/* front rim (in front of the ball -> through-the-hoop occlusion) */}
            <View style={[styles.abs, { left: hoopLeft, top: ballTop }]} pointerEvents="none">
              <RimFront size={ball} />
            </View>
          </View>
          <Text style={[styles.letter, letter]}>P</Text>
          <Text style={[styles.letter, letter, { color: colors.accent }]}>LORE</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {dots.map((d, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity: reduced ? 1 : d, transform: [{ translateY: reduced ? 0 : d.interpolate({ inputRange: [0.22, 1], outputRange: [0, -4] }) }] }]}
            />
          ))}
        </View>
        <Text style={styles.loading}>Game Loading</Text>
      </View>
    </View>
  );
}

function Basketball({ size }: { size: number }) {
  // Exact glyph from the design (viewBox 0 0 100 100): amber ball with a dark
  // outline and seams.
  const seam = colors.bg;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={45} fill={colors.accent} stroke={seam} strokeWidth={6} />
      <Line x1={50} y1={7} x2={50} y2={93} stroke={seam} strokeWidth={6} />
      <Line x1={7} y1={50} x2={93} y2={50} stroke={seam} strokeWidth={6} />
      <Path d="M18 16 Q50 50 18 84" fill="none" stroke={seam} strokeWidth={6} />
      <Path d="M82 16 Q50 50 82 84" fill="none" stroke={seam} strokeWidth={6} />
    </Svg>
  );
}

// Rim geometry shared by the two arcs.
function rimGeom(size: number) {
  const cx = size / 2;
  const cy = size * 0.42;
  const rx = size * 0.4;
  const ry = size * 0.13;
  return { cx, cy, rx, ry };
}

function RimBack({ size }: { size: number }) {
  const { cx, cy, rx, ry } = rimGeom(size);
  const net = '#8B93A3';
  const bottom = size * 0.86;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Line x1={cx - rx} y1={cy} x2={cx - rx * 0.45} y2={bottom} stroke={net} strokeWidth={size * 0.03} />
      <Line x1={cx - rx * 0.5} y1={cy + ry} x2={cx - rx * 0.18} y2={bottom} stroke={net} strokeWidth={size * 0.03} />
      <Line x1={cx + rx * 0.5} y1={cy + ry} x2={cx + rx * 0.18} y2={bottom} stroke={net} strokeWidth={size * 0.03} />
      <Line x1={cx + rx} y1={cy} x2={cx + rx * 0.45} y2={bottom} stroke={net} strokeWidth={size * 0.03} />
      <Line x1={cx} y1={cy + ry} x2={cx} y2={bottom} stroke={net} strokeWidth={size * 0.03} />
      {/* far/top arc, darker for depth */}
      <Path d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`} stroke="#C9821F" strokeWidth={size * 0.07} fill="none" />
    </Svg>
  );
}

function RimFront({ size }: { size: number }) {
  const { cx, cy, rx, ry } = rimGeom(size);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* near/bottom arc, full amber */}
      <Path d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`} stroke={colors.accent} strokeWidth={size * 0.07} fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: colors.glowAmberSoft, top: '24%' },
  center: { alignItems: 'center', gap: 16 },
  eyebrow: { fontFamily: font.xb, color: colors.textFaint, fontSize: 11, letterSpacing: 3.4, fontWeight: '800' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  letter: { letterSpacing: -0.6, fontWeight: '800', includeFontPadding: false },
  abs: { position: 'absolute' },
  bottom: { position: 'absolute', bottom: 92, alignItems: 'center', gap: 12 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  loading: { fontFamily: font.b, color: '#3a4150', fontSize: 10, letterSpacing: 3, fontWeight: '700' },
});

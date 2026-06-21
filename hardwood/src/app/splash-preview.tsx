import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SplashLogo } from '../components/SplashLogo';
import { colors, font } from '../theme/tokens';

/**
 * Standalone screen to watch the animated intro on a device without cold-starting
 * the app. Reachable from Settings → "Replay intro animation". Tap anywhere to exit.
 */
export default function SplashPreview() {
  return (
    <Pressable style={styles.fill} onPress={() => router.back()}>
      <SplashLogo />
      <Text style={styles.hint}>tap to close</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  hint: { position: 'absolute', bottom: 36, alignSelf: 'center', fontFamily: font.b, color: colors.textFaint, fontSize: 11, letterSpacing: 2 },
});

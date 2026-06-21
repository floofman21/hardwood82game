import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
  Barlow_800ExtraBold,
} from '@expo-google-fonts/barlow';
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_800ExtraBold,
} from '@expo-google-fonts/barlow-condensed';
import { useMetaStore } from '../game/state/metaStore';
import { SplashLogo } from '../components/SplashLogo';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  const hydrate = useMetaStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [fontsLoaded] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    Barlow_800ExtraBold,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_800ExtraBold,
  });

  // Keep the animated splash up long enough to play one full dunk, otherwise it
  // flashes by once fonts are cached. Tune SPLASH_MIN_MS (set to 0 to disable).
  const SPLASH_MIN_MS: number = 2800;
  const [minElapsed, setMinElapsed] = useState(SPLASH_MIN_MS === 0);
  useEffect(() => {
    if (SPLASH_MIN_MS === 0) return;
    const id = setTimeout(() => setMinElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(id);
  }, []);
  const ready = fontsLoaded && minElapsed;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {ready ? (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          />
        ) : (
          <SplashLogo />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

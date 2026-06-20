import React from 'react';
import { View, Text, Switch, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMetaStore } from '../game/state/metaStore';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, space, radius } from '../theme/tokens';

export default function Settings() {
  const settings = useMetaStore((s) => s.settings);
  const setSetting = useMetaStore((s) => s.setSetting);
  const clearHistory = useMetaStore((s) => s.clearHistory);

  const confirmClear = () => {
    Alert.alert('Clear history?', 'This permanently deletes all saved games.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Haptics</Text>
            <Text style={styles.sub}>Vibrate on spins and picks</Text>
          </View>
          <Switch
            value={settings.haptics}
            onValueChange={(v) => setSetting('haptics', v)}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.text}
          />
        </View>

        <Pressable onPress={confirmClear} style={styles.row}>
          <Text style={[styles.label, { color: colors.bad }]}>Clear history</Text>
        </Pressable>

        <View style={styles.about}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutTxt}>
            HoopLore is an independent basketball drafting game. Player names and
            statistics are factual historical data. This app is not affiliated with,
            endorsed by, or sponsored by the NBA or any team, and uses no league logos,
            photographs, or trademarks.
          </Text>
          <Text style={styles.version}>v0.1.0 · dataset v1</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: space.lg, gap: space.sm },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: space.lg,
  },
  label: { color: colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  about: { padding: space.lg, gap: space.sm, marginTop: space.lg },
  aboutTitle: { color: colors.textFaint, fontWeight: '700', letterSpacing: 1.5, fontSize: 12 },
  aboutTxt: { color: colors.textDim, fontSize: 13, lineHeight: 20 },
  version: { color: colors.textFaint, fontSize: 12, marginTop: space.sm },
});

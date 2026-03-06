// src/screens/ExposureActiveScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { CircularTimer, ScreenWrapper } from '../components';
import { Button } from '../components';
import { useAppState } from '../state/AppState';
import { mockUVData } from '../data/mockData';
import { uvColor, uvLabel } from '../theme/tokens';
import { formatTimer, spfLabel } from '../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function ExposureActiveScreen({ navigation }: Props) {
  const { timer, pauseTimer, resetTimer, profile } = useAppState();
  const uv = mockUVData.uv;
  const col = uvColor(uv);
  const pct = timer.secondsLeft / timer.totalSeconds;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[`${col}18`, Colors.navy]}
        locations={[0, 0.6]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[StyleSheet.absoluteFill, { paddingTop: 56, paddingHorizontal: Spacing.xl3, paddingBottom: 48 }]}>
        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={styles.uvNow}>
            <Text style={styles.uvNowLabel}>UV NOW</Text>
            <Text style={[styles.uvNowValue, { color: col }]}>{uv.toFixed(1)}</Text>
          </View>

          <View style={[styles.activeBadge]}>
            <Text style={styles.activeDot}>●</Text>
            <Text style={styles.activeBadgeText}> ACTIVE</Text>
          </View>

          <View style={styles.riskBadge}>
            <Text style={styles.riskLabel}>Risk</Text>
            <Text style={[styles.riskValue, { color: col }]}>{uvLabel(uv)}</Text>
          </View>
        </View>

        {/* Main timer */}
        <View style={styles.timerSection}>
          <CircularTimer
            pct={pct}
            label={formatTimer(timer.secondsLeft)}
            sublabel="remaining"
            size={240}
            strokeWidth={10}
            color={col}
          />
          <Text style={styles.timerSub}>
            {`Skin Type ${profile.skinType}`} · {spfLabel(profile.defaultSpf)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Button
            label="🧴  Reapply Sunscreen"
            variant="amberOrange"
            onPress={() => navigation.navigate('SunscreenAlert')}
          />
          <View style={styles.controlRow}>
            <Button
              label={timer.isPaused ? '▶  Resume' : '⏸  Pause'}
              variant="secondary"
              onPress={pauseTimer}
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              style={styles.endBtn}
              onPress={() => { resetTimer(); navigation.goBack(); }}
            >
              <Text style={styles.endBtnText}>✕  End</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.navy },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  uvNow: { alignItems: 'center' },
  uvNowLabel: { fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  uvNowValue: { fontSize: FontSizes.xl4, fontWeight: FontWeights.bold, fontFamily: 'monospace' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: `${Colors.green}20`, borderWidth: 1, borderColor: `${Colors.green}50` },
  activeDot: { color: Colors.green, fontSize: FontSizes.sm },
  activeBadgeText: { color: Colors.green, fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  riskBadge: { alignItems: 'center' },
  riskLabel: { fontSize: 11, color: Colors.textMuted },
  riskValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  timerSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  timerSub: { fontSize: FontSizes.sm, color: Colors.textMuted },
  controls: { gap: Spacing.md },
  controlRow: { flexDirection: 'row', gap: Spacing.md },
  endBtn: { flex: 1, paddingVertical: 16, borderRadius: Radii.xl3, backgroundColor: Colors.transparent, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  endBtnText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textMuted },
});

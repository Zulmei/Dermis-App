// src/screens/ExposureActiveScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { CircularTimer, ScreenWrapper } from '../components';
import { Button } from '../components';
import { useAppState } from '../state/AppState';
import { mockUVData, mockLocation, UVData } from '../data/mockData';
import { fetchCurrentUV } from '../services/uvService';
import { uvColor, uvLabel } from '../theme/tokens';
import { formatTimer, spfLabel } from '../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function ExposureActiveScreen({ navigation }: Props) {
  const { timer, pauseTimer, resetTimer, profile } = useAppState();

  const [uvData, setUvData] = useState<UVData>(mockUVData);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUV(mockLocation.lat, mockLocation.lon, mockLocation.altitude)
      .then(data => { if (!cancelled) setUvData(data); });
    return () => { cancelled = true; };
  }, []);

  const uv  = uvData.uv;
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

          <View style={styles.activeBadge}>
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
            <Button
              label="✕  End"
              variant="ghost"
              onPress={() => { resetTimer(); navigation.navigate('Home'); }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.navy },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl2 },
  uvNow: { alignItems: 'center' },
  uvNowLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  uvNowValue: { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold },
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${Colors.teal}20`, borderRadius: Radii.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  activeDot: { fontSize: 8, color: Colors.teal },
  activeBadgeText: { fontSize: FontSizes.xs, color: Colors.teal, fontWeight: FontWeights.semibold, letterSpacing: 1 },
  riskBadge: { alignItems: 'center' },
  riskLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  riskValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold },
  timerSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  timerSub: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center' },
  controls: { gap: Spacing.md },
  controlRow: { flexDirection: 'row', gap: Spacing.md },
});

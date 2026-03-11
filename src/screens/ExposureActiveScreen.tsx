// src/screens/ExposureActiveScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { CircularTimer } from '../components';
import { Button } from '../components';
import { useAppState } from '../state/AppState';
import { uvColor, uvLabel } from '../theme/tokens';
import { formatTimer, spfLabel } from '../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function ExposureActiveScreen({ navigation }: Props) {
  const { timer, pauseTimer, resetTimer, profile, uvData } = useAppState();

  // Use live uvData from AppState — already kept up to date by AppState's
  // auto-fetch, so no local fetch needed here.
  const uv  = uvData.uv;
  const col = uvColor(uv);
  const pct = timer.totalSeconds > 0 ? timer.secondsLeft / timer.totalSeconds : 1;

  const handleBack = () => {
    // Pause the timer so it doesn't burn down while the user is on Home,
    // then navigate back without resetting anything.
    if (timer.isRunning) pauseTimer();
    navigation.navigate('Home');
  };

  const handleEnd = () => {
    resetTimer();
    navigation.navigate('Home');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[`${col}18`, Colors.navy]}
        locations={[0, 0.6]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[StyleSheet.absoluteFill, { paddingTop: 56, paddingHorizontal: Spacing.xl3, paddingBottom: 48 }]}>

        {/* ── Top row: back button + status ── */}
        <View style={styles.topRow}>
          {/* Back chevron — returns to Home without ending the session */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            accessibilityLabel="Back to Home"
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          {/* Status centre */}
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

          {/* Spacer to keep status row centred */}
          <View style={styles.backBtn} />
        </View>

        {/* ── Main timer ── */}
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

        {/* ── Controls ── */}
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
              onPress={handleEnd}
              style={{ flex: 1 }}
            />
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: Colors.navy },

  // Top row holds back button + status strip + mirror spacer
  topRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl2 },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: `${Colors.white}10`, borderWidth: 1, borderColor: `${Colors.white}18`, alignItems: 'center', justifyContent: 'center' },
  backIcon:         { fontSize: 24, color: Colors.textPrimary, lineHeight: 30, marginLeft: -2 },

  // Status strip (centred between back btn and mirror spacer)
  statusRow:        { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  uvNow:            { alignItems: 'center' },
  uvNowLabel:       { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  uvNowValue:       { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold },
  activeBadge:      { flexDirection: 'row', alignItems: 'center', backgroundColor: `${Colors.teal}20`, borderRadius: Radii.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  activeDot:        { fontSize: 8, color: Colors.teal },
  activeBadgeText:  { fontSize: FontSizes.xs, color: Colors.teal, fontWeight: FontWeights.semibold, letterSpacing: 1 },
  riskBadge:        { alignItems: 'center' },
  riskLabel:        { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  riskValue:        { fontSize: FontSizes.base, fontWeight: FontWeights.bold },

  // Timer
  timerSection:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  timerSub:         { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center' },

  // Bottom controls
  controls:         { gap: Spacing.md },
  controlRow:       { flexDirection: 'row', gap: Spacing.md },
});

// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Card, CircularTimer, ProgressBar, ScreenWrapper, Button } from '../components';
import { useAppState } from '../state/AppState';
import { mockLocation } from '../data/mockData';
import { uvColor, uvLabel } from '../theme/tokens';
import { formatTimer, spfLabel } from '../utils/format';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

function unixToTime(ts: number): string {
  if (!ts) return '—';
  try {
    return new Date(ts * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return '—'; }
}

function isoToTime(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return '—'; }
}

function capitalise(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

export function HomeScreen({ navigation }: Props) {
  const {
    timer, startTimer, pauseTimer, resetTimer,
    budgetUsedPct,
    profile,
    uvData,
    weatherData,
    currentUV,
    liveDataStatus,
    liveDataError,
    refreshLiveData,
    location,
    locationPermission,
    metricUnits,
  } = useAppState();

  // Use the root navigator so we can jump to the ProfileTab from anywhere.
  const rootNav = useNavigation<NativeStackNavigationProp<any>>();

  const loading  = liveDataStatus === 'loading';
  const hasError = liveDataStatus === 'error';
  const uv  = currentUV;
  const col = uvColor(uv);
  const pct = timer.totalSeconds > 0 ? timer.secondsLeft / timer.totalSeconds : 1;
  const timerLabel = formatTimer(timer.secondsLeft);

  const cityLabel = location
    ? `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`
    : locationPermission === 'denied'
      ? 'Location off'
      : mockLocation.city;

  const solarElev  = uvData.sun_info?.sun_position?.altitude != null
    ? `${Math.round(uvData.sun_info.sun_position.altitude)}°` : '—';
  const cloudCover = `${weatherData.cloud_coverage ?? 0}%`;
  const sunriseStr = weatherData.sunrise ? unixToTime(weatherData.sunrise) : '—';
  const sunsetStr  = weatherData.sunset  ? unixToTime(weatherData.sunset)  : '—';

  const weatherSummary = weatherData.description
    ? `${capitalise(weatherData.description)} · ${Math.round(weatherData.temp)}${metricUnits ? '°C' : '°F'}`
    : null;

  const spfStr        = spfLabel(profile.defaultSpf ?? 0);
  const timerSubLabel = `Skin Type ${profile.skinType} · ${spfStr} applied`;

  const reapplyHint: string | null =
    profile.reapplyReminder && profile.reapplyReminder !== 'Manual reminders'
      ? `Reapply reminder: ${profile.reapplyReminder.toLowerCase()}`
      : null;

  const sessionInProgress = timer.isRunning || timer.isPaused;
  const timerBtnLabel = sessionInProgress ? '▶  Continue' : '▶  Start Exposure';

  const peakTime = isoToTime(uvData.uv_max_time);
  const quickCards = [
    { label: 'Peak UV',  value: uvData.uv_max != null ? uvData.uv_max.toFixed(1) : '—', sub: peakTime,  color: Colors.red,   onPress: undefined },
    { label: 'Sunset',   value: sunsetStr,   sub: 'today',    color: Colors.amber, onPress: undefined },
    { label: 'Forecast', value: '→',         sub: 'View UV',  color: Colors.teal,  onPress: () => navigation.navigate('ForecastTab') },
  ];

  const budgetPctColor = budgetUsedPct >= 1 ? Colors.red : Colors.amber;

  // Navigate to ProfileTab correctly — avoids the nested navigator error.
  const goToProfile = () => {
    rootNav.navigate('ProfileTab');
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationLabel}>LOCATION</Text>
          <Text style={styles.location}>📍 {cityLabel}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={refreshLiveData}
            disabled={loading}
            accessibilityLabel="Refresh UV data"
          >
            {loading
              ? <ActivityIndicator size="small" color={Colors.teal} />
              : <Text style={styles.iconBtnText}>↻</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={goToProfile}
            accessibilityLabel="Open profile"
          >
            <Text style={styles.iconBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {hasError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={1}>
            ⚠ Could not load live data — showing last known values.
          </Text>
          <TouchableOpacity onPress={refreshLiveData}>
            <Text style={styles.errorRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.cards} showsVerticalScrollIndicator={false}>

        {/* UV Conditions Card */}
        <Card style={styles.uvCard}>
          <View style={[styles.uvGlow, { backgroundColor: `${col}12` }]} />
          <View style={styles.uvRow}>
            <View>
              <Text style={styles.uvIndexLabel}>UV INDEX</Text>
              <Text style={[styles.uvNumber, { color: col, fontFamily: 'monospace' }]}>{uv.toFixed(1)}</Text>
              <Text style={[styles.uvRiskLabel, { color: col }]}>{uvLabel(uv)}</Text>
            </View>
            <View style={styles.uvMeta}>
              {[
                { label: 'SOLAR ELEV.',  value: solarElev  },
                { label: 'CLOUD COVER', value: cloudCover  },
                { label: 'SUNRISE',     value: sunriseStr  },
                { label: 'SUNSET',      value: sunsetStr   },
              ].map(item => (
                <View key={item.label} style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{item.label}</Text>
                  <Text style={[styles.metaValue, { fontFamily: 'monospace' }]}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
          {weatherSummary ? <Text style={styles.weatherSummary}>{weatherSummary}</Text> : null}
        </Card>

        {/* Safe Exposure Timer Card */}
        <Card>
          <Text style={styles.timerCardLabel}>YOUR SAFE EXPOSURE TIME</Text>
          <View style={styles.timerCenter}>
            <CircularTimer pct={pct} label={timerLabel} sublabel="remaining" size={200} strokeWidth={8} color={col} />
          </View>
          <Text style={styles.timerSub}>{timerSubLabel}</Text>
          {reapplyHint ? (
            <View style={styles.reapplyRow}>
              <Text style={styles.reapplyIcon}>🧴</Text>
              <Text style={styles.reapplyText}>{reapplyHint}</Text>
            </View>
          ) : null}
          <View style={styles.timerButtons}>
            <Button
              label={timerBtnLabel}
              variant="primary"
              onPress={() => {
                if (timer.isPaused) startTimer();
                if (!timer.isRunning && !timer.isPaused) startTimer();
                navigation.navigate('ExposureActive');
              }}
              style={{ flex: 2 }}
            />
            <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Solar Budget Card */}
        <Card>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Daily Solar Budget</Text>
            <Text style={[styles.budgetPct, { color: budgetPctColor, fontFamily: 'monospace' }]}>
              {Math.round(budgetUsedPct * 100)}%
            </Text>
          </View>
          <ProgressBar
            pct={Math.min(budgetUsedPct, 1)}
            gradient={budgetUsedPct >= 1 ? undefined : ['#2DD4BF', '#F59E0B']}
            solidColor={budgetUsedPct >= 1 ? Colors.red : undefined}
            height={8}
            style={{ marginBottom: Spacing.sm }}
          />
          <Text style={styles.budgetDesc}>
            {budgetUsedPct >= 1
              ? "⚠ You've exceeded today's safe exposure limit."
              : `You've used ${Math.round(budgetUsedPct * 100)}% of today's safe exposure.`}
          </Text>
        </Card>

        {/* Quick Insight Cards */}
        <View style={styles.quickRow}>
          {quickCards.map(c => (
            <TouchableOpacity
              key={c.label}
              style={styles.quickCard}
              onPress={c.onPress}
              activeOpacity={c.onPress ? 0.7 : 1}
            >
              <Text style={styles.quickLabel}>{c.label}</Text>
              <Text style={[styles.quickValue, { color: c.color, fontFamily: 'monospace' }]}>{c.value}</Text>
              <Text style={styles.quickSub}>{c.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.sm },
  locationLabel:  { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  location:       { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary, marginTop: 2 },
  headerIcons:    { flexDirection: 'row', gap: Spacing.sm },
  iconBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBtnText:    { fontSize: 16, color: Colors.textMuted },
  errorBanner:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: `${Colors.orange}18`, borderRadius: Radii.lg, borderWidth: 1, borderColor: `${Colors.orange}40` },
  errorText:      { flex: 1, fontSize: FontSizes.xs, color: Colors.orange },
  errorRetry:     { fontSize: FontSizes.xs, color: Colors.teal, marginLeft: Spacing.md, fontWeight: FontWeights.semibold },
  scroll:         { flex: 1 },
  cards:          { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  uvCard:         { overflow: 'hidden' },
  uvGlow:         { position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60 },
  uvRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  uvIndexLabel:   { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.xs },
  uvNumber:       { fontSize: 52, fontWeight: FontWeights.bold, lineHeight: 56 },
  uvRiskLabel:    { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginTop: Spacing.xs },
  uvMeta:         { gap: Spacing.sm, alignItems: 'flex-end' },
  metaItem:       { alignItems: 'flex-end' },
  metaLabel:      { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue:      { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  weatherSummary: { marginTop: Spacing.md, fontSize: FontSizes.sm, color: Colors.textMuted },
  timerCardLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.lg, textAlign: 'center' },
  timerCenter:    { alignItems: 'center', marginBottom: Spacing.lg },
  timerSub:       { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.sm },
  reapplyRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  reapplyIcon:    { fontSize: FontSizes.sm },
  reapplyText:    { fontSize: FontSizes.sm, color: Colors.amber },
  timerButtons:   { flexDirection: 'row', gap: Spacing.md },
  resetBtn:       { flex: 1, paddingVertical: 16, borderRadius: Radii.xl2, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  resetText:      { fontSize: FontSizes.sm, color: Colors.textMuted },
  budgetHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  budgetTitle:    { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  budgetPct:      { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  budgetDesc:     { fontSize: FontSizes.sm, color: Colors.textMuted },
  quickRow:       { flexDirection: 'row', gap: Spacing.md },
  quickCard:      { flex: 1, backgroundColor: Colors.navyCard, borderRadius: Radii.xl4, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center' },
  quickLabel:     { fontSize: 11, color: Colors.textMuted, marginBottom: Spacing.xs },
  quickValue:     { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  quickSub:       { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
});

// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Card, CircularTimer, ProgressBar, ScreenWrapper } from '../components';
import { Button } from '../components';
import { useAppState } from '../state/AppState';
import { mockUVData, mockWeatherData, mockLocation, UVData, WeatherData } from '../data/mockData';
import { fetchCurrentUV } from '../services/uvService';
import { fetchCurrentWeather } from '../services/weatherService';
import { uvColor, uvLabel } from '../theme/tokens';
import { formatTimer, spfLabel } from '../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function HomeScreen({ navigation }: Props) {
  const { timer, startTimer, pauseTimer, resetTimer, budgetUsedPct, profile } = useAppState();

  const [uvData, setUvData]       = useState<UVData>(mockUVData);
  const [weather, setWeather]     = useState<WeatherData>(mockWeatherData);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [uv, wx] = await Promise.all([
          fetchCurrentUV(mockLocation.lat, mockLocation.lon, mockLocation.altitude),
          fetchCurrentWeather(mockLocation.lat, mockLocation.lon),
        ]);
        if (!cancelled) { setUvData(uv); setWeather(wx); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const uv  = uvData.uv;
  const col = uvColor(uv);
  const pct = timer.secondsLeft / timer.totalSeconds;
  const timerLabel = formatTimer(timer.secondsLeft);

  // Format peak UV time from ISO string
  const peakTime = (() => {
    try {
      const d = new Date(uvData.uv_max_time);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch { return '—'; }
  })();

  // Format sunset from unix timestamp
  const sunsetTime = (() => {
    try {
      const d = new Date(weather.sunset * 1000);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch { return '—'; }
  })();

  const quickCards = [
    { label: 'Peak UV',  value: uvData.uv_max.toFixed(1), sub: peakTime,   color: Colors.red },
    { label: 'Sunset',   value: sunsetTime,                sub: 'today',   color: Colors.amber },
    { label: 'Forecast', value: '→',                       sub: 'View UV', color: Colors.teal,
      onPress: () => navigation.navigate('ForecastTab') },
  ];

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationLabel}>LOCATION</Text>
          <Text style={styles.location}>📍 {mockLocation.city}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            {loading
              ? <ActivityIndicator size="small" color={Colors.teal} />
              : <Text style={styles.iconBtnText}>↻</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ProfileTab')}>
            <Text style={styles.iconBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.cards} showsVerticalScrollIndicator={false}>
        {/* UV Conditions Card */}
        <Card style={styles.uvCard}>
          <View style={[styles.uvGlow, { backgroundColor: `${col}15` }]} />
          <View style={styles.uvRow}>
            <View>
              <Text style={styles.uvIndexLabel}>UV INDEX</Text>
              <Text style={[styles.uvNumber, { color: col }]}>{uv.toFixed(1)}</Text>
              <Text style={[styles.uvRiskLabel, { color: col }]}>{uvLabel(uv)} Risk</Text>
            </View>
            <View style={styles.uvMeta}>
              {[
                ['Solar Elev.', `${uvData.sun_info.sun_position.altitude}°`],
                ['Cloud Cover', `${weather.cloud_coverage}%`],
                ['Humidity',    `${weather.humidity}%`],
                ['Conditions',  weather.description],
              ].map(([l, v]) => (
                <View key={l} style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{l}</Text>
                  <Text style={styles.metaValue}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Exposure Timer Card */}
        <Card>
          <Text style={styles.timerCardLabel}>YOUR SAFE EXPOSURE TIME</Text>
          <View style={styles.timerCenter}>
            <CircularTimer pct={pct} label={timerLabel} color={col} size={200} />
          </View>
          <Text style={styles.timerSub}>
            Based on {`Skin Type ${profile.skinType}`} · {spfLabel(profile.defaultSpf)} applied
          </Text>
          <View style={styles.timerButtons}>
            <Button
              label={timer.isRunning && !timer.isPaused ? '⏸  Pause' : '▶  Start Exposure'}
              onPress={() => {
                if (!timer.isRunning) { startTimer(); navigation.navigate('ExposureActive'); }
                else pauseTimer();
              }}
              style={{ flex: 2 }}
            />
            <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Solar Budget */}
        <Card>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Daily Solar Budget</Text>
            <Text style={[styles.budgetPct, { color: Colors.amber }]}>{Math.round(budgetUsedPct * 100)}%</Text>
          </View>
          <ProgressBar pct={budgetUsedPct} gradient={['#2DD4BF', '#F59E0B']} height={8} style={{ marginBottom: Spacing.sm }} />
          <Text style={styles.budgetDesc}>You've used {Math.round(budgetUsedPct * 100)}% of today's safe exposure.</Text>
        </Card>

        {/* Quick cards */}
        <View style={styles.quickRow}>
          {quickCards.map(c => (
            <TouchableOpacity key={c.label} style={styles.quickCard} onPress={c.onPress} activeOpacity={c.onPress ? 0.7 : 1}>
              <Text style={styles.quickLabel}>{c.label}</Text>
              <Text style={[styles.quickValue, { color: c.color }]}>{c.value}</Text>
              <Text style={styles.quickSub}>{c.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.sm },
  locationLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  location: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary, marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16, color: Colors.textMuted },
  scroll: { flex: 1 },
  cards: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  uvCard: { overflow: 'hidden' },
  uvGlow: { position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60 },
  uvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  uvIndexLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.xs },
  uvNumber: { fontSize: 52, fontWeight: FontWeights.bold, lineHeight: 56 },
  uvRiskLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginTop: Spacing.xs },
  uvMeta: { gap: Spacing.sm, alignItems: 'flex-end' },
  metaItem: { alignItems: 'flex-end' },
  metaLabel: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  timerCardLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.lg },
  timerCenter: { alignItems: 'center', marginBottom: Spacing.lg },
  timerSub: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  timerButtons: { flexDirection: 'row', gap: Spacing.md },
  resetBtn: { flex: 1, paddingVertical: 16, borderRadius: Radii.xl2, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontSize: FontSizes.sm, color: Colors.textMuted },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  budgetTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  budgetPct: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  budgetDesc: { fontSize: FontSizes.sm, color: Colors.textMuted },
  quickRow: { flexDirection: 'row', gap: Spacing.md },
  quickCard: { flex: 1, backgroundColor: Colors.navyCard, borderRadius: Radii.xl4, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center' },
  quickLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: Spacing.xs },
  quickValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  quickSub: { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
});

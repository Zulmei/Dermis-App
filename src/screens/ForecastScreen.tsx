// src/screens/ForecastScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Card, UVBarChart, ProgressBar, ScreenWrapper } from '../components';
import { mockHourlyUV, mockLocation, HourlyUVPoint } from '../data/mockData';
import { fetchHourlyForecast } from '../services/uvService';
import { uvColor, uvLabel } from '../theme/tokens';

export function ForecastScreen() {
  const [hourlyUV, setHourlyUV] = useState<HourlyUVPoint[]>(mockHourlyUV);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchHourlyForecast(mockLocation.lat, mockLocation.lon, mockLocation.altitude);
        if (!cancelled) setHourlyUV(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Derive peak from live data
  const peakPoint = hourlyUV.reduce((max, p) => p.uv > max.uv ? p : max, hourlyUV[0] ?? { uv: 0, hour: '—', time: '' });
  const peakIndex = hourlyUV.indexOf(peakPoint);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>UV Forecast</Text>
        <View style={styles.headerRight}>
          {loading && <ActivityIndicator size="small" color={Colors.teal} style={{ marginRight: Spacing.sm }} />}
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chart */}
        <Card>
          <Text style={styles.sectionLabel}>UV INDEX TODAY</Text>
          <UVBarChart data={hourlyUV} height={110} peakIndex={peakIndex} />
        </Card>

        {/* Peak alert */}
        <Card variant="alert">
          <View style={styles.alertRow}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: Colors.orange }]}>
                Peak UV Today: {peakPoint.uv.toFixed(1)} at {peakPoint.hour}
              </Text>
              <Text style={styles.alertBody}>Avoid prolonged sun exposure around peak hours.</Text>
            </View>
          </View>
        </Card>

        {/* Hourly breakdown */}
        <Card>
          <Text style={styles.sectionLabel}>HOURLY BREAKDOWN</Text>
          {hourlyUV.slice(0, 8).map((point, i) => {
            const col = uvColor(point.uv);
            return (
              <View key={i} style={[styles.hourRow, i < 7 && styles.hourRowBorder]}>
                <Text style={styles.hourLabel}>{point.hour}</Text>
                <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
                  <ProgressBar pct={point.uv / 11} solidColor={col} height={6} />
                </View>
                <Text style={[styles.hourUV, { color: col }]}>{point.uv.toFixed(1)}</Text>
                <Text style={[styles.hourRisk, { color: col }]}>{uvLabel(point.uv)}</Text>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  date: { fontSize: FontSizes.sm, color: Colors.textMuted },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  alertIcon: { fontSize: 20 },
  alertTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginBottom: Spacing.xs },
  alertBody: { fontSize: FontSizes.sm, color: Colors.textMuted },
  hourRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  hourRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  hourLabel: { fontSize: FontSizes.sm, color: Colors.textMuted, width: 36 },
  hourUV: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, width: 32, textAlign: 'right' },
  hourRisk: { fontSize: FontSizes.xs, width: 52 },
});

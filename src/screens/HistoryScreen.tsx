// src/screens/HistoryScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Card, ProgressBar, ScreenWrapper } from '../components';
import { mockExposureHistory, mockWeeklyData, weekDayLabels, DailyExposure } from '../data/mockData';
import { loadHistory, loadWeeklyChartData } from '../services/historyService';
import { uvColor } from '../theme/tokens';

export function HistoryScreen() {
  const CHART_HEIGHT = 60;

  const [history, setHistory]       = useState<DailyExposure[]>(mockExposureHistory);
  const [weeklyData, setWeeklyData] = useState<number[]>(mockWeeklyData);
  const [labels, setLabels]         = useState<string[]>(weekDayLabels);
  const [loading, setLoading]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hist, weekly] = await Promise.all([
        loadHistory(),
        loadWeeklyChartData(),
      ]);
      setHistory(hist);
      setWeeklyData(weekly.weeklyData);
      setLabels(weekly.labels);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derive stats from live history
  const daysWithExposure = history.filter(d => d.exposureMinutes > 0);
  const avgDaily = daysWithExposure.length > 0
    ? Math.round(daysWithExposure.reduce((s, d) => s + d.exposureMinutes, 0) / daysWithExposure.length)
    : 0;
  const peakUV = history.length > 0
    ? Math.max(...history.map(d => d.peakUV)).toFixed(1)
    : '—';
  const daysProtected = history.filter(d => d.spfUsed !== null && d.spfUsed > 0).length;
  const totalDays = history.length;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Exposure History</Text>
        {loading && <ActivityIndicator size="small" color={Colors.teal} />}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly chart */}
        <Card>
          <Text style={styles.sectionLabel}>THIS WEEK</Text>
          <View style={[styles.weekChart, { height: CHART_HEIGHT + 24 }]}>
            {weeklyData.map((v, i) => {
              const barH = v * CHART_HEIGHT;
              const col = v > 0.6 ? Colors.orange : v > 0.3 ? Colors.amber : Colors.teal;
              return (
                <View key={i} style={styles.weekBarCol}>
                  <View style={styles.weekBarWrapper}>
                    {v > 0 && <View style={[styles.weekBar, { height: barH, backgroundColor: col, opacity: 0.8 }]} />}
                  </View>
                  <Text style={styles.weekDayLabel}>{labels[i]}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Avg Daily',      value: `${avgDaily} min` },
            { label: 'Peak UV',        value: String(peakUV) },
            { label: 'Days Protected', value: `${daysProtected}/${totalDays}` },
          ].map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Daily log */}
        <Card>
          <Text style={styles.sectionLabel}>DAILY LOG</Text>
          {history.map((day, i) => (
            <View key={day.isoDate} style={[styles.dayRow, i < history.length - 1 && styles.dayRowBorder]}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayDate}>{day.date}</Text>
                <Text style={[styles.dayUV, { color: uvColor(day.peakUV) }]}>UV {day.peakUV.toFixed(1)}</Text>
              </View>
              <ProgressBar
                pct={day.budgetPct}
                solidColor={day.budgetPct > 0.6 ? Colors.orange : Colors.teal}
                height={4}
                style={{ marginBottom: Spacing.sm }}
              />
              <View style={styles.dayMeta}>
                <Text style={styles.dayMetaText}>⏱ {day.exposureMinutes} min</Text>
                <Text style={styles.dayMetaText}>🧴 SPF {day.spfUsed ?? '—'}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.sm },
  title: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  weekChart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  weekBarCol: { flex: 1, alignItems: 'center', gap: 6 },
  weekBarWrapper: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  weekBar: { width: '100%', borderRadius: Radii.xs },
  weekDayLabel: { fontSize: 10, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.navyCard, borderRadius: Radii.xl4, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  statValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.teal },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  dayRow: { paddingVertical: Spacing.md },
  dayRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  dayDate: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  dayUV: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  dayMeta: { flexDirection: 'row', gap: Spacing.lg },
  dayMetaText: { fontSize: FontSizes.sm, color: Colors.textMuted },
});

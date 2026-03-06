// src/screens/ForecastScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Card, UVBarChart, ProgressBar, ScreenWrapper } from '../components';
import { mockHourlyUV } from '../data/mockData';
import { uvColor, uvLabel } from '../theme/tokens';

export function ForecastScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>UV Forecast</Text>
        <Text style={styles.date}>Today, Mar 5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chart */}
        <Card>
          <Text style={styles.sectionLabel}>UV INDEX TODAY</Text>
          <UVBarChart data={mockHourlyUV} height={110} peakIndex={6} />
        </Card>

        {/* Peak alert */}
        <Card variant="alert">
          <View style={styles.alertRow}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: Colors.orange }]}>Peak UV Today: 9.2 at 1:30 PM</Text>
              <Text style={styles.alertBody}>Safest outdoor time: before 10:30 AM or after 4:00 PM</Text>
            </View>
          </View>
        </Card>

        {/* Hourly breakdown */}
        <Card>
          <Text style={styles.sectionLabel}>HOURLY BREAKDOWN</Text>
          {mockHourlyUV.slice(0, 8).map((point, i) => {
            const col = uvColor(point.uv);
            return (
              <View key={i} style={[styles.hourRow, i < 7 && styles.hourRowBorder]}>
                <Text style={styles.hourLabel}>{point.hour}</Text>
                <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
                  <ProgressBar pct={point.uv / 10} solidColor={col} height={6} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.md },
  title: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  date: { fontSize: FontSizes.sm, color: Colors.textMuted },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  alertRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  alertIcon: { fontSize: FontSizes.xl2 },
  alertTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginBottom: Spacing.xs },
  alertBody: { fontSize: FontSizes.sm, color: Colors.textMuted, lineHeight: 18 },
  hourRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  hourRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  hourLabel: { fontSize: FontSizes.sm, color: Colors.textMuted, width: 44 },
  hourUV: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, width: 36, textAlign: 'right' },
  hourRisk: { fontSize: 11, marginLeft: Spacing.sm, width: 56 },
});

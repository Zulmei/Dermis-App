// src/components/UVBarChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HourlyUVPoint } from '../data/mockData';
import { Colors, FontSizes, Radii } from '../theme';
import { uvColor } from '../theme/tokens';
import { hexToRgba } from '../utils/format';

interface UVBarChartProps {
  data: HourlyUVPoint[];
  height?: number;
  peakIndex?: number;
}

export function UVBarChart({ data, height = 100, peakIndex = 6 }: UVBarChartProps) {
  const maxUV = 10;

  return (
    <View>
      <View style={[styles.chartArea, { height }]}>
        {data.map((point, i) => {
          const barH = (point.uv / maxUV) * height;
          const col = uvColor(point.uv);
          return (
            <View key={i} style={styles.barWrapper}>
              {i === peakIndex && (
                <Text style={[styles.peakLabel, { color: col }]}>▲</Text>
              )}
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View style={[
                  styles.bar,
                  {
                    height: barH,
                    backgroundColor: hexToRgba(col, 0.35),
                    borderColor: hexToRgba(col, 0.7),
                  }
                ]} />
              </View>
            </View>
          );
        })}
      </View>
      {/* Baseline */}
      <View style={styles.baseline} />
      {/* Hour labels */}
      <View style={styles.hourRow}>
        {data.map((p, i) => (
          <Text key={i} style={styles.hourLabel}>{p.hour}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderTopLeftRadius: Radii.xs,
    borderTopRightRadius: Radii.xs,
  },
  peakLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  baseline: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 0,
  },
  hourRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
  },
  hourLabel: {
    flex: 1,
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

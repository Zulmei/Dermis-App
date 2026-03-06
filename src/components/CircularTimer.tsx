// src/components/CircularTimer.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontSizes, FontWeights } from '../theme';

interface CircularTimerProps {
  pct: number;         // 0–1
  label: string;       // center text (e.g. "22:14")
  sublabel?: string;   // e.g. "remaining"
  size?: number;       // diameter, default 200
  strokeWidth?: number;
  color: string;
}

export function CircularTimer({
  pct, label, sublabel = 'remaining',
  size = 200, strokeWidth = 8, color,
}: CircularTimerProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.max(0, Math.min(1, pct)));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size} height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={Colors.border}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  label: {
    fontSize: FontSizes.timer,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.5,
  },
  sublabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

// src/components/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '../theme';

interface ProgressBarProps {
  pct: number;            // 0–1
  height?: number;
  gradient?: [string, string];
  solidColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  pct, height = 8,
  gradient, solidColor,
  style,
}: ProgressBarProps) {
  const clampedPct = Math.max(0, Math.min(1, pct));
  const fillColor = pct > 1 ? Colors.red : (solidColor ?? Colors.teal);

  return (
    <View style={[{ height, backgroundColor: Colors.border, borderRadius: Radii.xs, overflow: 'hidden' }, style]}>
      {gradient && !solidColor ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ width: `${clampedPct * 100}%`, height: '100%', borderRadius: Radii.xs }}
        />
      ) : (
        <View style={{ width: `${clampedPct * 100}%`, height: '100%', backgroundColor: fillColor, borderRadius: Radii.xs }} />
      )}
    </View>
  );
}

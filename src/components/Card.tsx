// src/components/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Layout, Shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'alert' | 'premium' | 'teal';
  noShadow?: boolean;
}

export function Card({ children, style, variant = 'default', noShadow }: CardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'alert'   && styles.alert,
      variant === 'premium' && styles.premium,
      variant === 'teal'    && styles.teal,
      !noShadow && Shadows.card,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navyCard,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Layout.cardPadding,
  },
  alert: {
    backgroundColor: 'rgba(234,88,12,0.07)',
    borderColor: 'rgba(234,88,12,0.25)',
  },
  premium: {
    backgroundColor: 'rgba(245,158,11,0.06)',
    borderColor: 'rgba(245,158,11,0.25)',
  },
  teal: {
    backgroundColor: 'rgba(45,212,191,0.08)',
    borderColor: 'rgba(45,212,191,0.35)',
  },
});

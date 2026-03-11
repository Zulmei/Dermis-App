// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Layout, FontSizes, FontWeights, Radii } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'amberOrange';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: string;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style, textStyle, icon }: ButtonProps) {
  const isGradient = ['primary', 'danger', 'gold', 'amberOrange'].includes(variant);

  const getGradient = (): readonly [string, string] => {
    if (variant === 'danger')      return Gradients.danger;
    if (variant === 'gold')        return Gradients.gold;
    if (variant === 'amberOrange') return Gradients.amberOrange;
    return Gradients.primary;
  };

  const textColor = (): string => {
    if (variant === 'secondary') return Colors.teal;
    if (variant === 'ghost')     return Colors.textMuted;
    if (variant === 'danger')    return Colors.white;
    return Colors.black;
  };

  const content = (
    <Text style={[
      styles.text,
      { color: textColor() },
      variant === 'gold' && styles.goldText,
      textStyle,
    ]}>
      {icon ? `${icon}  ` : ''}{label}
    </Text>
  );

  if (isGradient) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.wrapper, style, disabled && styles.disabled]}>
        <LinearGradient
          colors={getGradient()}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? <ActivityIndicator color={Colors.black} /> : content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.wrapper,
        styles.flat,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost'     && styles.ghost,
        style,
        disabled && styles.disabled,
      ]}
    >
      {loading ? <ActivityIndicator color={Colors.teal} /> : content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Layout.buttonRadius,
    overflow: 'hidden',
    width: '100%',
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  flat: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: Colors.teal,
    backgroundColor: Colors.transparent,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  text: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.2,
  },
  goldText: {
    fontSize: FontSizes.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});

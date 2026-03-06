// src/components/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Colors, FontSizes, FontWeights, Radii, Spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, containerStyle, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        {...props}
        style={[
          styles.input,
          focused && styles.inputFocused,
          props.style,
        ]}
        placeholderTextColor={Colors.textMuted}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.navyCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
  },
  inputFocused: {
    borderColor: Colors.teal,
  },
});

// src/components/Toggle.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  const thumbAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(thumbAnim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbLeft = thumbAnim.interpolate({ inputRange: [0, 1], outputRange: [3, 25] });
  const trackColor = thumbAnim.interpolate({ inputRange: [0, 1], outputRange: [Colors.border, Colors.teal] });

  return (
    <TouchableWithoutFeedback onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.thumb, { left: thumbLeft }]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
  },
});

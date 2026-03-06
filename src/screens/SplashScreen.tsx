// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export function SplashScreen({ navigation }: Props) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const ring1     = useRef(new Animated.Value(1)).current;
  const ring2     = useRef(new Animated.Value(1)).current;
  const ring3     = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0.6)).current;
  const ring3Opacity = useRef(new Animated.Value(0.6)).current;

  const animateRing = (scale: Animated.Value, opacity: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.6, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, delay: 200, useNativeDriver: true }),
    ]).start();

    animateRing(ring1, ring1Opacity, 0);
    animateRing(ring2, ring2Opacity, 600);
    animateRing(ring3, ring3Opacity, 1200);

    const timer = setTimeout(() => navigation.replace('AuthLanding'), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#1A2A4E', Colors.navy]}
      locations={[0, 1]}
      style={styles.root}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        {/* Sun logo */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.ring, { transform: [{ scale: ring1 }], opacity: ring1Opacity }]} />
          <Animated.View style={[styles.ring, { transform: [{ scale: ring2 }], opacity: ring2Opacity }]} />
          <Animated.View style={[styles.ring, { transform: [{ scale: ring3 }], opacity: ring3Opacity }]} />
          <LinearGradient
            colors={['#F59E0B', '#EA580C', Colors.teal]}
            locations={[0.2, 0.6, 1]}
            style={styles.sunCircle}
          >
            <Text style={styles.sunGlyph}>☀</Text>
          </LinearGradient>
        </View>

        <Text style={styles.wordmark}>dermis</Text>
        <Text style={styles.tagline}>YOUR UV & SKIN GUARDIAN</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive, i === 1 && styles.dotWide]} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.teal,
  },
  sunCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sunGlyph: {
    fontSize: 48,
  },
  wordmark: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  dots: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.teal,
  },
  dotWide: {
    width: 24,
    backgroundColor: Colors.teal,
  },
});

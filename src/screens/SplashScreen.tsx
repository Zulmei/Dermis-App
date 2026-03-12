// src/screens/SplashScreen.tsx
// Dual-gate navigation: waits for BOTH the 2.4 s brand moment AND session
// restore to complete before deciding where to send the user.
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing } from '../theme';
import { useAppState } from '../state/AppState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export function SplashScreen({ navigation }: Props) {
  const { authLoading, isAuthenticated, onboardingComplete } = useAppState();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const ring1     = useRef(new Animated.Value(1)).current;
  const ring2     = useRef(new Animated.Value(1)).current;
  const ring3     = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0.6)).current;
  const ring3Opacity = useRef(new Animated.Value(0.6)).current;

  // Track whether we've already navigated away so we don't double-fire.
  const hasNavigated = useRef(false);

  const animateRing = (
    scale: Animated.Value,
    opacity: Animated.Value,
    delay: number,
  ) => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.6,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,   duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  };

  useEffect(() => {
    // Entrance animation — runs immediately, independent of auth state.
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    animateRing(ring1, ring1Opacity, 0);
    animateRing(ring2, ring2Opacity, 600);
    animateRing(ring3, ring3Opacity, 1200);
  }, []);

  // ── Navigation decision ────────────────────────────────────────────────
  // We wait for:
  //   1. authLoading to be false (session restore is complete), AND
  //   2. at least 2400 ms to have elapsed (brand moment / spec §5.1)
  //
  // Both gates use a ref so they only fire once.
  const minTimerDone = useRef(false);
  const authDone     = useRef(false);

  const maybeNavigate = useCallback(() => {
    if (!minTimerDone.current || !authDone.current) return;
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    if (isAuthenticated && onboardingComplete) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('AuthLanding');
    }
  });

  // Gate 1: minimum 2400 ms brand moment.
  useEffect(() => {
    const t = setTimeout(() => {
      minTimerDone.current = true;
      maybeNavigate();
    }, 2400);
    return () => clearTimeout(t);
  }, []);

  // Gate 2: auth restore complete.
  useEffect(() => {
    if (!authLoading) {
      authDone.current = true;
      maybeNavigate();
    }
  }, [authLoading]);

  return (
    <LinearGradient
      colors={['#1A2A4E', Colors.navy]}
      locations={[0, 1]}
      style={styles.root}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
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

      <Text style={styles.version}>v1.0</Text>
    </LinearGradient>
  );
}

// Pulled out of the component body so it doesn't recreate every render.
function useCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = React.useRef(fn);
  ref.current = fn;
  return React.useCallback((...args: any[]) => ref.current(...args), []) as T;
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
    marginBottom: Spacing.xl2,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: Colors.teal,
  },
  sunCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunGlyph: {
    fontSize: 36,
    color: '#fff',
  },
  wordmark: {
    fontSize: 42,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: 4,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 3,
    fontWeight: FontWeights.medium,
  },
  version: {
    position: 'absolute',
    bottom: 48,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});

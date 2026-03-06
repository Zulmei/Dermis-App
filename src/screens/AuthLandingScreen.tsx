// src/screens/AuthLandingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Card, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function AuthLandingScreen({ navigation }: Props) {
  return (
    <ScreenWrapper>
      <View style={styles.root}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={['#F59E0B', Colors.teal]} style={styles.appIcon}>
            <Text style={{ fontSize: 32 }}>☀</Text>
          </LinearGradient>
          <Text style={styles.wordmark}>dermis</Text>
          <Text style={styles.headline}>Protect Your Skin{'\n'}Smarter</Text>
          <Text style={styles.description}>
            Dermis calculates personalized UV exposure limits using satellite solar radiation data and your skin profile.
          </Text>
        </View>

        {/* Preview badge */}
        <Card style={styles.badge}>
          {[
            { label: 'UV Index', value: '8.4',    color: Colors.orange },
            { label: 'Safe Time', value: '24 min', color: Colors.teal },
            { label: 'Your SPF', value: 'SPF 30', color: Colors.amber },
          ].map(stat => (
            <View key={stat.label} style={styles.stat}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Card>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button label="Create Account" onPress={() => navigation.navigate('SignUp')} />
          <Button label="Sign In" variant="secondary" onPress={() => navigation.navigate('SignIn')} style={{ marginTop: Spacing.md }} />
          <TouchableOpacity onPress={() => navigation.navigate('OnboardingWelcome')} style={styles.guestLink}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.xl3,
    paddingBottom: Spacing.xl5,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  appIcon: {
    width: 72, height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  wordmark: {
    fontSize: FontSizes.xl5,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: FontSizes.xl4,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: Spacing.lg,
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginTop: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl2,
  },
  stat: { alignItems: 'center' },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  buttons: {},
  guestLink: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  guestText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
});

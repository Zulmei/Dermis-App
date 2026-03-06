// src/navigation/DevScreenPicker.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Developer screen picker — mirrors the pill-button nav bar from the web artifact.
// Toggle with triple-tap on the Dermis wordmark or via __DEV__ flag.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';

export type ScreenKey =
  | 'Splash' | 'AuthLanding' | 'SignUp' | 'SignIn' | 'ForgotPassword'
  | 'OnboardingWelcome' | 'OnboardingSkin' | 'OnboardingSunscreen' | 'LocationPermission'
  | 'Home' | 'ExposureActive' | 'SunscreenAlert' | 'Forecast' | 'Insights' | 'History' | 'Profile' | 'Settings' | 'Premium';

interface Group { label: string; screens: ScreenKey[] }

const GROUPS: Group[] = [
  {
    label: 'Auth',
    screens: ['Splash', 'AuthLanding', 'SignUp', 'SignIn', 'ForgotPassword'],
  },
  {
    label: 'Onboarding',
    screens: ['OnboardingWelcome', 'OnboardingSkin', 'OnboardingSunscreen', 'LocationPermission'],
  },
  {
    label: 'Main',
    screens: ['Home', 'ExposureActive', 'SunscreenAlert', 'Forecast', 'Insights', 'History', 'Profile', 'Settings', 'Premium'],
  },
];

const LABELS: Record<ScreenKey, string> = {
  Splash:               'Splash',
  AuthLanding:          'Landing',
  SignUp:               'Sign Up',
  SignIn:               'Sign In',
  ForgotPassword:       'Forgot PW',
  OnboardingWelcome:    'Welcome',
  OnboardingSkin:       'Skin Type',
  OnboardingSunscreen:  'Sunscreen',
  LocationPermission:   'Location',
  Home:                 'Home',
  ExposureActive:       'Active',
  SunscreenAlert:       'Alert',
  Forecast:             'Forecast',
  Insights:             'Insights',
  History:              'History',
  Profile:              'Profile',
  Settings:             'Settings',
  Premium:              'Premium',
};

interface Props {
  active: ScreenKey;
  onSelect: (screen: ScreenKey) => void;
}

export function DevScreenPicker({ active, onSelect }: Props) {
  return (
    <View style={styles.root}>
      {GROUPS.map(group => (
        <View key={group.label} style={styles.group}>
          <Text style={styles.groupLabel}>{group.label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
            {group.screens.map(screen => {
              const isActive = active === screen;
              return (
                <TouchableOpacity
                  key={screen}
                  style={[styles.pill, isActive && styles.pillActive]}
                  onPress={() => onSelect(screen)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {LABELS[screen]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  group: {
    gap: 4,
  },
  groupLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingLeft: Spacing.lg,
  },
  pills: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radii.full,
    backgroundColor: Colors.navyCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  pillText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontWeight: FontWeights.medium,
  },
  pillTextActive: {
    color: Colors.black,
    fontWeight: FontWeights.semibold,
  },
});

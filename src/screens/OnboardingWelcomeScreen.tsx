// src/screens/OnboardingWelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

const features = [
  { icon: '📡', label: 'Real-time UV Tracking',       sub: 'Live satellite solar data' },
  { icon: '⏱',  label: 'Personalized Exposure Timer', sub: 'Based on your skin profile' },
  { icon: '🧴', label: 'SPF Protection Monitoring',   sub: 'Reapply reminders & tracking' },
  { icon: '💡', label: 'Sun Safety Insights',         sub: 'Evidence-based guidance' },
];

export function OnboardingWelcomeScreen({ navigation }: Props) {
  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <View style={styles.content}>
          <Text style={styles.headline}>Protect your skin{'\n'}with precision</Text>
          <Text style={styles.description}>
            Dermis calculates real-time UV exposure using satellite solar radiation and your exact GPS location.
          </Text>

          <View style={styles.features}>
            {features.map(f => (
              <View key={f.label} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                </View>
                <View>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Button label="Continue  →" onPress={() => navigation.navigate('OnboardingSkin')} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: Spacing.xl3, paddingTop: Spacing.xl4, paddingBottom: Spacing.xl5 },
  content: { flex: 1 },
  headline: { fontSize: FontSizes.xl6, fontWeight: FontWeights.bold, color: Colors.textPrimary, lineHeight: 36, marginBottom: Spacing.md },
  description: { fontSize: FontSizes.sm, color: Colors.textMuted, lineHeight: 20, marginBottom: Spacing.xl4 },
  features: { gap: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  featureIcon: { width: 48, height: 48, borderRadius: Radii.xl2, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureEmoji: { fontSize: 22 },
  featureLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  featureSub: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
});

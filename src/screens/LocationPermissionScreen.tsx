// src/screens/LocationPermissionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

const benefits = ['Accurate UV index', 'Personalized sun exposure limits', 'Local solar conditions'];

export function LocationPermissionScreen({ navigation }: Props) {
  const goHome = () => navigation.replace('MainTabs');

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        {/* Map illustration */}
        <View style={styles.mapOuter}>
          <View style={styles.mapRingOuter} />
          <View style={styles.mapRingInner} />
          <View style={styles.pin}>
            <Text style={{ fontSize: 20 }}>📍</Text>
          </View>
          <View style={styles.sunFloat}>
            <Text style={{ fontSize: 24 }}>☀</Text>
          </View>
        </View>

        <Text style={styles.header}>Allow Location Access</Text>
        <Text style={styles.description}>
          Dermis calculates UV radiation based on your exact location and altitude.
        </Text>

        <View style={styles.benefits}>
          {benefits.map(b => (
            <View key={b} style={styles.benefitRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <Button label="Allow Location Access" onPress={goHome} />
          <Button label="Enter location manually" variant="ghost" onPress={goHome} style={{ marginTop: Spacing.sm }} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: Spacing.xl3, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl2 },
  mapOuter: { width: 180, height: 180, borderRadius: 90, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  mapRingOuter: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: `${Colors.teal}40`, borderStyle: 'dashed' },
  mapRingInner: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: `${Colors.teal}60`, backgroundColor: `${Colors.teal}15` },
  pin: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${Colors.teal}30`, borderWidth: 2, borderColor: Colors.teal, alignItems: 'center', justifyContent: 'center' },
  sunFloat: { position: 'absolute', top: 12, right: 24 },
  header: { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold, color: Colors.textPrimary, textAlign: 'center' },
  description: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  benefits: { width: '100%', gap: Spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.navyCard, borderRadius: Radii.lg, borderWidth: 1, borderColor: Colors.border },
  checkmark: { color: Colors.teal },
  benefitText: { fontSize: FontSizes.sm, color: Colors.textPrimary },
  buttons: { width: '100%' },
});

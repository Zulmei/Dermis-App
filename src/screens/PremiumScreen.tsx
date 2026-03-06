// src/screens/PremiumScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Gradients } from '../theme';
import { Button, Card, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

const FEATURES = [
  { icon: '∞',  label: 'Unlimited UV Monitoring',    desc: 'No daily limits on tracking' },
  { icon: '🛰', label: 'Advanced Solar Modeling',     desc: 'NASA-grade radiation forecasts' },
  { icon: '📊', label: 'Sun Exposure Analytics',      desc: 'Monthly & yearly skin reports' },
  { icon: '🧬', label: 'Long-term Skin Insights',     desc: 'Cumulative UV damage tracking' },
  { icon: '🌍', label: 'Multi-location Tracking',     desc: 'Travel & compare UV globally' },
];

export function PremiumScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1C1408', Colors.navy]} locations={[0, 0.5]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroStar}>✦</Text>
          <Text style={styles.wordmark}>dermis <Text style={{ color: Colors.amber }}>pro</Text></Text>
          <Text style={styles.heroDes}>Advanced sun protection science, personalized for your skin.</Text>
        </View>

        {/* Feature card */}
        <Card variant="premium">
          {FEATURES.map((f, i) => (
            <View key={f.label} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureBorder]}>
              <View style={styles.featureIcon}>
                <Text style={{ fontSize: FontSizes.lg }}>{f.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDes}>{f.desc}</Text>
              </View>
              <Text style={[styles.featureCheck, { color: Colors.amber }]}>✓</Text>
            </View>
          ))}
        </Card>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>$9.99</Text>
          <Text style={styles.priceSub}>One-time unlock · No subscription</Text>
        </View>

        <Button
          label="✦  Unlock Dermis Pro"
          variant="gold"
          onPress={() => {}}
          style={styles.purchaseBtn}
        />
        <Text style={styles.trialNote}>Includes 7-day free trial · Cancel anytime</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.navy },
  back: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  backText: { fontSize: FontSizes.xl2, color: Colors.textMuted },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xl5, gap: Spacing.xl2 },
  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  heroStar: { fontSize: 48, marginBottom: Spacing.md },
  wordmark: { fontSize: FontSizes.xl5, fontWeight: FontWeights.bold, color: Colors.textPrimary, letterSpacing: -0.5 },
  heroDes: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: Spacing.md, maxWidth: 260 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingVertical: Spacing.md },
  featureBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  featureIcon: { width: 40, height: 40, borderRadius: Radii.xl, backgroundColor: `${Colors.amber}20`, borderWidth: 1, borderColor: `${Colors.amber}40`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureContent: { flex: 1 },
  featureLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  featureDes: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  featureCheck: { fontSize: FontSizes.sm },
  priceSection: { alignItems: 'center' },
  price: { fontSize: FontSizes.display, fontWeight: FontWeights.bold, color: Colors.amber },
  priceSub: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  purchaseBtn: {},
  trialNote: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center' },
});

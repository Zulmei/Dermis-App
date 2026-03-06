// src/screens/InsightsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Card, ScreenWrapper } from '../components';

const INSIGHTS = [
  { icon: '🌊', title: 'UV & Reflective Surfaces', tag: 'Environment',
    body: 'UV exposure increases significantly near reflective surfaces like water or sand, boosting intensity by up to 25%.' },
  { icon: '🔬', title: 'Understanding UV Radiation', tag: 'Science',
    body: 'UV radiation is invisible electromagnetic energy from the sun. UVA and UVB rays affect your skin differently at the cellular level.' },
  { icon: '☀', title: 'UVA vs UVB Explained', tag: 'Education',
    body: 'UVA penetrates deep into the dermis causing aging. UVB primarily affects the epidermis and is the main cause of sunburn.' },
  { icon: '👤', title: 'Your Skin Risk Profile', tag: 'Personal',
    body: 'Type II skin has moderate sensitivity. With UV Index 8.4 today, unprotected exposure causes redness in as little as 15 minutes.' },
  { icon: '🌥', title: 'Clouds Don\'t Block UV', tag: 'Safety',
    body: 'Overcast skies block only 10–20% of UV radiation. You can burn on cloudy days — sun protection is always necessary.' },
  { icon: '💊', title: 'Vitamin D & UV', tag: 'Health',
    body: 'Short UV exposure helps your body produce Vitamin D. Just 10–15 minutes of midday sun is enough for most skin types.' },
];

export function InsightsScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Sun Insights</Text>
        <Text style={styles.sub}>Science-backed UV education</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {INSIGHTS.map((item, i) => (
          <Card key={i}>
            <View style={styles.cardRow}>
              <View style={styles.iconTile}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={styles.cardBody}>{item.body}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.xl, paddingBottom: Spacing.sm },
  title: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  sub: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  cardRow: { flexDirection: 'row', gap: Spacing.lg, alignItems: 'flex-start' },
  iconTile: { width: 48, height: 48, borderRadius: Radii.xl2, backgroundColor: Colors.navyLight, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm, gap: Spacing.sm },
  cardTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textPrimary, flex: 1 },
  tagBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: `${Colors.teal}20`, borderWidth: 1, borderColor: `${Colors.teal}40` },
  tagText: { fontSize: FontSizes.xs, color: Colors.teal },
  cardBody: { fontSize: FontSizes.sm, color: Colors.textMuted, lineHeight: 18 },
});

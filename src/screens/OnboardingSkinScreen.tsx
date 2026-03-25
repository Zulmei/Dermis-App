// src/screens/OnboardingSkinScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import { skinTypeColor } from '../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

const SKIN_TYPES = [
  { id: 1, label: 'Type I',   desc: 'Very fair skin, always burns' },
  { id: 2, label: 'Type II',  desc: 'Fair skin, burns easily' },
  { id: 3, label: 'Type III', desc: 'Medium skin, sometimes burns' },
  { id: 4, label: 'Type IV',  desc: 'Olive skin, rarely burns' },
  { id: 5, label: 'Type V',   desc: 'Brown skin, very rarely burns' },
  { id: 6, label: 'Type VI',  desc: 'Dark skin, almost never burns' },
];

export function OnboardingSkinScreen({ navigation, route }: Props) {
  const { profile, setProfile } = useAppState();
  const [selected, setSelected] = useState<number>(profile.skinType);

  // Auto-select type returned from the camera screen
  useEffect(() => {
    const detected = route.params?.detectedSkinType;
    if (detected) setSelected(detected);
  }, [route.params?.detectedSkinType]);

  const handleNext = () => {
    setProfile({ ...profile, skinType: selected });
    navigation.navigate('OnboardingSunscreen');
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progress}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.progressSegment, i <= 1 && styles.progressActive]} />
          ))}
        </View>

        <Text style={styles.header}>Select Your Skin Type</Text>
        <Text style={styles.description}>Dermis uses the Fitzpatrick scale to estimate UV sensitivity.</Text>

        <Button
          label="Use Camera to Detect  →"
          variant="secondary"
          onPress={() => navigation.navigate('SkinCamera')}
          style={{ marginBottom: Spacing.xl }}
        />

        <View style={styles.list}>
          {SKIN_TYPES.map(type => {
            const isSelected = selected === type.id;
            const col = skinTypeColor(type.id);
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(type.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[`${col}80`, col]}
                  style={styles.swatch}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>{type.label}</Text>
                  <Text style={styles.cardDesc}>{type.desc}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button label="Next  →" onPress={handleNext} disabled={!selected} style={{ marginTop: Spacing.xl }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, padding: Spacing.xl3, paddingTop: Spacing.xl2, paddingBottom: Spacing.xl5 },
  progress: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.lg },
  progressSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  progressActive: { backgroundColor: Colors.teal },
  header: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  description: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.xl },
  list: { gap: Spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    padding: Spacing.lg, borderRadius: Radii.xl3,
    backgroundColor: Colors.navyCard, borderWidth: 1.5, borderColor: Colors.border,
  },
  cardSelected: { backgroundColor: `${Colors.teal}18`, borderColor: Colors.teal },
  swatch: { width: 44, height: 44, borderRadius: Radii.xl, flexShrink: 0 },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.textPrimary },
  cardDesc: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  checkCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: Colors.black, fontSize: 11, fontWeight: FontWeights.bold },
});

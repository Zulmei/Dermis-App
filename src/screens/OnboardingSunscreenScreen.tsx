// src/screens/OnboardingSunscreenScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Toggle, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

const SPF_OPTIONS = [0, 15, 30, 50, 70];
const REMINDERS = ['Every 2 hours', 'Based on UV exposure', 'Manual reminders'];

export function OnboardingSunscreenScreen({ navigation }: Props) {
  const { profile, setProfile } = useAppState();
  const [spf, setSpf] = useState(profile.defaultSpf);
  const [reminder, setReminder] = useState(profile.reapplyReminder);
  const [water, setWater] = useState(profile.waterExposure);

  const handleFinish = () => {
    setProfile({ ...profile, defaultSpf: spf, reapplyReminder: reminder, waterExposure: water });
    navigation.navigate('LocationPermission');
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progress}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.progressSegment, i <= 2 && styles.progressActive]} />
          ))}
        </View>

        <Text style={styles.header}>Sunscreen Settings</Text>

        {/* SPF Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DEFAULT SPF</Text>
          <View style={styles.chipRow}>
            {SPF_OPTIONS.map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.chip, spf === val && styles.chipSelected]}
                onPress={() => setSpf(val)}
              >
                <Text style={[styles.chipText, spf === val && styles.chipTextSelected]}>
                  {val === 0 ? 'None' : `SPF ${val}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REAPPLY REMINDER</Text>
          <View style={styles.reminderList}>
            {REMINDERS.map(r => {
              const active = reminder === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.reminderRow, active && styles.reminderRowActive]}
                  onPress={() => setReminder(r)}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.reminderText}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Water toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Water / Sweat Exposure</Text>
            <Text style={styles.toggleSub}>Reduce effective SPF time</Text>
          </View>
          <Toggle value={water} onValueChange={setWater} />
        </View>

        <Button label="Finish Setup  →" onPress={handleFinish} style={{ marginTop: Spacing.xl }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, padding: Spacing.xl3, paddingTop: Spacing.xl2, paddingBottom: Spacing.xl5 },
  progress: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.lg },
  progressSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  progressActive: { backgroundColor: Colors.teal },
  header: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.xl2 },
  section: { marginBottom: Spacing.xl2 },
  sectionLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: Radii.xl, backgroundColor: Colors.navyCard, borderWidth: 1.5, borderColor: Colors.border },
  chipSelected: { backgroundColor: `${Colors.teal}20`, borderColor: Colors.teal },
  chipText: { fontSize: FontSizes.sm, color: Colors.textPrimary },
  chipTextSelected: { color: Colors.teal },
  reminderList: { gap: Spacing.sm },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radii.xl2, backgroundColor: Colors.navyCard, borderWidth: 1.5, borderColor: Colors.border },
  reminderRowActive: { backgroundColor: `${Colors.teal}15`, borderColor: Colors.teal },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.teal },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  reminderText: { fontSize: FontSizes.sm, color: Colors.textPrimary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderRadius: Radii.xl2, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border },
  toggleLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.medium, color: Colors.textPrimary },
  toggleSub: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 3 },
});

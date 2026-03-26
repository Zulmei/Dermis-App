// src/screens/OnboardingSunscreenScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

const SPF_OPTIONS = [0, 15, 30, 50, 70];
const REMINDERS = ['Based on UV Exposure', 'Every 2 hours', 'Manual reminders'];
const MANUAL_PRESETS = [
  { label: '30m',  value: 30  },
  { label: '45m',  value: 45  },
  { label: '1h',   value: 60  },
  { label: '1.5h', value: 90  },
  { label: '2h',   value: 120 },
];

export function OnboardingSunscreenScreen({ navigation }: Props) {
  const { profile, setProfile } = useAppState();
  const [spf,          setSpf]          = useState(profile.defaultSpf);
  const [reminder,     setReminder]     = useState(profile.reapplyReminder);
  const [manualMinutes, setManualMinutes] = useState<number | null>(profile.manualReminderMinutes ?? null);
  const [showCustom,   setShowCustom]   = useState(false);
  const [customInput,  setCustomInput]  = useState('');

  const handleFinish = () => {
    const updates: Parameters<typeof setProfile>[0] = { ...profile, defaultSpf: spf, reapplyReminder: reminder };
    if (reminder === 'Manual reminders' && manualMinutes) {
      updates.manualReminderMinutes = manualMinutes;
    }
    setProfile(updates);
    navigation.navigate('LocationPermission');
  };

  const adjustCustom = (delta: number) => {
    const base = parseInt(customInput, 10) || 30;
    setCustomInput(String(Math.min(480, Math.max(5, base + delta))));
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
                <View key={r}>
                  <TouchableOpacity
                    style={[styles.reminderRow, active && styles.reminderRowActive]}
                    onPress={() => {
                      setReminder(r);
                      if (r !== 'Manual reminders') setShowCustom(false);
                    }}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.reminderText}>{r}</Text>
                  </TouchableOpacity>

                  {active && r === 'Manual reminders' && (
                    <View style={styles.manualExpanded}>
                      {!showCustom ? (
                        <View style={styles.manualChipRow}>
                          {MANUAL_PRESETS.map(p => (
                            <TouchableOpacity
                              key={p.value}
                              style={[styles.manualChip, manualMinutes === p.value && styles.manualChipActive]}
                              onPress={() => setManualMinutes(p.value)}
                            >
                              <Text style={[styles.manualChipText, manualMinutes === p.value && styles.manualChipTextActive]}>
                                {p.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            style={styles.manualChip}
                            onPress={() => { setShowCustom(true); setManualMinutes(null); setCustomInput(''); }}
                          >
                            <Text style={styles.manualChipText}>Custom…</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.customRow}>
                          <TouchableOpacity style={styles.adjBtn} onPress={() => adjustCustom(-5)}>
                            <Text style={styles.adjText}>−</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={styles.customInput}
                            value={customInput}
                            onChangeText={t => {
                              setCustomInput(t);
                              const n = parseInt(t, 10);
                              if (!isNaN(n) && n >= 5 && n <= 480) setManualMinutes(n);
                            }}
                            keyboardType="number-pad"
                            placeholder="min"
                            placeholderTextColor={Colors.textMuted}
                            maxLength={3}
                          />
                          <TouchableOpacity style={styles.adjBtn} onPress={() => adjustCustom(5)}>
                            <Text style={styles.adjText}>+</Text>
                          </TouchableOpacity>
                          <Text style={styles.minsLabel}>minutes</Text>
                          <TouchableOpacity onPress={() => setShowCustom(false)}>
                            <Text style={styles.backText}>← Presets</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
  reminderText:       { fontSize: FontSizes.sm, color: Colors.textPrimary },
  manualExpanded:     { marginTop: Spacing.sm, paddingHorizontal: Spacing.sm },
  manualChipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  manualChip:         { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radii.xl, backgroundColor: Colors.navy, borderWidth: 1.5, borderColor: Colors.border },
  manualChipActive:   { backgroundColor: `${Colors.teal}20`, borderColor: Colors.teal },
  manualChipText:     { fontSize: FontSizes.xs, color: Colors.textPrimary },
  manualChipTextActive: { color: Colors.teal, fontWeight: FontWeights.semibold },
  customRow:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  adjBtn:             { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.navy, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  adjText:            { fontSize: FontSizes.lg, color: Colors.textPrimary, lineHeight: 22 },
  customInput:        { width: 64, height: 40, borderRadius: Radii.lg, backgroundColor: Colors.navy, borderWidth: 1.5, borderColor: Colors.teal, color: Colors.textPrimary, fontSize: FontSizes.base, fontWeight: FontWeights.bold, textAlign: 'center' },
  minsLabel:          { fontSize: FontSizes.xs, color: Colors.textMuted },
  backText:           { fontSize: FontSizes.xs, color: Colors.teal },
});

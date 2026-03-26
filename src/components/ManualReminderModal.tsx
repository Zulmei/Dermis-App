// src/components/ManualReminderModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';

const PRESETS = [
  { label: '30m',  value: 30  },
  { label: '45m',  value: 45  },
  { label: '1h',   value: 60  },
  { label: '1.5h', value: 90  },
  { label: '2h',   value: 120 },
];

interface Props {
  visible:  boolean;
  current?: number;
  onConfirm: (minutes: number) => void;
  onClose:   () => void;
}

export function ManualReminderModal({ visible, current, onConfirm, onClose }: Props) {
  const [selected,    setSelected]    = useState<number | null>(null);
  const [showCustom,  setShowCustom]  = useState(false);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    if (!visible) return;
    const isPreset = PRESETS.some(p => p.value === current);
    if (current && !isPreset) {
      setShowCustom(true);
      setCustomInput(String(current));
      setSelected(null);
    } else {
      setShowCustom(false);
      setCustomInput('');
      setSelected(current ?? null);
    }
  }, [visible, current]);

  const customMinutes = parseInt(customInput, 10);
  const customValid   = !isNaN(customMinutes) && customMinutes >= 5 && customMinutes <= 480;
  const canSet        = showCustom ? customValid : selected !== null;

  const handleSet = () => {
    const mins = showCustom ? customMinutes : selected!;
    onConfirm(mins);
    onClose();
  };

  const adjust = (delta: number) => {
    const base = parseInt(customInput, 10) || 30;
    setCustomInput(String(Math.min(480, Math.max(5, base + delta))));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Set Reapply Reminder</Text>

          {!showCustom ? (
            <View style={styles.chipRow}>
              {PRESETS.map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.chip, selected === p.value && styles.chipActive]}
                  onPress={() => setSelected(p.value)}
                >
                  <Text style={[styles.chipText, selected === p.value && styles.chipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.chip}
                onPress={() => { setShowCustom(true); setSelected(null); setCustomInput(''); }}
              >
                <Text style={styles.chipText}>Custom…</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.customRow}>
              <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(-5)}>
                <Text style={styles.adjText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.customInput}
                value={customInput}
                onChangeText={setCustomInput}
                keyboardType="number-pad"
                placeholder="min"
                placeholderTextColor={Colors.textMuted}
                maxLength={3}
              />
              <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(5)}>
                <Text style={styles.adjText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.minsLabel}>minutes</Text>
            </View>
          )}

          <View style={styles.actions}>
            {showCustom && (
              <TouchableOpacity style={styles.backBtn} onPress={() => setShowCustom(false)}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.setBtn, !canSet && styles.setBtnDisabled]}
              onPress={handleSet}
              disabled={!canSet}
            >
              <Text style={styles.setBtnText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetWrapper: { justifyContent: 'flex-end' },
  sheet:        { backgroundColor: Colors.navyCard, borderTopLeftRadius: Radii.xl4, borderTopRightRadius: Radii.xl4, padding: Spacing.xl2, paddingBottom: Spacing.xl5 },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  title:        { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xl },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', marginBottom: Spacing.xl },
  chip:         { paddingVertical: 10, paddingHorizontal: 16, borderRadius: Radii.xl, backgroundColor: Colors.navy, borderWidth: 1.5, borderColor: Colors.border },
  chipActive:   { backgroundColor: `${Colors.teal}20`, borderColor: Colors.teal },
  chipText:     { fontSize: FontSizes.sm, color: Colors.textPrimary },
  chipTextActive: { color: Colors.teal, fontWeight: FontWeights.semibold },
  customRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  adjBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.navy, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  adjText:      { fontSize: FontSizes.xl, color: Colors.textPrimary, lineHeight: 24 },
  customInput:  { width: 72, height: 48, borderRadius: Radii.lg, backgroundColor: Colors.navy, borderWidth: 1.5, borderColor: Colors.teal, color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: FontWeights.bold, textAlign: 'center' },
  minsLabel:    { fontSize: FontSizes.sm, color: Colors.textMuted },
  actions:      { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  backBtn:      { flex: 1, paddingVertical: 14, borderRadius: Radii.xl2, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backText:     { fontSize: FontSizes.sm, color: Colors.textMuted },
  setBtn:       { flex: 2, paddingVertical: 14, borderRadius: Radii.xl2, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center' },
  setBtnDisabled: { opacity: 0.35 },
  setBtnText:   { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.navy },
});

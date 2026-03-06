// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Toggle, Card, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function SettingsScreen({ navigation }: Props) {
  const { notifyReapply, setNotifyReapply, notifyExtreme, setNotifyExtreme, gpsEnabled, setGpsEnabled, metricUnits, setMetricUnits } = useAppState();

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {children}
      </Card>
    </View>
  );

  const Row = ({ label, sub, right, last }: { label: string; sub?: string; right: React.ReactNode; last?: boolean }) => (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right}
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section label="NOTIFICATIONS">
          <Row label="Reapply Sunscreen Alerts" sub="Remind me every 2 hours" right={<Toggle value={notifyReapply} onValueChange={setNotifyReapply} />} />
          <Row label="Extreme UV Alerts" sub="UV Index ≥ 9" right={<Toggle value={notifyExtreme} onValueChange={setNotifyExtreme} />} last />
        </Section>

        <Section label="LOCATION">
          <Row label="GPS Location" sub="Real-time UV accuracy" right={<Toggle value={gpsEnabled} onValueChange={setGpsEnabled} />} />
          <Row label="Manual Location" sub="Hoboken, NJ"
            right={<Text style={styles.editLink}>Edit</Text>} last />
        </Section>

        <Section label="UNITS">
          <Row label="UV Scale" sub="WHO Standard" right={<Text style={styles.valueText}>0–11+</Text>} />
          <Row label="Distance" right={
            <View style={styles.segmented}>
              {['Imperial', 'Metric'].map(opt => (
                <TouchableOpacity key={opt} style={[styles.segment, !metricUnits && opt === 'Imperial' && styles.segmentActive, metricUnits && opt === 'Metric' && styles.segmentActive]} onPress={() => setMetricUnits(opt === 'Metric')}>
                  <Text style={[styles.segmentText, ((!metricUnits && opt === 'Imperial') || (metricUnits && opt === 'Metric')) && styles.segmentTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          } last />
        </Section>

        <Section label="DATA SOURCES">
          {['OpenUV API', 'NASA Solar Radiation', 'OpenWeather'].map((src, i, arr) => (
            <Row key={src} label={src} right={
              <View style={styles.activeBadge}>
                <Text style={styles.activeDot}>●</Text>
                <Text style={styles.activeText}> Active</Text>
              </View>
            } last={i === arr.length - 1} />
          ))}
        </Section>

        <Section label="PRIVACY & ACCOUNT">
          <Row label="Privacy Policy"  right={<Text style={styles.arrow}>→</Text>} />
          <Row label="Terms of Service" right={<Text style={styles.arrow}>→</Text>} />
          <View style={[styles.row]}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </View>
        </Section>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.xl, paddingBottom: Spacing.sm },
  backBtn: {},
  backText: { fontSize: FontSizes.xl2, color: Colors.textMuted },
  title: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xl4 },
  section: { gap: Spacing.sm },
  sectionLabel: { fontSize: 11, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', paddingLeft: Spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: FontSizes.sm, color: Colors.textPrimary },
  rowSub: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  editLink: { fontSize: FontSizes.sm, color: Colors.teal },
  valueText: { fontSize: FontSizes.sm, color: Colors.textMuted },
  arrow: { fontSize: FontSizes.sm, color: Colors.textMuted },
  segmented: { flexDirection: 'row', backgroundColor: Colors.navyLight, borderRadius: Spacing.sm, padding: 3, gap: 2 },
  segment: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  segmentActive: { backgroundColor: Colors.teal },
  segmentText: { fontSize: FontSizes.sm, color: Colors.textMuted },
  segmentTextActive: { color: Colors.black, fontWeight: FontWeights.semibold },
  activeBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: `${Colors.green}20`, borderWidth: 1, borderColor: `${Colors.green}40` },
  activeDot: { color: Colors.green, fontSize: 11 },
  activeText: { color: Colors.green, fontSize: 11 },
  deleteText: { fontSize: FontSizes.sm, color: Colors.red },
});

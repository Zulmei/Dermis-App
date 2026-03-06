// src/screens/SunscreenAlertScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Card, ProgressBar, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function SunscreenAlertScreen({ navigation }: Props) {
  const handleReapply = () => navigation.goBack();

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>🧴</Text>
        </View>

        <Text style={styles.title}>Time to Reapply Sunscreen</Text>
        <Text style={styles.body}>
          Your SPF protection may have decreased due to sweat or time elapsed.
        </Text>

        <Card style={styles.spfCard}>
          <View style={styles.spfHeader}>
            <Text style={styles.spfLabel}>SPF Effectiveness</Text>
            <Text style={[styles.spfPct, { color: Colors.orange }]}>42% remaining</Text>
          </View>
          <ProgressBar pct={0.42} solidColor={Colors.orange} height={6} />
        </Card>

        <View style={styles.buttons}>
          <Button
            label="✓  Reapply & Restart Timer"
            variant="amberOrange"
            onPress={handleReapply}
          />
          <Button label="Dismiss" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: Spacing.sm }} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: Spacing.xl3, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl2 },
  iconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${Colors.amber}20`, borderWidth: 2, borderColor: Colors.amber, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48 },
  title: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary, textAlign: 'center' },
  body: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  spfCard: { width: '100%' },
  spfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  spfLabel: { fontSize: FontSizes.sm, color: Colors.textMuted },
  spfPct: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  buttons: { width: '100%' },
});

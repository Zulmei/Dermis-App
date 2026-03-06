// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Input, Card, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        {sent ? (
          <Card style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Text style={{ fontSize: 28 }}>✉</Text>
            </View>
            <Text style={styles.confirmTitle}>Check your inbox</Text>
            <Text style={styles.confirmText}>Reset instructions have been sent to your email address.</Text>
          </Card>
        ) : (
          <>
            <Input
              label="Email Address"
              placeholder="jane@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ marginTop: Spacing.sm }}
            />
            <View style={styles.spacer} />
            <Button label="Send Reset Link" onPress={() => setSent(true)} disabled={!email} />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: Spacing.xl3, paddingTop: Spacing.xl2 },
  back: { marginBottom: Spacing.xl5 },
  backText: { fontSize: FontSizes.xl3, color: Colors.textMuted },
  header: { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  description: { fontSize: FontSizes.sm, color: Colors.textMuted, lineHeight: 20 },
  spacer: { flex: 1 },
  confirmCard: { marginTop: Spacing.xl2, alignItems: 'center', padding: 28 },
  confirmIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: `${Colors.teal}22`, borderWidth: 1, borderColor: Colors.teal, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  confirmTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  confirmText: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

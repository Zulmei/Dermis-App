// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Input, Card, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function ForgotPasswordScreen({ navigation }: Props) {
  const { requestPasswordReset, authError, clearAuthError } = useAppState();

  const [email,    setEmail]    = useState('');
  const [sent,     setSent]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleChange = (v: string) => {
    setEmail(v);
    setLocalErr(null);
    clearAuthError();
  };

  const handleSend = async () => {
    if (!email.trim()) {
      setLocalErr('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalErr('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err: any) {
      setLocalErr(err.message ?? 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = localErr ?? authError;

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          /* ── Confirmation state ── */
          <Card style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Text style={{ fontSize: 28 }}>✉</Text>
            </View>
            <Text style={styles.confirmTitle}>Check your inbox</Text>
            <Text style={styles.confirmText}>
              Reset instructions have been sent to {email}. Check your spam folder if you
              don't see it within a few minutes.
            </Text>
            <Button
              label="Back to Sign In"
              variant="secondary"
              onPress={() => navigation.navigate('SignIn')}
              style={{ marginTop: Spacing.xl }}
            />
          </Card>
        ) : (
          /* ── Form state ── */
          <>
            {displayError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            <Input
              label="Email Address"
              placeholder="jane@example.com"
              value={email}
              onChangeText={handleChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={{ marginTop: Spacing.sm }}
            />

            <View style={styles.spacer} />

            {loading ? (
              <ActivityIndicator color={Colors.teal} size="large" />
            ) : (
              <Button
                label="Send Reset Link"
                onPress={handleSend}
                disabled={!email.trim()}
              />
            )}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, padding: Spacing.xl3, paddingTop: Spacing.xl2 },
  back:         { marginBottom: Spacing.xl5 },
  backText:     { fontSize: FontSizes.xl3, color: Colors.textMuted },
  header:       { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  description:  { fontSize: FontSizes.sm, color: Colors.textMuted, lineHeight: 20 },
  errorBanner:  { backgroundColor: `${Colors.red}18`, borderWidth: 1, borderColor: `${Colors.red}40`, borderRadius: Radii.lg, padding: Spacing.md, marginVertical: Spacing.md },
  errorText:    { fontSize: FontSizes.sm, color: Colors.red, lineHeight: 18 },
  spacer:       { flex: 1 },
  confirmCard:  { marginTop: Spacing.xl2, alignItems: 'center', padding: 28 },
  confirmIcon:  { width: 56, height: 56, borderRadius: 28, backgroundColor: `${Colors.teal}22`, borderWidth: 1, borderColor: Colors.teal, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  confirmTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  confirmText:  { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

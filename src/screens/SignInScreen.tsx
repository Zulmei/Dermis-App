// src/screens/SignInScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Input, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function SignInScreen({ navigation }: Props) {
  const { signIn, authLoading, authError, clearAuthError } = useAppState();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setValidationError(null);
    clearAuthError();
  };

  const validate = (): boolean => {
    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return false;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    try {
      await signIn({ email: email.trim(), password });
      // Session is now persisted. Navigate into the app.
      navigation.replace('MainTabs');
    } catch (_) {
      // authError is set inside AppState.signIn
    }
  };

  const displayError = validationError ?? authError;

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Welcome Back</Text>
        <Text style={styles.sub}>Sign in to your Dermis account</Text>

        {/* Error banner */}
        {displayError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="jane@example.com"
            value={email}
            onChangeText={handleChange(setEmail)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={handleChange(setPassword)}
            secureTextEntry
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {authLoading ? (
            <ActivityIndicator color={Colors.teal} size="large" style={styles.loader} />
          ) : (
            <Button label="Sign In" onPress={handleSignIn} />
          )}

          <View style={styles.ssoRow}>
            {['🍎  Apple', 'G  Google'].map(t => (
              <TouchableOpacity key={t} style={styles.ssoBtn}>
                <Text style={styles.ssoBtnText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>
              New here? <Text style={styles.link}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  content:     { flexGrow: 1, padding: Spacing.xl3, paddingTop: Spacing.xl2 },
  back:        { marginBottom: Spacing.xl5 },
  backText:    { fontSize: FontSizes.xl3, color: Colors.textMuted },
  header:      { fontSize: FontSizes.xl4, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  sub:         { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.xl2 },
  errorBanner: { backgroundColor: `${Colors.red}18`, borderWidth: 1, borderColor: `${Colors.red}40`, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md },
  errorText:   { fontSize: FontSizes.sm, color: Colors.red, lineHeight: 18 },
  form:        { gap: Spacing.md },
  forgotRow:   { alignSelf: 'flex-end' },
  forgotText:  { fontSize: FontSizes.sm, color: Colors.teal },
  link:        { color: Colors.teal },
  footer:      { marginTop: 'auto', paddingTop: Spacing.xl5, gap: Spacing.md },
  loader:      { marginVertical: Spacing.md },
  ssoRow:      { flexDirection: 'row', gap: Spacing.md },
  ssoBtn:      { flex: 1, paddingVertical: 13, borderRadius: Radii.xl, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  ssoBtnText:  { fontSize: FontSizes.sm, color: Colors.textPrimary },
  footerLink:  { alignItems: 'center' },
  footerText:  { fontSize: FontSizes.sm, color: Colors.textMuted },
});

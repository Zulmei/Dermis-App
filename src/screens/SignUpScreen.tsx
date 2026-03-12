// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Input, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function SignUpScreen({ navigation }: Props) {
  const { signUp, authLoading, authError, clearAuthError } = useAppState();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [agreed,   setAgreed]   = useState(false);

  // Inline validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setValidationError(null);
    clearAuthError();
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return false;
    }
    if (!/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      setValidationError('Password must include a number and a symbol.');
      return false;
    }
    if (password !== confirm) {
      setValidationError('Passwords do not match.');
      return false;
    }
    if (!agreed) {
      setValidationError('You must agree to the Privacy Policy and Terms of Service.');
      return false;
    }
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;

    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
      // AppState navigates via SplashScreen logic — but since we're already in
      // the stack we navigate manually to the onboarding welcome screen.
      navigation.navigate('OnboardingWelcome');
    } catch (_) {
      // authError is set inside AppState.signUp — no additional handling needed.
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

        <Text style={styles.header}>Create Your{'\n'}Dermis Account</Text>

        {/* Error banner */}
        {displayError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            value={name}
            onChangeText={handleChange(setName)}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Input
            label="Email Address"
            placeholder="jane@example.com"
            value={email}
            onChangeText={handleChange(setEmail)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={handleChange(setPassword)}
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirm}
            onChangeText={handleChange(setConfirm)}
            secureTextEntry
          />
          <Text style={styles.hint}>At least 8 characters with a number and symbol.</Text>

          <TouchableOpacity onPress={() => setAgreed(!agreed)} style={styles.checkRow}>
            <View style={[styles.check, agreed && styles.checkActive]}>
              {agreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkText}>
              I agree to the <Text style={styles.link}>Privacy Policy</Text> and{' '}
              <Text style={styles.link}>Terms of Service</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {authLoading ? (
            <ActivityIndicator color={Colors.teal} size="large" style={styles.loader} />
          ) : (
            <Button
              label="Create Account"
              onPress={handleCreateAccount}
              disabled={!agreed}
            />
          )}

          <View style={styles.ssoRow}>
            {['🍎  Apple', 'G  Google'].map(t => (
              <TouchableOpacity key={t} style={styles.ssoBtn}>
                <Text style={styles.ssoBtnText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.link}>Sign In</Text>
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
  back:        { marginBottom: Spacing.xl },
  backText:    { fontSize: FontSizes.xl3, color: Colors.textMuted },
  header:      { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold, color: Colors.textPrimary, lineHeight: 30, marginBottom: Spacing.xl2 },
  errorBanner: { backgroundColor: `${Colors.red}18`, borderWidth: 1, borderColor: `${Colors.red}40`, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md },
  errorText:   { fontSize: FontSizes.sm, color: Colors.red, lineHeight: 18 },
  form:        { gap: Spacing.md },
  hint:        { fontSize: FontSizes.sm, color: Colors.textMuted },
  checkRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginTop: Spacing.xs },
  check:       { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  checkActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  checkMark:   { color: Colors.black, fontSize: 12, fontWeight: FontWeights.bold },
  checkText:   { fontSize: FontSizes.sm, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  link:        { color: Colors.teal },
  footer:      { marginTop: 'auto', paddingTop: Spacing.xl, gap: Spacing.md },
  loader:      { marginVertical: Spacing.md },
  ssoRow:      { flexDirection: 'row', gap: Spacing.md },
  ssoBtn:      { flex: 1, paddingVertical: 13, borderRadius: Radii.xl, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  ssoBtnText:  { fontSize: FontSizes.sm, color: Colors.textPrimary },
  footerLink:  { alignItems: 'center' },
  footerText:  { fontSize: FontSizes.sm, color: Colors.textMuted },
});

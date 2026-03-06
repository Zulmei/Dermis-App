// src/screens/SignInScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Input, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScreenWrapper>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Welcome Back</Text>
        <Text style={styles.sub}>Sign in to your Dermis account</Text>

        <View style={styles.form}>
          <Input label="Email" placeholder="jane@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" placeholder="Your password" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button label="Sign In" onPress={() => navigation.navigate('MainTabs')} />
          <View style={styles.ssoRow}>
            {['🍎  Apple', 'G  Google'].map(t => (
              <TouchableOpacity key={t} style={styles.ssoBtn}>
                <Text style={styles.ssoBtnText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.footerLink}>
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
  root: { flex: 1 },
  content: { flexGrow: 1, padding: Spacing.xl3, paddingTop: Spacing.xl2 },
  back: { marginBottom: Spacing.xl5 },
  backText: { fontSize: FontSizes.xl3, color: Colors.textMuted },
  header: { fontSize: FontSizes.xl4, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  sub: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.xl2 },
  form: { gap: Spacing.md },
  forgotRow: { alignSelf: 'flex-end' },
  forgotText: { fontSize: FontSizes.sm, color: Colors.teal },
  link: { color: Colors.teal },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl5, gap: Spacing.md },
  ssoRow: { flexDirection: 'row', gap: Spacing.md },
  ssoBtn: { flex: 1, paddingVertical: 13, borderRadius: Radii.xl, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  ssoBtnText: { fontSize: FontSizes.sm, color: Colors.textPrimary },
  footerLink: { alignItems: 'center' },
  footerText: { fontSize: FontSizes.sm, color: Colors.textMuted },
});

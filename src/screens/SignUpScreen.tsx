// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Input, ScreenWrapper } from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

export function SignUpScreen({ navigation }: Props) {
  const [agreed, setAgreed] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <ScreenWrapper>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Create Your{'\n'}Dermis Account</Text>

        <View style={styles.form}>
          <Input label="Full Name" placeholder="Jane Smith" value={name} onChangeText={setName} autoCapitalize="words" />
          <Input label="Email Address" placeholder="jane@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="Confirm Password" placeholder="Re-enter password" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <Text style={styles.hint}>At least 8 characters with a number and symbol.</Text>

          <TouchableOpacity onPress={() => setAgreed(!agreed)} style={styles.checkRow}>
            <View style={[styles.check, agreed && styles.checkActive]}>
              {agreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkText}>
              I agree to the <Text style={styles.link}>Privacy Policy</Text> and <Text style={styles.link}>Terms of Service</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button label="Create Account" onPress={() => navigation.navigate('OnboardingWelcome')} disabled={!agreed} />
          <View style={styles.ssoRow}>
            {['🍎  Apple', 'G  Google'].map(t => (
              <TouchableOpacity key={t} style={styles.ssoBtn}>
                <Text style={styles.ssoBtnText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.footerLink}>
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
  root: { flex: 1 },
  content: { flexGrow: 1, padding: Spacing.xl3, paddingTop: Spacing.xl2 },
  back: { marginBottom: Spacing.xl },
  backText: { fontSize: FontSizes.xl3, color: Colors.textMuted },
  header: { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold, color: Colors.textPrimary, lineHeight: 30, marginBottom: Spacing.xl2 },
  form: { gap: Spacing.md },
  hint: { fontSize: FontSizes.sm, color: Colors.textMuted },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginTop: Spacing.xs },
  check: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  checkActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  checkMark: { color: Colors.black, fontSize: 12, fontWeight: FontWeights.bold },
  checkText: { fontSize: FontSizes.sm, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  link: { color: Colors.teal },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl, gap: Spacing.md },
  ssoRow: { flexDirection: 'row', gap: Spacing.md },
  ssoBtn: { flex: 1, paddingVertical: 13, borderRadius: Radii.xl, backgroundColor: Colors.navyCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  ssoBtnText: { fontSize: FontSizes.sm, color: Colors.textPrimary },
  footerLink: { alignItems: 'center' },
  footerText: { fontSize: FontSizes.sm, color: Colors.textMuted },
});

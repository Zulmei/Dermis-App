// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Card, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import { skinTypeName, spfLabel } from '../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, CommonActions } from '@react-navigation/native';

interface Props { navigation: NativeStackNavigationProp<any> }

export function ProfileScreen({ navigation }: Props) {
  const { profile, setIsAuthenticated, setOnboardingComplete } = useAppState();

  // FIX: The original code called navigation.getParent()?.navigate('Auth').
  // This failed for two reasons:
  //
  //   1. There is no screen named 'Auth' — the auth screens live directly in
  //      AuthStack (Splash, AuthLanding, SignUp, etc.).
  //
  //   2. ProfileScreen sits inside ProfileTabStack → MainTabs → AuthStack,
  //      so getParent() only climbs one level (to MainTabs/Tab.Navigator),
  //      not all the way up to AuthStack. A second getParent() call would
  //      reach AuthStack, but that's fragile if the nesting ever changes.
  //
  // The robust fix is to use CommonActions.reset on the root navigator,
  // which clears the entire navigation stack and lands on AuthLanding —
  // exactly what you'd want after sign-out so the user can't press Back
  // to get back into the app.
  //
  // We also clear the auth flags in AppState so that if the app is
  // backgrounded and resumed, SplashScreen routes to AuthLanding instead
  // of MainTabs.
  const rootNavigation = useNavigation();

  const handleLogOut = () => {
    setIsAuthenticated(false);
    setOnboardingComplete(false);
    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AuthLanding' }],
      }),
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar card */}
        <Card style={styles.avatarCard}>
          <LinearGradient colors={[Colors.teal, Colors.amber]} style={styles.avatar}>
            <Text style={{ fontSize: 28 }}>👤</Text>
          </LinearGradient>
          <View>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
          </View>
        </Card>

        {/* Skin profile */}
        <Card>
          <Text style={styles.sectionLabel}>SKIN PROFILE</Text>
          {[
            ['Skin Type',    skinTypeName(profile.skinType)],
            ['Default SPF',  spfLabel(profile.defaultSpf)],
            ['Member Since', 'March 2025'],
          ].map(([label, value], i, arr) => (
            <View key={label} style={[styles.profileRow, i < arr.length - 1 && styles.rowBorder]}>
              <Text style={styles.profileLabel}>{label}</Text>
              <Text style={styles.profileValue}>{value}</Text>
            </View>
          ))}
        </Card>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Button label="Edit Profile" variant="secondary" onPress={() => {}} />
          <Button label="⚙  Settings" variant="ghost" onPress={() => navigation.navigate('Settings')} style={styles.ghostBtn} />
          <Button label="✦  Dermis Pro" variant="ghost" onPress={() => navigation.navigate('Premium')} style={[styles.ghostBtn, styles.premiumBtn]} textStyle={{ color: Colors.amber }} />
          <Button label="Log Out" variant="danger" onPress={handleLogOut} style={{ marginTop: Spacing.sm }} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.xl, paddingBottom: Spacing.sm },
  title: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userName: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  userEmail: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  profileLabel: { fontSize: FontSizes.sm, color: Colors.textMuted },
  profileValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.textPrimary },
  actions: { gap: Spacing.md },
  ghostBtn: { borderWidth: 0 },
  premiumBtn: {},
});

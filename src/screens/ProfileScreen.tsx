// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button, Card, ScreenWrapper } from '../components';
import { useAppState } from '../state/AppState';
import { skinTypeName, spfLabel } from '../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, CommonActions } from '@react-navigation/native';

interface Props { navigation: NativeStackNavigationProp<any> }

export function ProfileScreen({ navigation }: Props) {
  const {
    profile,
    user,
    authLoading,
    signOut,
  } = useAppState();

  const rootNavigation = useNavigation();

  const handleLogOut = async () => {
    // signOut clears the Parse session, resets AppState, then we
    // navigate back to AuthLanding with a clean stack.
    await signOut();
    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AuthLanding' }],
      }),
    );
  };

  // Prefer the Parse user's email over the profile default.
  const displayEmail = user?.email ?? profile.email;
  const displayName  = profile.name ?? user?.username ?? 'Dermis User';

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
          <View style={styles.avatarInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
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
          <Button label="Edit Profile"   variant="secondary" onPress={() => {}} />
          <Button label="⚙  Settings"   variant="ghost"     onPress={() => navigation.navigate('Settings')} style={styles.ghostBtn} />
          <Button label="✦  Dermis Pro" variant="ghost"     onPress={() => navigation.navigate('Premium')}  style={[styles.ghostBtn, styles.premiumBtn]} textStyle={{ color: Colors.amber }} />

          {authLoading ? (
            <ActivityIndicator color={Colors.red} style={{ marginTop: Spacing.sm }} />
          ) : (
            <Button
              label="Log Out"
              variant="danger"
              onPress={handleLogOut}
              style={{ marginTop: Spacing.sm }}
            />
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:       { padding: Spacing.xl, paddingBottom: Spacing.sm },
  title:        { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  content:      { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl4 },
  avatarCard:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatar:       { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarInfo:   { flex: 1 },
  userName:     { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  userEmail:    { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  profileRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: Colors.border },
  profileLabel: { fontSize: FontSizes.sm, color: Colors.textMuted },
  profileValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.textPrimary },
  actions:      { gap: Spacing.md },
  ghostBtn:     { borderWidth: 0 },
  premiumBtn:   {},
});

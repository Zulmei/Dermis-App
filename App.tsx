// App.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProvider } from './src/state/AppState';
import { Colors, FontSizes, FontWeights, Spacing } from './src/theme';
import { DevScreenPicker, ScreenKey } from './src/navigation/DevScreenPicker';

// All screens (direct imports — bypasses RN Navigation for the picker)
import { SplashScreen }             from './src/screens/SplashScreen';
import { AuthLandingScreen }        from './src/screens/AuthLandingScreen';
import { SignUpScreen }             from './src/screens/SignUpScreen';
import { SignInScreen }             from './src/screens/SignInScreen';
import { ForgotPasswordScreen }     from './src/screens/ForgotPasswordScreen';
import { OnboardingWelcomeScreen }  from './src/screens/OnboardingWelcomeScreen';
import { OnboardingSkinScreen }     from './src/screens/OnboardingSkinScreen';
import { OnboardingSunscreenScreen }from './src/screens/OnboardingSunscreenScreen';
import { LocationPermissionScreen } from './src/screens/LocationPermissionScreen';
import { HomeScreen }               from './src/screens/HomeScreen';
import { ExposureActiveScreen }     from './src/screens/ExposureActiveScreen';
import { SunscreenAlertScreen }     from './src/screens/SunscreenAlertScreen';
import { ForecastScreen }           from './src/screens/ForecastScreen';
import { InsightsScreen }           from './src/screens/InsightsScreen';
import { HistoryScreen }            from './src/screens/HistoryScreen';
import { ProfileScreen }            from './src/screens/ProfileScreen';
import { SettingsScreen }           from './src/screens/SettingsScreen';
import { PremiumScreen }            from './src/screens/PremiumScreen';

// ── Mock navigation object for standalone screen rendering ────────────────
function makeMockNav(navigate: (screen: ScreenKey) => void): any {
  return {
    navigate: (name: string) => {
      const map: Record<string, ScreenKey> = {
        AuthLanding:          'AuthLanding',
        SignUp:               'SignUp',
        SignIn:               'SignIn',
        ForgotPassword:       'ForgotPassword',
        OnboardingWelcome:    'OnboardingWelcome',
        OnboardingSkin:       'OnboardingSkin',
        OnboardingSunscreen:  'OnboardingSunscreen',
        LocationPermission:   'LocationPermission',
        MainTabs:             'Home',
        Home:                 'Home',
        ExposureActive:       'ExposureActive',
        SunscreenAlert:       'SunscreenAlert',
        ForecastTab:          'Forecast',
        InsightsTab:          'Insights',
        HistoryTab:           'History',
        ProfileTab:           'Profile',
        Settings:             'Settings',
        Premium:              'Premium',
      };
      if (map[name]) navigate(map[name] as ScreenKey);
    },
    goBack: () => {},
    replace: (name: string) => {
      const map: Record<string, ScreenKey> = {
        AuthLanding: 'AuthLanding',
        MainTabs:    'Home',
      };
      if (map[name]) navigate(map[name] as ScreenKey);
    },
    getParent: () => ({ navigate: (name: string) => { if (name === 'Auth') navigate('AuthLanding'); } }),
  };
}

// ── Screen renderer ───────────────────────────────────────────────────────
function renderScreen(screen: ScreenKey, nav: any) {
  const props = { navigation: nav };
  switch (screen) {
    case 'Splash':              return <SplashScreen {...props} />;
    case 'AuthLanding':         return <AuthLandingScreen {...props} />;
    case 'SignUp':              return <SignUpScreen {...props} />;
    case 'SignIn':              return <SignInScreen {...props} />;
    case 'ForgotPassword':      return <ForgotPasswordScreen {...props} />;
    case 'OnboardingWelcome':   return <OnboardingWelcomeScreen {...props} />;
    case 'OnboardingSkin':      return <OnboardingSkinScreen {...props} />;
    case 'OnboardingSunscreen': return <OnboardingSunscreenScreen {...props} />;
    case 'LocationPermission':  return <LocationPermissionScreen {...props} />;
    case 'Home':                return <HomeScreen {...props} />;
    case 'ExposureActive':      return <ExposureActiveScreen {...props} />;
    case 'SunscreenAlert':      return <SunscreenAlertScreen {...props} />;
    case 'Forecast':            return <ForecastScreen />;
    case 'Insights':            return <InsightsScreen />;
    case 'History':             return <HistoryScreen />;
    case 'Profile':             return <ProfileScreen {...props} />;
    case 'Settings':            return <SettingsScreen {...props} />;
    case 'Premium':             return <PremiumScreen {...props} />;
    default:                    return null;
  }
}

// ── App shell ─────────────────────────────────────────────────────────────
export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('Splash');
  const nav = makeMockNav(setActiveScreen);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <SafeAreaView style={styles.root} edges={['top']}>
            {/* Dev pill nav bar */}
            <View style={styles.pickerHeader}>
              <Text style={styles.brandText}>☀  dermis</Text>
              <Text style={styles.brandSub}>UI Prototype</Text>
            </View>
            <DevScreenPicker active={activeScreen} onSelect={setActiveScreen} />

            {/* Screen content */}
            <View style={styles.screen}>
              {renderScreen(activeScreen, nav)}
            </View>
          </SafeAreaView>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  brandText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.teal,
  },
  brandSub: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
});

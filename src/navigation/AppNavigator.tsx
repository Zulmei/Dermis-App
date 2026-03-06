// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';

// Screens
import { SplashScreen }               from '../screens/SplashScreen';
import { AuthLandingScreen }           from '../screens/AuthLandingScreen';
import { SignUpScreen }                from '../screens/SignUpScreen';
import { SignInScreen }                from '../screens/SignInScreen';
import { ForgotPasswordScreen }        from '../screens/ForgotPasswordScreen';
import { OnboardingWelcomeScreen }     from '../screens/OnboardingWelcomeScreen';
import { OnboardingSkinScreen }        from '../screens/OnboardingSkinScreen';
import { OnboardingSunscreenScreen }   from '../screens/OnboardingSunscreenScreen';
import { LocationPermissionScreen }    from '../screens/LocationPermissionScreen';
import { HomeScreen }                  from '../screens/HomeScreen';
import { ExposureActiveScreen }        from '../screens/ExposureActiveScreen';
import { SunscreenAlertScreen }        from '../screens/SunscreenAlertScreen';
import { ForecastScreen }              from '../screens/ForecastScreen';
import { InsightsScreen }              from '../screens/InsightsScreen';
import { HistoryScreen }               from '../screens/HistoryScreen';
import { ProfileScreen }               from '../screens/ProfileScreen';
import { SettingsScreen }              from '../screens/SettingsScreen';
import { PremiumScreen }               from '../screens/PremiumScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Bottom Tab Navigator ──────────────────────────────────────────────────
const TAB_ITEMS = [
  { name: 'HomeTab',     label: 'Home',     icon: '⊙' },
  { name: 'ForecastTab', label: 'Forecast', icon: '◈' },
  { name: 'InsightsTab', label: 'Insights', icon: '✦' },
  { name: 'HistoryTab',  label: 'History',  icon: '◷' },
  { name: 'ProfileTab',  label: 'Profile',  icon: '◉' },
];

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, descriptors, navigation }) => (
        <View style={tabStyles.bar}>
          {state.routes.map((route, index) => {
            const item = TAB_ITEMS[index];
            const active = state.index === index;
            return (
              <TouchableOpacity
                key={route.key}
                style={tabStyles.tab}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.7}
              >
                <Text style={[tabStyles.icon, active && tabStyles.iconActive]}>{item.icon}</Text>
                <Text style={[tabStyles.label, active && tabStyles.labelActive]}>{item.label}</Text>
                {active && <View style={tabStyles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="HomeTab"     component={HomeTabStack} />
      <Tab.Screen name="ForecastTab" component={ForecastScreen} />
      <Tab.Screen name="InsightsTab" component={InsightsScreen} />
      <Tab.Screen name="HistoryTab"  component={HistoryScreen} />
      <Tab.Screen name="ProfileTab"  component={ProfileTabStack} />
    </Tab.Navigator>
  );
}

// Home stack (includes active + alert)
function HomeTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Home"            component={HomeScreen} />
      <Stack.Screen name="ExposureActive"  component={ExposureActiveScreen} />
      <Stack.Screen name="SunscreenAlert"  component={SunscreenAlertScreen} />
    </Stack.Navigator>
  );
}

// Profile stack (includes settings + premium)
function ProfileTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Profile"  component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Premium"  component={PremiumScreen} />
    </Stack.Navigator>
  );
}

// Auth stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash"              component={SplashScreen} />
      <Stack.Screen name="AuthLanding"         component={AuthLandingScreen} />
      <Stack.Screen name="SignUp"              component={SignUpScreen} />
      <Stack.Screen name="SignIn"              component={SignInScreen} />
      <Stack.Screen name="ForgotPassword"      component={ForgotPasswordScreen} />
      <Stack.Screen name="OnboardingWelcome"   component={OnboardingWelcomeScreen} />
      <Stack.Screen name="OnboardingSkin"      component={OnboardingSkinScreen} />
      <Stack.Screen name="OnboardingSunscreen" component={OnboardingSunscreenScreen} />
      <Stack.Screen name="LocationPermission"  component={LocationPermissionScreen} />
      <Stack.Screen name="MainTabs"            component={MainTabs} />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    height: 80,
    backgroundColor: Colors.navyMid,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    paddingBottom: 16,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  iconActive: {
    color: Colors.teal,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: Colors.teal,
    fontWeight: FontWeights.semibold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.teal,
  },
});

// ── Root Navigator ────────────────────────────────────────────────────────
export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: Colors.teal,
            background: Colors.navy,
            card: Colors.navyCard,
            text: Colors.textPrimary,
            border: Colors.border,
            notification: Colors.teal,
          },
        }}
      >
        <AuthStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

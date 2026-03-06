# ☀ Dermis — React Native (Expo) App

> Your UV & Skin Guardian — full 18-screen implementation matching the frozen UI spec v1.0.

---

## Quick Start

```bash
cd dermis
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS or Android).  
Press `w` for web preview.

---

## Folder Structure

```
dermis/
├── App.tsx                     # Root — dev picker shell
├── app.json                    # Expo config
├── babel.config.js
├── tsconfig.json
└── src/
    ├── theme/
    │   ├── tokens.ts           # ★ Single source of truth for all design tokens
    │   └── index.ts
    ├── data/
    │   ├── mockData.ts         # All mock data + TypeScript types
    │   └── index.ts
    ├── state/
    │   ├── AppState.tsx        # React Context: timer, profile, settings
    │   └── index.ts
    ├── utils/
    │   ├── format.ts           # Helpers: formatTimer, uvColor, skinTypeName…
    │   └── index.ts
    ├── components/
    │   ├── Button.tsx          # 6 variants: primary/secondary/ghost/danger/gold/amberOrange
    │   ├── Card.tsx            # 4 variants: default/alert/premium/teal
    │   ├── CircularTimer.tsx   # SVG countdown ring
    │   ├── Input.tsx           # Focus-animated text field
    │   ├── ProgressBar.tsx     # Solid or gradient fill
    │   ├── ScreenWrapper.tsx   # SafeAreaView + optional ScrollView
    │   ├── Toggle.tsx          # Animated iOS-style toggle
    │   ├── UVBarChart.tsx      # Flex-based UV bar chart
    │   └── index.ts
    ├── screens/                # All 18 screens
    │   ├── SplashScreen.tsx
    │   ├── AuthLandingScreen.tsx
    │   ├── SignUpScreen.tsx
    │   ├── SignInScreen.tsx
    │   ├── ForgotPasswordScreen.tsx
    │   ├── OnboardingWelcomeScreen.tsx
    │   ├── OnboardingSkinScreen.tsx
    │   ├── OnboardingSunscreenScreen.tsx
    │   ├── LocationPermissionScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── ExposureActiveScreen.tsx
    │   ├── SunscreenAlertScreen.tsx
    │   ├── ForecastScreen.tsx
    │   ├── InsightsScreen.tsx
    │   ├── HistoryScreen.tsx
    │   ├── ProfileScreen.tsx
    │   ├── SettingsScreen.tsx
    │   └── PremiumScreen.tsx
    └── navigation/
        ├── AppNavigator.tsx    # Full RN Navigation setup (stack + tabs)
        ├── DevScreenPicker.tsx # Pill nav bar for jumping between screens
        └── index.ts
```

---

## Dev Screen Picker

The app launches with a **pill-button nav bar** at the top — identical to the web artifact — letting you jump to any of the 18 screens directly, grouped by Auth / Onboarding / Main.

To use the full navigation flow instead, replace the entire contents of `App.tsx` with:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from './src/state/AppState';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
```

> **Note:** `GestureHandlerRootView` and `AppProvider` are required wrappers. Omitting them will cause a `useAppState must be used within AppProvider` runtime error.

---

## Design Tokens

All visual constants live in `src/theme/tokens.ts`:

| Token category     | Key exports |
|--------------------|-------------|
| Colors             | `Colors.*`  |
| UV risk mapping    | `uvColor(n)`, `uvLabel(n)` |
| Typography         | `FontSizes.*`, `FontWeights.*` |
| Spacing (4pt grid) | `Spacing.*` |
| Border radii       | `Radii.*` |
| Gradients          | `Gradients.*` |
| Shadows            | `Shadows.*` |
| Layout constants   | `Layout.*` |

---

## Replacing Mock Data with Real APIs

All mock data is in `src/data/mockData.ts`. The TypeScript types mirror real API shapes:

### OpenUV API (`/api/v1/uv`)
```ts
// Replace mockUVData with:
const res = await fetch(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lon}`, {
  headers: { 'x-access-token': OPENUV_API_KEY }
});
const { result }: { result: UVData } = await res.json();
```

### OpenWeather One Call 3.0
```ts
// Replace mockWeatherData with:
const res = await fetch(
  `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`
);
const data: WeatherData = await res.json();
```

### NASA POWER (historical solar baselines)
```ts
// Use for long-term analytics only:
const res = await fetch(
  `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_UV_INDEX&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`
);
```

---

## Interactive Features

| Feature | Screen | Implementation |
|---------|--------|----------------|
| Live countdown timer | Home + Exposure Active | `useEffect` + `setInterval` in `AppState.tsx` |
| Skin type selection | Onboarding Skin | Single-select card with highlight state |
| SPF chip selection | Onboarding Sunscreen | Multi-state chip row |
| Reminder radio | Onboarding Sunscreen | Single-select rows |
| Water toggle | Onboarding Sunscreen | Animated `Toggle` component |
| Settings toggles | Settings | Animated `Toggle` × 3 |
| Segmented control | Settings | Imperial / Metric |
| Scrollable history | History | `ScrollView` with week chart |
| Reset password flow | Forgot Password | Local `sent` state swap |
| Profile persistence | Profile | React Context |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `expo` | Build toolchain |
| `expo-linear-gradient` | Button + hero gradients |
| `react-native-svg` | Circular timer ring |
| `@react-navigation/native` | Screen routing |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Bottom tab bar |
| `react-native-reanimated` | Smooth animations |
| `react-native-safe-area-context` | Safe area handling |
| `react-native-gesture-handler` | Gesture support (required root wrapper) |

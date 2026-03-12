// App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: The Parse config import MUST be the very first import so that
// Parse is initialized before any other module references it.
// ─────────────────────────────────────────────────────────────────────────────
import './src/config/parse';

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

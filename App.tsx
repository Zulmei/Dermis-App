// App.tsx
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

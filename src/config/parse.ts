// src/config/parse.ts
// ─────────────────────────────────────────────────────────────────────────────
// Back4App / Parse SDK initialization for Expo React Native.
//
// parse/react-native requires setAsyncStorage() for its network layer.
// We restore this, but immediately wipe Parse's own user cache from
// AsyncStorage after init — preventing the implicit server logOut that
// occurred when Parse detected a stale session on JS bundle reload.
//
// Session ownership: SecureStore (authService.ts) → Parse.User.become(token)
//
// Credentials in .env:
//   EXPO_PUBLIC_BACK4APP_APP_ID=your_application_id
//   EXPO_PUBLIC_BACK4APP_JS_KEY=your_javascript_key
//   EXPO_PUBLIC_BACK4APP_SERVER_URL=https://parseapi.back4app.com
// ─────────────────────────────────────────────────────────────────────────────

import ParseType from 'parse';
import AsyncStorage from '@react-native-async-storage/async-storage';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const Parse = require('parse/react-native') as typeof ParseType;

const APP_ID     = process.env.EXPO_PUBLIC_BACK4APP_APP_ID     ?? '';
const JS_KEY     = process.env.EXPO_PUBLIC_BACK4APP_JS_KEY     ?? '';
const SERVER_URL = process.env.EXPO_PUBLIC_BACK4APP_SERVER_URL ?? 'https://parseapi.back4app.com';

if (!APP_ID || !JS_KEY) {
  console.warn(
    '[Parse] Missing Back4App credentials. ' +
    'Add EXPO_PUBLIC_BACK4APP_APP_ID and EXPO_PUBLIC_BACK4APP_JS_KEY to your .env file.',
  );
}

// setAsyncStorage must come before initialize() — required for RN network layer.
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(APP_ID, JS_KEY);
(Parse as any).serverURL = SERVER_URL;

// ── Wipe Parse's own user cache ───────────────────────────────────────────
// Parse stores the current user in AsyncStorage under one of these keys.
// By clearing them immediately after init, we prevent Parse from finding a
// stale session and calling logOut() on the server during JS bundle reloads.
// authService.ts owns the session token via SecureStore and rehydrates it
// via Parse.User.become(token) — so Parse doesn't need its own cache.
const USER_KEYS = [
  'Parse/currentUser',
  `Parse/${APP_ID}/currentUser`,
  'currentUser',
];
Promise.all(USER_KEYS.map(k => AsyncStorage.removeItem(k))).catch(() => {});

export default Parse;

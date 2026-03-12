// src/services/authService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Parse authentication — session token is owned entirely by us (SecureStore).
// We never call Parse.User.currentAsync() or rely on Parse's internal session
// persistence, because Parse re-initializing on Expo reload actively invalidates
// the server session via an implicit logOut call.
//
// Flow:
//   signIn / signUp  → get token from Parse → store in SecureStore → return user
//   restoreSession   → read token from SecureStore → Parse.User.become(token)
//   signOut          → Parse.User.logOut() → delete from SecureStore
// ─────────────────────────────────────────────────────────────────────────────

import Parse from '../config/parse';
import type ParseType from 'parse';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'dermis_session_token';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:           string;
  username:     string;
  email:        string;
  sessionToken: string;
}

export interface SignUpParams {
  name:     string;
  email:    string;
  password: string;
}

export interface SignInParams {
  email:    string;
  password: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function toAuthUser(parseUser: ParseType.User): AuthUser {
  return {
    id:           parseUser.id ?? '',
    username:     (parseUser.get('username') as string) ?? '',
    email:        (parseUser.get('email')    as string) ?? '',
    sessionToken: parseUser.getSessionToken() ?? '',
  };
}

function isParseError(err: unknown): err is { code: number; message: string } {
  return (
    typeof err === 'object' && err !== null &&
    'code'    in err && typeof (err as any).code    === 'number' &&
    'message' in err && typeof (err as any).message === 'string'
  );
}

function friendlyError(err: unknown): string {
  if (isParseError(err)) {
    switch (err.code) {
      case 101: return 'Incorrect email or password. Please try again.';
      case 202:
      case 203: return 'An account with that email already exists.';
      case 125: return 'Please enter a valid email address.';
      case 201: return 'A password is required.';
      case 200: return 'An email address is required.';
      case 100: return 'No internet connection. Please check your network and try again.';
      case 209: return 'Your session has expired. Please sign in again.';
      default:  return err.message || 'Something went wrong. Please try again.';
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred. Please try again.';
}

async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, token);
}

async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

async function readToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function signUp(params: SignUpParams): Promise<AuthUser> {
  const user = new Parse.User();
  user.set('username', params.email.toLowerCase().trim());
  user.set('email',    params.email.toLowerCase().trim());
  user.set('password', params.password);
  user.set('name',     params.name.trim());
  try {
    const saved = await user.signUp();
    const token = saved.getSessionToken() ?? '';
    await storeToken(token);
    return toAuthUser(saved);
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}

export async function signIn(params: SignInParams): Promise<AuthUser> {
  try {
    const user = await Parse.User.logIn(
      params.email.toLowerCase().trim(),
      params.password,
    );
    const token = user.getSessionToken() ?? '';
    await storeToken(token);
    return toAuthUser(user);
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}

export async function signOut(): Promise<void> {
  try {
    await Parse.User.logOut();
  } catch (err) {
    // Log but don't block — always clear the local token.
    console.warn('[authService] server logOut error:', err);
  }
  await clearToken();
}

/**
 * Restore session on app launch using only our SecureStore token.
 * We deliberately skip Parse.User.currentAsync() — it triggers Parse's
 * internal session reconciliation which can delete the server session on reload.
 *
 * Parse.User.become(token) makes one network call to validate the token and
 * returns the full user object. If the token is invalid/expired it throws,
 * and we treat that as logged out.
 */
export async function restoreSession(): Promise<AuthUser | null> {
  const token = await readToken();
  if (!token) {
    console.log('[authService] restoreSession: no stored token found.');
    return null;
  }

  try {
    console.log('[authService] restoreSession: found token, calling become()...');
    const user = await Parse.User.become(token);
    console.log('[authService] restoreSession: success, user =', user.id);
    return toAuthUser(user);
  } catch (err) {
    console.warn('[authService] restoreSession: become() failed — clearing token.', err);
    await clearToken();
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await Parse.User.requestPasswordReset(email.toLowerCase().trim());
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}

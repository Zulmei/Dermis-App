// src/state/AppState.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import * as Location from 'expo-location';
import {
  defaultProfile,
  mockUVData,
  mockWeatherData,
  UserProfile,
  UVData,
  WeatherData,
} from '../data/mockData';
import { saveTodayExposure } from '../services/historyService';
import { fetchCurrentUV } from '../services/uvService';
import { fetchCurrentWeather } from '../services/weatherService';
import {
  signIn as parseSignIn,
  signUp as parseSignUp,
  signOut as parseSignOut,
  restoreSession as parseRestoreSession,
  requestPasswordReset as parseRequestPasswordReset,
  AuthUser,
  SignInParams,
  SignUpParams,
} from '../services/authService';
import { saveProfile, loadProfile } from '../services/profileStore';
import { calcSafeExposureSeconds, rescaleSecondsLeft } from '../utils/timerCalc';

// ── Types ─────────────────────────────────────────────────────────────────

interface TimerState {
  totalSeconds: number;
  secondsLeft:  number;
  isRunning:    boolean;
  isPaused:     boolean;
}

export type LiveDataStatus = 'idle' | 'loading' | 'success' | 'error';

interface AppContextType {
  user:               AuthUser | null;
  authLoading:        boolean;
  authError:          string | null;
  clearAuthError:     () => void;

  signIn:               (params: SignInParams) => Promise<void>;
  signUp:               (params: SignUpParams) => Promise<void>;
  signOut:              () => Promise<void>;
  restoreSession:       () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;

  isAuthenticated:       boolean;
  setIsAuthenticated:    (v: boolean) => void;

  onboardingComplete:    boolean;
  setOnboardingComplete: (v: boolean) => void;

  profile:    UserProfile;
  setProfile: (p: UserProfile) => void;

  timer:       TimerState;
  startTimer:  () => void;
  pauseTimer:  () => void;
  resetTimer:  () => void;

  budgetUsedPct:    number;
  setBudgetUsedPct: (v: number) => void;

  uvData:          UVData;
  weatherData:     WeatherData;
  currentUV:       number;
  liveDataStatus:  LiveDataStatus;
  liveDataError:   string | null;
  refreshLiveData: () => void;

  location:              Location.LocationObjectCoords | null;
  setLocation:           (coords: Location.LocationObjectCoords | null) => void;
  locationPermission:    'granted' | 'denied' | 'undetermined';
  setLocationPermission: (status: 'granted' | 'denied' | 'undetermined') => void;

  notifyReapply:    boolean;
  setNotifyReapply: (v: boolean) => void;
  notifyExtreme:    boolean;
  setNotifyExtreme: (v: boolean) => void;
  gpsEnabled:       boolean;
  setGpsEnabled:    (v: boolean) => void;
  metricUnits:      boolean;
  setMetricUnits:   (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {

  // ── Auth ──────────────────────────────────────────────────────────────
  const [user,        setUser]        = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError,   setAuthError]   = useState<string | null>(null);

  const clearAuthError     = useCallback(() => setAuthError(null), []);
  const isAuthenticated    = user !== null;
  const setIsAuthenticated = useCallback((v: boolean) => { if (!v) setUser(null); }, []);

  // ── Profile + Onboarding ──────────────────────────────────────────────
  const [profile,            setProfileState]            = useState<UserProfile>(defaultProfile);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  // ── Refs — always hold the latest values synchronously ───────────────
  const userRef         = useRef<AuthUser | null>(null);
  const profileRef      = useRef<UserProfile>(defaultProfile);
  const onboardingRef   = useRef(false);

  // Update refs synchronously on every render.
  userRef.current       = user;
  profileRef.current    = profile;
  onboardingRef.current = onboardingComplete;

  // ── Atomic persist — saves BOTH values together in one write ──────────
  const persist = useCallback((
    userId: string,
    p: UserProfile,
    ob: boolean,
  ) => {
    console.log('[AppState] persist called for', userId,
      '| skinType:', p.skinType, '| spf:', p.defaultSpf, '| onboarding:', ob);
    saveProfile(userId, { profile: p, onboardingComplete: ob })
      .catch(err => console.error('[AppState] persist error:', err));
  }, []);

  // ── Public setters exposed via context ────────────────────────────────
  // These update React state AND persist — screens call these unchanged.

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    if (userRef.current?.id) {
      persist(userRef.current.id, p, onboardingRef.current);
    } else {
      console.warn('[AppState] setProfile called but no user in ref yet');
    }
  }, [persist]);

  const setOnboardingComplete = useCallback((v: boolean) => {
    setOnboardingCompleteState(v);
    if (userRef.current?.id) {
      persist(userRef.current.id, profileRef.current, v);
    } else {
      console.warn('[AppState] setOnboardingComplete called but no user in ref yet');
    }
  }, [persist]);

  // ── Live data ─────────────────────────────────────────────────────────
  const [uvData,         setUvData]         = useState<UVData>(mockUVData);
  const [weatherData,    setWeatherData]    = useState<WeatherData>(mockWeatherData);
  const [liveDataStatus, setLiveDataStatus] = useState<LiveDataStatus>('idle');
  const [liveDataError,  setLiveDataError]  = useState<string | null>(null);

  // ── Location ──────────────────────────────────────────────────────────
  const [location,           setLocation]           = useState<Location.LocationObjectCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  // ── Settings ──────────────────────────────────────────────────────────
  const [notifyReapply, setNotifyReapply] = useState(true);
  const [notifyExtreme, setNotifyExtreme] = useState(true);
  const [gpsEnabled,    setGpsEnabled]    = useState(true);
  const [metricUnits,   setMetricUnits]   = useState(false);

  // ── Auth actions ──────────────────────────────────────────────────────

  const restoreSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      const restored = await parseRestoreSession();
      if (restored) {
        setUser(restored);
        const persisted = await loadProfile(restored.id);
        if (persisted) {
          setProfileState(persisted.profile);
          // If a profile exists the user has been through onboarding.
          setOnboardingCompleteState(true);
        } else {
          console.log('[AppState] restoreSession: no saved profile, using defaults');
          setProfileState(prev => ({ ...prev, email: restored.email }));
          setOnboardingCompleteState(false);
        }
      } else {
        setUser(null);
      }
    } catch (_) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Re-fetch device location (if permission already granted) then load
   * live UV + weather. Called after restoreSession and signIn so returning
   * users always see live data instead of mock values.
   * Defined here so it is available to the effects below.
   */
  // Ref so fetchLocationAndData can call fetchLiveData before it is declared.
  const fetchLiveDataRef = useRef<((coords: Location.LocationObjectCoords) => Promise<void>) | null>(null);

  const fetchLocationAndData = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setLocationPermission('granted');
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(result.coords);
      if (fetchLiveDataRef.current) {
        await fetchLiveDataRef.current(result.coords);
      }
    } catch (err) {
      console.warn('[AppState] fetchLocationAndData error:', err);
    }
  }, []);

  // After session restore, re-fetch location + live data in the background.
  // We use a ref so this effect only runs once after the initial restore.
  const didAutoFetch = useRef(false);
  useEffect(() => {
    if (user && !didAutoFetch.current) {
      didAutoFetch.current = true;
      fetchLocationAndData();
    }
  }, [user, fetchLocationAndData]);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const signIn = useCallback(async (params: SignInParams) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const authedUser = await parseSignIn(params);
      setUser(authedUser);
      const persisted = await loadProfile(authedUser.id);
      if (persisted) {
        setProfileState(persisted.profile);
        // A returning user who can sign in has completed onboarding.
        // We always set true here regardless of what was stored, because
        // onboarding may not have saved true yet (e.g. first session incomplete).
        setOnboardingCompleteState(true);
        // Persist the corrected onboardingComplete value.
        saveProfile(authedUser.id, {
          profile:            persisted.profile,
          onboardingComplete: true,
        }).catch(() => {});
      } else {
        console.log('[AppState] signIn: no saved profile, seeding defaults');
        setProfileState(prev => ({ ...prev, email: authedUser.email }));
        setOnboardingCompleteState(true);
      }
      // Re-fetch location + live data in background after sign-in.
      fetchLocationAndData();
    } catch (err: any) {
      setAuthError(err.message ?? 'Sign in failed.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [fetchLocationAndData]);

  const signUp = useCallback(async (params: SignUpParams) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const authedUser = await parseSignUp(params);
      setUser(authedUser);
      const seededProfile: UserProfile = {
        ...defaultProfile,
        name:  params.name,
        email: authedUser.email,
      };
      setProfileState(seededProfile);
      setOnboardingCompleteState(false);
      // Persist immediately with the seeded profile.
      await saveProfile(authedUser.id, {
        profile:            seededProfile,
        onboardingComplete: false,
      });
    } catch (err: any) {
      setAuthError(err.message ?? 'Sign up failed.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthLoading(true);
    try {
      await parseSignOut();
    } finally {
      setUser(null);
      setOnboardingCompleteState(false);
      setProfileState(defaultProfile);
      setAuthLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      await parseRequestPasswordReset(email);
    } catch (err: any) {
      setAuthError(err.message ?? 'Password reset failed.');
      throw err;
    }
  }, []);

  // ── Live data fetch ───────────────────────────────────────────────────
  const fetchLiveData = useCallback(async (coords: Location.LocationObjectCoords) => {
    setLiveDataStatus('loading');
    setLiveDataError(null);
    const units = metricUnits ? 'metric' : 'imperial';
    const alt   = coords.altitude ?? 0;
    try {
      const [uv, wx] = await Promise.all([
        fetchCurrentUV(coords.latitude, coords.longitude, alt),
        fetchCurrentWeather(coords.latitude, coords.longitude, units),
      ]);
      setUvData(uv);
      setWeatherData(wx);
      setLiveDataStatus('success');
    } catch (err: any) {
      setLiveDataError(err?.message ?? 'Unknown error');
      setLiveDataStatus('error');
    }
  }, [metricUnits]);

  // Keep the ref current so fetchLocationAndData always calls the latest version.
  fetchLiveDataRef.current = fetchLiveData;

  useEffect(() => { if (location) fetchLiveData(location); }, [location]);

  const refreshLiveData = useCallback(() => {
    if (location) fetchLiveData(location);
    else fetchLocationAndData();
  }, [location, fetchLiveData, fetchLocationAndData]);

  // ── Timer ─────────────────────────────────────────────────────────────
  const [timer, setTimer] = useState<TimerState>(() => {
    const total = calcSafeExposureSeconds(
      defaultProfile.skinType, defaultProfile.defaultSpf, mockUVData,
    );
    return { totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef  = useRef(0);
  const budgetRef   = useRef(0);
  const prevSkinTypeRef  = useRef(defaultProfile.skinType);
  const prevSpfRef       = useRef(defaultProfile.defaultSpf);
  const prevReminderRef  = useRef(defaultProfile.reapplyReminder);
  const prevManualMinRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const skinChanged = profile.skinType   !== prevSkinTypeRef.current;
    const spfChanged  = profile.defaultSpf !== prevSpfRef.current;
    if (!skinChanged && !spfChanged) return;
    prevSkinTypeRef.current = profile.skinType;
    prevSpfRef.current      = profile.defaultSpf;
    if (profile.reapplyReminder !== 'Based on UV Exposure') return;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    elapsedRef.current = 0;
    const total = calcSafeExposureSeconds(profile.skinType, profile.defaultSpf, uvData);
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile.skinType, profile.defaultSpf, profile.reapplyReminder, uvData]);

  const prevUVRef = useRef(mockUVData.uv);
  useEffect(() => {
    const newUV = uvData.uv;
    if (newUV === prevUVRef.current) return;
    prevUVRef.current = newUV;
    if (profile.reapplyReminder !== 'Based on UV Exposure') return;
    const newTotal = calcSafeExposureSeconds(profile.skinType, profile.defaultSpf, uvData);
    setTimer(prev => {
      const newLeft = prev.isRunning || prev.isPaused
        ? rescaleSecondsLeft(prev.totalSeconds, prev.secondsLeft, newTotal)
        : newTotal;
      return { ...prev, totalSeconds: newTotal, secondsLeft: newLeft };
    });
  }, [uvData, profile.skinType, profile.defaultSpf, profile.reapplyReminder]);

  useEffect(() => {
    const reminderChanged  = profile.reapplyReminder      !== prevReminderRef.current;
    const manualMinChanged = profile.manualReminderMinutes !== prevManualMinRef.current;
    if (!reminderChanged && !manualMinChanged) return;
    prevReminderRef.current   = profile.reapplyReminder;
    prevManualMinRef.current  = profile.manualReminderMinutes;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    elapsedRef.current = 0;
    let total: number;
    if (profile.reapplyReminder === 'Every 2 hours') {
      total = 7200;
    } else if (profile.reapplyReminder === 'Manual reminders' && profile.manualReminderMinutes) {
      total = profile.manualReminderMinutes * 60;
    } else {
      total = calcSafeExposureSeconds(profile.skinType, profile.defaultSpf, uvData);
    }
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile.reapplyReminder, profile.manualReminderMinutes, profile.skinType, profile.defaultSpf, uvData]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    setTimer(t => ({ ...t, isRunning: true, isPaused: false }));
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t.secondsLeft <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return { ...t, secondsLeft: 0, isRunning: false };
        }
        elapsedRef.current += 1;
        return { ...t, secondsLeft: t.secondsLeft - 1 };
      });
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setTimer(t => ({ ...t, isRunning: false, isPaused: true }));
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (elapsedRef.current > 0) {
      saveTodayExposure({
        minutes:   Math.round(elapsedRef.current / 60),
        peakUV:    uvData.uv,
        spfUsed:   profile.defaultSpf > 0 ? profile.defaultSpf : null,
        budgetPct: budgetRef.current,
      });
    }
    elapsedRef.current = 0;
    let total: number;
    if (profile.reapplyReminder === 'Every 2 hours') {
      total = 7200;
    } else if (profile.reapplyReminder === 'Manual reminders' && profile.manualReminderMinutes) {
      total = profile.manualReminderMinutes * 60;
    } else {
      total = calcSafeExposureSeconds(profile.skinType, profile.defaultSpf, uvData);
    }
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile, uvData]);

  const [budgetUsedPct, _setBudgetUsedPct] = useState(0.65);
  const setBudgetUsedPct = useCallback((v: number) => {
    budgetRef.current = v;
    _setBudgetUsedPct(v);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        authError,
        clearAuthError,
        signIn,
        signUp,
        signOut,
        restoreSession,
        requestPasswordReset,
        isAuthenticated,
        setIsAuthenticated,

        onboardingComplete,
        setOnboardingComplete,

        profile,
        setProfile,

        timer,
        startTimer,
        pauseTimer,
        resetTimer,

        budgetUsedPct,
        setBudgetUsedPct,

        uvData,
        weatherData,
        currentUV:      uvData.uv,
        liveDataStatus,
        liveDataError,
        refreshLiveData,

        location,
        setLocation,
        locationPermission,
        setLocationPermission,

        notifyReapply,    setNotifyReapply,
        notifyExtreme,    setNotifyExtreme,
        gpsEnabled,       setGpsEnabled,
        metricUnits,      setMetricUnits,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

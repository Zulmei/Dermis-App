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
import { defaultProfile, mockUVData, UserProfile } from '../data/mockData';
import { saveTodayExposure } from '../services/historyService';

// ── Types ─────────────────────────────────────────────────────────────────
interface TimerState {
  totalSeconds: number;
  secondsLeft:  number;
  isRunning:    boolean;
  isPaused:     boolean;
}

interface AppContextType {
  // Auth / session flags
  isAuthenticated:       boolean;
  setIsAuthenticated:    (v: boolean) => void;
  onboardingComplete:    boolean;
  setOnboardingComplete: (v: boolean) => void;

  // Profile
  profile:    UserProfile;
  setProfile: (p: UserProfile) => void;

  // Timer
  timer:       TimerState;
  startTimer:  () => void;
  pauseTimer:  () => void;
  resetTimer:  () => void;

  // Solar budget
  budgetUsedPct:    number;
  setBudgetUsedPct: (v: number) => void;

  // Live UV (set by screens that fetch it, consumed by AppState for history)
  currentUV:    number;
  setCurrentUV: (v: number) => void;

  // Location
  location:              Location.LocationObjectCoords | null;
  setLocation:           (coords: Location.LocationObjectCoords | null) => void;
  locationPermission:    'granted' | 'denied' | 'undetermined';
  setLocationPermission: (status: 'granted' | 'denied' | 'undetermined') => void;

  // Settings
  notifyReapply:    boolean;
  setNotifyReapply: (v: boolean) => void;
  notifyExtreme:    boolean;
  setNotifyExtreme: (v: boolean) => void;
  gpsEnabled:       boolean;
  setGpsEnabled:    (v: boolean) => void;
  metricUnits:      boolean;
  setMetricUnits:   (v: boolean) => void;
}

// ── Context ───────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ── Auth / onboarding state ───────────────────────────────────────────
  const [isAuthenticated,    setIsAuthenticated]    = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // ── Profile ───────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  // ── Live UV (shared so AppState can persist it with history) ──────────
  const [currentUV, setCurrentUV] = useState<number>(mockUVData.uv);

  // ── Timer ─────────────────────────────────────────────────────────────
  const calcTotalSeconds = (skinType: number, spf: number) => {
    const baseMinutes: Record<number, number> = {
      1: 12, 2: 24, 3: 32, 4: 48, 5: 72, 6: 120,
    };
    const base = baseMinutes[skinType] ?? 24;
    const spfMultiplier = spf > 0 ? Math.min(spf / 15, 4) : 1;
    return Math.round(base * spfMultiplier) * 60;
  };

  const total = calcTotalSeconds(profile.skinType, profile.defaultSpf);
  const [timer, setTimer] = useState<TimerState>({
    totalSeconds: total,
    secondsLeft:  total,
    isRunning:    false,
    isPaused:     false,
  });

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef   = useRef(0);
  const budgetRef    = useRef(0.65);
  const uvRef        = useRef(mockUVData.uv);

  useEffect(() => { uvRef.current = currentUV; }, [currentUV]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    setTimer(t => ({ ...t, isRunning: true, isPaused: false }));
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setTimer(t => {
        if (t.secondsLeft <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return { ...t, secondsLeft: 0, isRunning: false };
        }
        return { ...t, secondsLeft: t.secondsLeft - 1 };
      });
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimer(t => ({ ...t, isRunning: false, isPaused: true }));
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (elapsedRef.current > 0) {
      saveTodayExposure({
        minutes: Math.round(elapsedRef.current / 60),
        peakUV: uvRef.current,
        spfUsed: profile.defaultSpf ?? null,
        budgetPct: budgetRef.current,
      });
    }

    elapsedRef.current = 0;
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile]);

  // ── Misc state ────────────────────────────────────────────────────────
  const [budgetUsedPct, _setBudgetUsedPct] = useState(0.65);

  const setBudgetUsedPct = useCallback((v: number) => {
    budgetRef.current = v;
    _setBudgetUsedPct(v);
  }, []);

  // ── Location ──────────────────────────────────────────────────────────
  const [location,           setLocation]           = useState<Location.LocationObjectCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  // ── Settings ──────────────────────────────────────────────────────────
  const [notifyReapply, setNotifyReapply] = useState(true);
  const [notifyExtreme, setNotifyExtreme] = useState(true);
  const [gpsEnabled,    setGpsEnabled]    = useState(true);
  const [metricUnits,   setMetricUnits]   = useState(false);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,       setIsAuthenticated,
        onboardingComplete,    setOnboardingComplete,
        profile,               setProfile,
        timer,                 startTimer, pauseTimer, resetTimer,
        budgetUsedPct,         setBudgetUsedPct,
        currentUV,             setCurrentUV,
        location,              setLocation,
        locationPermission,    setLocationPermission,
        notifyReapply,         setNotifyReapply,
        notifyExtreme,         setNotifyExtreme,
        gpsEnabled,            setGpsEnabled,
        metricUnits,           setMetricUnits,
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

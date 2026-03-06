// src/state/AppState.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { defaultProfile, mockUVData, UserProfile } from '../data/mockData';

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
  // In production these would be hydrated from SecureStore / AsyncStorage.
  // Default false so new installs always go through auth → onboarding.
  const [isAuthenticated,       setIsAuthenticated]    = useState(false);
  const [onboardingComplete,    setOnboardingComplete] = useState(false);

  // ── Profile ───────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  // ── Timer ─────────────────────────────────────────────────────────────
  const calcTotalSeconds = (skinType: number, spf: number) => {
    const baseMinutes: Record<number, number> = {
      1: 12, 2: 24, 3: 32, 4: 48, 5: 72, 6: 120,
    };
    const base = baseMinutes[skinType] ?? 24;
    const spfMultiplier = spf > 0 ? Math.min(spf / 10 + 1, 4) : 1;
    return Math.round(base * spfMultiplier) * 60;
  };

  const initialSeconds = calcTotalSeconds(profile.skinType, profile.defaultSpf);
  const [timer, setTimer] = useState<TimerState>({
    totalSeconds: initialSeconds,
    secondsLeft:  initialSeconds,
    isRunning:    false,
    isPaused:     false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.secondsLeft <= 0) {
            clearInterval(intervalRef.current!);
            return { ...prev, isRunning: false, secondsLeft: 0 };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.isRunning, timer.isPaused]);

  const startTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: true, isPaused: false }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetTimer = useCallback(() => {
    const total = calcTotalSeconds(profile.skinType, profile.defaultSpf);
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile]);

  // ── Misc state ────────────────────────────────────────────────────────
  const [budgetUsedPct, setBudgetUsedPct] = useState(0.65);

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

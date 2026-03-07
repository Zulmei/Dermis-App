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

  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track elapsed seconds so we can persist on reset without needing timer state closure
  const elapsedRef     = useRef<number>(0);
  const currentUVRef   = useRef<number>(currentUV);
  const budgetRef      = useRef<number>(0.65);

  // Keep refs in sync
  useEffect(() => { currentUVRef.current = currentUV; }, [currentUV]);

  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          elapsedRef.current = prev.totalSeconds - prev.secondsLeft + 1;
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
    elapsedRef.current = 0;
    setTimer(prev => ({ ...prev, isRunning: true, isPaused: false }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetTimer = useCallback(() => {
    const total   = calcTotalSeconds(profile.skinType, profile.defaultSpf);
    const minutes = Math.round(elapsedRef.current / 60);

    // Persist session to history if any time was recorded
    if (minutes > 0) {
      saveTodayExposure({
        minutes,
        peakUV:    currentUVRef.current,
        spfUsed:   profile.defaultSpf > 0 ? profile.defaultSpf : null,
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

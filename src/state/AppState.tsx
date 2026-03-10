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
import { defaultProfile, mockUVData, mockWeatherData, UserProfile, UVData, WeatherData } from '../data/mockData';
import { saveTodayExposure } from '../services/historyService';
import { fetchCurrentUV } from '../services/uvService';
import { fetchCurrentWeather } from '../services/weatherService';

// ── Types ─────────────────────────────────────────────────────────────────

interface TimerState {
  totalSeconds: number;
  secondsLeft:  number;
  isRunning:    boolean;
  isPaused:     boolean;
}

/** Status of the live UV + weather fetch triggered by location becoming available. */
export type LiveDataStatus = 'idle' | 'loading' | 'success' | 'error';

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

  // ── Live data (UV + weather) ──────────────────────────────────────────
  /** Full UV dataset from OpenUV — pre-seeded with mock, replaced on fetch. */
  uvData:          UVData;
  /** Full weather dataset from OpenWeatherMap — pre-seeded with mock, replaced on fetch. */
  weatherData:     WeatherData;
  /** Convenience alias: current UV index number (uvData.uv). */
  currentUV:       number;
  /** 'idle' | 'loading' | 'success' | 'error' — reflects the last fetch attempt. */
  liveDataStatus:  LiveDataStatus;
  /** Non-null when the last fetch failed; null otherwise. */
  liveDataError:   string | null;
  /** Manually re-trigger the UV + weather fetch (e.g. pull-to-refresh). */
  refreshLiveData: () => void;

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

  // ── Auth / onboarding ─────────────────────────────────────────────────
  const [isAuthenticated,    setIsAuthenticated]    = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // ── Profile ───────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

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

  // ── Live data fetch ───────────────────────────────────────────────────
  /**
   * Fetches UV + weather in parallel using the current location coords.
   * Called automatically when `location` changes from null → coords,
   * and can be called manually via `refreshLiveData()`.
   */
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
      const msg = err?.message ?? 'Unknown error fetching live data';
      console.error('[AppState] fetchLiveData error:', msg);
      setLiveDataError(msg);
      setLiveDataStatus('error');
      // uvData and weatherData retain their last good values (mock or prior fetch)
    }
  }, [metricUnits]);

  /** Auto-fetch whenever location is first set (or changes). */
  useEffect(() => {
    if (location) {
      fetchLiveData(location);
    }
  }, [location]); // intentionally excludes fetchLiveData to avoid refetch on metricUnits change

  /** Public handle so screens can trigger a manual refresh. */
  const refreshLiveData = useCallback(() => {
    if (location) {
      fetchLiveData(location);
    }
  }, [location, fetchLiveData]);

  // ── Timer ─────────────────────────────────────────────────────────────
  const calcTotalSeconds = (skinType: number, spf: number) => {
    const baseMinutes: Record<number, number> = {
      1: 12, 2: 24, 3: 32, 4: 48, 5: 72, 6: 120,
    };
    const base = baseMinutes[skinType] ?? 24;
    const spfMultiplier = spf > 0 ? Math.min(spf / 15, 4) : 1;
    return Math.round(base * spfMultiplier) * 60;
  };

  const [timer, setTimer] = useState<TimerState>(() => {
    const total = calcTotalSeconds(profile.skinType, profile.defaultSpf);
    return { totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false };
  });

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef   = useRef(0);
  const budgetRef    = useRef(0);

  // Keep timer total in sync with profile changes
  useEffect(() => {
    const total = calcTotalSeconds(profile.skinType, profile.defaultSpf);
    setTimer(t => ({ ...t, totalSeconds: total, secondsLeft: total }));
  }, [profile.skinType, profile.defaultSpf]);

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

    // Persist today's exposure before reset
    const elapsed = elapsedRef.current;
    if (elapsed > 0) {
      saveTodayExposure({
        minutes:   Math.round(elapsed / 60),
        peakUV:    uvData.uv,              // use live UV value
        spfUsed:   profile.defaultSpf ?? null,
        budgetPct: budgetRef.current,
      });
    }

    elapsedRef.current = 0;
    const total = calcTotalSeconds(profile.skinType, profile.defaultSpf);
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile, uvData.uv]);

  // ── Misc state ────────────────────────────────────────────────────────
  const [budgetUsedPct, _setBudgetUsedPct] = useState(0.65);

  const setBudgetUsedPct = useCallback((v: number) => {
    budgetRef.current = v;
    _setBudgetUsedPct(v);
  }, []);

  // ── Context value ─────────────────────────────────────────────────────
  return (
    <AppContext.Provider
      value={{
        isAuthenticated,       setIsAuthenticated,
        onboardingComplete,    setOnboardingComplete,
        profile,               setProfile,
        timer,                 startTimer, pauseTimer, resetTimer,
        budgetUsedPct,         setBudgetUsedPct,
        uvData,
        weatherData,
        currentUV:             uvData.uv,
        liveDataStatus,
        liveDataError,
        refreshLiveData,
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

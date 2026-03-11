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
import { calcSafeExposureSeconds, rescaleSecondsLeft } from '../utils/timerCalc';

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
    }
  }, [metricUnits]);

  useEffect(() => {
    if (location) {
      fetchLiveData(location);
    }
  }, [location]);

  const refreshLiveData = useCallback(() => {
    if (location) {
      fetchLiveData(location);
    }
  }, [location, fetchLiveData]);

  // ── Timer ─────────────────────────────────────────────────────────────
  //
  // Timer is initialised from profile + mock UV data.
  // It reactively recalculates when:
  //   (a) profile.skinType or profile.defaultSpf changes  → full reset
  //   (b) uvData changes (live UV arrives)               → rescale to preserve progress

  const [timer, setTimer] = useState<TimerState>(() => {
    const total = calcSafeExposureSeconds(
      defaultProfile.skinType,
      defaultProfile.defaultSpf,
      mockUVData,
    );
    return { totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef  = useRef(0);
  const budgetRef   = useRef(0);

  // (a) Profile changes → full reset (skin type or SPF changed by user).
  //     We recalculate the total using the *latest* uvData so UV is baked in.
  const prevSkinTypeRef = useRef(defaultProfile.skinType);
  const prevSpfRef      = useRef(defaultProfile.defaultSpf);

  useEffect(() => {
    const skinChanged = profile.skinType  !== prevSkinTypeRef.current;
    const spfChanged  = profile.defaultSpf !== prevSpfRef.current;
    if (!skinChanged && !spfChanged) return;

    prevSkinTypeRef.current  = profile.skinType;
    prevSpfRef.current       = profile.defaultSpf;

    // Stop any running interval on profile change.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    elapsedRef.current = 0;

    const total = calcSafeExposureSeconds(profile.skinType, profile.defaultSpf, uvData);
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile.skinType, profile.defaultSpf, uvData]);

  // (b) Live UV changes → recalculate total and rescale remaining time so the
  //     ring arc moves smoothly without a jarring jump.
  //     We do NOT reset elapsed time or pause the timer.
  const prevUVRef = useRef(mockUVData.uv);

  useEffect(() => {
    const newUV = uvData.uv;
    if (newUV === prevUVRef.current) return;
    prevUVRef.current = newUV;

    const newTotal = calcSafeExposureSeconds(profile.skinType, profile.defaultSpf, uvData);

    setTimer(prev => {
      const newLeft = prev.isRunning || prev.isPaused
        ? rescaleSecondsLeft(prev.totalSeconds, prev.secondsLeft, newTotal)
        : newTotal; // not started yet → just update total
      return { ...prev, totalSeconds: newTotal, secondsLeft: newLeft };
    });
  }, [uvData, profile.skinType, profile.defaultSpf]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return; // already running
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

    // Persist today's exposure before reset.
    const elapsed = elapsedRef.current;
    if (elapsed > 0) {
      saveTodayExposure({
        minutes:   Math.round(elapsed / 60),
        peakUV:    uvData.uv,
        spfUsed:   profile.defaultSpf > 0 ? profile.defaultSpf : null,
        budgetPct: budgetRef.current,
      });
    }

    elapsedRef.current = 0;
    const total = calcSafeExposureSeconds(profile.skinType, profile.defaultSpf, uvData);
    setTimer({ totalSeconds: total, secondsLeft: total, isRunning: false, isPaused: false });
  }, [profile, uvData]);

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

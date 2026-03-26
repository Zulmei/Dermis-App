// src/data/mockData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Mock data layer. Replace these with real API calls to OpenUV / OpenWeather.
// All types mirror what the real APIs return so swapping is a 1-line change.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types (mirrors OpenUV + OpenWeather response shapes) ─────────────────
export interface UVData {
  uv: number;
  uv_max: number;
  uv_max_time: string;      // ISO string
  ozone: number;
  safe_exposure_time: {     // minutes per Fitzpatrick type
    st1: number; st2: number; st3: number;
    st4: number; st5: number; st6: number;
  };
  sun_info: {
    sun_times: {
      sunrise: string;
      sunset:  string;
      solar_noon: string;
    };
    sun_position: {
      altitude: number;      // degrees
      azimuth: number;
    };
  };
}

export interface WeatherData {
  temp: number;             // Celsius
  feels_like: number;
  humidity: number;
  cloud_coverage: number;   // %
  wind_speed: number;       // m/s
  description: string;
  uvi: number;
  sunrise: number;          // Unix timestamp
  sunset: number;
}

export interface HourlyUVPoint {
  hour: string;             // "7am", "8am"…
  uv: number;
  time: string;             // "07:00"
}

export interface DailyExposure {
  date: string;             // "Mar 5"
  isoDate: string;          // "2026-03-05"
  exposureMinutes: number;
  peakUV: number;
  spfUsed: number | null;
  budgetPct: number;        // 0–1
}

// ── Current UV (OpenUV /api/v1/uv) ───────────────────────────────────────
export const mockUVData: UVData = {
  uv: 8.4,
  uv_max: 9.3,
  uv_max_time: '2026-03-05T13:15:00Z',
  ozone: 287.4,
  safe_exposure_time: {
    st1: 12,
    st2: 24,
    st3: 32,
    st4: 48,
    st5: 72,
    st6: 120,
  },
  sun_info: {
    sun_times: {
      sunrise: '2026-03-05T11:14:00Z',
      sunset:  '2026-03-05T00:02:00Z',
      solar_noon: '2026-03-05T17:38:00Z',
    },
    sun_position: {
      altitude: 62,
      azimuth: -0.45,
    },
  },
};

// ── Current Weather (OpenWeather One Call) ────────────────────────────────
export const mockWeatherData: WeatherData = {
  temp: 18,
  feels_like: 17,
  humidity: 44,
  cloud_coverage: 12,
  wind_speed: 3.2,
  description: 'Mostly Sunny',
  uvi: 8.4,
  sunrise: 1741172040,
  sunset:  1741215720,
};

// ── Hourly UV Forecast ────────────────────────────────────────────────────
export const mockHourlyUV: HourlyUVPoint[] = [
  { hour: '7am',  uv: 1.2,  time: '07:00' },
  { hour: '8am',  uv: 2.8,  time: '08:00' },
  { hour: '9am',  uv: 4.5,  time: '09:00' },
  { hour: '10am', uv: 6.1,  time: '10:00' },
  { hour: '11am', uv: 7.9,  time: '11:00' },
  { hour: '12pm', uv: 9.0,  time: '12:00' },
  { hour: '1pm',  uv: 9.2,  time: '13:00' },
  { hour: '2pm',  uv: 8.8,  time: '14:00' },
  { hour: '3pm',  uv: 7.1,  time: '15:00' },
  { hour: '4pm',  uv: 5.0,  time: '16:00' },
  { hour: '5pm',  uv: 3.2,  time: '17:00' },
];

// ── Exposure History ──────────────────────────────────────────────────────
export const mockExposureHistory: DailyExposure[] = [
  { date: 'Mar 5',  isoDate: '2026-03-05', exposureMinutes: 24, peakUV: 8.4,  spfUsed: 30, budgetPct: 0.42 },
  { date: 'Mar 4',  isoDate: '2026-03-04', exposureMinutes: 45, peakUV: 8.7,  spfUsed: 50, budgetPct: 0.65 },
  { date: 'Mar 3',  isoDate: '2026-03-03', exposureMinutes: 12, peakUV: 6.2,  spfUsed: 30, budgetPct: 0.20 },
  { date: 'Mar 2',  isoDate: '2026-03-02', exposureMinutes: 0,  peakUV: 3.1,  spfUsed: null, budgetPct: 0 },
  { date: 'Mar 1',  isoDate: '2026-03-01', exposureMinutes: 31, peakUV: 7.9,  spfUsed: 30, budgetPct: 0.52 },
  { date: 'Feb 28', isoDate: '2026-02-28', exposureMinutes: 22, peakUV: 5.4,  spfUsed: 30, budgetPct: 0.35 },
  { date: 'Feb 27', isoDate: '2026-02-27', exposureMinutes: 8,  peakUV: 4.2,  spfUsed: 15, budgetPct: 0.10 },
];

// ── Weekly chart data (last 7 days) ──────────────────────────────────────
export const mockWeeklyData = [0.20, 0.65, 0.0, 0.42, 0.52, 0.35, 0.10];
export const weekDayLabels  = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ── User profile defaults ─────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  email: string;
  skinType: number;         // 1–6 Fitzpatrick
  defaultSpf: number;
  reapplyReminder: string;
  manualReminderMinutes?: number;
}

export const defaultProfile: UserProfile = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  skinType: 2,
  defaultSpf: 30,
  reapplyReminder: 'Based on UV Exposure',
};

// ── Location ──────────────────────────────────────────────────────────────
export const mockLocation = {
  city: 'Hoboken, NJ',
  lat: 40.744,
  lon: -74.032,
  altitude: 5,
};

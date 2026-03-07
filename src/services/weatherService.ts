// src/services/weatherService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Weather data service — wraps the OpenWeatherMap One Call 3.0 API.
// Docs: https://openweathermap.org/api/one-call-3
//
// Required env vars (add to .env / app.config.js extra.env):
//   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here
// ─────────────────────────────────────────────────────────────────────────────

import { WeatherData, mockWeatherData } from '../data/mockData';

// ── Config ────────────────────────────────────────────────────────────────────
const OWM_BASE = 'https://api.openweathermap.org/data/3.0/onecall';
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '';

const USE_MOCK = !API_KEY || API_KEY === 'your_key_here';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Map an OpenWeatherMap One Call `current` block to our WeatherData shape.
 * The OWM `current` object already closely mirrors our type.
 */
function parseWeatherResponse(json: any): WeatherData {
  const c = json.current;
  return {
    temp:           c.temp,
    feels_like:     c.feels_like,
    humidity:       c.humidity,
    cloud_coverage: c.clouds,          // OWM field is `clouds` (%)
    wind_speed:     c.wind_speed,
    description:    c.weather?.[0]?.description ?? 'Unknown',
    uvi:            c.uvi,
    sunrise:        c.sunrise,         // Unix timestamp
    sunset:         c.sunset,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch current weather conditions for a lat/lon coordinate.
 * Units default to metric (°C, m/s); pass `units: 'imperial'` for °F.
 * Falls back to mock data when no API key is configured or on network error.
 */
export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial' = 'metric',
): Promise<WeatherData> {
  if (USE_MOCK) {
    console.debug('[weatherService] No API key — returning mock weather data.');
    return mockWeatherData;
  }

  try {
    const url =
      `${OWM_BASE}?lat=${lat}&lon=${lon}` +
      `&units=${units}&exclude=minutely,hourly,daily,alerts` +
      `&appid=${API_KEY}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.warn(
        `[weatherService] fetchCurrentWeather HTTP ${res.status} — falling back to mock.`,
      );
      return mockWeatherData;
    }

    const json = await res.json();
    return parseWeatherResponse(json);
  } catch (err) {
    console.error('[weatherService] fetchCurrentWeather error:', err);
    return mockWeatherData; // graceful degradation
  }
}

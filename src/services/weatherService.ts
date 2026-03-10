// src/services/weatherService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Weather data service — wraps the OpenWeatherMap Current Weather 2.5 API.
// Docs: https://openweathermap.org/current
//
// Required env vars (add to .env):
//   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here
// ─────────────────────────────────────────────────────────────────────────────

import { WeatherData, mockWeatherData } from '../data/mockData';

// ── Config ────────────────────────────────────────────────────────────────────
const OWM_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY  = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '';

const USE_MOCK = !API_KEY || API_KEY === 'your_key_here';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Map a 2.5/weather response to our WeatherData shape.
 * Unlike One Call 3.0, fields are at the top level (no `current` wrapper).
 */
function parseWeatherResponse(json: any): WeatherData {
  return {
    temp:           json.main.temp,
    feels_like:     json.main.feels_like,
    humidity:       json.main.humidity,
    cloud_coverage: json.clouds?.all ?? 0,
    wind_speed:     json.wind?.speed ?? 0,
    description:    json.weather?.[0]?.description ?? 'Unknown',
    uvi:            0,           // not in 2.5/weather; UV index comes from uvService
    sunrise:        json.sys?.sunrise ?? 0,
    sunset:         json.sys?.sunset ?? 0,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch current weather conditions for a lat/lon coordinate.
 * `units` is forwarded from AppState (metric = °C / m/s, imperial = °F / mph).
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
    const url = `${OWM_BASE}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`[weatherService] fetchCurrentWeather HTTP ${res.status} — falling back to mock.`);
      return mockWeatherData;
    }

    const json = await res.json();
    return parseWeatherResponse(json);
  } catch (err) {
    console.error('[weatherService] fetchCurrentWeather error:', err);
    return mockWeatherData;
  }
}

// src/services/uvService.ts
// ─────────────────────────────────────────────────────────────────────────────
// UV data service — wraps the OpenUV REST API.
// Docs: https://www.openuv.io/uvindex
//
// Required env vars (add to .env / app.config.js extra.env):
//   EXPO_PUBLIC_OPENUV_API_KEY=your_key_here
// ─────────────────────────────────────────────────────────────────────────────

import {
  UVData,
  HourlyUVPoint,
  mockUVData,
  mockHourlyUV,
} from '../data/mockData';

// ── Config ────────────────────────────────────────────────────────────────────
const OPENUV_BASE = 'https://api.openuv.io/api/v1';
const API_KEY = process.env.EXPO_PUBLIC_OPENUV_API_KEY ?? '';

const USE_MOCK = !API_KEY || API_KEY === 'your_key_here';

// ── Internal helpers ──────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  return {
    'x-access-token': API_KEY,
    'Content-Type': 'application/json',
  };
}

/** Map an OpenUV /uv response body to our UVData shape (already identical). */
function parseUVResponse(json: any): UVData {
  const r = json.result;
  return {
    uv:          r.uv,
    uv_max:      r.uv_max,
    uv_max_time: r.uv_max_time,
    ozone:       r.ozone,
    safe_exposure_time: {
      st1: r.safe_exposure_time.st1,
      st2: r.safe_exposure_time.st2,
      st3: r.safe_exposure_time.st3,
      st4: r.safe_exposure_time.st4,
      st5: r.safe_exposure_time.st5,
      st6: r.safe_exposure_time.st6,
    },
    sun_info: {
      sun_times: {
        sunrise:    r.sun_info.sun_times.sunrise,
        sunset:     r.sun_info.sun_times.sunset,
        solar_noon: r.sun_info.sun_times.solarNoon,
      },
      sun_position: {
        altitude: r.sun_info.sun_position.altitude,
        azimuth:  r.sun_info.sun_position.azimuth,
      },
    },
  };
}

/** Map an OpenUV /forecast response to our HourlyUVPoint[] shape. */
function parseForecastResponse(json: any): HourlyUVPoint[] {
  const results: any[] = json.result ?? [];
  return results.map((item) => {
    const date = new Date(item.uv_time);
    const hour = date.getHours();
    const label =
      hour === 0
        ? '12am'
        : hour < 12
        ? `${hour}am`
        : hour === 12
        ? '12pm'
        : `${hour - 12}pm`;
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    return { hour: label, uv: item.uv, time: timeStr } as HourlyUVPoint;
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch current UV index data for a lat/lon coordinate.
 * Falls back to mock data when no API key is configured or on network error.
 */
export async function fetchCurrentUV(
  lat: number,
  lon: number,
  alt: number = 0,
): Promise<UVData> {
  if (USE_MOCK) {
    console.debug('[uvService] No API key — returning mock UV data.');
    return mockUVData;
  }

  try {
    const url = `${OPENUV_BASE}/uv?lat=${lat}&lng=${lon}&alt=${alt}`;
    const res = await fetch(url, { headers: authHeaders() });

    if (!res.ok) {
      console.warn(`[uvService] fetchCurrentUV HTTP ${res.status} — falling back to mock.`);
      return mockUVData;
    }

    const json = await res.json();
    return parseUVResponse(json);
  } catch (err) {
    console.error('[uvService] fetchCurrentUV error:', err);
    return mockUVData; // graceful degradation
  }
}

/**
 * Fetch today's hourly UV forecast for a lat/lon coordinate.
 * Falls back to mock data when no API key is configured or on network error.
 */
export async function fetchHourlyForecast(
  lat: number,
  lon: number,
  alt: number = 0,
): Promise<HourlyUVPoint[]> {
  if (USE_MOCK) {
    console.debug('[uvService] No API key — returning mock hourly UV forecast.');
    return mockHourlyUV;
  }

  try {
    const url = `${OPENUV_BASE}/forecast?lat=${lat}&lng=${lon}&alt=${alt}`;
    const res = await fetch(url, { headers: authHeaders() });

    if (!res.ok) {
      console.warn(`[uvService] fetchHourlyForecast HTTP ${res.status} — falling back to mock.`);
      return mockHourlyUV;
    }

    const json = await res.json();
    return parseForecastResponse(json);
  } catch (err) {
    console.error('[uvService] fetchHourlyForecast error:', err);
    return mockHourlyUV;
  }
}

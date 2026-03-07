// src/services/historyService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Exposure history service — persists daily exposure records locally with
// AsyncStorage and exposes helpers to read, append, and summarise history.
//
// No remote API key required — data is stored on device.
// Swap the AsyncStorage backend for a remote database (e.g. Supabase) by
// replacing `storage.get` / `storage.set` below.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DailyExposure,
  mockExposureHistory,
  mockWeeklyData,
  weekDayLabels,
} from '../data/mockData';

// ── Constants ─────────────────────────────────────────────────────────────────
const HISTORY_KEY = '@dermis/exposure_history';

// ── Utility ───────────────────────────────────────────────────────────────────

/** Returns today's ISO date string "YYYY-MM-DD". */
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns a display-friendly date label like "Mar 5". */
function formatDisplayDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Given a raw history array (newest-first), derive seven-day bar-chart values
 * and day labels matching the existing `mockWeeklyData` / `weekDayLabels` shape.
 */
function deriveWeeklyData(history: DailyExposure[]): {
  weeklyData: number[];
  labels: string[];
} {
  const today = new Date();
  const days: { label: string; budgetPct: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const label = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
    const match = history.find((h) => h.isoDate === iso);
    days.push({ label, budgetPct: match?.budgetPct ?? 0 });
  }

  return {
    weeklyData: days.map((d) => d.budgetPct),
    labels: days.map((d) => d.label),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load the full exposure history from AsyncStorage.
 * Returns mock data as seed if storage is empty (first launch) or on error.
 */
export async function loadHistory(): Promise<DailyExposure[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) {
      // Seed with mock data so the UI is populated on first launch.
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(mockExposureHistory));
      return mockExposureHistory;
    }
    return JSON.parse(raw) as DailyExposure[];
  } catch (err) {
    console.error('[historyService] loadHistory error:', err);
    return mockExposureHistory; // graceful degradation
  }
}

/**
 * Append or update today's exposure record.
 *
 * @param minutes  Total outdoor minutes accumulated today.
 * @param peakUV   Highest UV index observed today.
 * @param spfUsed  SPF number applied (null if none).
 * @param budgetPct  Fraction (0–1) of daily solar budget consumed.
 */
export async function saveTodayExposure(params: {
  minutes: number;
  peakUV: number;
  spfUsed: number | null;
  budgetPct: number;
}): Promise<void> {
  try {
    const history = await loadHistory();
    const iso = todayISO();
    const record: DailyExposure = {
      date:            formatDisplayDate(iso),
      isoDate:         iso,
      exposureMinutes: params.minutes,
      peakUV:          params.peakUV,
      spfUsed:         params.spfUsed,
      budgetPct:       params.budgetPct,
    };

    // Replace today's entry if it already exists; otherwise prepend.
    const existingIdx = history.findIndex((h) => h.isoDate === iso);
    if (existingIdx >= 0) {
      history[existingIdx] = record;
    } else {
      history.unshift(record); // newest first
    }

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('[historyService] saveTodayExposure error:', err);
  }
}

/**
 * Derive weekly chart data from stored history.
 * Returns the same shapes as `mockWeeklyData` and `weekDayLabels`.
 */
export async function loadWeeklyChartData(): Promise<{
  weeklyData: number[];
  labels: string[];
}> {
  try {
    const history = await loadHistory();
    return deriveWeeklyData(history);
  } catch (err) {
    console.error('[historyService] loadWeeklyChartData error:', err);
    return { weeklyData: mockWeeklyData, labels: weekDayLabels };
  }
}

/**
 * Wipe all stored history (e.g. on sign-out or account deletion).
 */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('[historyService] clearHistory error:', err);
  }
}

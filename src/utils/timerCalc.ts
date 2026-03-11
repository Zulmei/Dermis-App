// src/utils/timerCalc.ts
// ─────────────────────────────────────────────────────────────────────────────
// Safe UV exposure time calculator.
//
// Formula:
//   1. Start with OpenUV's pre-computed safe_exposure_time for the user's
//      Fitzpatrick skin type at the current UV index (st1–st6, in minutes).
//   2. Multiply by an SPF factor: clamp(SPF / 15, 1, MAX_SPF_MULTIPLIER).
//      SPF 0 / None → ×1 (no benefit).
//      SPF 15 → ×1, SPF 30 → ×2, SPF 50 → ×3.3, SPF 70 → ×4 (cap).
//   3. If the OpenUV value is missing / zero (e.g. mock or night-time), fall
//      back to the hard-coded Fitzpatrick baseline at UV 8 — then scale by
//      the live UV index via:  baseMinutes × (8 / max(uvIndex, 0.5))
//
// All returned values are in SECONDS for direct use by the timer.
// ─────────────────────────────────────────────────────────────────────────────

import type { UVData } from '../data/mockData';

// Maximum practical SPF multiplier.  Studies show SPF 50+ offers diminishing
// returns; capping at 4× prevents unrealistically long timers.
const MAX_SPF_MULTIPLIER = 4;

/** Hard-coded Fitzpatrick baselines at UV ≈ 8 (minutes). */
const BASELINE_MINUTES: Record<number, number> = {
  1: 12,
  2: 24,
  3: 32,
  4: 48,
  5: 72,
  6: 120,
};

/**
 * Map Fitzpatrick type (1–6) to the OpenUV safe_exposure_time key.
 */
function stKey(skinType: number): keyof UVData['safe_exposure_time'] {
  return `st${Math.min(Math.max(skinType, 1), 6)}` as keyof UVData['safe_exposure_time'];
}

/**
 * Compute the SPF multiplier from an SPF value.
 *   spf = 0  → 1.0  (no sunscreen)
 *   spf = 15 → 1.0
 *   spf = 30 → 2.0
 *   spf = 50 → 3.33
 *   spf ≥ 60 → 4.0  (capped)
 */
export function spfMultiplier(spf: number): number {
  if (spf <= 0) return 1;
  return Math.min(spf / 15, MAX_SPF_MULTIPLIER);
}

/**
 * Calculate total safe exposure time in SECONDS.
 *
 * @param skinType  Fitzpatrick scale 1–6.
 * @param spf       SPF value from user profile (0 = none).
 * @param uvData    Current UV data object (from OpenUV API or mock).
 *
 * @returns Total safe exposure seconds (minimum 60 s, maximum 8 h).
 */
export function calcSafeExposureSeconds(
  skinType: number,
  spf: number,
  uvData: UVData,
): number {
  let baseMinutes: number;

  // Prefer the live API value for the user's skin type.
  const apiMinutes = uvData.safe_exposure_time[stKey(skinType)];

  if (apiMinutes && apiMinutes > 0) {
    // OpenUV already accounts for current UV level — use directly.
    baseMinutes = apiMinutes;
  } else {
    // Fallback: Fitzpatrick baseline scaled to live UV index.
    const baseline = BASELINE_MINUTES[Math.min(Math.max(skinType, 1), 6)] ?? 24;
    const liveUV   = uvData.uv ?? 8;
    // At UV 0 we'd never scale up to infinity, so floor the UV at 0.5.
    baseMinutes = baseline * (8 / Math.max(liveUV, 0.5));
  }

  const totalMinutes = baseMinutes * spfMultiplier(spf);

  // Clamp: at least 1 minute, at most 8 hours.
  const clamped = Math.max(1, Math.min(totalMinutes, 480));
  return Math.round(clamped * 60);
}

/**
 * When UV changes mid-session, preserve the *fraction* of time remaining
 * so the ring doesn't jump.  Recalculate the new total and scale secondsLeft.
 *
 * @param prevTotal      Previous totalSeconds.
 * @param prevLeft       Current secondsLeft.
 * @param newTotal       Newly-calculated totalSeconds.
 * @returns              Adjusted secondsLeft for the new total.
 */
export function rescaleSecondsLeft(
  prevTotal: number,
  prevLeft: number,
  newTotal: number,
): number {
  if (prevTotal <= 0) return newTotal;
  const fraction = prevLeft / prevTotal;
  return Math.max(0, Math.round(fraction * newTotal));
}

/**
 * Human-readable summary of what the timer is based on.
 * Useful for the sub-label under the circular ring.
 */
export function timerBasisLabel(skinType: number, spf: number): string {
  const spfStr = spf > 0 ? `SPF ${spf} applied` : 'no sunscreen';
  return `Skin Type ${skinType} · ${spfStr}`;
}

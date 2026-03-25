// src/utils/skinAnalysis.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fitzpatrick skin type detection via ITA (Individual Typology Angle).
//
// Pipeline:
//   1. 1×1 PNG base64 → raw RGB via PNG chunk parsing + pako zlib inflate
//   2. sRGB → linear RGB → XYZ (D65) → CIELAB
//   3. ITA = arctan((L* − 50) / b*) × 180/π
//   4. ITA range → Fitzpatrick type 1–6
// ─────────────────────────────────────────────────────────────────────────────

import pako from 'pako';

// ── PNG pixel extraction ──────────────────────────────────────────────────────

/**
 * Extract the single RGB pixel from a 1×1 PNG base64 string.
 * Works by locating the IDAT chunk, inflating its zlib payload, and reading
 * the scanline bytes (filter_byte, R, G, B).
 */
export function extractPixelFromPng(base64: string): [number, number, number] {
  // Decode base64 → byte array
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  // PNG signature = 8 bytes, IHDR chunk = 4+4+13+4 = 25 bytes → IDAT starts at 33
  let offset = 8; // skip signature

  while (offset < bytes.length) {
    const chunkLength =
      (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) | bytes[offset + 3];
    const chunkType = String.fromCharCode(
      bytes[offset + 4], bytes[offset + 5],
      bytes[offset + 6], bytes[offset + 7],
    );

    if (chunkType === 'IDAT') {
      const zlibData = bytes.slice(offset + 8, offset + 8 + chunkLength);
      const raw = pako.inflate(zlibData);
      // Scanline for 1×1 RGB: [filterByte, R, G, B]
      return [raw[1], raw[2], raw[3]];
    }

    // Move to next chunk: length(4) + type(4) + data(chunkLength) + crc(4)
    offset += 4 + 4 + chunkLength + 4;
  }

  throw new Error('IDAT chunk not found in PNG');
}

// ── Color space conversion ────────────────────────────────────────────────────

/** sRGB (0–255) → CIELAB [L*, a*, b*] via linear RGB → XYZ D65 */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // Normalise to 0–1 and linearise (remove sRGB gamma)
  const linearise = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lr = linearise(r);
  const lg = linearise(g);
  const lb = linearise(b);

  // Linear RGB → XYZ (D65 illuminant, sRGB primaries)
  const X = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const Y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  const Z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  // Normalise by D65 white point
  const fx = f(X / 0.95047);
  const fy = f(Y / 1.00000);
  const fz = f(Z / 1.08883);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bStar = 200 * (fy - fz);

  return [L, a, bStar];
}

function f(t: number): number {
  const delta = 6 / 29;
  return t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29;
}

// ── ITA calculation ───────────────────────────────────────────────────────────

/** ITA (Individual Typology Angle) in degrees from L* and b*. */
export function calcITA(L: number, bStar: number): number {
  // Guard against b* = 0 to avoid division by zero
  const safeBStar = bStar === 0 ? 0.001 : bStar;
  return Math.atan((L - 50) / safeBStar) * (180 / Math.PI);
}

// ── Fitzpatrick mapping ───────────────────────────────────────────────────────

/**
 * Map ITA angle (degrees) to Fitzpatrick scale type 1–6.
 * Ranges from published dermatology literature.
 */
export function itaToFitzpatrick(ita: number): number {
  if (ita > 55)  return 1;
  if (ita > 41)  return 2;
  if (ita > 28)  return 3;
  if (ita > 10)  return 4;
  if (ita > -30) return 5;
  return 6;
}

// ── Brightness gate ───────────────────────────────────────────────────────────

/**
 * Check if lighting conditions are acceptable based on L* (lightness 0–100).
 * Returns 'too_dark' | 'too_bright' | 'ok'.
 */
export function checkBrightness(L: number): 'too_dark' | 'too_bright' | 'ok' {
  if (L < 15) return 'too_dark';
  if (L > 90) return 'too_bright';
  return 'ok';
}

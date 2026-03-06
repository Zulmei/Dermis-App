// src/theme/tokens.ts
// ─────────────────────────────────────────────────────────────────────────────
// DERMIS Design Tokens  — v1.0
// Single source of truth. Matches the frozen UI spec exactly.
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  navy:       '#0A0F1E',   // Primary app background
  navyMid:    '#0D1628',   // Bottom nav, footer bars
  navyLight:  '#131C35',   // Icon tile backgrounds
  navyCard:   '#162040',   // All card / input backgrounds
  pageBg:     '#050911',   // Outer canvas (prototype only)

  // ── Brand Accent ─────────────────────────────────────────────────────────
  teal:       '#2DD4BF',   // Primary action, active states, ring progress
  tealDim:    '#0891B2',   // Gradient pair for primary button

  // ── UV Risk Escalation ───────────────────────────────────────────────────
  amber:      '#F59E0B',   // UV moderate / warnings / SPF data / premium
  orange:     '#EA580C',   // UV high / sunscreen alert
  red:        '#DC2626',   // UV very high / extreme / danger
  green:      '#10B981',   // UV safe / active session badge

  // ── Typography ───────────────────────────────────────────────────────────
  textPrimary: '#E8EDF8',  // Headings, values, active labels
  textMuted:   '#7B91B8',  // Body, sublabels, helper text
  textCard:    '#C8D4EC',  // Card body paragraphs

  // ── Borders ──────────────────────────────────────────────────────────────
  border:      '#1E2D4E',  // All card / input / divider borders

  // ── Misc ─────────────────────────────────────────────────────────────────
  white:       '#FFFFFF',
  black:       '#000000',
  transparent: 'transparent',
} as const;

// ── UV Risk Color Mapping ─────────────────────────────────────────────────
export function uvColor(index: number): string {
  if (index <= 2)  return Colors.green;
  if (index <= 5)  return '#84CC16';
  if (index <= 7)  return Colors.amber;
  if (index <= 10) return Colors.orange;
  return Colors.red;
}

export function uvLabel(index: number): string {
  if (index <= 2)  return 'Low';
  if (index <= 5)  return 'Moderate';
  if (index <= 7)  return 'High';
  if (index <= 10) return 'Very High';
  return 'Extreme';
}

// ── Typography ────────────────────────────────────────────────────────────
export const Fonts = {
  mono:  'SpaceMono',         // Space Mono — numerics, wordmark, stats
  sans:  'System',            // DM Sans equivalent (system font fallback)
} as const;

export const FontSizes = {
  xs:   10,
  sm:   12,
  md:   14,
  base: 16,
  lg:   18,
  xl:   20,
  xl2:  22,
  xl3:  24,
  xl4:  26,
  xl5:  28,
  xl6:  30,
  display: 38,
  hero:    52,
  timer:   42,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
} as const;

// ── Spacing Scale (4pt grid) ──────────────────────────────────────────────
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xl2:  24,
  xl3:  28,
  xl4:  32,
  xl5:  40,
  xl6:  44,  // Notch clearance
  xl7:  48,
  xl8:  80,
} as const;

// ── Border Radii ──────────────────────────────────────────────────────────
export const Radii = {
  xs:   4,
  sm:   6,
  md:   8,
  lg:   10,
  xl:   12,
  xl2:  14,
  xl3:  16,
  xl4:  20,
  xl5:  24,
  full: 9999,
} as const;

// ── Shadows ───────────────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  }),
} as const;

// ── Button Gradient Presets ───────────────────────────────────────────────
export const Gradients = {
  primary:      [Colors.teal,   Colors.tealDim]  as const,
  danger:       [Colors.red,    '#9B1C1C']        as const,
  gold:         [Colors.amber,  '#D97706']        as const,
  amberOrange:  [Colors.amber,  Colors.orange]    as const,
  uvHigh:       [Colors.orange, Colors.red]       as const,
  splash:       ['#1A2A4E',     Colors.navy]      as const,
} as const;

// ── Animation Durations ───────────────────────────────────────────────────
export const Durations = {
  fast:   150,
  normal: 250,
  slow:   400,
  timer:  1000,
} as const;

// ── Layout Constants ──────────────────────────────────────────────────────
export const Layout = {
  screenPadding:    Spacing.xl3,   // 28pt horizontal gutter
  cardPadding:      Spacing.xl,    // 20pt card internal padding
  cardRadius:       Radii.xl4,     // 20pt card radius
  inputRadius:      Radii.xl,      // 12pt input radius
  buttonRadius:     Radii.xl3,     // 16pt button radius
  bottomNavHeight:  80,
  headerHeight:     56,
} as const;

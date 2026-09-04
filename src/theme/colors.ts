/**
 * Courtly design tokens — "sporty dark" theme.
 * Near-black green-tinted surfaces with a lime accent,
 * inspired by modern padel/tennis booking apps.
 */
export const colors = {
  bg: '#0B0F0C',
  surface: '#151B16',
  surfaceRaised: '#1C241D',
  border: '#262F27',

  accent: '#C6F135', // lime
  accentPressed: '#A8D11F',
  onAccent: '#0B0F0C',

  text: '#F2F5F0',
  textMuted: '#8A938A',
  textFaint: '#5C655D',

  danger: '#FF6B6B',
  success: '#4ADE80',
  warning: '#FBBF24',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

/**
 * CarGuessr Mobile — Design System
 * Centralized theme tokens for consistent, premium UI
 */

export const Colors = {
  // Backgrounds
  bg: '#0B1120',
  bgCard: '#131B2E',
  bgCardHover: '#1A2540',
  bgInput: '#141E33',
  bgSurface: '#0F172A',

  // Borders
  border: '#1E293B',
  borderLight: '#293548',
  borderFocus: '#6366F1',

  // Primary — Electric Indigo
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryMuted: 'rgba(99, 102, 241, 0.12)',
  primaryGlow: 'rgba(99, 102, 241, 0.35)',

  // Success — Emerald
  success: '#10B981',
  successLight: '#34D399',
  successMuted: 'rgba(16, 185, 129, 0.12)',

  // Error — Rose
  error: '#F43F5E',
  errorLight: '#FB7185',
  errorMuted: 'rgba(244, 63, 94, 0.12)',

  // Warning — Amber
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningMuted: 'rgba(245, 158, 11, 0.12)',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDim: '#475569',

  // Rank colors
  gold: '#FBBF24',
  silver: '#94A3B8',
  bronze: '#CD7F32',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const Gradients = {
  primary: ['#6366F1', '#8B5CF6'] as const,
  primaryDark: ['#4F46E5', '#6366F1'] as const,
  hero: ['#4F46E5', '#7C3AED'] as const,
  card: ['#131B2E', '#1A2540'] as const,
  success: ['#059669', '#10B981'] as const,
  error: ['#E11D48', '#F43F5E'] as const,
  dark: ['#0B1120', '#131B2E'] as const,
  gold: ['#F59E0B', '#FBBF24'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
};

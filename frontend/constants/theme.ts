// AquaSense design system — single source of truth for all visual tokens

export const Colors = {
  // Core brand palette (§1 — Product Identity)
  primaryTeal: '#0A7EA4',
  safeGreen: '#27AE60',
  cautionAmber: '#F39C12',
  dangerRed: '#E74C3C',
  backgroundWhite: '#F4FEFF',
  darkText: '#1A2E35',

  // UI & structural colors
  secondaryText: '#8F9BB3',
  cardBackground: '#FFFFFF',
  skeletonBase: '#E0EFEF',
  grey: '#9CA3AF',

  // Dark mode (§19)
  darkBackground: '#0D1B2A',
  darkCard: '#1A2E35',
};

// Typography — primary export name used by shared/index.tsx and other components
export const Typography = {
  heading: 'PlusJakartaSans-Bold',
  body: 'Inter-Regular',
  bodySemiBold: 'Inter-SemiBold',
  mono: 'JetBrainsMono-Light',

  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// Fonts — alias kept for any existing imports
export const Fonts = Typography;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
};

// React Native-compatible shadow objects (not CSS strings)
export const Shadows = {
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const DarkMode = {
  background: Colors.darkBackground,
  card: Colors.darkCard,
  text: Colors.backgroundWhite,
};

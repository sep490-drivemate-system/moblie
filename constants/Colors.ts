const tintColorLight = '#036AA5';
const tintColorDark = '#fff';

// App Theme Colors
export const AppColors = {
  // Primary Colors
  primary: '#1AD562',
  primaryDark: '#5568d3',
  primaryLight: '#8b9cff',

  // Brand Color (Blue from design system)
  brandBlue: '#036AA5',
  active: '#036AA5', // For active states

  // Gray Colors
  gray: '#64748b',

  //yellow Colors
  yellow: '#f59e0b',

  //blue Colors
  blue: '#31B2BD',

  //red Colors
  red: '#E57373',

  // Gradient Colors
  gradientStart: '#43cea2',
  gradientMiddle: '#a8e063',
  gradientEnd: '#56ab2f',

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Background Colors
  background: '#f7fafc',
  backgroundLight: '#ffffff',
  backgroundDark: '#f8fafc',

  // Text Colors
  textPrimary: '#1a202c',
  textSecondary: '#64748b',
  textLight: '#9ca3af',
  textWhite: '#ffffff',

  // Border Colors
  border: '#e2e8f0',
  borderLight: '#e5e7eb',
  borderDark: '#d1d5db',

  // Card & Surface
  cardBackground: '#ffffff',
  cardShadow: 'rgba(0, 0, 0, 0.1)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Legacy theme support
export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

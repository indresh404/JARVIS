// theme/colors.ts
export const COLORS = {
  primary: '#116acf', // Main brand color
  primaryLight: '#4db8d9',
  primaryDark: '#0a83af',
  secondary: '#10B981',
  white: '#FFFFFF',
  surface: '#F0F8FF',
  black: '#000000',
  gray: {
    900: '#111827',
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F9FAFB',
  },
  text: {
    primary: '#1a1a2e',
    secondary: '#374151',
    muted: '#6B7280',
    white: '#FFFFFF',
  },
  risk: {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    green: '#10B981',
  },
  // Backward compatibility for old code
  blue: {
    900: '#2596be',
    700: '#1a7a9e',
    500: '#2596be',
    300: '#4db8d9',
    100: '#DBEAFE',
  },
  green: {
    500: '#10B981',
    300: '#6EE7B7',
  },
} as const;

export const GRADIENTS = {
  primary: ['#2596be', '#1a7a9e'],
  secondary: ['#10B981', '#059669'],
  surface: ['#F0F8FF', '#DBEAFE'],
  card: ['#2596be', '#1a7a9e'],
} as const;
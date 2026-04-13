export const COLORS = {
  primary: '#0474FC',
  primaryDark: '#0355C5',
  primaryLight: '#E8F2FF',
  primaryBorder: '#B8D4FF',

  background: '#FFFFFF',
  surface: '#F4F8FF',
  cardBg: '#FFFFFF',

  text: {
    primary: '#0A1629',
    secondary: '#4A6080',
    muted: '#8AA0BC',
    white: '#FFFFFF',
  },

  border: '#DCEAFF',
  borderDark: '#B8D4FF',

  green: '#10B981',
  greenLight: '#ECFDF5',

  risk: {
    high: '#EF4444',
    elevated: '#F97316',
    moderate: '#EAB308',
    low: '#10B981',
  },

  white: '#FFFFFF',
  black: '#0A1629',
};

export const STYLES = {
  shadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowPrimary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 6,
  },
};

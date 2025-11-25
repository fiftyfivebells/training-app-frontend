import type { Theme } from './types'

const colors = {
  primary: '#D2691E',
  primaryHover: '#B8581A',
  primaryLight: '#E8A87C',

  brown: '#8B4513',
  brownDark: '#704010',

  cream: '#FAF8F5',
  sand: '#E8DDD0',
  charcoal: '#2D2A26',

  stone: '#6B5D4F',
  stoneLight: '#8B7D6B',

  highGreatBg: '#FFF4E6',
  highGreatBorder: '#F59E0B',
  highGreatText: '#78350F',

  highToughBg: '#FEF2F2',
  highToughBorder: '#DC2626',
  highToughText: '#7F1D1D',

  lowGreatBg: '#F0F5FF',
  lowGreatBorder: '#3B82F6',
  lowGreatText: '#1E3A8A',

  lowToughBg: '#F5F3F0',
  lowToughBorder: '#9CA3AF',
  lowToughText: '#4B5563',

  success: '#6B8E23',
  error: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
}

const semantic = {
  surface: {
    background: colors.cream,
    card: colors.white,
    cardAlt: colors.sand,
    header: colors.brown,
    modal: colors.white,
  },
  text: {
    primary: colors.charcoal,
    secondary: colors.stone,
    muted: colors.stoneLight,
    inverse: colors.cream,
    header: colors.cream,
  },
  border: {
    default: colors.sand,
    strong: colors.brown,
  },
  button: {
    primary: { bg: colors.primary, text: colors.white },
    secondary: { bg: colors.transparent, text: colors.brown, border: colors.brown },
    subtle: { bg: colors.sand, text: colors.charcoal },
  },
  chip: {
    default: { bg: colors.sand, text: colors.charcoal },
    brass: { bg: colors.primaryLight, text: colors.brown },
  },
  mood: {
    highGreat: {
      bg: colors.highGreatBg,
      border: colors.highGreatBorder,
      text: colors.highGreatText,
    },
    highTough: {
      bg: colors.highToughBg,
      border: colors.highToughBorder,
      text: colors.highToughText,
    },
    lowGreat: {
      bg: colors.lowGreatBg,
      border: colors.lowGreatBorder,
      text: colors.lowGreatText,
    },
    lowTough: {
      bg: colors.lowToughBg,
      border: colors.lowToughBorder,
      text: colors.lowToughText,
    },
  },
}

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
}

const typography = {
  fontFamily: 'Manrope',
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
}

const shadow = {
  card: {
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    android: {
      elevation: 2,
    },
  },
}

const header = {
  bg: semantic.surface.header,
  text: semantic.text.header,
  height: 56,
  paddingHorizontal: spacing.lg,
}

const card = {
  base: {
    backgroundColor: semantic.surface.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderColor: semantic.border.default,
    borderWidth: 1,
  },
}

const buttons = {
  primary: {
    backgroundColor: semantic.button.primary.bg,
    color: semantic.button.primary.text,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
}

const runItem = {
  container: {
    backgroundColor: semantic.surface.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderColor: semantic.border.default,
    borderWidth: 1,
  },
  strip: (color: string) => ({
    width: 4,
    borderRadius: radius.full,
    backgroundColor: color,
  }),
}

const modal = {
  background: semantic.surface.modal,
  borderRadius: radius.xl,
  padding: spacing.xl,
}

export const clubhouseTheme: Theme = {
  colors,
  semantic,
  spacing,
  radius,
  typography,
  shadow,
  header,
  card,
  buttons,
  runItem,
  modal,
}

import type { Theme } from '../types'

//
// 1. RAW PALETTE — Racebib Minimal
//
const colors = {
  // Core palette
  paper: '#FDFDF8',
  white: '#FFFFFF',
  ink: '#111827',
  gray: '#6B7280',
  grayLight: '#E5E7EB',

  // Accents
  orange: '#F97316',
  teal: '#0F766E',

  // Mood palette (high contrast + structured)
  highGreatBg: '#FFF6ED',
  highGreatBorder: '#F97316',
  highGreatText: '#C2410C',

  highToughBg: '#FEF2F2',
  highToughBorder: '#DC2626',
  highToughText: '#7F1D1D',

  lowGreatBg: '#F0FDFA',
  lowGreatBorder: '#0F766E',
  lowGreatText: '#064E3B',

  lowToughBg: '#F3F4F6',
  lowToughBorder: '#9CA3AF',
  lowToughText: '#4B5563',

  black: '#000000',
  transparent: 'transparent',
}

//
// 2. SEMANTIC TOKENS
//
const semantic = {
  surface: {
    background: colors.paper,
    card: colors.white,
    cardAlt: colors.paper,
    header: colors.paper,
    modal: colors.white,
  },
  text: {
    primary: colors.ink,
    secondary: colors.gray,
    muted: colors.gray,
    inverse: colors.paper,
    header: colors.ink,
  },
  border: {
    default: colors.grayLight,
    strong: colors.ink,
  },
  button: {
    primary: { bg: colors.orange, text: colors.white },
    secondary: { bg: colors.transparent, text: colors.ink, border: colors.ink },
    subtle: { bg: colors.paper, text: colors.ink },
  },
  chip: {
    default: { bg: colors.paper, text: colors.ink },
    brass: { bg: colors.grayLight, text: colors.ink },
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

//
// 3. CORE TOKENS
//
const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 999 }

const typography = {
  fontFamily: 'System',
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
} as const satisfies Theme['typography']

const shadow = {
  card: {
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 1 },
  },
}

//
// 4. COMPONENT TOKENS
//
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
  base: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  variants: {
    primary: {
      container: { backgroundColor: semantic.button.primary.bg },
      text: { color: semantic.button.primary.text },
      spinner: semantic.button.primary.text,
    },
    secondary: {
      container: {
        backgroundColor: colors.transparent,
        borderWidth: 2,
        borderColor: semantic.button.secondary.border,
      },
      text: { color: semantic.button.secondary.text },
      spinner: semantic.button.secondary.text,
    },
    outline: {
      container: {
        backgroundColor: colors.transparent,
        borderWidth: 2,
        borderColor: semantic.button.secondary.border,
      },
      text: { color: semantic.button.secondary.text },
      spinner: semantic.button.secondary.text,
    },
    ghost: {
      container: { backgroundColor: colors.transparent },
      text: { color: semantic.button.secondary.text },
      spinner: semantic.button.secondary.text,
    },
  },
  sizes: {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minHeight: 36 },
    md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 48 },
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 56 },
  },
  states: {
    pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
    disabled: { opacity: 0.5 },
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
  sheet: {
    backgroundColor: semantic.surface.modal,
    padding: spacing.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  card: {
    backgroundColor: semantic.surface.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  backdrop: 'rgba(0,0,0,0.25)',
  shadow: {
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardShadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}

//
// 5. EXPORT
//
export const racebibTheme: Theme = {
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

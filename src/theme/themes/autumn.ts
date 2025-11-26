import type { Theme } from '../types'

//
// 1. RAW PALETTE — Autumn Road Classic
//
const colors = {
  // Core palette
  fog: '#F7F5EF',
  moss: '#324739',
  pumpkin: '#C7704A',
  hillside: '#7B8F7A',
  taupe: '#C2B8A3',

  // Neutrals
  ink: '#2E2A25',
  creamDark: '#DAD2C4',
  white: '#FFFFFF',

  // Mood palette (earthy + seasonal)
  highGreatBg: '#F6F1E8',
  highGreatBorder: '#C7704A',
  highGreatText: '#9A5739',

  highToughBg: '#F4EDEA',
  highToughBorder: '#9A725E',
  highToughText: '#6A4E3F',

  lowGreatBg: '#EEF4EF',
  lowGreatBorder: '#7B8F7A',
  lowGreatText: '#4C5E4C',

  lowToughBg: '#F3F0EC',
  lowToughBorder: '#AFA79B',
  lowToughText: '#6B645B',

  black: '#000000',
  transparent: 'transparent',
}

//
// 2. SEMANTIC TOKENS
//
const semantic = {
  surface: {
    background: colors.fog,
    card: colors.white,
    cardAlt: colors.taupe,
    header: colors.moss,
    modal: colors.white,
  },
  text: {
    primary: colors.ink,
    secondary: colors.hillside,
    muted: colors.taupe,
    inverse: colors.fog,
    header: colors.fog,
  },
  border: {
    default: colors.creamDark,
    strong: colors.moss,
  },
  button: {
    primary: { bg: colors.pumpkin, text: colors.white },
    secondary: { bg: colors.transparent, text: colors.moss, border: colors.moss },
    subtle: { bg: colors.taupe, text: colors.moss },
  },
  chip: {
    default: { bg: colors.taupe, text: colors.moss },
    brass: { bg: colors.hillside + '33', text: colors.moss },
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
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 2 },
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
export const autumnRoadTheme: Theme = {
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

import type { Theme } from '../types'

//
// 1. RAW PALETTE — Verde Modern
//
const colors = {
  // Core modern green palette
  forest: '#1E473B',
  verdant: '#4FAF8F',
  mistWhite: '#FAFCFA',
  sage: '#DDECE4',
  ink: '#1A1C1C',

  // Supporting neutrals
  borderLight: '#D1D5DB',
  borderMid: '#94A3A2',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Mood palette (clean, modern, green-forward)
  moodHighGreatBg: '#E6F5F0',
  moodHighGreatBorder: '#4FAF8F',
  moodHighGreatText: '#1E473B',

  moodHighToughBg: '#F2F5F3',
  moodHighToughBorder: '#A3B2A8',
  moodHighToughText: '#55635B',

  moodLowGreatBg: '#EEF7F2',
  moodLowGreatBorder: '#66C2A6',
  moodLowGreatText: '#1E473B',

  moodLowToughBg: '#F3F4F4',
  moodLowToughBorder: '#C5CBC8',
  moodLowToughText: '#6D746F',
}

//
// 2. SEMANTIC TOKENS
//
const semantic = {
  surface: {
    background: colors.mistWhite,
    card: colors.white,
    cardAlt: colors.sage,
    header: colors.forest,
    modal: colors.white,
  },
  text: {
    primary: colors.ink,
    secondary: colors.forest,
    muted: colors.borderMid,
    inverse: colors.mistWhite,
    header: colors.mistWhite,
  },
  border: {
    default: colors.borderLight,
    strong: colors.forest,
  },
  button: {
    primary: { bg: colors.forest, text: colors.mistWhite },
    secondary: { bg: colors.transparent, text: colors.forest, border: colors.forest },
    subtle: { bg: colors.sage, text: colors.forest },
  },
  chip: {
    default: { bg: colors.sage, text: colors.forest },
    brass: { bg: colors.verdant + '33', text: colors.forest },
  },
  mood: {
    highGreat: {
      bg: colors.moodHighGreatBg,
      border: colors.moodHighGreatBorder,
      text: colors.moodHighGreatText,
    },
    highTough: {
      bg: colors.moodHighToughBg,
      border: colors.moodHighToughBorder,
      text: colors.moodHighToughText,
    },
    lowGreat: {
      bg: colors.moodLowGreatBg,
      border: colors.moodLowGreatBorder,
      text: colors.moodLowGreatText,
    },
    lowTough: {
      bg: colors.moodLowToughBg,
      border: colors.moodLowToughBorder,
      text: colors.moodLowToughText,
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
export const verdeModernTheme: Theme = {
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

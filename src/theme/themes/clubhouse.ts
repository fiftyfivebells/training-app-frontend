import type { Theme } from '../types'

//
// 1. RAW PALETTE — New England Clubhouse
//
const colors = {
  // Core palette
  navy: '#1E293B',
  leather: '#8B5A3C',
  brass: '#CBB893',
  brick: '#C2564A',

  // Surfaces
  creamLight: '#F5F3EF',
  cream: '#EDE8E1',
  creamDark: '#E5DCD0',
  white: '#FFFFFF',

  // Text
  ink: '#111827',
  stone: '#6B5D4F',
  stoneMuted: '#958B80',

  // Mood colors (heritage, desaturated)
  moodRelaxedGreatBg: '#E9F5EF',
  moodRelaxedGreatBorder: '#6BAA89',
  moodRelaxedGreatText: '#355E49',

  moodRelaxedGoodBg: '#EFF4EA',
  moodRelaxedGoodBorder: '#8BAA84',
  moodRelaxedGoodText: '#4A5E3F',

  moodHighToughBg: '#FCECEA',
  moodHighToughBorder: '#C2564A',
  moodHighToughText: '#732F23',

  moodTiredProudBg: '#F5EFEA',
  moodTiredProudBorder: '#8B5A3C',
  moodTiredProudText: '#4B2F20',

  black: '#000000',
  transparent: 'transparent',
}

//
// 2. SEMANTIC TOKENS
//
const semantic = {
  surface: {
    background: colors.creamLight,
    card: colors.white,
    cardAlt: colors.cream,
    header: colors.navy,
    modal: colors.white,
  },
  text: {
    primary: colors.ink,
    secondary: colors.stone,
    muted: colors.stoneMuted,
    inverse: colors.creamLight,
    header: colors.creamLight,
  },
  border: {
    default: colors.creamDark,
    strong: colors.leather,
  },
  button: {
    primary: { bg: colors.brick, text: colors.white },
    secondary: { bg: colors.transparent, text: colors.navy, border: colors.navy },
    subtle: { bg: colors.cream, text: colors.navy },
  },
  chip: {
    default: { bg: colors.cream, text: colors.navy },
    brass: { bg: colors.brass + '22', text: colors.leather },
  },
  mood: {
    highGreat: {
      bg: colors.moodRelaxedGreatBg,
      border: colors.moodRelaxedGreatBorder,
      text: colors.moodRelaxedGreatText,
    },
    highTough: {
      bg: colors.moodHighToughBg,
      border: colors.moodHighToughBorder,
      text: colors.moodHighToughText,
    },
    lowGreat: {
      bg: colors.moodRelaxedGoodBg,
      border: colors.moodRelaxedGoodBorder,
      text: colors.moodRelaxedGoodText,
    },
    lowTough: {
      bg: colors.moodTiredProudBg,
      border: colors.moodTiredProudBorder,
      text: colors.moodTiredProudText,
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
      shadowOpacity: 0.07,
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
        backgroundColor: semantic.button.secondary.bg,
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

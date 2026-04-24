export interface ThemeTokens {
  bg: {
    base: string
    surface: string
    elevated: string
    input: string
  }
  rule: {
    subtle: string
    default: string
    strong: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    disabled: string
  }
  accent: {
    default: string
    hover: string
    pressed: string
    onAccent: string
  }
  brick: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
  }
  mood: {
    highGood: string
    highTough: string
    lowGood: string
    lowTough: string
  }
  moodBg: {
    highGood: string
    highTough: string
    lowGood: string
    lowTough: string
  }
  semantic: {
    success: string
    successBg: string
    warning: string
    warningBg: string
    error: string
    errorBg: string
    info: string
    infoBg: string
  }
  space: {
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    8: number
    10: number
    12: number
    16: number
  }
  radius: {
    none: number
    xs: number
    sm: number
    md: number
    lg: number
    pill: number
  }
}

export const darkTokens: ThemeTokens = {
  bg: {
    base: '#141210',
    surface: '#1C1916',
    elevated: '#26221E',
    input: '#1A1714',
  },
  rule: {
    subtle: '#241F1B',
    default: '#2E2A25',
    strong: '#423C34',
  },
  text: {
    primary: '#F2ECDE',
    secondary: '#ABA398',
    tertiary: '#716A5E',
    disabled: '#3E3832',
  },
  accent: {
    default: '#D5854F',
    hover: '#E59966',
    pressed: '#B56A3E',
    onAccent: '#F4EFE4',
  },
  brick: {
    50: '#F8E8E2',
    100: '#F0C7B5',
    200: '#E59585',
    300: '#D66A4E',
    400: '#B4452F',
    500: '#952E25',
    600: '#762720',
    700: '#521A12',
  },
  mood: {
    highGood: '#D4A855',
    highTough: '#C45335',
    lowGood: '#759460',
    lowTough: '#6B8496',
  },
  moodBg: {
    highGood: 'rgba(212, 168, 85, 0.22)',
    highTough: 'rgba(196, 83, 53, 0.24)',
    lowGood: 'rgba(117, 148, 96, 0.22)',
    lowTough: 'rgba(107, 132, 150, 0.22)',
  },
  semantic: {
    success: '#6E8E49',
    successBg: 'rgba(110, 142, 73, 0.15)',
    warning: '#C89848',
    warningBg: 'rgba(200, 152, 72, 0.15)',
    error: '#B64535',
    errorBg: 'rgba(182, 69, 53, 0.15)',
    info: '#6C8194',
    infoBg: 'rgba(108, 129, 148, 0.15)',
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 10,
    pill: 999,
  },
}

export const lightTokens: ThemeTokens = {
  bg: {
    base: '#F0EEEA',
    surface: '#F6F5F2',
    elevated: '#FAFAF8',
    input: '#F3F2EF',
  },
  rule: {
    subtle: '#E0DDD8',
    default: '#CCCAC4',
    strong: '#AEABA3',
  },
  text: {
    primary: '#1A1816',
    secondary: '#58534C',
    tertiary: '#8C8780',
    disabled: '#AEABA3',
  },
  accent: {
    default: '#BA683D',
    hover: '#D57D4D',
    pressed: '#8F4C2C',
    onAccent: '#F6F5F2',
  },
  brick: {
    50: '#F8E8E2',
    100: '#F0C7B5',
    200: '#E59585',
    300: '#D66A4E',
    400: '#B4452F',
    500: '#952E25',
    600: '#762720',
    700: '#521A12',
  },
  mood: {
    highGood: '#9C7540',
    highTough: '#A83D2A',
    lowGood: '#507042',
    lowTough: '#485664',
  },
  moodBg: {
    highGood: 'rgba(156, 117, 64, 0.10)',
    highTough: 'rgba(168, 61, 42, 0.09)',
    lowGood: 'rgba(80, 112, 66, 0.10)',
    lowTough: 'rgba(72, 86, 100, 0.10)',
  },
  semantic: {
    success: '#4A6E2E',
    successBg: 'rgba(74, 110, 46, 0.10)',
    warning: '#8C6420',
    warningBg: 'rgba(140, 100, 32, 0.10)',
    error: '#8F2E1E',
    errorBg: 'rgba(143, 46, 30, 0.10)',
    info: '#3A5870',
    infoBg: 'rgba(58, 88, 112, 0.10)',
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 10,
    pill: 999,
  },
}

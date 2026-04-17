export interface ThemeTokens {
  colors: {
    background: {
      base: string
      surface: string
      elevated: string
      input: string
    }
    border: {
      subtle: string
      default: string
      accent: string
    }
    text: {
      primary: string
      secondary: string
      tertiary: string
    }
    copper: {
      subtle: string
      muted: string
      dim: string
      default: string
      light: string
    }
    semantic: {
      successBg: string
      successFg: string
      errorBg: string
      errorFg: string
      warningBg: string
      warningFg: string
    }
    mood: {
      highGood: string
      highTough: string
      lowGood: string
      lowTough: string
    }
  }
  space: {
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    8: number
  }
  radius: {
    sm: number
    md: number
    lg: number
    xl: number
    full: number
  }
}

export const darkTokens: ThemeTokens = {
  colors: {
    background: {
      base: '#0C0E14',
      surface: '#13162A',
      elevated: '#1A1E32',
      input: '#21263C',
    },
    border: {
      subtle: '#1E2230',
      default: '#2A2F48',
      accent: '#C87941',
    },
    text: {
      primary: '#E8E4DC',
      secondary: '#8A92A8',
      tertiary: '#4A5068',
    },
    copper: {
      subtle: '#1C1108',
      muted: '#3D2410',
      dim: '#7A4A28',
      default: '#C87941',
      light: '#E09A5A',
    },
    semantic: {
      successBg: '#1A2E1C',
      successFg: '#5AB86C',
      errorBg: '#2E1A1A',
      errorFg: '#E05A5A',
      warningBg: '#2A2410',
      warningFg: '#D4A843',
    },
    mood: {
      highGood: '#B8D44A',
      highTough: '#E07840',
      lowGood: '#4AC4D4',
      lowTough: '#9B60B8',
    },
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
}

// Stub — values intentionally match dark until light theme is designed
export const lightTokens: ThemeTokens = JSON.parse(JSON.stringify(darkTokens))

export const colors = {
  // Primary colors (fall foliage)
  primary: {
    DEFAULT: '#D2691E',
    hover: '#B8581A',
    light: '#E8A87C',
  },
  brown: {
    DEFAULT: '#8B4513',
    dark: '#704010',
  },

  // Neutrals
  cream: '#FAF8F5',
  sand: '#E8DDD0',
  charcoal: '#2D2A26',
  stone: {
    DEFAULT: '#6B5D4F',
    light: '#8B7D6B',
  },

  // Mood quadrants
  mood: {
    highGreat: {
      bg: '#FFF4E6',
      border: '#F59E0B',
      text: '#78350F',
    },
    highTough: {
      bg: '#FEF2F2',
      border: '#DC2626',
      text: '#7F1D1D',
    },
    lowGreat: {
      bg: '#F0F5FF',
      border: '#3B82F6',
      text: '#1E3A8A',
    },
    lowTough: {
      bg: '#F5F3F0',
      border: '#9CA3AF',
      text: '#4B5563',
    },
  },

  // Semantic colors
  success: '#6B8E23',
  error: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

export type ColorKey = keyof typeof colors

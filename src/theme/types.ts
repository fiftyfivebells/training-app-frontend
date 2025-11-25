import type { TextStyle } from 'react-native'

export type Theme = {
  colors: Record<string, string>

  semantic: {
    surface: {
      background: string
      card: string
      cardAlt: string
      header: string
      modal: string
    }
    text: {
      primary: string
      secondary: string
      muted: string
      inverse: string
      header: string
    }
    border: {
      default: string
      strong: string
    }
    button: {
      primary: { bg: string; text: string }
      secondary: { bg: string; text: string; border: string }
      subtle: { bg: string; text: string }
    }
    chip: {
      default: { bg: string; text: string }
      brass: { bg: string; text: string }
    }
    mood: Record<string, { bg: string; border: string; text: string }>
  }

  spacing: Record<string, number>
  radius: Record<string, number>

  typography: {
    fontFamily: string
    weights: Record<string, TextStyle['fontWeight']>
    size: Record<string, number>
  }

  shadow: Record<string, any>

  header: Record<string, any>
  card: Record<string, any>
  buttons: Record<string, any>
  runItem: Record<string, any>
  modal: Record<string, any>
}

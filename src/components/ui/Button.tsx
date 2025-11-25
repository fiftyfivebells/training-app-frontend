import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'

import { ThemedText } from './ThemedText'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading
  const theme = useTheme()
  const variantStyles = theme.buttons.variants[variant] ?? theme.buttons.variants.primary
  const sizeStyles = theme.buttons.sizes[size] ?? theme.buttons.sizes.md

  return (
    <Pressable
      style={({ pressed }) => [
        theme.buttons.base,
        variantStyles.container,
        sizeStyles,
        pressed && !isDisabled && theme.buttons.states.pressed,
        isDisabled && theme.buttons.states.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.spinner ?? theme.semantic.text.inverse} />
      ) : (
        <ThemedText
          style={[
            {
              fontWeight: theme.typography.weights.semibold,
              fontSize:
                size === 'sm'
                  ? theme.typography.size.sm
                  : size === 'lg'
                    ? theme.typography.size.lg
                    : theme.typography.size.md,
            },
            variantStyles.text,
          ]}
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  )
}

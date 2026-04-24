import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { useTheme } from '@/theme/useTheme'

import { ThemedText } from './ThemedText'

interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading
  const { bg, text, rule, accent, semantic, space, radius } = useTheme()

  const getVariantStyles = () => {
    if (isDisabled) {
      return {
        container: { backgroundColor: rule.subtle, borderWidth: 0 },
        textColor: text.disabled,
        spinner: text.disabled,
      }
    }
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: rule.default },
          textColor: text.primary,
          spinner: text.primary,
        }
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          textColor: text.primary,
          spinner: text.primary,
        }
      case 'danger':
        return {
          container: { backgroundColor: semantic.error, borderWidth: 1, borderColor: semantic.error },
          textColor: bg.base,
          spinner: bg.base,
        }
      case 'primary':
      default:
        return {
          container: { backgroundColor: accent.default, borderWidth: 1, borderColor: accent.default },
          textColor: accent.onAccent,
          spinner: accent.onAccent,
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: space[1], paddingHorizontal: space[3], minHeight: 32, fontSize: 13 }
      case 'lg':
        return { paddingVertical: space[5], paddingHorizontal: space[5], minHeight: 52, fontSize: 17 }
      case 'md':
      default:
        return { paddingVertical: space[2], paddingHorizontal: space[4], minHeight: 44, fontSize: 15 }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <Pressable
      style={({ pressed }) => [
        {
          borderRadius: radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          minHeight: sizeStyles.minHeight,
        },
        variantStyles.container,
        pressed && !isDisabled && { opacity: 0.8 },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.spinner} />
      ) : (
        <ThemedText
          style={{ fontWeight: '600', fontSize: sizeStyles.fontSize, color: variantStyles.textColor }}
        >
          {children}
        </ThemedText>
      )}
    </Pressable>
  )
}

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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
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
  const { colors, space, radius } = useTheme()

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.copper.default,
          },
          text: { color: colors.copper.default },
          spinner: colors.copper.default,
        }
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.copper.default,
          },
          text: { color: colors.copper.default },
          spinner: colors.copper.default,
        }
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.copper.default },
          spinner: colors.copper.default,
        }
      case 'primary':
      default:
        return {
          container: { backgroundColor: colors.copper.default },
          text: { color: colors.background.base },
          spinner: colors.background.base,
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: space[1],
          paddingHorizontal: space[4],
          minHeight: 36,
          fontSize: 13,
        }
      case 'lg':
        return {
          paddingVertical: space[4],
          paddingHorizontal: space[8],
          minHeight: 56,
          fontSize: 17,
        }
      case 'md':
      default:
        return {
          paddingVertical: space[2],
          paddingHorizontal: space[6],
          minHeight: 48,
          fontSize: 15,
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <Pressable
      style={({ pressed }) => [
        {
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        },
        variantStyles.container,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          minHeight: sizeStyles.minHeight,
        },
        pressed && !isDisabled && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.spinner} />
      ) : (
        <ThemedText
          style={[
            {
              fontWeight: '600',
              fontSize: sizeStyles.fontSize,
            },
            variantStyles.text,
          ]}
        >
          {children}
        </ThemedText>
      )}
    </Pressable>
  )
}


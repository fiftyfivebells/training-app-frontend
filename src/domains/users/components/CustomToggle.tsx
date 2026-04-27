import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/theme/useTheme'

interface CustomToggleProps {
  value: boolean
  onValueChange: (val: boolean) => void
  disabled?: boolean
}

export function CustomToggle({ value, onValueChange, disabled }: CustomToggleProps) {
  const { text, rule, accent } = useTheme()
  const translateX = useRef(new Animated.Value(value ? 18 : 0)).current

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 18 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [value, translateX])

  const backgroundColor = value ? accent.default : rule.default

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[
        styles.track,
        { backgroundColor, opacity: disabled ? 0.4 : 1 }
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          { transform: [{ translateX }], backgroundColor: text.primary }
        ]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  }
})

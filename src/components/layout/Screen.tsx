import React from 'react'
import { ScrollView, StyleSheet, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/ThemeProvider'

type ScreenProps = {
  children: React.ReactNode
  scroll?: boolean
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
}

export function Screen({
  children,
  scroll = true,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const theme = useTheme()
  const safeAreaStyles = [
    styles.safeArea,
    { backgroundColor: theme.semantic.surface.background },
    style,
  ]
  const containerPadding = { padding: theme.spacing.lg }

  if (scroll) {
    return (
      <SafeAreaView style={safeAreaStyles}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[containerPadding, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[...safeAreaStyles, containerPadding]}>{children}</SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: { flex: 1 },
})

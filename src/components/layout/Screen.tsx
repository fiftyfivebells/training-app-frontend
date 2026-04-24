import React from 'react'
import { ScrollView, StyleSheet, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/useTheme'

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
  const { bg, text, rule, accent, mood, moodBg, semantic, space } = useTheme()
  const safeAreaStyles = [
    styles.safeArea,
    { backgroundColor: bg.base },
    style,
  ]
  const containerPadding = { padding: space[6] }

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

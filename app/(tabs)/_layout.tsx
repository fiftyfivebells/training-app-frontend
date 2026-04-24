import { Tabs } from 'expo-router'

import { CustomTabBar } from '@/components/CustomTabBar'
import { useTheme } from '@/theme/useTheme'

export default function TabLayout() {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}

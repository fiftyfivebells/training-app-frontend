import { Tabs } from 'expo-router'

import { CustomTabBar } from '@/components/CustomTabBar'
import { useTheme } from '@/theme/useTheme'

export default function TabLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: colors.background.base },
      }}
    />
  )
}

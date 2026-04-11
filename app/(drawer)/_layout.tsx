import { Drawer } from 'expo-router/drawer'
import React from 'react'

import { useBlockThemeSync } from '@/domains/blocks/hooks/useBlockThemeSync'
import { useTheme } from '@/theme/ThemeProvider'

function DrawerWithThemeSync() {
  useBlockThemeSync()
  const theme = useTheme()

  return (
    <Drawer
      screenOptions={{
        headerTintColor: theme.semantic.text.header,
        headerStyle: { backgroundColor: theme.semantic.surface.header },
        drawerActiveTintColor: theme.semantic.text.primary,
        drawerInactiveTintColor: theme.semantic.text.secondary,
        drawerType: 'front',
      }}
    >
      <Drawer.Screen name="blocks" options={{ title: 'Training Blocks' }} />
    </Drawer>
  )
}

export default function DrawerLayout() {
  return <DrawerWithThemeSync />
}

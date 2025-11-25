import { Drawer } from 'expo-router/drawer'
import React from 'react'

import { useTheme } from '@/theme/ThemeProvider'

export default function DrawerLayout() {
  const theme = useTheme()

  return (
    <>
      <Drawer
        screenOptions={{
          headerTintColor: theme.semantic.text.header,
          headerStyle: { backgroundColor: theme.semantic.surface.header },
          drawerActiveTintColor: theme.semantic.text.primary,
          drawerInactiveTintColor: theme.semantic.text.secondary,
          drawerType: 'front',
        }}
      />
      {/*         <Drawer.Screen name="index" options={{ title: 'Home' }} />
        <Drawer.Screen name="runs" options={{ title: 'Runs' }} />
        <Drawer.Screen name="log-run" options={{ title: 'Log Run' }} />
      </Drawer> */}
    </>
  )
}

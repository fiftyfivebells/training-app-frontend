import { Drawer } from 'expo-router/drawer'
import React from 'react'
import { colors, typography } from '@/theme'
import { SessionChecker } from '@/domains/auth/components/SessionChecker'

export default function DrawerLayout() {
  return (
    <>
      <Drawer
        screenOptions={{
          headerTintColor: colors.charcoal,
          headerStyle: { backgroundColor: colors.cream },
          drawerActiveTintColor: colors.brown.DEFAULT,
          drawerInactiveTintColor: colors.stone.DEFAULT,
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

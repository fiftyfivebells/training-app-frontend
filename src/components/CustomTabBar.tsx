import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { router } from 'expo-router'
import type { ComponentProps } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

const TAB_BAR_HEIGHT = 82
const FAB_SIZE = 56
const FAB_RISE = 18

type TabConfig = {
  name: string
  activeIcon: ComponentProps<typeof Ionicons>['name']
  inactiveIcon: ComponentProps<typeof Ionicons>['name']
  label: string
}

const TAB_CONFIGS: TabConfig[] = [
  { name: 'index', activeIcon: 'home', inactiveIcon: 'home-outline', label: 'Home' },
  { name: 'logbook', activeIcon: 'list', inactiveIcon: 'list-outline', label: 'Logbook' },
  { name: 'blocks', activeIcon: 'barbell', inactiveIcon: 'barbell-outline', label: 'Blocks' },
  { name: 'analytics', activeIcon: 'stats-chart', inactiveIcon: 'stats-chart-outline', label: 'Analytics' },
]

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme()

  const leftRoutes = state.routes.slice(0, 2)
  const rightRoutes = state.routes.slice(2)

  function renderTab(route: (typeof state.routes)[0]) {
    const routeIndex = state.routes.indexOf(route)
    const isFocused = state.index === routeIndex
    const config = TAB_CONFIGS.find((t) => t.name === route.name)
    if (!config) return null

    const iconName = isFocused ? config.activeIcon : config.inactiveIcon
    const color = isFocused ? colors.copper.default : colors.text.tertiary
    const fontWeight = isFocused ? '500' : '400'

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      })
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params)
      }
    }

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tab}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={descriptors[route.key]?.options.tabBarAccessibilityLabel ?? config.label}
      >
        <Ionicons name={iconName} size={22} color={color} />
        <Text style={[styles.label, { color, fontWeight }]}>{config.label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.surface,
          borderTopColor: colors.border.subtle,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* FAB — rises above bar */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.copper.default }]}
        onPress={() => router.push('/log')}
        accessibilityRole="button"
        accessibilityLabel="Log a run"
      >
        <Ionicons name="add" size={28} color={colors.background.base} />
      </TouchableOpacity>

      {/* Tab row */}
      <View style={styles.row} pointerEvents="box-none">
        {leftRoutes.map(renderTab)}
        <View style={styles.fabSpacer} />
        {rightRoutes.map(renderTab)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: TAB_BAR_HEIGHT,
    borderTopWidth: 1,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: TAB_BAR_HEIGHT,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  fabSpacer: {
    width: FAB_SIZE + 16,
  },
  fab: {
    position: 'absolute',
    top: -FAB_RISE,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -(FAB_SIZE / 2),
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
})

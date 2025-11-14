// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { ThemedText } from '@/components/ui/ThemedText'
import { colors } from '@theme/colors'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.stone.DEFAULT,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.sand,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="log-run"
        options={{
          title: 'Log Run',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="plus-circle" color={color} size={size} />
          ),
        }}
      />
      {/* TODO: anticipated screens for later */}
      {/* 
      <Tabs.Screen
        name="blocks"
        options={{
          title: 'Blocks',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="user" color={color} size={size} />
          ),
        }}
      />
      */}
    </Tabs>
  )
}

function TabBarIcon({
  name,
  color,
  size,
}: {
  name: string
  color: string
  size: number
}) {
  const icons = {
    home: '🏠',
    'plus-circle': '➕',
    calendar: '📅',
    user: '👤',
  }

  return (
    <ThemedText style={{ fontSize: size, color }}>
      {icons[name as keyof typeof icons] || '•'}
    </ThemedText>
  )
}

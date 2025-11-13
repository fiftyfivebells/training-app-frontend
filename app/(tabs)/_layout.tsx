import { Redirect, Tabs } from 'expo-router';
import { colors } from '../../src/theme';
import { Text } from 'react-native';
import { useAuthContext } from '@/domains/auth/context/AuthContext';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

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
    </Tabs>
  );
}

// Simple icon component
function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons = {
    home: '🏠',
    'plus-circle': '➕',
    calendar: '📅',
    user: '👤',
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name as keyof typeof icons] || '•'}
    </Text>
  );
}

import { Stack } from 'expo-router';
import { colors } from '@theme/colors'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.cream,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen 
        name="register"
        options={{
          title: 'Register',
        }}
      />
      <Stack.Screen 
        name="verify-email"
        options={{
          title: 'Verify Email',
        }}
      />
    </Stack>
  );
}
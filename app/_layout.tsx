// app/_layout.tsx
import { Redirect, Slot, Stack, usePathname } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '@components/ui';
import { AuthProvider, useAuthContext } from '@domains/auth/context/AuthContext';
import { SessionChecker } from '@/domains/auth/components/SessionChecker';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const pathname = usePathname();

  if (isLoading) return null;

  const inAuthGroup = pathname.startsWith("/(auth)");

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href={"/(auth)/login"} />;
  }

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Slot />
}

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SessionChecker />
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FAF8F5' },
              }}
            >
              <AuthGate />
              {/*               <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
            </Stack>
          </AuthProvider>
        </QueryClientProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}

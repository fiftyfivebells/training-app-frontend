import { Redirect, Slot } from 'expo-router'
import { useAuthContext } from '@/domains/auth/context/AuthContext'

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    // TODO: maybe render a splash/loading screen here instead of null
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return <Slot />
}

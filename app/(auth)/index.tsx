import { Redirect } from 'expo-router'

import { useAuthContext } from '@/domains/auth/context/AuthContext'

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) return null

  return <Redirect href={isAuthenticated ? '/(drawer)/' : '/(auth)/login'} />
}

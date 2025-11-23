import { tokenStorage } from '@domains/auth/utils/tokenStorage'
import { useGetCurrentUser } from '@domains/users/hooks'
import { type User, userResponseToUser } from '@domains/users/users.types'
import { useQueryClient } from '@tanstack/react-query'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { authClient } from '../api/authClient'
import { useLogin } from '../hooks'
import { getDeviceInfo } from '../utils/deviceInfoHelper'
import { registerLogoutHandler } from './authEvents'

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const queryClient = useQueryClient()

  const { data: currentUser, refetch: refetchCurrentUser } = useGetCurrentUser({
    enabled: false,
  })

  useEffect(() => {
    ;(async () => {
      const token = await tokenStorage.getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const { data } = await refetchCurrentUser()
        setUser(data || null)
      } catch {
        await logout()
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, user } = await authClient.login({
      email: email,
      password: password,
      deviceInfo: getDeviceInfo(),
    })

    await tokenStorage.setAccessToken(accessToken)
    setUser(userResponseToUser(user))

    if (Platform.OS !== 'web') {
      await tokenStorage.setRefreshToken(refreshToken)
    }

    queryClient.setQueryData(['users', 'me'], user)

    router.replace('/(drawer)/')
  }, [])

  const logout = useCallback(async () => {
    await tokenStorage.deleteAccessToken()
    queryClient.clear()
    setUser(null)
    router.replace('/(auth)/login')
  }, [])

  useEffect(() => {
    registerLogoutHandler(logout)
  }, [logout])

  const refetchUser = useCallback(async () => {
    const { data } = await refetchCurrentUser()
    if (data) setUser(data)
  }, [refetchCurrentUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: isLoading,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}

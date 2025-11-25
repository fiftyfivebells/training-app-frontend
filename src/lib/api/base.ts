import { notifyLogout } from '@/domains/auth/context/authEvents'
import { refreshAccessToken } from '@/lib/api/refreshManager'
import { Platform } from 'react-native'
import { tokenStorage } from '../../domains/auth/utils/tokenStorage'
import { ApiError } from './error'

// TODO: this is just for development. I need to go back to the env var for production
const API_BASE_URL = Platform.OS === 'web' ? '' : 'http://192.168.0.215:8080' //Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:8080'

export abstract class BaseApiClient {
  protected baseUrl: string
  protected apiVersion: string

  constructor(baseUrl: string = API_BASE_URL, apiVersion: string = '/api/v1') {
    this.baseUrl = baseUrl
    this.apiVersion = apiVersion
  }

  protected async makeRequest<T>(path: string, options?: RequestInit): Promise<T> {
    console.log('API Base URL:', API_BASE_URL)
    const url = `${this.baseUrl}${this.apiVersion}/${path}`
    const accessToken = await tokenStorage.getAccessToken()

    let requestOptions = {
      credentials: 'include' as RequestCredentials,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }

    const attemptRequest = async (): Promise<Response> => {
      console.log('Making API request to:', url, requestOptions)
      return fetch(url, requestOptions)
    }

    let response = await attemptRequest()

    if (response.status === 401) {
      let body: any = null
      try {
        body = await response.json()
      } catch {}

      if (body?.message === 'Token expired') {
        const newAccessToken = await refreshAccessToken()

        if (!newAccessToken) {
          notifyLogout()
          throw new ApiError(401, { message: 'Session is expired' })
        }

        requestOptions = {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        }

        response = await attemptRequest()
      }
    }

    if (response.ok) {
      if (response.status === 204) {
        return undefined as T
      }
      return response.json()
    }

    if (response.status === 401) {
      notifyLogout()
      throw new ApiError(response.status, { message: 'Session is expired' })
    }

    let errorBody: any
    try {
      errorBody = await response.json()
    } catch (error) {
      console.log(error)
      errorBody = { message: 'Failed to parse error response' }
    }

    throw new ApiError(response.status, errorBody)
  }

  protected get<T>(path: string): Promise<T> {
    return this.makeRequest<T>(path, { method: 'GET' })
  }

  protected post<T>(path: string, body?: unknown): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  protected put<T>(path: string, body?: unknown): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  protected delete<T>(path: string): Promise<T> {
    return this.makeRequest<T>(path, { method: 'DELETE' })
  }
}

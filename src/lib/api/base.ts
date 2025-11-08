import { tokenStorage } from "../../domains/auth/utils/tokenStorage";
import { ApiError } from "./error";
import Constants from "expo-constants"

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:8080';

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected apiVersion: string;

  constructor(baseUrl: string = API_BASE_URL, apiVersion: string = '/api/v1') {
    this.baseUrl = baseUrl;
    this.apiVersion = apiVersion;
  }

  protected async makeRequest<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${this.apiVersion}/${path}`;
    const accessToken = await tokenStorage.getAccessToken();

    if (accessToken) {
      options = {
        ...options,
        headers: {
          ...options?.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      };
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
    });

    if (response.ok) {
      if (response.status === 204) {
        return undefined as T;
      }
      return response.json();
    }

    const errorBody = await response.json().catch((e) => (
      console.log(e),
      {
        message: 'Failed to parse error response',
      }));

    throw new ApiError(response.status, errorBody);
  }

  protected get<T>(path: string): Promise<T> {
    return this.makeRequest<T>(path, { method: 'GET' });
  }

  protected post<T>(path: string, body?: unknown): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected put<T>(path: string, body?: unknown): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected delete<T>(path: string): Promise<T> {
    return this.makeRequest<T>(path, { method: 'DELETE' });
  }
}

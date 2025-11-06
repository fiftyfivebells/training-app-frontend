import { setSecureValue, getSecureValue, deleteSecureValue } from "../../../lib/storage/secureStorage";

const ACCESS_TOKEN_KEY = 'auth.accessToken';

export const tokenStorage = {
  async setAccessToken(accessToken: string): Promise<void> {
    await setSecureValue(ACCESS_TOKEN_KEY, accessToken);
  },
  async getAccessToken(): Promise<string | null> {
    return await getSecureValue(ACCESS_TOKEN_KEY);
  },
  async deleteAccessToken(): Promise<void> {
    await deleteSecureValue(ACCESS_TOKEN_KEY);
  }
}
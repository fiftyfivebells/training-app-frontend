import * as SecureStorage from 'expo-secure-store';

export async function setSecureValue(key: string, value: string): Promise<void> {
  await SecureStorage.setItemAsync(key, value);
}

export async function getSecureValue(key: string): Promise<string | null> {
  return await SecureStorage.getItemAsync(key);
}

export async function deleteSecureValue(key: string): Promise<void> {
  await SecureStorage.deleteItemAsync(key);
}

export async function clearAllSecureValues(keys: string[]): Promise<void> {
  await Promise.all(keys.map(key => SecureStorage.deleteItemAsync(key)));
}
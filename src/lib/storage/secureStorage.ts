import * as SecureStorage from 'expo-secure-store';
import { Platform } from 'react-native';

export async function setSecureValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    console.warn("Secure storage is not supported on web platform.");
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to set secure value in localStorage:", error);
    }
  } else {
    try {
      await SecureStorage.setItemAsync(key, value);
    } catch (error) {
      console.error("Failed to set secure value in SecureStorage:", error);
    }
  }
}

export async function getSecureValue(key: string): Promise<string | null> {
  console.log("Retrieving secure value for key:", key);
  console.log("Platform:", Platform.OS);
  if (Platform.OS === 'web') {
    console.warn("Secure storage is not supported on web platform.");
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Failed to get secure value from localStorage:", error);
      return null;
    }
  } else {
    try {
      return await SecureStorage.getItemAsync(key);
    } catch (error) {
      console.error("Failed to get secure value from SecureStorage:", error);
      return null;
    }
  }
}

export async function deleteSecureValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to delete secure value from localStorage:", error);
    }
  } else {
    try {
      await SecureStorage.deleteItemAsync(key);
    } catch (error) {
      console.error("Failed to delete secure value from SecureStorage:", error);
    }
  }
}

export async function clearAllSecureValues(keys: string[]): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Failed to clear secure values from localStorage:", error);
    }
  } else {
    try {
      await Promise.all(keys.map(key => SecureStorage.deleteItemAsync(key)));
    } catch (error) {
      console.error("Failed to clear secure values from SecureStorage:", error);
    }
  }
}
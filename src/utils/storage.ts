import { Platform } from 'react-native';
import * as SecureStorage from 'expo-secure-store';

export const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStorage.getItemAsync(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStorage.setItemAsync(key, value);
  },

  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStorage.deleteItemAsync(key);
  },
};

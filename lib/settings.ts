import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'dark' | 'carbon' | 'light' | 'neon' | 'steel' | 'midnight';

export interface AppSettings {
  theme: AppTheme;
  notifications: boolean;
  favoriteDriver: string | null;
  language: 'id' | 'en';
  timezone: 'WIB' | 'WITA' | 'WIT';
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  notifications: true,
  favoriteDriver: null,
  language: 'id',
  timezone: 'WIB',
};

const KEY = 'f1hub_settings';

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return DEFAULT_SETTINGS; }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
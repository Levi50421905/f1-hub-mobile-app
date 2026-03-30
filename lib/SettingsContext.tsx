import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from './settings';
import { getTheme, isRaceWeekendNow, ThemeColors } from './theme';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  theme: ThemeColors;
  isRaceWeekend: boolean;
  setRaces: (races: any[]) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  theme: getTheme('dark', false),
  isRaceWeekend: false,
  setRaces: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [races, setRaces] = useState<any[]>([]);
  const isRaceWeekend = isRaceWeekendNow(races);
  const theme = getTheme(settings.theme, isRaceWeekend);

  useEffect(() => { loadSettings().then(setSettings); }, []);

  async function updateSettings(partial: Partial<AppSettings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, theme, isRaceWeekend, setRaces }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
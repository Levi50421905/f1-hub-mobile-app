import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from '../lib/SettingsContext';
import { getRaceSchedule } from '../lib/api';
import { cancelAllNotifications, requestNotificationPermission, scheduleRaceNotifications } from '../lib/notifications';

function AppStack() {
  const { settings } = useSettings();

  useEffect(() => {
    async function setupNotifications() {
      if (!settings.notifications) {
        await cancelAllNotifications();
        return;
      }
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;
      const races = await getRaceSchedule('2026');
      await scheduleRaceNotifications(races, settings.timezone, settings.language === 'en');
    }
    setupNotifications();
  }, [settings.notifications, settings.timezone, settings.language]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppStack />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
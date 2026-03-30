import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('f1-sessions', {
      name: 'F1 Sessions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#e10600',
      sound: 'default',
    });
  }

  return true;
}

export interface SessionNotif {
  label: string;
  date: string;
  time: string;
  raceName: string;
}

function getSessionEmoji(label: string): string {
  if (label === 'Race') return '🏁';
  if (label.includes('Sprint')) return '⚡';
  if (label.includes('Kualifikasi') || label.includes('Qualifying')) return '⏱️';
  return '🔧';
}

function getSessionMessage(label: string, raceName: string, isEN: boolean): { title: string; body: string } {
  const emoji = getSessionEmoji(label);
  if (isEN) {
    return {
      title: `${emoji} ${label} – ${raceName}`,
      body: `Session starts in 30 minutes! Don't miss it.`,
    };
  }
  return {
    title: `${emoji} ${label} – ${raceName}`,
    body: `Sesi dimulai dalam 30 menit! Jangan sampai ketinggalan.`,
  };
}

export async function scheduleRaceNotifications(
  races: any[],
  timezone: string,
  isEN: boolean,
): Promise<void> {
  // Cancel all existing scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const now = new Date();
  let count = 0;

  for (const race of races) {
    const sessions: SessionNotif[] = [
      race.FirstPractice && { label: 'FP1', ...race.FirstPractice, raceName: race.raceName },
      race.SecondPractice && { label: 'FP2', ...race.SecondPractice, raceName: race.raceName },
      race.ThirdPractice && { label: 'FP3', ...race.ThirdPractice, raceName: race.raceName },
      race.SprintQualifying && { label: isEN ? 'Sprint Qualifying' : 'Sprint Qualifying', ...race.SprintQualifying, raceName: race.raceName },
      race.Sprint && { label: 'Sprint', ...race.Sprint, raceName: race.raceName },
      race.Qualifying && { label: isEN ? 'Qualifying' : 'Kualifikasi', ...race.Qualifying, raceName: race.raceName },
      { label: 'Race', date: race.date, time: race.time, raceName: race.raceName },
    ].filter(Boolean) as SessionNotif[];

    for (const session of sessions) {
      if (!session.date || !session.time) continue;

      const sessionTime = new Date(`${session.date}T${session.time}`);
      // Notify 30 minutes before
      const notifTime = new Date(sessionTime.getTime() - 30 * 60 * 1000);

      // Skip if already passed
      if (notifTime <= now) continue;

      const { title, body } = getSessionMessage(session.label, session.raceName, isEN);

      await Notifications.scheduleNotificationAsync({
  content: {
    title,
    body,
    sound: 'default',
    data: { round: race.round, session: session.label },
    ...(Platform.OS === 'android' && { channelId: 'f1-sessions' }),
  },
  trigger: {
    type: 'date', // ✅ INI YANG PENTING
    date: notifTime,
    channelId: 'f1-sessions',
  },
});

      count++;
    }
  }

  console.log(`Scheduled ${count} F1 notifications`);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
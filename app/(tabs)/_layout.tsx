import { Tabs } from 'expo-router';
import { Calendar, Chrome as Home, Settings, Trophy, Users } from 'lucide-react-native';
import { useSettings } from '../../lib/SettingsContext';

export default function TabLayout() {
  const { theme } = useSettings();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="standings"
        options={{ title: 'Klasemen', tabBarIcon: ({ color }) => <Trophy size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Kalender', tabBarIcon: ({ color }) => <Calendar size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="drivers"
        options={{ title: 'Driver', tabBarIcon: ({ color }) => <Users size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Setting', tabBarIcon: ({ color }) => <Settings size={22} color={color} /> }}
      />
      {/* Hidden — ada di tabs biar navbar muncul, tapi tidak tampil di tab bar */}
      <Tabs.Screen name="glossary" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="race/[round]" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
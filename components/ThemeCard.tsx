import { useSettings } from '@/lib/SettingsContext';
import { StyleSheet, View } from 'react-native';

export default function ThemeCard({ children, style, accent = false }: any) {
  const { theme } = useSettings();

  if (!theme) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          borderLeftColor: accent ? theme.accent : theme.cardBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    borderLeftWidth: 3,
  },
});
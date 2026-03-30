import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  code: string;
  size?: 'sm' | 'md' | 'lg';
}

function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🏁';
  const offset = 0x1F1E6 - 65;
  return code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + offset)).join('');
}

export default function FlagBadge({ code, size = 'md' }: Props) {
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 32 : 18;
  const badgeW = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;
  const badgeH = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;
  const textSize = size === 'sm' ? 7 : size === 'lg' ? 11 : 9;

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.badge, { width: badgeW, height: badgeH }]}>
        <Text style={[styles.code, { fontSize: textSize }]}>{code}</Text>
      </View>
    );
  }

  return <Text style={{ fontSize }}>{codeToFlag(code)}</Text>;
}

const styles = StyleSheet.create({
  badge: { backgroundColor: '#1e1e1e', borderRadius: 3, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  code: { color: '#aaa', fontWeight: '800', letterSpacing: 0.5 },
});
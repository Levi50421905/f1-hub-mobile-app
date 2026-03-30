import { View, StyleSheet } from 'react-native';
import { ThemeColors } from '../lib/theme';

export default function BgDecoration({ theme }: { theme: ThemeColors }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Grid — Carbon */}
      {theme.showGridOverlay && (
        <>
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridH, { top: i * 22 }]} />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridV, { left: i * 22 }]} />
          ))}
        </>
      )}

      {/* Glow — Neon */}
      {theme.showGlowOverlay && (
        <>
          <View style={[styles.glowTop, { backgroundColor: theme.glowColor }]} />
          <View style={[styles.glowRight, { backgroundColor: theme.glowColor }]} />
        </>
      )}

      {/* Top accent bar */}
      {theme.topAccentBar && (
        <View style={[
          styles.topBar,
          { backgroundColor: theme.topAccentBarColor },
          theme.topAccentDashed && styles.topBarDashed,
        ]} />
      )}

      {/* Dark hero diagonal lines */}
      {!theme.isLight && !theme.showGridOverlay && !theme.showGlowOverlay && (
        <>
          <View style={[styles.diagLine1, { backgroundColor: theme.accent }]} />
          <View style={[styles.diagLine2, { backgroundColor: theme.accent }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#ffffff', opacity: 0.025 },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#ffffff', opacity: 0.025 },
  glowTop: { position: 'absolute', top: -80, left: 0, right: 0, height: 260, borderBottomLeftRadius: 200, borderBottomRightRadius: 200, opacity: 0.8 },
  glowRight: { position: 'absolute', bottom: 0, right: -60, width: 200, height: 300, borderRadius: 100, opacity: 0.5 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  topBarDashed: { height: 2 },
  diagLine1: { position: 'absolute', top: -60, right: 40, width: 60, height: 500, opacity: 0.04, transform: [{ rotate: '20deg' }] },
  diagLine2: { position: 'absolute', top: -60, right: 100, width: 30, height: 500, opacity: 0.025, transform: [{ rotate: '20deg' }] },
});
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../lib/SettingsContext';
import { getRaceSchedule, TIMEZONES } from '../../lib/api';
import {
  cancelAllNotifications,
  getScheduledNotifications,
  requestNotificationPermission,
  scheduleRaceNotifications,
} from '../../lib/notifications';
import { AppTheme } from '../../lib/settings';

const APP_VERSION = '1.0.0';
const BUILD_CODE = '2026.03';

const THEMES: { key: AppTheme; label: string; desc: string; bg: string; accent: string; border: string }[] = [
  { key: 'dark',     label: 'Dark',          desc: 'Deep black',       bg: '#080808', accent: '#e10600', border: '#1c1c1c' },
  { key: 'carbon',   label: 'Carbon',        desc: 'Motorsport grid',  bg: '#0c0c0c', accent: '#e10600', border: '#e10600' },
  { key: 'light',    label: 'Light',         desc: 'Clean & bright',   bg: '#f2f2f2', accent: '#e10600', border: '#ddd' },
  { key: 'neon',     label: 'Neon',          desc: 'Night race',       bg: '#03030f', accent: '#ff1744', border: '#ff1744' },
  { key: 'steel',    label: 'Steel Blue',    desc: 'Cobalt sport',     bg: '#060d1a', accent: '#2979ff', border: '#2979ff' },
  { key: 'midnight', label: 'Midnight Cyan', desc: 'Abu Dhabi vibes',  bg: '#04080f', accent: '#00b4d8', border: '#00b4d8' },
];

// ─── SECTION ─────────────────────────────────────────────────────────────────
function Section({
  title, badge, open, onToggle, children, theme,
}: {
  title: string; badge?: string; open: boolean;
  onToggle: () => void; children: React.ReactNode; theme: any;
}) {
  return (
    <View style={[sec.wrap, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <TouchableOpacity style={sec.header} onPress={onToggle} activeOpacity={0.7}>
        <Text style={[sec.title, { color: theme.text }]}>{title}</Text>
        {badge ? (
          <View style={[sec.badge, { backgroundColor: theme.accentBg, borderColor: theme.accent + '40' }]}>
            <Text style={[sec.badgeTxt, { color: theme.accent }]}>{badge}</Text>
          </View>
        ) : null}
        <Text style={[sec.chevron, { color: theme.textMuted }]}>{open ? '−' : '+'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={[sec.body, { borderTopColor: theme.cardBorder }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: { borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  title: { flex: 1, fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  badge: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  chevron: { fontSize: 18, fontWeight: '300', lineHeight: 20, width: 16, textAlign: 'center' },
  body: { borderTopWidth: 1, paddingHorizontal: 16, paddingBottom: 4 },
});

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
function Div({ theme }: { theme: any }) {
  return <View style={{ height: 1, backgroundColor: theme.cardBorder, opacity: 0.4, marginVertical: 0 }} />;
}

// ─── ROW ─────────────────────────────────────────────────────────────────────
function Row({ label, sub, right, theme, onPress, disabled }: {
  label: string; sub?: string; right?: React.ReactNode;
  theme: any; onPress?: () => void; disabled?: boolean;
}) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap style={row.wrap} onPress={onPress} activeOpacity={0.7} disabled={disabled}>
      <View style={{ flex: 1 }}>
        <Text style={[row.label, { color: theme.text }]}>{label}</Text>
        {sub ? <Text style={[row.sub, { color: theme.textMuted }]}>{sub}</Text> : null}
      </View>
      {right}
    </Wrap>
  );
}
const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  label: { fontSize: 13, fontWeight: '600' },
  sub: { fontSize: 10, marginTop: 2, lineHeight: 15 },
});

// ─── RADIO ───────────────────────────────────────────────────────────────────
function Radio({ selected, theme }: { selected: boolean; theme: any }) {
  return (
    <View style={[rd.ring, { borderColor: selected ? theme.accent : theme.cardBorder }]}>
      {selected && <View style={[rd.dot, { backgroundColor: theme.accent }]} />}
    </View>
  );
}
const rd = StyleSheet.create({
  ring: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5 },
});

// ─── SETTINGS HEADER ─────────────────────────────────────────────────────────
function SettingsHeader({ theme, insets, isEN, notifCount }: {
  theme: any; insets: any; isEN: boolean; notifCount: number | null;
}) {
  const accentColor = theme.accent;

  return (
    <View style={[hdr.root, { paddingTop: insets.top + 8, backgroundColor: theme.bgHero, borderBottomColor: theme.cardBorder }]}>
      {/* Top label row */}
      <View style={hdr.topRow}>
        <View style={[hdr.labelPill, { borderColor: accentColor + '40', backgroundColor: accentColor + '10' }]}>
          <View style={[hdr.pillDot, { backgroundColor: accentColor }]} />
          <Text style={[hdr.pillTxt, { color: accentColor }]}>F1 HUB</Text>
        </View>
        {/* Version badge kanan atas */}
        <View style={[hdr.versionBadge, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
          <Text style={[hdr.versionTxt, { color: theme.textMuted }]}>v{APP_VERSION}</Text>
        </View>
      </View>

      {/* Main title row */}
      <View style={hdr.titleRow}>
        <View style={{ flex: 1 }}>
          {/* BIG title with accent bar */}
          <View style={hdr.titleWithBar}>
            <View style={[hdr.accentBar, { backgroundColor: accentColor }]} />
            <Text style={[hdr.title, { color: theme.text }]}>
              {isEN ? 'Settings' : 'Pengaturan'}
            </Text>
          </View>
          <Text style={[hdr.subtitle, { color: theme.textMuted }]}>
            {isEN ? 'Customize your experience' : 'Sesuaikan pengalamanmu'}
          </Text>
        </View>
      </View>

      {/* Build info strip — bottom of header */}
      <View style={[hdr.buildStrip, { borderTopColor: theme.cardBorder + '60' }]}>
        <View style={hdr.buildItem}>
          <Text style={[hdr.buildKey, { color: theme.textMuted }]}>BUILD</Text>
          <Text style={[hdr.buildVal, { color: theme.textSub }]}>{BUILD_CODE}</Text>
        </View>
        <View style={[hdr.buildDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={hdr.buildItem}>
          <Text style={[hdr.buildKey, { color: theme.textMuted }]}>PLATFORM</Text>
          <Text style={[hdr.buildVal, { color: theme.textSub }]}>iOS · Android</Text>
        </View>
        <View style={[hdr.buildDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={hdr.buildItem}>
          <Text style={[hdr.buildKey, { color: theme.textMuted }]}>SEASON</Text>
          <Text style={[hdr.buildVal, { color: accentColor }]}>2026</Text>
        </View>
        {notifCount != null && (
          <>
            <View style={[hdr.buildDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={hdr.buildItem}>
              <Text style={[hdr.buildKey, { color: theme.textMuted }]}>NOTIF</Text>
              <Text style={[hdr.buildVal, { color: theme.textSub }]}>{notifCount}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const hdr = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  pillTxt: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  versionBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  versionTxt: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  titleWithBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  accentBar: {
    width: 3,
    height: 28,
    borderRadius: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginLeft: 13, // align with title (after bar + gap)
  },
  gearBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 22,
  },
  buildStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
    gap: 0,
  },
  buildItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  buildDivider: {
    width: 1,
    height: '100%',
    opacity: 0.4,
  },
  buildKey: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buildVal: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, theme } = useSettings();
  const isEN = settings.language === 'en';
  const [open, setOpen] = useState<string | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifCount, setNotifCount] = useState<number | null>(null);
  const [showLibs, setShowLibs] = useState(false);

  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));
  const S = (id: string, en: string) => (isEN ? en : id);

  async function handleNotifToggle(value: boolean) {
    await updateSettings({ notifications: value });
    if (value) {
      setNotifLoading(true);
      const ok = await requestNotificationPermission();
      if (!ok) {
        Alert.alert(S('Izin Ditolak', 'Permission Denied'), S('Aktifkan notifikasi di pengaturan HP.', 'Enable notifications in phone settings.'));
        await updateSettings({ notifications: false });
        setNotifLoading(false);
        return;
      }
      const races = await getRaceSchedule('2026');
      await scheduleRaceNotifications(races, settings.timezone, isEN);
      const scheduled = await getScheduledNotifications();
      setNotifCount(scheduled.length);
      setNotifLoading(false);
    } else {
      await cancelAllNotifications();
      setNotifCount(0);
    }
  }

  async function handleReschedule() {
    setNotifLoading(true);
    const races = await getRaceSchedule('2026');
    await scheduleRaceNotifications(races, settings.timezone, isEN);
    const scheduled = await getScheduledNotifications();
    setNotifCount(scheduled.length);
    setNotifLoading(false);
    Alert.alert(S('Selesai', 'Done'), `${scheduled.length} ${S('notifikasi dijadwalkan ulang.', 'notifications rescheduled.')}`);
  }

  return (
    <View style={[st.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />

      {/* ── HEADER BARU ── */}
      <SettingsHeader
        theme={theme}
        insets={insets}
        isEN={isEN}
        notifCount={notifCount}
      />

      <ScrollView
        style={st.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[st.content, { paddingBottom: insets.bottom + 96 }]}
      >

        {/* ── 1. NOTIFIKASI ── */}
        <Section
          title={S('Notifikasi', 'Notifications')}
          badge={notifCount != null ? `${notifCount} scheduled` : undefined}
          open={open === 'notif'}
          onToggle={() => toggle('notif')}
          theme={theme}
        >
          <Row
            label={S('Pengingat Sesi', 'Session Reminders')}
            sub={S('30 menit sebelum setiap sesi', '30 minutes before each session')}
            theme={theme}
            right={notifLoading
              ? <ActivityIndicator color={theme.accent} size="small" />
              : <Switch
                  value={settings.notifications}
                  onValueChange={handleNotifToggle}
                  trackColor={{ false: theme.cardBorder, true: theme.accent }}
                  thumbColor="#fff"
                />
            }
          />
          {settings.notifications && (
            <>
              <Div theme={theme} />
              <Row
                label={S('Jadwalkan Ulang', 'Reschedule All')}
                sub={S('Perbarui setelah mengubah timezone', 'Update after changing timezone')}
                theme={theme}
                onPress={handleReschedule}
                disabled={notifLoading}
                right={<Text style={[st.linkArrow, { color: theme.accent }]}>→</Text>}
              />
            </>
          )}
        </Section>

        {/* ── 2. TIMEZONE ── */}
        <Section
          title="Timezone"
          badge={settings.timezone}
          open={open === 'tz'}
          onToggle={() => toggle('tz')}
          theme={theme}
        >
          {(['WIB', 'WITA', 'WIT'] as const).map((tz, i) => (
            <View key={tz}>
              {i > 0 && <Div theme={theme} />}
              <Row
                label={tz}
                sub={TIMEZONES[tz]}
                theme={theme}
                onPress={() => updateSettings({ timezone: tz })}
                right={<Radio selected={settings.timezone === tz} theme={theme} />}
              />
            </View>
          ))}
        </Section>

        {/* ── 3. BAHASA ── */}
        <Section
          title={S('Bahasa', 'Language')}
          badge={isEN ? 'EN' : 'ID'}
          open={open === 'lang'}
          onToggle={() => toggle('lang')}
          theme={theme}
        >
          {[
            { key: 'id', label: 'Indonesia', sub: 'Bahasa Indonesia' },
            { key: 'en', label: 'English', sub: 'English (UK/US)' },
          ].map((lang, i) => (
            <View key={lang.key}>
              {i > 0 && <Div theme={theme} />}
              <Row
                label={lang.label}
                sub={lang.sub}
                theme={theme}
                onPress={() => updateSettings({ language: lang.key as any })}
                right={<Radio selected={settings.language === lang.key} theme={theme} />}
              />
            </View>
          ))}
        </Section>

        {/* ── 4. TEMA ── */}
        <Section
          title={S('Tema', 'Theme')}
          badge={THEMES.find(t => t.key === settings.theme)?.label}
          open={open === 'theme'}
          onToggle={() => toggle('theme')}
          theme={theme}
        >
          {THEMES.map((t, i) => (
            <View key={t.key}>
              {i > 0 && <Div theme={theme} />}
              <TouchableOpacity style={st.themeRow} onPress={() => updateSettings({ theme: t.key })} activeOpacity={0.7}>
                <View style={[st.swatch, { backgroundColor: t.bg, borderColor: t.border }]}>
                  <View style={[st.swatchAccent, { backgroundColor: t.accent }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[st.themeLabel, { color: theme.text }]}>{t.label}</Text>
                  <Text style={[st.themeSub, { color: theme.textMuted }]}>{t.desc}</Text>
                </View>
                {settings.theme === t.key && (
                  <View style={[st.activePill, { backgroundColor: theme.accentBg, borderColor: theme.accent + '50' }]}>
                    <Text style={[st.activePillTxt, { color: theme.accent }]}>{S('AKTIF', 'ACTIVE')}</Text>
                  </View>
                )}
                <Radio selected={settings.theme === t.key} theme={theme} />
              </TouchableOpacity>
            </View>
          ))}
        </Section>

        {/* ── 5. DRIVER FAVORIT ── */}
        <Section
          title={S('Driver Favorit', 'Favorite Driver')}
          badge={settings.favoriteDriver ? 'Set' : undefined}
          open={open === 'fav'}
          onToggle={() => toggle('fav')}
          theme={theme}
        >
          <Row
            label={settings.favoriteDriver ?? S('Belum dipilih', 'Not selected')}
            sub={S('Pilih dari tab Driver', 'Select from the Drivers tab')}
            theme={theme}
            right={settings.favoriteDriver
              ? <TouchableOpacity
                  style={[st.resetBtn, { borderColor: theme.cardBorder }]}
                  onPress={() => updateSettings({ favoriteDriver: null })}
                >
                  <Text style={[st.resetTxt, { color: theme.textMuted }]}>Clear</Text>
                </TouchableOpacity>
              : null
            }
          />
        </Section>

        {/* ── 6. SUMBER DATA ── */}
        <Section
          title={S('Sumber Data', 'Data Sources')}
          open={open === 'data'}
          onToggle={() => toggle('data')}
          theme={theme}
        >
          {[
            { name: 'Jolpica F1 API', desc: S('Data race, driver & klasemen', 'Race, driver & standings data'), url: 'https://jolpi.ca' },
            { name: 'Open-Meteo', desc: S('Cuaca sirkuit real-time', 'Real-time circuit weather'), url: 'https://open-meteo.com' },
            { name: 'Expo Notifications', desc: S('Pengingat sesi lokal', 'Local session reminders'), url: null },
          ].map((src, i) => (
            <View key={src.name}>
              {i > 0 && <Div theme={theme} />}
              <Row
                label={src.name}
                sub={src.desc}
                theme={theme}
                onPress={src.url ? () => Linking.openURL(src.url!) : undefined}
                right={src.url
                  ? <Text style={[st.linkArrow, { color: theme.accent }]}>↗</Text>
                  : null
                }
              />
            </View>
          ))}
        </Section>

        {/* ── 7. TENTANG ── */}
        <Section
          title={S('Tentang', 'About')}
          open={open === 'about'}
          onToggle={() => toggle('about')}
          theme={theme}
        >
          <View style={[st.appBlock, { borderBottomColor: theme.cardBorder }]}>
            <Text style={[st.appName, { color: theme.text }]}>F1 Hub Mobile</Text>
            <Text style={[st.appTagline, { color: theme.textMuted }]}>
              {S('Tracker F1 untuk pengguna Indonesia', 'F1 tracker for Indonesian users')}
            </Text>
          </View>

          {[
            { k: 'Developer', v: 'LeviAR' },
            { k: 'Platform', v: 'iOS & Android' },
            { k: 'Framework', v: 'React Native + Expo' },
            { k: 'Version', v: `v${APP_VERSION}` },
            { k: S('Build', 'Build'), v: BUILD_CODE },
          ].map((item, i) => (
            <View key={item.k}>
              {i > 0 && <Div theme={theme} />}
              <View style={st.infoRow}>
                <Text style={[st.infoKey, { color: theme.textMuted }]}>{item.k}</Text>
                <Text style={[st.infoVal, { color: theme.textSub }]}>{item.v}</Text>
              </View>
            </View>
          ))}

          <Div theme={theme} />
          <TouchableOpacity style={st.libsToggle} onPress={() => setShowLibs(!showLibs)}>
            <Text style={[st.libsTitle, { color: theme.text }]}>Open Source Libraries</Text>
            <Text style={[st.linkArrow, { color: theme.textMuted, fontSize: 12 }]}>{showLibs ? '−' : '+'}</Text>
          </TouchableOpacity>

          {showLibs && ['Expo ~51', 'React Native 0.74', 'expo-router ~3.5', 'expo-notifications ~0.28'].map((lib, i) => (
            <View key={lib}>
              <Div theme={theme} />
              <View style={[st.infoRow, { paddingVertical: 10 }]}>
                <Text style={[st.infoKey, { color: theme.textSub }]}>{lib}</Text>
                <View style={[st.mitPill, { backgroundColor: theme.accentBg, borderColor: theme.accent + '40' }]}>
                  <Text style={[st.mitTxt, { color: theme.accent }]}>MIT</Text>
                </View>
              </View>
            </View>
          ))}

          <Div theme={theme} />
          <Text style={[st.madeBy, { color: theme.textMuted }]}>
            Made by LeviAR · Indonesia
          </Text>
        </Section>

        {/* Disclaimer */}
        <View style={[st.disclaimer, { borderColor: theme.cardBorder }]}>
          <Text style={[st.disclaimerTxt, { color: theme.textMuted }]}>
            {S(
              'F1 Hub bukan produk resmi Formula 1. F1, FORMULA ONE, dan logo terkait adalah merek dagang dari Formula One Licensing B.V.',
              'F1 Hub is not an official Formula 1 product. F1, FORMULA ONE, and related marks are trademarks of Formula One Licensing B.V.',
            )}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 14 },
  linkArrow: { fontSize: 15, fontWeight: '600' },

  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  swatch: { width: 34, height: 34, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  swatchAccent: { width: 12, height: 12, borderRadius: 3 },
  themeLabel: { fontSize: 13, fontWeight: '700' },
  themeSub: { fontSize: 10, marginTop: 1 },
  activePill: { borderRadius: 5, borderWidth: 0.5, paddingHorizontal: 7, paddingVertical: 3 },
  activePillTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },

  resetBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  resetTxt: { fontSize: 11, fontWeight: '600' },

  appBlock: { paddingVertical: 14, borderBottomWidth: 1, marginBottom: 4 },
  appName: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  appTagline: { fontSize: 11, marginTop: 3 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  infoKey: { fontSize: 12 },
  infoVal: { fontSize: 12, fontWeight: '600' },

  libsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  libsTitle: { fontSize: 13, fontWeight: '600' },
  mitPill: { borderRadius: 4, borderWidth: 0.5, paddingHorizontal: 6, paddingVertical: 2 },
  mitTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  madeBy: { fontSize: 11, textAlign: 'center', paddingVertical: 12 },

  disclaimer: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  disclaimerTxt: { fontSize: 10, lineHeight: 16 },
});
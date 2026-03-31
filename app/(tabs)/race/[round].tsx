import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BgDecoration from '../../../components/BgDecoration';
import FlagBadge from '../../../components/FlagBadge';
import ThemeCard from '../../../components/ThemeCard';
import {
  CIRCUIT_COORDS,
  COUNTRY_CODES,
  formatDate,
  formatLocalTime,
  getDriverCode,
  getQualiResult,
  getRaceResult,
  getRaceSchedule,
  getSprintResult,
  getWeather, getWeatherLabel,
  TEAM_COLORS, TEAM_NAME_MAP,
  TIMEZONES
} from '../../../lib/api';
import { useSettings } from '../../../lib/SettingsContext';

type TabType = 'schedule' | 'race' | 'qualifying' | 'sprint';

export default function RaceDetailScreen() {
  const { round } = useLocalSearchParams<{ round: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, settings } = useSettings();
  const isEN = settings.language === 'en';
  const tz = TIMEZONES[settings.timezone];
  const labelStyle = { letterSpacing: theme.labelTracking, textTransform: theme.labelCase as any };
  const scrollY = useRef(new Animated.Value(0)).current;

  const [tab, setTab] = useState<TabType>('schedule');
  const [raceData, setRaceData] = useState<any>(null);
  const [qualiData, setQualiData] = useState<any>(null);
  const [sprintData, setSprintData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSprint, setHasSprint] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const schedule = await getRaceSchedule('2026');
      const raceInfo = schedule?.find((r: any) => r.round === round);
      setScheduleData(raceInfo);

      const done = raceInfo ? new Date(raceInfo.date) < new Date() : false;
      setIsDone(done);

      // Check if sprint weekend based on schedule data
      const isSprintWeekend = !!(raceInfo?.Sprint);
      setHasSprint(isSprintWeekend);

      // Weather
      if (raceInfo?.Circuit?.circuitId) {
        const coords = CIRCUIT_COORDS[raceInfo.Circuit.circuitId];
        if (coords) getWeather(coords.lat, coords.lon).then(setWeather);
      }

      if (done) {
        const [race, quali] = await Promise.all([
          getRaceResult('2026', round),
          getQualiResult('2026', round),
        ]);
        setRaceData(race);
        setQualiData(quali);

        // Only fetch sprint if it's a sprint weekend
        if (isSprintWeekend) {
          const sprint = await getSprintResult('2026', round);
          if (sprint?.SprintResults?.length > 0) {
            setSprintData(sprint);
          }
        }
        setTab('race');
      } else {
        setTab('schedule');
      }
      setLoading(false);
    }
    load();
  }, [round]);

  const raceInfo = scheduleData;
  const countryCode = COUNTRY_CODES[raceInfo?.Circuit?.Location?.country ?? ''] ?? '??';
  const weatherInfo = weather ? getWeatherLabel(weather.code) : null;

  // Build tabs — only show relevant ones
  const TABS: { key: TabType; label: string }[] = [
    { key: 'schedule', label: isEN ? 'Schedule' : 'Jadwal' },
    ...(isDone ? [{ key: 'race' as TabType, label: 'Race' }] : []),
    ...(isDone ? [{ key: 'qualifying' as TabType, label: isEN ? 'Qualifying' : 'Kualifikasi' }] : []),
    ...(isDone && hasSprint ? [{ key: 'sprint' as TabType, label: 'Sprint' }] : []),
  ];

  const sessions = raceInfo ? [
    raceInfo.FirstPractice && { label: 'FP1', ...raceInfo.FirstPractice },
    raceInfo.SecondPractice && { label: 'FP2', ...raceInfo.SecondPractice },
    raceInfo.ThirdPractice && { label: 'FP3', ...raceInfo.ThirdPractice },
    raceInfo.SprintQualifying && { label: 'Sprint Qualifying', ...raceInfo.SprintQualifying },
    raceInfo.Sprint && { label: 'Sprint Race', ...raceInfo.Sprint },
    raceInfo.Qualifying && { label: isEN ? 'Qualifying' : 'Kualifikasi', ...raceInfo.Qualifying },
    { label: 'Race', date: raceInfo.date, time: raceInfo.time },
  ].filter(Boolean) : [];

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  function ResultTable({ results, type }: { results: any[]; type: 'race' | 'quali' | 'sprint' }) {
    return (
      <View style={styles.tableContainer}>
        {/* Header */}
        <View style={[styles.tableHead, { borderBottomColor: theme.cardBorder }]}>
          <Text style={[styles.tableHeadPos, { color: theme.textMuted }]}>POS</Text>
          <Text style={[styles.tableHeadDriver, { color: theme.textMuted }]}>DRIVER</Text>
          <Text style={[styles.tableHeadTeam, { color: theme.textMuted }]}>TIM</Text>
          {type === 'quali' ? (
            <Text style={[styles.tableHeadTime, { color: theme.textMuted }]}>BEST</Text>
          ) : (
            <>
              <Text style={[styles.tableHeadTime, { color: theme.textMuted }]}>WAKTU</Text>
              <Text style={[styles.tableHeadPts, { color: theme.textMuted }]}>PTS</Text>
            </>
          )}
        </View>
        {/* Rows */}
        {results.map((result: any) => {
          const pos = parseInt(result.position);
          const teamName = TEAM_NAME_MAP[result.Constructor?.name] ?? result.Constructor?.name ?? '-';
          const color = TEAM_COLORS[teamName] ?? '#888';
          const driverCode = getDriverCode(result.Driver);
          const isTop3 = pos <= 3;
          return (
            <View
              key={result.position}
              style={[
                styles.tableRow,
                { borderBottomColor: theme.cardBorder },
                pos === 1 && { backgroundColor: theme.accentBg },
              ]}
            >
              <Text style={[styles.tablePos, { color: isTop3 ? theme.accent : theme.textMuted }]}>{pos}</Text>
              <View style={styles.tableDriver}>
                <View style={[styles.teamColorDot, { backgroundColor: color }]} />
                <FlagBadge code={driverCode} size="sm" />
                <View>
                  <Text style={[styles.tableDriverName, { color: theme.text, fontWeight: theme.titleWeight }]}>
                    {result.Driver.givenName} {result.Driver.familyName}
                  </Text>
                  <Text style={[styles.tableDriverCode, { color: color }]}>
                    {result.Driver.code ?? result.Driver.familyName.slice(0, 3).toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.tableTeam, { color: theme.textMuted }]} numberOfLines={1}>{teamName}</Text>
              {type === 'quali' ? (
                <Text style={[styles.tableTime, { color: isTop3 ? theme.accent : theme.textSub }]}>
                  {result.Q3 ?? result.Q2 ?? result.Q1 ?? '-'}
                </Text>
              ) : (
                <>
                  <Text style={[styles.tableTime, { color: theme.textSub }]}>
                    {pos === 1 ? result.Time?.time : result.Time?.time ? `+${result.Time.time}` : result.status}
                  </Text>
                  <Text style={[styles.tablePts, { color: parseInt(result.points) > 0 ? theme.accent : theme.textMuted }]}>
                    {result.points}
                  </Text>
                </>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <BgDecoration theme={theme} />

      {/* Status bar background — fix notif bar overlap */}
      <View style={[styles.statusBarBg, { height: insets.top, backgroundColor: theme.bgHero }]} />

      {/* Sticky back button + title */}
      <Animated.View style={[styles.stickyHeader, { top: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, opacity: headerBgOpacity }]} />
        <View style={styles.stickyRow}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/calendar')}
            style={styles.backBtn}
          >
            <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
          </TouchableOpacity>
          <Animated.Text
            numberOfLines={1}
            style={[styles.stickyTitle, { color: theme.text, opacity: headerBgOpacity }]}
          >
            {raceInfo?.raceName ?? ''}
          </Animated.Text>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={[styles.hero, {
          backgroundColor: theme.bgHero,
          paddingTop: insets.top + 52,
        }]}>
          {!theme.isLight && !theme.showGridOverlay && (
            <View style={[styles.heroGradient, { backgroundColor: theme.heroGradient[0] }]} pointerEvents="none" />
          )}

          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.roundBadge, { backgroundColor: theme.cardBorder }]}>
              <Text style={[styles.roundNum, { color: theme.textSub }]}>R{round}</Text>
            </View>
            {isDone && (
              <View style={[styles.pill, { backgroundColor: theme.accent }]}>
                <Text style={styles.pillText}>✓ {isEN ? 'SELESAI' : 'SELESAI'}</Text>
              </View>
            )}
            {hasSprint && (
              <View style={[styles.pill, { backgroundColor: '#FF8000' }]}>
                <Text style={styles.pillText}>⚡ SPRINT</Text>
              </View>
            )}
          </View>

          {/* Race name */}
          <View style={styles.nameRow}>
            <FlagBadge code={countryCode} size="lg" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.raceName, { color: theme.text, fontWeight: theme.titleWeight }]}>
                {raceInfo?.raceName?.replace(' Grand Prix', '').replace(' GP', '') ?? '...'}
              </Text>
              <Text style={[styles.raceNameSub, { color: theme.text }]}>Grand Prix</Text>
            </View>
          </View>

          <Text style={[styles.circuit, { color: theme.textMuted }]}>
            📍 {raceInfo?.Circuit?.circuitName ?? '...'}
          </Text>
          <Text style={[styles.location, { color: theme.textMuted }]}>
            {raceInfo?.Circuit?.Location?.locality}, {raceInfo?.Circuit?.Location?.country}
          </Text>

          {/* Key sessions */}
          {raceInfo && (
            <View style={styles.keyRow}>
              {raceInfo.Qualifying && (
                <View style={[styles.keyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 }]}>
                  <Text style={[styles.keyLabel, { color: theme.textMuted, ...labelStyle }]}>
                    {isEN ? 'QUALI' : 'KUAL'}
                  </Text>
                  <Text style={[styles.keyTime, { color: theme.textSub }]}>
                    {formatLocalTime(raceInfo.Qualifying.date, raceInfo.Qualifying.time, tz)}
                  </Text>
                </View>
              )}
              {raceInfo.Sprint && (
                <View style={[styles.keyCard, { backgroundColor: '#FF800015', borderColor: '#FF8000', borderWidth: 1 }]}>
                  <Text style={[styles.keyLabel, { color: '#FF8000', ...labelStyle }]}>SPRINT</Text>
                  <Text style={[styles.keyTime, { color: '#FF8000' }]}>
                    {formatLocalTime(raceInfo.Sprint.date, raceInfo.Sprint.time, tz)}
                  </Text>
                </View>
              )}
              <View style={[styles.keyCard, { backgroundColor: theme.accentBg, borderColor: theme.accent, borderWidth: 1 }]}>
                <Text style={[styles.keyLabel, { color: theme.accent, ...labelStyle }]}>RACE</Text>
                <Text style={[styles.keyTime, { color: theme.accent, fontWeight: '700' }]}>
                  {formatLocalTime(raceInfo.date, raceInfo.time, tz)}
                </Text>
              </View>
            </View>
          )}

          {/* Weather */}
          {weatherInfo && weather && (
            <View style={[styles.weatherCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 }]}>
              <Text style={styles.weatherIcon}>{weatherInfo.icon}</Text>
              <Text style={[styles.weatherTemp, { color: theme.text }]}>{weather.temp}°C</Text>
              <Text style={[styles.weatherLabel, { color: theme.textMuted }]}>{weatherInfo.label}</Text>
              <Text style={[styles.weatherAt, { color: theme.textMuted }]}>
                {isEN ? 'at circuit' : 'di sirkuit'}
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        {!loading && (
          <View style={[styles.tabsWrap, { backgroundColor: theme.bg, borderBottomColor: theme.cardBorder }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {TABS.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.tabItem,
                    tab === t.key && [styles.tabItemActive, { borderBottomColor: theme.accent }],
                  ]}
                  onPress={() => setTab(t.key)}
                >
                  <Text style={[
                    styles.tabLabel,
                    { color: tab === t.key ? theme.accent : theme.textMuted },
                  ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.body}>

            {/* SCHEDULE */}
            {tab === 'schedule' && (
              <View style={styles.list}>
                {sessions.map((s: any, i: number) => {
                  const isRace = s.label === 'Race';
                  const isSprint = s.label === 'Sprint Race';
                  const done = new Date(`${s.date}T${s.time ?? '00:00:00Z'}`) < new Date();
                  return (
                    <ThemeCard key={i} theme={theme} accent={isRace} style={[styles.sessionCard, done && { opacity: 0.5 }]}>
                      <View style={styles.sessionRow}>
                        <View style={[styles.sessionTag, {
                          backgroundColor: isRace ? theme.accent : isSprint ? '#FF8000' : theme.cardBorder,
                        }]}>
                          <Text style={[styles.sessionTagText, { color: isRace || isSprint ? '#fff' : theme.textSub }]}>
                            {s.label}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.sessionDate, { color: theme.textSub }]}>{formatDate(s.date)}</Text>
                          <Text style={[styles.sessionTime, {
                            color: isRace ? theme.accent : theme.text,
                            fontWeight: isRace ? '800' : '600',
                          }]}>
                            {formatLocalTime(s.date, s.time, tz)}
                          </Text>
                        </View>
                        {done && <Text style={{ color: theme.textMuted, fontSize: 14 }}>✓</Text>}
                      </View>
                    </ThemeCard>
                  );
                })}
              </View>
            )}

            {/* RACE */}
            {tab === 'race' && (
              raceData?.Results?.length > 0 ? (
                <View style={styles.list}>
                  {/* Podium */}
                  <View style={styles.podium}>
                    {[1, 0, 2].map((offset) => {
                      const r = raceData.Results[offset];
                      if (!r) return null;
                      const pos = parseInt(r.position);
                      const teamName = TEAM_NAME_MAP[r.Constructor?.name] ?? '-';
                      const color = TEAM_COLORS[teamName] ?? '#888';
                      return (
                        <View key={offset} style={[
                          styles.podiumCard,
                          pos === 1 && styles.podiumFirst,
                          { backgroundColor: theme.card, borderColor: pos === 1 ? theme.accent : theme.cardBorder },
                        ]}>
                          <Text style={styles.podiumEmoji}>{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</Text>
                          <FlagBadge code={getDriverCode(r.Driver)} size="sm" />
                          <Text style={[styles.podiumName, { color: theme.text, fontWeight: theme.titleWeight }]}>
                            {r.Driver.familyName}
                          </Text>
                          <Text style={[styles.podiumTeam, { color }]}>{teamName}</Text>
                          <Text style={[styles.podiumTime, { color: theme.textMuted }]}>
                            {r.Time?.time ?? r.status}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <ResultTable results={raceData.Results} type="race" />
                </View>
              ) : (
                <NoData icon="🏁" text={isEN ? 'Results not available yet.' : 'Hasil belum tersedia.'} theme={theme} />
              )
            )}

            {/* QUALIFYING */}
            {tab === 'qualifying' && (
              qualiData?.QualifyingResults?.length > 0
                ? <ResultTable results={qualiData.QualifyingResults} type="quali" />
                : <NoData icon="🕐" text={isEN ? 'Qualifying results not available.' : 'Hasil kualifikasi belum tersedia.'} theme={theme} />
            )}

            {/* SPRINT */}
            {tab === 'sprint' && (
              sprintData?.SprintResults?.length > 0
                ? <ResultTable results={sprintData.SprintResults} type="sprint" />
                : <NoData icon="⚡" text={isEN ? 'Sprint results not available.' : 'Hasil sprint belum tersedia.'} theme={theme} />
            )}

          </View>
        )}

        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
}

function NoData({ icon, text, theme }: { icon: string; text: string; theme: any }) {
  return (
    <View style={styles.noData}>
      <Text style={styles.noDataIcon}>{icon}</Text>
      <Text style={[styles.noDataText, { color: theme.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBarBg: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  stickyHeader: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  stickyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 40 },
  backText: { fontSize: 22, fontWeight: '700' },
  stickyTitle: { fontSize: 14, fontWeight: '800', flex: 1, textAlign: 'center' },
  hero: { paddingHorizontal: 16, paddingBottom: 16, position: 'relative', overflow: 'hidden' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  roundBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  roundNum: { fontSize: 12, fontWeight: '800' },
  pill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  raceName: { fontSize: 24, lineHeight: 24 },
  raceNameSub: { fontSize: 14, lineHeight: 18, opacity: 0.6 },
  circuit: { fontSize: 11, marginTop: 6 },
  location: { fontSize: 10, marginTop: 2, marginBottom: 12 },
  keyRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  keyCard: { flex: 1, borderRadius: 8, padding: 10 },
  keyLabel: { fontSize: 8, fontWeight: '700', marginBottom: 3 },
  keyTime: { fontSize: 11, fontWeight: '600' },
  weatherCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 8, padding: 10 },
  weatherIcon: { fontSize: 16 },
  weatherTemp: { fontSize: 14, fontWeight: '800' },
  weatherLabel: { fontSize: 12, flex: 1 },
  weatherAt: { fontSize: 9 },
  // Tabs — underline style like web
  tabsWrap: { borderBottomWidth: 1 },
  tabsScroll: { paddingHorizontal: 16, gap: 0 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomWidth: 2 },
  tabLabel: { fontSize: 13, fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  list: { gap: 8 },
  // Schedule
  sessionCard: { padding: 14 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionTag: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, minWidth: 88, alignItems: 'center' },
  sessionTagText: { fontSize: 11, fontWeight: '800' },
  sessionDate: { fontSize: 11, marginBottom: 2 },
  sessionTime: { fontSize: 14 },
  // Podium
  podium: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'flex-end' },
  podiumCard: { flex: 1, borderRadius: 10, padding: 10, borderWidth: 1, alignItems: 'center', gap: 3 },
  podiumFirst: { paddingTop: 16, paddingBottom: 16 },
  podiumEmoji: { fontSize: 22 },
  podiumName: { fontSize: 11, textAlign: 'center', marginTop: 3 },
  podiumTeam: { fontSize: 9, textAlign: 'center' },
  podiumTime: { fontSize: 9, textAlign: 'center', marginTop: 1 },
  // Table
  table: { borderRadius: 10, overflow: 'hidden', borderWidth: 1 },
  tableHead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1 },
  thPos: { fontSize: 9, fontWeight: '800', width: 28, letterSpacing: 0.5 },
  thDriver: { fontSize: 9, fontWeight: '800', flex: 1, letterSpacing: 0.5 },
  thTeam: { fontSize: 9, fontWeight: '800', width: 70, letterSpacing: 0.5 },
  thTime: { fontSize: 9, fontWeight: '800', width: 80, textAlign: 'right', letterSpacing: 0.5 },
  thPts: { fontSize: 9, fontWeight: '800', width: 28, textAlign: 'right', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1 },
  tdPos: { fontSize: 14, fontWeight: '900', width: 28 },
  tdDriver: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  colorLine: { width: 3, height: 28, borderRadius: 2 },
  tdName: { fontSize: 12 },
  tdCode: { fontSize: 9, fontWeight: '800', marginTop: 1 },
  tdTeam: { fontSize: 10, width: 70 },
  tdTime: { fontSize: 11, fontWeight: '600', width: 80, textAlign: 'right' },
  tdPts: { fontSize: 11, fontWeight: '800', width: 28, textAlign: 'right' },
  noData: { paddingVertical: 48, alignItems: 'center', gap: 8 },
  noDataIcon: { fontSize: 32 },
  noDataText: { fontSize: 13 },
});
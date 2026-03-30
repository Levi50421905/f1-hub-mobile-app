import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BgDecoration from '../../components/BgDecoration';
import FlagBadge from '../../components/FlagBadge';
import {
  CIRCUIT_COORDS,
  COUNTRY_CODES,
  formatDateFull,
  formatLocalTime,
  getDriverStandings,
  getRaceSchedule,
  getWeather,
  getWeatherLabel,
  TEAM_COLORS,
  TEAM_NAME_MAP,
  TIMEZONES
} from '../../lib/api';
import { useSettings } from '../../lib/SettingsContext';

const { width: SCREEN_W } = Dimensions.get('window');

const GLOSSARY_ID = [
  { term: 'DRS', full: 'Drag Reduction System', def: 'Sayap belakang dibuka di zona tertentu untuk nambah kecepatan di lurus panjang.' },
  { term: 'Undercut', full: 'Strategic Early Pit Stop', def: 'Masuk pit lebih awal dari lawan untuk dapat ban segar dan menyalip mereka.' },
  { term: 'Parc Fermé', full: 'Closed Park', def: 'Setelah kualifikasi, mobil tidak boleh dimodifikasi sampai race selesai.' },
];
const GLOSSARY_EN = [
  { term: 'DRS', full: 'Drag Reduction System', def: 'Rear wing opens in designated zones to gain speed on straights.' },
  { term: 'Undercut', full: 'Strategic Early Pit Stop', def: 'Pit earlier than rival to get fresh tyres and overtake them.' },
  { term: 'Parc Fermé', full: 'Closed Park', def: 'Cars cannot be modified after qualifying until the race ends.' },
];

function useCountdown(targetDate: string) {
  const [parts, setParts] = useState({ d: '00', h: '00', m: '00', s: '00' });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setParts({ d: '00', h: '00', m: '00', s: '00' }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setParts({
        d: String(d).padStart(2, '0'),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return parts;
}

function CountdownBlock({ value, label, theme }: { value: string; label: string; theme: any }) {
  return (
    <View style={[styles.cdBlock, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={[styles.cdValue, { color: theme.accent, fontFamily: 'Courier New' }]}>{value}</Text>
      <Text style={[styles.cdLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, settings, isRaceWeekend, setRaces } = useSettings();
  const isEN = settings.language === 'en';
  const tz = TIMEZONES[settings.timezone];

  const [drivers, setDrivers] = useState<any[]>([]);
  const [races, setLocalRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [openGlossary, setOpenGlossary] = useState<number | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp' });

  useEffect(() => {
    async function load() {
      const [d, r] = await Promise.all([getDriverStandings(), getRaceSchedule()]);
      setDrivers(d);
      setLocalRaces(r);
      setRaces(r);
      setLoading(false);
      const next = r.find((race: any) => new Date(race.date) >= new Date());
      if (next) {
        const coords = CIRCUIT_COORDS[next.Circuit?.circuitId];
        if (coords) getWeather(coords.lat, coords.lon).then(setWeather);
      }
    }
    load();
  }, []);

  const now = new Date();
  const nextRace = races.find((r) => new Date(r.date) >= now);
  const cdParts = useCountdown(nextRace ? `${nextRace.date}T${nextRace.time ?? '00:00:00Z'}` : '');
  const top5 = drivers.slice(0, 5);
  const upcomingRaces = races.filter((r) => new Date(r.date) >= now).slice(0, 3);
  const glossaryItems = isEN ? GLOSSARY_EN : GLOSSARY_ID;
  const weatherInfo = weather ? getWeatherLabel(weather.code) : null;
  const nextRaceCountryCode = nextRace ? COUNTRY_CODES[nextRace.Circuit?.Location?.country ?? ''] ?? '??' : '??';

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <BgDecoration theme={theme} />

      {/* Sticky header */}
      <Animated.View style={[styles.stickyHdr, { top: 0, paddingTop: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, opacity: headerOpacity }]} />
        <View style={[styles.stickyHdrInner, { borderBottomColor: theme.cardBorder }]}>
          <Text style={[styles.stickyLogo, { color: theme.text }]}>
            F1<Text style={{ color: theme.accent }}>HUB</Text>
          </Text>
          {isRaceWeekend && (
            <View style={[styles.livePill, { backgroundColor: theme.accent }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>LIVE</Text>
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* ── HERO ── */}
        <View style={[styles.hero, { backgroundColor: theme.bgHero, paddingTop: insets.top + 52 }]}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={[styles.logoMain, { color: theme.text }]}>
                F1<Text style={{ color: theme.accent }}>HUB</Text>
              </Text>
              <Text style={[styles.logoSub, { color: theme.textMuted, letterSpacing: 2 }]}>2026 SEASON</Text>
            </View>
            {isRaceWeekend ? (
              <View style={[styles.raceWeekendBadge, { backgroundColor: theme.accent }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTxt}>RACE WEEKEND</Text>
              </View>
            ) : (
              <View style={[styles.seasonBadge, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
                <Text style={[styles.seasonTxt, { color: theme.textMuted }]}>ROUND {nextRace?.round ?? '--'} NEXT</Text>
              </View>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color={theme.accent} style={{ marginVertical: 40 }} />
          ) : nextRace ? (
            <>
              {/* Race title block */}
              <View style={styles.heroRaceBlock}>
                <Text style={[styles.heroRaceLabel, { color: theme.textMuted, letterSpacing: 2 }]}>
                  {isEN ? 'NEXT RACE' : 'RACE BERIKUTNYA'} · R{String(nextRace.round).padStart(2, '0')}
                </Text>
                <View style={styles.heroNameRow}>
                  <FlagBadge code={nextRaceCountryCode} size="lg" />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[styles.heroGP, { color: theme.text }]} numberOfLines={1}>
                      {nextRace.raceName.replace(' Grand Prix', '').replace(' GP', '')}
                    </Text>
                    <Text style={[styles.heroGPSub, { color: theme.textMuted }]}>GRAND PRIX</Text>
                  </View>
                </View>
                <Text style={[styles.heroCircuit, { color: theme.textMuted }]}>
                  {nextRace.Circuit?.circuitName}  ·  {nextRace.Circuit?.Location?.country}
                </Text>
              </View>

              {/* Separator line */}
              <View style={[styles.separator, { backgroundColor: theme.cardBorder }]} />

              {/* Countdown blocks */}
              <View style={styles.cdRow}>
                <CountdownBlock value={cdParts.d} label={isEN ? 'DAYS' : 'HARI'} theme={theme} />
                <Text style={[styles.cdColon, { color: theme.accent }]}>:</Text>
                <CountdownBlock value={cdParts.h} label={isEN ? 'HRS' : 'JAM'} theme={theme} />
                <Text style={[styles.cdColon, { color: theme.accent }]}>:</Text>
                <CountdownBlock value={cdParts.m} label="MIN" theme={theme} />
                <Text style={[styles.cdColon, { color: theme.accent }]}>:</Text>
                <CountdownBlock value={cdParts.s} label="SEC" theme={theme} />
              </View>

              {/* Session pills */}
              <View style={styles.sessionRow}>
                {nextRace.Qualifying && (
                  <View style={[styles.sessionPill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.sessionPillLabel, { color: theme.textMuted }]}>
                      {isEN ? 'QUALI' : 'KUAL'}
                    </Text>
                    <Text style={[styles.sessionPillTime, { color: theme.textSub }]}>
                      {formatLocalTime(nextRace.Qualifying.date, nextRace.Qualifying.time, tz)}
                    </Text>
                  </View>
                )}
                <View style={[styles.sessionPill, { backgroundColor: theme.accentBg, borderColor: theme.accent, borderWidth: 1 }]}>
                  <Text style={[styles.sessionPillLabel, { color: theme.accent }]}>RACE</Text>
                  <Text style={[styles.sessionPillTime, { color: theme.accent, fontWeight: '800' }]}>
                    {formatLocalTime(nextRace.date, nextRace.time, tz)}
                  </Text>
                </View>
              </View>

              {/* Weather strip */}
              {weatherInfo && weather && (
                <View style={[styles.weatherStrip, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
                  <Text style={styles.weatherIcon}>{weatherInfo.icon}</Text>
                  <Text style={[styles.weatherTemp, { color: theme.text }]}>{weather.temp}°C</Text>
                  <View style={[styles.weatherDiv, { backgroundColor: theme.cardBorder }]} />
                  <Text style={[styles.weatherLabel, { color: theme.textMuted }]}>{weatherInfo.label}</Text>
                  <Text style={[styles.weatherAt, { color: theme.textMuted }]}>
                    {isEN ? '· at circuit' : '· di sirkuit'}
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>

        {/* ── BODY ── */}
        <View style={styles.body}>

          {/* ── DRIVER STANDINGS ── */}
          <View style={styles.sectionHdr}>
            <View style={[styles.sectionAccent, { backgroundColor: theme.accent }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isEN ? 'Drivers' : 'Driver'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/standings')} style={styles.seeAllBtn}>
              <Text style={[styles.seeAll, { color: theme.accent }]}>{isEN ? 'SEE ALL' : 'LIHAT SEMUA'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.driversScroll}>
            {top5.map((d: any, i: number) => {
              const teamName = TEAM_NAME_MAP[d.Constructors?.[0]?.name] ?? '-';
              const color = TEAM_COLORS[teamName] ?? '#888';
              const pos = parseInt(d.position);
              const isFav = settings.favoriteDriver === d.Driver.driverId;
              const code = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();
              return (
                <View key={d.Driver.driverId} style={[
                  styles.driverCard,
                  { backgroundColor: theme.card, borderColor: isFav ? '#FFD700' : theme.cardBorder },
                ]}>
                  {/* Team color bar */}
                  <View style={[styles.driverColorBar, { backgroundColor: color }]} />
                  {/* Position */}
                  <Text style={[styles.driverPos, { color: pos === 1 ? theme.accent : theme.textMuted }]}>
                    P{d.position}
                  </Text>
                  {/* Code */}
                  <Text style={[styles.driverCode, { color: theme.text }]}>{code}</Text>
                  {/* Team */}
                  <Text style={[styles.driverTeam, { color }]} numberOfLines={2}>{teamName}</Text>
                  {/* Points */}
                  <View style={styles.driverPtsRow}>
                    <Text style={[styles.driverPts, { color: pos === 1 ? theme.accent : theme.text }]}>
                      {d.points}
                    </Text>
                    <Text style={[styles.driverPtsLabel, { color: theme.textMuted }]}>PTS</Text>
                  </View>
                  {isFav && <Text style={styles.favStar}>⭐</Text>}
                </View>
              );
            })}
          </ScrollView>

          {/* ── UPCOMING RACES ── */}
          <View style={styles.sectionHdr}>
            <View style={[styles.sectionAccent, { backgroundColor: theme.accent }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isEN ? 'Upcoming' : 'Akan Datang'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/calendar')} style={styles.seeAllBtn}>
              <Text style={[styles.seeAll, { color: theme.accent }]}>{isEN ? 'SEE ALL' : 'LIHAT SEMUA'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.upcomingList}>
            {upcomingRaces.map((race: any, i: number) => {
              const isNext = i === 0;
              const diff = new Date(`${race.date}T${race.time ?? '00:00:00Z'}`).getTime() - now.getTime();
              const daysLeft = Math.floor(diff / 86400000);
              const hoursLeft = Math.floor(diff / 3600000);
              const timeLabel = hoursLeft < 24 ? `${hoursLeft}h` : `${daysLeft}d`;
              const countryCode = COUNTRY_CODES[race.Circuit?.Location?.country ?? ''] ?? '??';
              return (
                <TouchableOpacity
                  key={race.round}
                  onPress={() => router.push(`/race/${race.round}`)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.upcomingRow,
                    {
                      backgroundColor: isNext ? theme.accentBg : theme.card,
                      borderColor: isNext ? theme.accent : theme.cardBorder,
                    },
                  ]}>
                    {isNext && <View style={[styles.upcomingAccentBar, { backgroundColor: theme.accent }]} />}
                    <View style={[styles.upcomingRound, { backgroundColor: theme.cardBorder }]}>
                      <Text style={[styles.upcomingRoundTxt, { color: theme.textSub }]}>
                        R{String(race.round).padStart(2, '0')}
                      </Text>
                    </View>
                    <FlagBadge code={countryCode} size="md" />
                    <View style={styles.upcomingInfo}>
                      <Text style={[styles.upcomingName, { color: isNext ? theme.accent : theme.text }]} numberOfLines={1}>
                        {race.raceName}
                      </Text>
                      <Text style={[styles.upcomingDate, { color: theme.textMuted }]}>
                        {formatDateFull(race.date)}  ·  {formatLocalTime(race.date, race.time, tz)}
                      </Text>
                    </View>
                    <View style={[styles.upcomingBadge, {
                      backgroundColor: isNext ? theme.accent + '22' : theme.card,
                      borderColor: isNext ? theme.accent : theme.cardBorder,
                    }]}>
                      <Text style={[styles.upcomingBadgeTxt, { color: isNext ? theme.accent : theme.textMuted }]}>
                        {timeLabel}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── GLOSSARY ── */}
          <View style={styles.sectionHdr}>
            <View style={[styles.sectionAccent, { backgroundColor: theme.accent }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>F1 Glossary</Text>
            <TouchableOpacity onPress={() => router.push('/glossary')} style={styles.seeAllBtn}>
              <Text style={[styles.seeAll, { color: theme.accent }]}>{isEN ? 'SEE ALL' : 'LIHAT SEMUA'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.glossaryList}>
            {glossaryItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setOpenGlossary(openGlossary === i ? null : i)}
                activeOpacity={0.75}
              >
                <View style={[styles.glossaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.glossaryTop}>
                    <View style={[styles.glossaryBadge, { backgroundColor: theme.accent }]}>
                      <Text style={styles.glossaryBadgeTxt}>{item.term}</Text>
                    </View>
                    <Text style={[styles.glossaryFull, { color: theme.textSub }]} numberOfLines={1}>
                      {item.full}
                    </Text>
                    <Text style={[styles.glossaryChevron, { color: theme.textMuted }]}>
                      {openGlossary === i ? '▲' : '▼'}
                    </Text>
                  </View>
                  {openGlossary === i && (
                    <Text style={[styles.glossaryDef, { color: theme.textMuted, borderTopColor: theme.cardBorder }]}>
                      {item.def}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: insets.bottom + 96 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyHdr: { position: 'absolute', left: 0, right: 0, zIndex: 20 },
  stickyHdrInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  stickyLogo: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },

  // Hero
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  logoMain: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  logoSub: { fontSize: 9, fontWeight: '700', marginTop: 2, letterSpacing: 2 },
  raceWeekendBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  seasonBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  seasonTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  liveTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  heroRaceBlock: { marginBottom: 20 },
  heroRaceLabel: { fontSize: 9, fontWeight: '700', marginBottom: 12, letterSpacing: 2 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  heroGP: { fontSize: 30, fontWeight: '900', letterSpacing: -1, lineHeight: 32 },
  heroGPSub: { fontSize: 12, fontWeight: '700', letterSpacing: 2, marginTop: 2 },
  heroCircuit: { fontSize: 11, marginTop: 4 },

  separator: { height: 1, marginBottom: 20, opacity: 0.4 },

  cdRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 },
  cdBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 58,
  },
  cdValue: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  cdLabel: { fontSize: 8, fontWeight: '700', marginTop: 3, letterSpacing: 1.5 },
  cdColon: { fontSize: 20, fontWeight: '900', marginBottom: 12 },

  sessionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  sessionPill: { flex: 1, borderRadius: 8, padding: 12, borderWidth: 1 },
  sessionPillLabel: { fontSize: 8, fontWeight: '800', marginBottom: 4, letterSpacing: 1 },
  sessionPillTime: { fontSize: 12, fontWeight: '700' },

  weatherStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  weatherIcon: { fontSize: 16 },
  weatherTemp: { fontSize: 14, fontWeight: '800' },
  weatherDiv: { width: 1, height: 14, borderRadius: 1 },
  weatherLabel: { fontSize: 12, flex: 1 },
  weatherAt: { fontSize: 10 },

  // Body
  body: { paddingHorizontal: 16, paddingTop: 4 },

  sectionHdr: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, marginBottom: 14 },
  sectionAccent: { width: 3, height: 16, borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', flex: 1, letterSpacing: -0.3 },
  seeAllBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  seeAll: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  // Driver cards
  driversScroll: { gap: 10, paddingBottom: 2 },
  driverCard: {
    width: 96,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  driverColorBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: 1 },
  driverPos: { fontSize: 10, fontWeight: '800', marginTop: 8, letterSpacing: 0.5 },
  driverCode: { fontSize: 16, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  driverTeam: { fontSize: 9, fontWeight: '600', marginTop: 4, lineHeight: 12 },
  driverPtsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 10 },
  driverPts: { fontSize: 16, fontWeight: '900' },
  driverPtsLabel: { fontSize: 8, fontWeight: '700' },
  favStar: { position: 'absolute', top: 8, right: 8, fontSize: 10 },

  // Upcoming
  upcomingList: { gap: 8 },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  upcomingAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  upcomingRound: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingRoundTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  upcomingInfo: { flex: 1 },
  upcomingName: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  upcomingDate: { fontSize: 10 },
  upcomingBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  upcomingBadgeTxt: { fontSize: 11, fontWeight: '900' },

  // Glossary
  glossaryList: { gap: 8 },
  glossaryCard: { borderRadius: 10, borderWidth: 1, padding: 14 },
  glossaryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  glossaryBadge: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  glossaryBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '900' },
  glossaryFull: { flex: 1, fontSize: 12, fontWeight: '600' },
  glossaryChevron: { fontSize: 8 },
  glossaryDef: { fontSize: 12, lineHeight: 19, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
});
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
  getDriverCareerStats,
  getDriverCode,
  getDriverStandings,
  TEAM_COLORS,
  TEAM_NAME_MAP
} from '../../lib/api';
import { useSettings } from '../../lib/SettingsContext';

// ─── STAT BOX ───────────────────────────────────────────────────────────────
function StatBox({ label, value, accent, theme, size = 'md' }: {
  label: string; value: string | number; accent?: boolean; theme: any; size?: 'sm' | 'md' | 'lg';
}) {
  const valSize = size === 'lg' ? 32 : size === 'sm' ? 16 : 22;
  return (
    <View style={[sb.box, {
      backgroundColor: accent ? theme.accentBg : theme.card,
      borderColor: accent ? theme.accent + '80' : theme.cardBorder,
    }]}>
      <Text style={[sb.val, { color: accent ? theme.accent : theme.text, fontSize: valSize }]}>{value}</Text>
      <Text style={[sb.lbl, { color: accent ? theme.accent + 'aa' : theme.textMuted }]}>{label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  box: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 13, paddingHorizontal: 8, alignItems: 'center' },
  val: { fontWeight: '900', letterSpacing: -0.5 },
  lbl: { fontSize: 9, fontWeight: '700', marginTop: 4, letterSpacing: 0.8, textAlign: 'center' },
});

// ─── DRIVER PROFILE ─────────────────────────────────────────────────────────
function DriverProfile({ driver, onBack, theme, settings, updateSettings, isEN }: any) {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const teamName = TEAM_NAME_MAP[driver.Constructors?.[0]?.name] ?? driver.Constructors?.[0]?.name ?? '-';
  const color = TEAM_COLORS[teamName] ?? '#888';
  const d = driver.Driver;
  const isFav = settings.favoriteDriver === d.driverId;
  const code = d.code ?? d.familyName.slice(0, 3).toUpperCase();

  const heroOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.2], extrapolate: 'clamp' });

  useEffect(() => {
    getDriverCareerStats(d.driverId).then((s) => { setStats(s); setLoading(false); });
  }, [d.driverId]);

  return (
    <View style={[pr.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <BgDecoration theme={theme} />

      {/* Floating back + fav */}
      <View style={[pr.floatBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={[pr.floatBtn, { backgroundColor: theme.card + 'ee', borderColor: theme.cardBorder }]} onPress={onBack}>
          <Text style={[pr.floatBtnTxt, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[pr.floatBtn, {
            backgroundColor: isFav ? '#FFD70022' : theme.card + 'ee',
            borderColor: isFav ? '#FFD700' : theme.cardBorder,
          }]}
          onPress={() => updateSettings({ favoriteDriver: isFav ? null : d.driverId })}
        >
          <Text style={{ fontSize: 18 }}>{isFav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* HERO */}
        <Animated.View style={[pr.hero, { backgroundColor: theme.bgHero, paddingTop: insets.top + 56, opacity: heroOpacity }]}>
          <View style={[pr.heroAccent, { backgroundColor: color + '18' }]} />
          <View style={[pr.heroBorderBottom, { backgroundColor: color }]} />

          <View style={pr.heroMain}>
            {/* Left: name + meta */}
            <View style={{ flex: 1 }}>
              <FlagBadge code={getDriverCode(d)} size="lg" />
              <Text style={[pr.given, { color: theme.textMuted }]}>{d.givenName}</Text>
              <Text style={[pr.family, { color: theme.text }]}>{d.familyName}</Text>
              <View style={pr.chipRow}>
                <View style={[pr.teamChip, { backgroundColor: color + '18', borderColor: color + '55' }]}>
                  <View style={[pr.teamDot, { backgroundColor: color }]} />
                  <Text style={[pr.teamChipTxt, { color }]}>{teamName}</Text>
                </View>
                {d.permanentNumber && (
                  <View style={[pr.numChip, { borderColor: theme.cardBorder }]}>
                    <Text style={[pr.numHash, { color: theme.textMuted }]}>#</Text>
                    <Text style={[pr.numVal, { color: theme.text }]}>{d.permanentNumber}</Text>
                  </View>
                )}
                {d.code && (
                  <View style={[pr.codeChip, { backgroundColor: color + '15', borderColor: color + '44' }]}>
                    <Text style={[pr.codeTxt, { color }]}>{d.code}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Right: position badge */}
            <View style={[pr.posBadge, { borderColor: color + '55', backgroundColor: color + '12' }]}>
              <Text style={[pr.posLbl, { color: color + 'aa' }]}>POS</Text>
              <Text style={[pr.posNum, { color }]}>{driver.position}</Text>
              <Text style={[pr.posSeason, { color: color + 'aa' }]}>2026</Text>
            </View>
          </View>

          {/* Season quick stats */}
          <View style={[pr.seasonBar, { borderTopColor: theme.cardBorder + '80' }]}>
            <View style={pr.seasonItem}>
              <Text style={[pr.seasonLbl, { color: theme.textMuted }]}>
                {isEN ? 'SEASON PTS' : 'POIN MUSIM'}
              </Text>
              <Text style={[pr.seasonVal, { color: theme.accent }]}>{driver.points}</Text>
            </View>
            <View style={[pr.seasonDiv, { backgroundColor: theme.cardBorder }]} />
            <View style={pr.seasonItem}>
              <Text style={[pr.seasonLbl, { color: theme.textMuted }]}>{isEN ? 'WINS' : 'MENANG'}</Text>
              <Text style={[pr.seasonVal, { color: theme.text }]}>{driver.wins}</Text>
            </View>
            <View style={[pr.seasonDiv, { backgroundColor: theme.cardBorder }]} />
            <View style={pr.seasonItem}>
              <Text style={[pr.seasonLbl, { color: theme.textMuted }]}>{isEN ? 'COUNTRY' : 'NEGARA'}</Text>
              <Text style={[pr.seasonNat, { color: theme.textSub }]}>{d.nationality}</Text>
            </View>
            {d.dateOfBirth && (
              <>
                <View style={[pr.seasonDiv, { backgroundColor: theme.cardBorder }]} />
                <View style={pr.seasonItem}>
                  <Text style={[pr.seasonLbl, { color: theme.textMuted }]}>{isEN ? 'BORN' : 'LAHIR'}</Text>
                  <Text style={[pr.seasonNat, { color: theme.textSub }]}>{d.dateOfBirth}</Text>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {/* BODY */}
        <View style={pr.body}>
          {/* Section title */}
          <View style={pr.secHdr}>
            <View style={[pr.secBar, { backgroundColor: theme.accent }]} />
            <Text style={[pr.secTitle, { color: theme.text }]}>
              {isEN ? 'Career Statistics' : 'Statistik Karier'}
            </Text>
          </View>

          {loading ? (
            <View style={pr.loadWrap}>
              <ActivityIndicator color={theme.accent} />
              <Text style={[pr.loadTxt, { color: theme.textMuted }]}>
                {isEN ? 'Fetching career data...' : 'Mengambil data karier...'}
              </Text>
            </View>
          ) : stats ? (
            <>
              {/* Total career points — hero card */}
              <View style={[pr.heroStatCard, { backgroundColor: theme.accentBg, borderColor: theme.accent + '55' }]}>
                <View>
                  <Text style={[pr.heroStatLbl, { color: theme.accent + 'bb' }]}>
                    {isEN ? 'TOTAL CAREER POINTS' : 'TOTAL POIN KARIER'}
                  </Text>
                  <Text style={[pr.heroStatVal, { color: theme.accent }]}>
                    {stats.totalPoints.toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[pr.heroStatLbl, { color: theme.accent + 'bb' }]}>
                      {isEN ? 'SEASONS' : 'MUSIM'}
                    </Text>
                    <Text style={[pr.heroStatSub, { color: theme.accent }]}>{stats.seasons}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[pr.heroStatLbl, { color: theme.accent + 'bb' }]}>
                      {isEN ? 'DEBUT' : 'DEBUT'}
                    </Text>
                    <Text style={[pr.heroStatSub, { color: theme.accent }]}>{stats.debutYear}</Text>
                  </View>
                </View>
              </View>

              {/* Row 1: Races · Wins · Podiums */}
              <View style={pr.row3}>
                <StatBox label={isEN ? 'RACES' : 'RACE'} value={stats.totalRaces} theme={theme} />
                <StatBox label={isEN ? 'WINS' : 'MENANG'} value={stats.wins} accent theme={theme} />
                <StatBox label="PODIUMS" value={stats.podiums} theme={theme} />
              </View>

              {/* Row 2: Poles · Fastest · Titles */}
              <View style={pr.row3}>
                <StatBox label={isEN ? 'POLES' : 'POLE POS.'} value={stats.polePositions} theme={theme} />
                <StatBox label={isEN ? 'FASTEST LAPS' : 'LAP TERCEPAT'} value={stats.fastestLaps} theme={theme} />

              </View>

              {/* Row 3: DNF · DNS */}
              <View style={pr.row2}>
                <StatBox label="DNF" value={stats.dnf} theme={theme} size="sm" />
                <StatBox label="DNS" value={stats.dns} theme={theme} size="sm" />
              </View>

              {/* Debut race */}
              {stats.debutRace ? (
                <View style={[pr.debutCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[pr.debutLbl, { color: theme.textMuted }]}>
                    {isEN ? 'F1 DEBUT RACE' : 'RACE DEBUT F1'}
                  </Text>
                  <Text style={[pr.debutName, { color: theme.text }]}>{stats.debutRace}</Text>
                  <Text style={[pr.debutYear, { color: theme.textMuted }]}>{stats.debutYear} Season</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={[pr.loadTxt, { color: theme.textMuted, textAlign: 'center', marginTop: 32 }]}>
              {isEN ? 'Career data unavailable.' : 'Data karier tidak tersedia.'}
            </Text>
          )}
        </View>

        <View style={{ height: insets.bottom + 96 }} />
      </Animated.ScrollView>
    </View>
  );
}

const pr = StyleSheet.create({
  root: { flex: 1 },
  floatBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  floatBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  floatBtnTxt: { fontSize: 20, fontWeight: '700' },
  hero: { paddingHorizontal: 20, paddingBottom: 0, overflow: 'hidden', position: 'relative' },
  heroAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  heroBorderBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  heroMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  given: { fontSize: 15, fontWeight: '600', marginTop: 10 },
  family: { fontSize: 30, fontWeight: '900', letterSpacing: -1, lineHeight: 32, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  teamChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  teamDot: { width: 6, height: 6, borderRadius: 3 },
  teamChipTxt: { fontSize: 11, fontWeight: '700' },
  numChip: { flexDirection: 'row', alignItems: 'baseline', borderWidth: 1, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 },
  numHash: { fontSize: 10, fontWeight: '700' },
  numVal: { fontSize: 14, fontWeight: '900' },
  codeChip: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 },
  codeTxt: { fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  posBadge: { width: 76, height: 76, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  posLbl: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  posNum: { fontSize: 26, fontWeight: '900', lineHeight: 28 },
  posSeason: { fontSize: 8, fontWeight: '700' },
  seasonBar: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 12, gap: 0 },
  seasonItem: { flex: 1, alignItems: 'center' },
  seasonDiv: { width: 1, height: '100%', opacity: 0.4 },
  seasonLbl: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginBottom: 3 },
  seasonVal: { fontSize: 20, fontWeight: '900' },
  seasonNat: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  body: { padding: 16, gap: 8 },
  secHdr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 4 },
  secBar: { width: 3, height: 14, borderRadius: 2 },
  secTitle: { fontSize: 14, fontWeight: '800' },
  loadWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadTxt: { fontSize: 12 },
  heroStatCard: { borderRadius: 12, borderWidth: 1, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  heroStatLbl: { fontSize: 8, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  heroStatVal: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  heroStatSub: { fontSize: 20, fontWeight: '900' },
  row3: { flexDirection: 'row', gap: 7 },
  row2: { flexDirection: 'row', gap: 7 },
  debutCard: { borderRadius: 10, borderWidth: 1, padding: 14 },
  debutLbl: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  debutName: { fontSize: 15, fontWeight: '700' },
  debutYear: { fontSize: 11, marginTop: 2 },
});

// ─── LIST SCREEN ─────────────────────────────────────────────────────────────
export default function DriversScreen() {
  const insets = useSafeAreaInsets();
  const { theme, settings, updateSettings, isRaceWeekend } = useSettings();
  const isEN = settings.language === 'en';
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    getDriverStandings().then((data) => { setDrivers(data); setLoading(false); });
  }, []);

  if (selected) {
    return <DriverProfile driver={selected} onBack={() => setSelected(null)} theme={theme} settings={settings} updateSettings={updateSettings} isEN={isEN} />;
  }

  return (
    <View style={[ls.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <BgDecoration theme={theme} />

      <View style={[ls.hdr, { paddingTop: insets.top + 16, backgroundColor: theme.bgHero, borderBottomColor: theme.cardBorder }]}>
        {isRaceWeekend && (
          <View style={[ls.ticker, { backgroundColor: theme.accent }]}>
            <View style={ls.tickerDot} />
            <Text style={ls.tickerTxt}>RACE WEEKEND LIVE</Text>
          </View>
        )}
        <View style={ls.hdrContent}>
          <Text style={[ls.title, { color: theme.text }]}>Drivers</Text>
          <Text style={[ls.sub, { color: theme.textMuted }]}>
            2026 · {drivers.length} {isEN ? 'DRIVERS' : 'PEMBALAP'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 48 }} />
        ) : (
          <View style={ls.list}>
            {drivers.map((d: any) => {
              const teamName = TEAM_NAME_MAP[d.Constructors?.[0]?.name] ?? '-';
              const color = TEAM_COLORS[teamName] ?? '#888';
              const pos = parseInt(d.position);
              const driverCode = getDriverCode(d.Driver);
              const isFav = settings.favoriteDriver === d.Driver.driverId;
              const isFirst = pos === 1;
              const code = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();

              return (
                <TouchableOpacity key={d.Driver.driverId} onPress={() => setSelected(d)} activeOpacity={0.75}>
                  <View style={[ls.row, {
                    backgroundColor: isFav ? '#FFD70010' : theme.card,
                    borderColor: isFav ? '#FFD700' : isFirst ? color + '55' : theme.cardBorder,
                  }]}>
                    <View style={[ls.stripe, { backgroundColor: color }]} />
                    <Text style={[ls.pos, { color: isFirst ? theme.accent : theme.textMuted }]}>
                      {String(pos).padStart(2, '0')}
                    </Text>
                    <FlagBadge code={driverCode} size="sm" />
                    <View style={ls.info}>
                      <View style={ls.nameRow}>
                        <Text style={[ls.surname, { color: theme.text }]}>{d.Driver.familyName}</Text>
                        <Text style={[ls.initial, { color: theme.textMuted }]}>{d.Driver.givenName[0]}.</Text>
                        {isFav && <Text style={{ fontSize: 10 }}>⭐</Text>}
                      </View>
                      <View style={ls.teamRow}>
                        <View style={[ls.teamDot, { backgroundColor: color }]} />
                        <Text style={[ls.team, { color: theme.textMuted }]}>{teamName}</Text>
                      </View>
                    </View>
                    <Text style={[ls.code, { color: color }]}>{code}</Text>
                    <View style={ls.pts}>
                      <Text style={[ls.ptsVal, { color: isFirst ? theme.accent : theme.text }]}>{d.points}</Text>
                      <Text style={[ls.ptsLbl, { color: theme.textMuted }]}>PTS</Text>
                    </View>
                    <Text style={[ls.arrow, { color: theme.textMuted }]}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: insets.bottom + 96 }} />
      </ScrollView>
    </View>
  );
}

const ls = StyleSheet.create({
  root: { flex: 1 },
  hdr: { borderBottomWidth: 1 },
  ticker: { paddingHorizontal: 20, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 7 },
  tickerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  tickerTxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  hdrContent: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  sub: { fontSize: 9, fontWeight: '700', marginTop: 4, letterSpacing: 2 },
  list: { padding: 16, gap: 5 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 11, paddingHorizontal: 12, gap: 9, overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  pos: { fontSize: 12, fontWeight: '900', width: 24, textAlign: 'center', letterSpacing: 0.5 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  surname: { fontSize: 13, fontWeight: '800' },
  initial: { fontSize: 11 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  teamDot: { width: 5, height: 5, borderRadius: 3 },
  team: { fontSize: 10 },
  code: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5, width: 34, textAlign: 'right' },
  pts: { alignItems: 'flex-end', minWidth: 44 },
  ptsVal: { fontSize: 16, fontWeight: '900' },
  ptsLbl: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  arrow: { fontSize: 18 },
});
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BgDecoration from '../../components/BgDecoration';
import FlagBadge from '../../components/FlagBadge';
import {
  CONSTRUCTOR_CODES,
  getConstructorStandings,
  getDriverCode,
  getDriverStandings,
  TEAM_COLORS,
  TEAM_NAME_MAP,
} from '../../lib/api';
import { useSettings } from '../../lib/SettingsContext';

type Tab = 'drivers' | 'constructors';

export default function StandingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, settings, isRaceWeekend } = useSettings();
  const isEN = settings.language === 'en';
  const [tab, setTab] = useState<Tab>('drivers');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [d, c] = await Promise.all([getDriverStandings(), getConstructorStandings()]);
      setDrivers(d); setConstructors(c); setLoading(false);
    }
    load();
  }, []);

  const leaderPts = tab === 'drivers'
    ? parseFloat(drivers[0]?.points ?? '1')
    : parseFloat(constructors[0]?.points ?? '1');

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <BgDecoration theme={theme} />

      {/* ── HEADER ── */}
      <View style={[s.hdr, { paddingTop: insets.top + 16, backgroundColor: theme.bgHero, borderBottomColor: theme.cardBorder }]}>
        {isRaceWeekend && (
          <View style={[s.ticker, { backgroundColor: theme.accent }]}>
            <View style={s.tickerDot} />
            <Text style={s.tickerTxt}>RACE WEEKEND LIVE</Text>
          </View>
        )}
        <View style={s.hdrContent}>
          <Text style={[s.title, { color: theme.text }]}>{isEN ? 'Standings' : 'Klasemen'}</Text>
          <Text style={[s.sub, { color: theme.textMuted }]}>2026 SEASON</Text>
        </View>

        {/* Toggle */}
        <View style={[s.toggle, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {(['drivers', 'constructors'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.toggleBtn, tab === t && { backgroundColor: theme.accent }]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.toggleTxt, { color: tab === t ? '#fff' : theme.textMuted }]}>
                {t === 'drivers' ? (isEN ? 'Drivers' : 'Driver') : (isEN ? 'Constructors' : 'Konstruktor')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 48 }} />
        ) : (
          <View style={s.list}>

            {/* ── PODIUM TOP 3 ── */}
            {tab === 'drivers' && drivers.length >= 3 && (
              <View style={s.podiumRow}>
                {/* P2 */}
                {(() => {
                  const d = drivers[1];
                  const teamName = TEAM_NAME_MAP[d.Constructors?.[0]?.name] ?? '-';
                  const color = TEAM_COLORS[teamName] ?? '#888';
                  const code = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();
                  return (
                    <View style={[s.podCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 14 }]}>
                      <View style={[s.podStripe, { backgroundColor: color }]} />
                      <Text style={[s.podPos, { color: theme.textMuted }]}>P2</Text>
                      <FlagBadge code={getDriverCode(d.Driver)} size="sm" />
                      <Text style={[s.podCode, { color }]}>{code}</Text>
                      <Text style={[s.podPts, { color: theme.text }]}>{d.points}</Text>
                      <Text style={[s.podPtsLbl, { color: theme.textMuted }]}>PTS</Text>
                    </View>
                  );
                })()}

                {/* P1 */}
                {(() => {
                  const d = drivers[0];
                  const teamName = TEAM_NAME_MAP[d.Constructors?.[0]?.name] ?? '-';
                  const color = TEAM_COLORS[teamName] ?? '#888';
                  const code = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();
                  return (
                    <View style={[s.podCard, s.podFirst, { backgroundColor: theme.accentBg, borderColor: theme.accent + '60' }]}>
                      <View style={[s.podStripe, { backgroundColor: color, height: 4 }]} />
                      <Text style={[s.podPos, { color: theme.accent }]}>P1</Text>
                      <FlagBadge code={getDriverCode(d.Driver)} size="sm" />
                      <Text style={[s.podCode, { color }]}>{code}</Text>
                      <Text style={[s.podPts, { color: theme.accent, fontSize: 22 }]}>{d.points}</Text>
                      <Text style={[s.podPtsLbl, { color: theme.accent + 'aa' }]}>PTS</Text>
                    </View>
                  );
                })()}

                {/* P3 */}
                {(() => {
                  const d = drivers[2];
                  const teamName = TEAM_NAME_MAP[d.Constructors?.[0]?.name] ?? '-';
                  const color = TEAM_COLORS[teamName] ?? '#888';
                  const code = d.Driver.code ?? d.Driver.familyName.slice(0, 3).toUpperCase();
                  return (
                    <View style={[s.podCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 22 }]}>
                      <View style={[s.podStripe, { backgroundColor: color }]} />
                      <Text style={[s.podPos, { color: theme.textMuted }]}>P3</Text>
                      <FlagBadge code={getDriverCode(d.Driver)} size="sm" />
                      <Text style={[s.podCode, { color }]}>{code}</Text>
                      <Text style={[s.podPts, { color: theme.text }]}>{d.points}</Text>
                      <Text style={[s.podPtsLbl, { color: theme.textMuted }]}>PTS</Text>
                    </View>
                  );
                })()}
              </View>
            )}

            {/* ── TABLE HEADER ── */}
            <View style={[s.tableHdr, { borderColor: theme.cardBorder }]}>
              <Text style={[s.thPos, { color: theme.textMuted }]}>POS</Text>
              <Text style={[s.thName, { color: theme.textMuted }]}>
                {tab === 'drivers' ? (isEN ? 'DRIVER' : 'PEMBALAP') : (isEN ? 'TEAM' : 'TIM')}
              </Text>
              <Text style={[s.thGap, { color: theme.textMuted }]}>GAP</Text>
              <Text style={[s.thPts, { color: theme.textMuted }]}>PTS</Text>
            </View>

            {/* ── ROWS ── */}
            {tab === 'drivers'
              ? drivers.map((d: any, idx: number) => {
                  const teamName = TEAM_NAME_MAP[d.Constructors?.[0]?.name] ?? '-';
                  const color = TEAM_COLORS[teamName] ?? '#888';
                  const pos = parseInt(d.position);
                  const pts = parseFloat(d.points);
                  const pct = Math.min(100, (pts / leaderPts) * 100);
                  const gap = idx === 0 ? 'LEADER' : `-${(leaderPts - pts).toFixed(0)}`;
                  const isFav = settings.favoriteDriver === d.Driver.driverId;
                  const isFirst = pos === 1;
                  const driverCode = getDriverCode(d.Driver);
                  const teamCode = CONSTRUCTOR_CODES[teamName] ?? '??';

                  return (
                    <View key={d.Driver.driverId} style={[s.row, {
                      backgroundColor: isFav ? '#FFD70008' : theme.card,
                      borderColor: isFav ? '#FFD70066' : isFirst ? color + '44' : theme.cardBorder,
                    }]}>
                      <View style={[s.stripe, { backgroundColor: color }]} />

                      <Text style={[s.pos, { color: isFirst ? theme.accent : pos <= 3 ? theme.textSub : theme.textMuted }]}>
                        {String(pos).padStart(2, '0')}
                      </Text>

                      <FlagBadge code={driverCode} size="sm" />

                      <View style={s.info}>
                        <View style={s.nameRow}>
                          <Text style={[s.surname, { color: theme.text }]}>{d.Driver.familyName}</Text>
                          <Text style={[s.initial, { color: theme.textMuted }]}>{d.Driver.givenName[0]}.</Text>
                          {isFav && <Text style={{ fontSize: 9 }}>⭐</Text>}
                        </View>
                        <View style={s.teamRow}>
                          <FlagBadge code={teamCode} size="sm" />
                          <Text style={[s.team, { color: theme.textMuted }]}>{teamName}</Text>
                        </View>
                        {/* Progress bar */}
                        <View style={[s.bar, { backgroundColor: theme.cardBorder }]}>
                          <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: isFirst ? theme.accent : color + '99' }]} />
                        </View>
                      </View>

                      <Text style={[s.gap, { color: isFirst ? theme.accent : theme.textMuted }]}>{gap}</Text>
                      <Text style={[s.pts, { color: isFirst ? theme.accent : theme.text }]}>{d.points}</Text>
                    </View>
                  );
                })
              : constructors.map((c: any, idx: number) => {
                  const teamName = TEAM_NAME_MAP[c.Constructor?.name] ?? c.Constructor?.name ?? '-';
                  const color = TEAM_COLORS[teamName] ?? '#888';
                  const pos = parseInt(c.position);
                  const pts = parseFloat(c.points);
                  const pct = Math.min(100, (pts / leaderPts) * 100);
                  const gap = idx === 0 ? 'LEADER' : `-${(leaderPts - pts).toFixed(0)}`;
                  const isFirst = pos === 1;
                  const teamCode = CONSTRUCTOR_CODES[teamName] ?? '??';

                  return (
                    <View key={c.Constructor.constructorId} style={[s.row, {
                      backgroundColor: theme.card,
                      borderColor: isFirst ? color + '44' : theme.cardBorder,
                    }]}>
                      <View style={[s.stripe, { backgroundColor: color }]} />
                      <Text style={[s.pos, { color: isFirst ? theme.accent : pos <= 3 ? theme.textSub : theme.textMuted }]}>
                        {String(pos).padStart(2, '0')}
                      </Text>
                      <FlagBadge code={teamCode} size="sm" />
                      <View style={s.info}>
                        <Text style={[s.surname, { color: theme.text }]}>{teamName}</Text>
                        <View style={[s.bar, { backgroundColor: theme.cardBorder, marginTop: 6 }]}>
                          <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: isFirst ? theme.accent : color + '99' }]} />
                        </View>
                      </View>
                      <Text style={[s.gap, { color: isFirst ? theme.accent : theme.textMuted }]}>{gap}</Text>
                      <Text style={[s.pts, { color: isFirst ? theme.accent : theme.text }]}>{c.points}</Text>
                    </View>
                  );
                })}
          </View>
        )}
        <View style={{ height: insets.bottom + 96 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  hdr: { borderBottomWidth: 1 },
  ticker: { paddingHorizontal: 20, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 7 },
  tickerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  tickerTxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  hdrContent: { paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  sub: { fontSize: 9, fontWeight: '700', marginTop: 4, letterSpacing: 2 },
  toggle: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 14, borderRadius: 10, borderWidth: 1, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 7 },
  toggleTxt: { fontSize: 13, fontWeight: '700' },

  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4, gap: 5 },

  // Podium
  podiumRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  podCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 10, alignItems: 'center', gap: 3, overflow: 'hidden', position: 'relative' },
  podFirst: { paddingVertical: 14 },
  podStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  podPos: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  podCode: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  podPts: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  podPtsLbl: { fontSize: 8, fontWeight: '700' },

  // Table header
  tableHdr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 2 },
  thPos: { fontSize: 9, fontWeight: '800', letterSpacing: 1, width: 32 },
  thName: { fontSize: 9, fontWeight: '800', letterSpacing: 1, flex: 1, paddingLeft: 28 },
  thGap: { fontSize: 9, fontWeight: '800', letterSpacing: 1, width: 52, textAlign: 'right' },
  thPts: { fontSize: 9, fontWeight: '800', letterSpacing: 1, width: 40, textAlign: 'right' },

  // Rows
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 8, overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  pos: { fontSize: 12, fontWeight: '900', width: 26, letterSpacing: 0.5 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  surname: { fontSize: 13, fontWeight: '800' },
  initial: { fontSize: 11 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2, marginBottom: 4 },
  team: { fontSize: 10 },
  bar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  gap: { fontSize: 10, fontWeight: '700', width: 52, textAlign: 'right' },
  pts: { fontSize: 15, fontWeight: '900', width: 40, textAlign: 'right' },
});
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BgDecoration from '../../components/BgDecoration';
import FlagBadge from '../../components/FlagBadge';
import { COUNTRY_CODES, formatDate, getRaceSchedule } from '../../lib/api';
import { useSettings } from '../../lib/SettingsContext';

type Filter = 'all' | 'upcoming' | 'done';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, settings, isRaceWeekend, setRaces } = useSettings();
  const isEN = settings.language === 'en';
  const [races, setLocalRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    getRaceSchedule().then((data) => {
      setLocalRaces(data);
      setRaces(data);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const nextRaceIdx = races.findIndex((r) => new Date(r.date) >= now);
  const filtered = races.filter((r) => {
    const done = new Date(r.date) < now;
    if (filter === 'upcoming') return !done;
    if (filter === 'done') return done;
    return true;
  });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: isEN ? 'All' : 'Semua' },
    { key: 'upcoming', label: isEN ? 'Upcoming' : 'Akan Datang' },
    { key: 'done', label: isEN ? 'Done' : 'Selesai' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <BgDecoration theme={theme} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.bgHero, borderBottomColor: theme.cardBorder }]}>
        {isRaceWeekend && (
          <View style={[styles.ticker, { backgroundColor: theme.accent }]}>
            <View style={styles.tickerDot} />
            <Text style={styles.tickerTxt}>RACE WEEKEND LIVE</Text>
          </View>
        )}
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>{isEN ? 'Calendar' : 'Kalender'}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>2026 · {races.length} {isEN ? 'ROUNDS' : 'RACE'}</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={[styles.filterRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && { backgroundColor: theme.accent }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterTxt, { color: filter === f.key ? '#fff' : theme.textMuted }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 48 }} />
        ) : (
          <View style={styles.list}>
            {filtered.map((race: any) => {
              const idx = races.indexOf(race);
              const isDone = new Date(race.date) < now;
              const isNext = idx === nextRaceIdx;
              const countryCode = COUNTRY_CODES[race.Circuit?.Location?.country ?? ''] ?? '??';

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => router.push(`/race/${race.round}`)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.raceRow,
                    {
                      backgroundColor: isNext ? theme.accentBg : theme.card,
                      borderColor: isNext ? theme.accent : isDone ? theme.cardBorder + '66' : theme.cardBorder,
                      opacity: isDone ? 0.5 : 1,
                    },
                  ]}>
                    {/* Left accent for next race */}
                    {isNext && <View style={[styles.nextAccentBar, { backgroundColor: theme.accent }]} />}

                    {/* Round badge */}
                    <View style={[styles.roundBadge, { backgroundColor: isNext ? theme.accent + '22' : theme.cardBorder }]}>
                      <Text style={[styles.roundNum, { color: isNext ? theme.accent : theme.textSub }]}>
                        {String(race.round).padStart(2, '0')}
                      </Text>
                    </View>

                    <FlagBadge code={countryCode} size="md" />

                    <View style={styles.raceInfo}>
                      <Text style={[styles.raceName, { color: isNext ? theme.accent : theme.text }]} numberOfLines={1}>
                        {race.raceName}
                      </Text>
                      <Text style={[styles.raceDetail, { color: theme.textMuted }]}>
                        {race.Circuit?.Location?.country}  ·  {formatDate(race.date)}
                      </Text>
                    </View>

                    {/* Status */}
                    {isDone ? (
                      <View style={[styles.doneBadge, { borderColor: theme.cardBorder }]}>
                        <Text style={[styles.doneTxt, { color: theme.textMuted }]}>✓</Text>
                      </View>
                    ) : isNext ? (
                      <View style={[styles.nextBadge, { backgroundColor: theme.accent }]}>
                        <Text style={styles.nextTxt}>NEXT</Text>
                      </View>
                    ) : (
                      <Text style={[styles.arrow, { color: theme.textMuted }]}>›</Text>
                    )}
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

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: { paddingBottom: 0, borderBottomWidth: 1 },
  ticker: { paddingHorizontal: 20, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 7 },
  tickerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  tickerTxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  headerContent: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 9, fontWeight: '700', marginTop: 4, letterSpacing: 2 },

  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
    gap: 2,
  },
  filterBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 7 },
  filterTxt: { fontSize: 12, fontWeight: '700' },

  list: { padding: 16, gap: 8 },
  raceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  nextAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  roundBadge: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  roundNum: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  raceInfo: { flex: 1 },
  raceName: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  raceDetail: { fontSize: 10 },
  doneBadge: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  doneTxt: { fontSize: 12, fontWeight: '700' },
  nextBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  nextTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  arrow: { fontSize: 20, fontWeight: '300' },
});
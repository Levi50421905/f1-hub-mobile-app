const BASE = 'https://api.jolpi.ca/ergast/f1';

export async function getDriverStandings(season = '2026') {
  const res = await fetch(`${BASE}/${season}/driverstandings.json`);
  const data = await res.json();
  return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(season = '2026') {
  const res = await fetch(`${BASE}/${season}/constructorstandings.json`);
  const data = await res.json();
  return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
}

export async function getRaceSchedule(season = '2026') {
  const res = await fetch(`${BASE}/${season}.json`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races ?? [];
}

export async function getRaceResult(season = '2026', round: string) {
  const res = await fetch(`${BASE}/${season}/${round}/results.json`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races?.[0] ?? null;
}

export async function getQualiResult(season = '2026', round: string) {
  const res = await fetch(`${BASE}/${season}/${round}/qualifying.json`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races?.[0] ?? null;
}

export async function getSprintResult(season = '2026', round: string) {
  const res = await fetch(`${BASE}/${season}/${round}/sprint.json`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races?.[0] ?? null;
}

export async function getDriverList(season = '2026') {
  const res = await fetch(`${BASE}/${season}/drivers.json`);
  const data = await res.json();
  return data?.MRData?.DriverTable?.Drivers ?? [];
}

export async function getDriverSeasonResults(season = '2026', driverId: string) {
  const res = await fetch(`${BASE}/${season}/drivers/${driverId}/results.json`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races ?? [];
}

export async function getWeather(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`
    );
    const data = await res.json();
    return { temp: Math.round(data.current.temperature_2m), code: data.current.weathercode };
  } catch { return null; }
}

export function getWeatherLabel(code: number) {
  if (code === 0) return { label: 'Cerah', icon: '☀️' };
  if (code <= 3) return { label: 'Berawan', icon: '⛅' };
  if (code <= 48) return { label: 'Berkabut', icon: '🌫️' };
  if (code <= 67) return { label: 'Hujan', icon: '🌧️' };
  if (code <= 77) return { label: 'Salju', icon: '❄️' };
  if (code <= 82) return { label: 'Hujan Deras', icon: '⛈️' };
  return { label: 'Badai', icon: '🌩️' };
}

export const CIRCUIT_COORDS: Record<string, { lat: number; lon: number }> = {
  'albert_park': { lat: -37.8497, lon: 144.968 },
  'shanghai': { lat: 31.3389, lon: 121.22 },
  'bahrain': { lat: 26.0325, lon: 50.5106 },
  'jeddah': { lat: 21.6319, lon: 39.1044 },
  'miami': { lat: 25.9581, lon: -80.2389 },
  'imola': { lat: 44.3439, lon: 11.7167 },
  'monaco': { lat: 43.7347, lon: 7.4206 },
  'catalunya': { lat: 41.57, lon: 2.2611 },
  'villeneuve': { lat: 45.5, lon: -73.5228 },
  'red_bull_ring': { lat: 47.2197, lon: 14.7647 },
  'silverstone': { lat: 52.0786, lon: -1.0169 },
  'spa': { lat: 50.4372, lon: 5.9714 },
  'hungaroring': { lat: 47.5789, lon: 19.2486 },
  'zandvoort': { lat: 52.3888, lon: 4.5409 },
  'monza': { lat: 45.6156, lon: 9.2811 },
  'baku': { lat: 40.3725, lon: 49.8533 },
  'marina_bay': { lat: 1.2914, lon: 103.864 },
  'americas': { lat: 30.1328, lon: -97.6411 },
  'rodriguez': { lat: 19.4042, lon: -99.0907 },
  'interlagos': { lat: -23.7036, lon: -46.6997 },
  'las_vegas': { lat: 36.1147, lon: -115.1728 },
  'losail': { lat: 25.49, lon: 51.4542 },
  'yas_marina': { lat: 24.4672, lon: 54.6031 },
};

export const COUNTRY_FLAGS: Record<string, string> = {
  'Australia': '🇦🇺', 'China': '🇨🇳', 'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦',
  'USA': '🇺🇸', 'United States': '🇺🇸', 'Italy': '🇮🇹', 'Monaco': '🇲🇨',
  'Spain': '🇪🇸', 'Canada': '🇨🇦', 'Austria': '🇦🇹', 'UK': '🇬🇧',
  'Great Britain': '🇬🇧', 'Belgium': '🇧🇪', 'Hungary': '🇭🇺', 'Netherlands': '🇳🇱',
  'Azerbaijan': '🇦🇿', 'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷',
  'Las Vegas': '🇺🇸', 'Qatar': '🇶🇦', 'Abu Dhabi': '🇦🇪', 'UAE': '🇦🇪',
  'Dutch': '🇳🇱', 'British': '🇬🇧', 'German': '🇩🇪', 'French': '🇫🇷',
  'Spanish': '🇪🇸', 'Finnish': '🇫🇮', 'Australian': '🇦🇺', 'Canadian': '🇨🇦',
  'Mexican': '🇲🇽', 'Brazilian': '🇧🇷', 'Monegasque': '🇲🇨', 'Italian': '🇮🇹',
  'Thai': '🇹🇭', 'Japanese': '🇯🇵', 'Chinese': '🇨🇳', 'American': '🇺🇸',
  'Danish': '🇩🇰', 'Argentine': '🇦🇷', 'New Zealander': '🇳🇿',
};

export const COUNTRY_CODES: Record<string, string> = {
  'Australia': 'AU', 'China': 'CN', 'Bahrain': 'BH', 'Saudi Arabia': 'SA',
  'USA': 'US', 'United States': 'US', 'Italy': 'IT', 'Monaco': 'MC',
  'Spain': 'ES', 'Canada': 'CA', 'Austria': 'AT', 'UK': 'GB',
  'Great Britain': 'GB', 'Belgium': 'BE', 'Hungary': 'HU', 'Netherlands': 'NL',
  'Azerbaijan': 'AZ', 'Singapore': 'SG', 'Mexico': 'MX', 'Brazil': 'BR',
  'Qatar': 'QA', 'Abu Dhabi': 'AE', 'UAE': 'AE', 'Japan': 'JP',
  'Dutch': 'NL', 'British': 'GB', 'German': 'DE', 'French': 'FR',
  'Spanish': 'ES', 'Finnish': 'FI', 'Australian': 'AU', 'Canadian': 'CA',
  'Mexican': 'MX', 'Brazilian': 'BR', 'Monegasque': 'MC', 'Italian': 'IT',
  'Thai': 'TH', 'Japanese': 'JP', 'Chinese': 'CN', 'American': 'US',
  'Danish': 'DK', 'Argentine': 'AR', 'New Zealander': 'NZ',
};

export const DRIVER_FLAGS: Record<string, string> = {
  'max_verstappen': '🇳🇱', 'hamilton': '🇬🇧', 'leclerc': '🇲🇨',
  'norris': '🇬🇧', 'sainz': '🇪🇸', 'russell': '🇬🇧', 'piastri': '🇦🇺',
  'perez': '🇲🇽', 'alonso': '🇪🇸', 'stroll': '🇨🇦', 'gasly': '🇫🇷',
  'ocon': '🇫🇷', 'albon': '🇹🇭', 'bottas': '🇫🇮', 'zhou': '🇨🇳',
  'magnussen': '🇩🇰', 'hulkenberg': '🇩🇪', 'tsunoda': '🇯🇵', 'lawson': '🇳🇿',
  'bearman': '🇬🇧', 'colapinto': '🇦🇷', 'antonelli': '🇮🇹', 'hadjar': '🇫🇷',
  'doohan': '🇦🇺', 'bortoleto': '🇧🇷', 'drugovich': '🇧🇷', 'crawford': '🇺🇸',
};

export const DRIVER_CODES: Record<string, string> = {
  'max_verstappen': 'NL', 'hamilton': 'GB', 'leclerc': 'MC',
  'norris': 'GB', 'sainz': 'ES', 'russell': 'GB', 'piastri': 'AU',
  'perez': 'MX', 'alonso': 'ES', 'stroll': 'CA', 'gasly': 'FR',
  'ocon': 'FR', 'albon': 'TH', 'bottas': 'FI', 'zhou': 'CN',
  'magnussen': 'DK', 'hulkenberg': 'DE', 'tsunoda': 'JP', 'lawson': 'NZ',
  'bearman': 'GB', 'colapinto': 'AR', 'antonelli': 'IT', 'hadjar': 'FR',
  'doohan': 'AU', 'bortoleto': 'BR',
};

export const CONSTRUCTOR_FLAGS: Record<string, string> = {
  'Red Bull': '🇦🇹', 'McLaren': '🇬🇧', 'Ferrari': '🇮🇹', 'Mercedes': '🇩🇪',
  'Aston Martin': '🇬🇧', 'Alpine': '🇫🇷', 'Williams': '🇬🇧',
  'RB': '🇮🇹', 'Kick Sauber': '🇨🇭', 'Haas': '🇺🇸',
};

export const CONSTRUCTOR_CODES: Record<string, string> = {
  'Red Bull': 'AT', 'McLaren': 'GB', 'Ferrari': 'IT', 'Mercedes': 'DE',
  'Aston Martin': 'GB', 'Alpine': 'FR', 'Williams': 'GB',
  'RB': 'IT', 'Kick Sauber': 'CH', 'Haas': 'US',
};

export const TEAM_COLORS: Record<string, string> = {
  'Red Bull': '#3671C6', 'McLaren': '#FF8000', 'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
  'Williams': '#64C4FF', 'RB': '#6692FF', 'Kick Sauber': '#52E252', 'Haas': '#B6BABD',
};

export const TEAM_NAME_MAP: Record<string, string> = {
  'Red Bull': 'Red Bull', 'McLaren': 'McLaren', 'Ferrari': 'Ferrari',
  'Mercedes': 'Mercedes', 'Aston Martin': 'Aston Martin',
  'Alpine F1 Team': 'Alpine', 'Williams': 'Williams',
  'RB F1 Team': 'RB', 'Kick Sauber': 'Kick Sauber', 'Haas F1 Team': 'Haas',
};

export const TIMEZONES: Record<string, string> = {
  'WIB': 'Asia/Jakarta',
  'WITA': 'Asia/Makassar',
  'WIT': 'Asia/Jayapura',
};

export function formatLocalTime(dateStr: string, timeStr: string, tz = 'Asia/Jakarta', includeDay = false) {
  if (!dateStr || !timeStr) return '-';
  try {
    const dt = new Date(`${dateStr}T${timeStr}`);
    const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: tz };
    if (includeDay) { opts.weekday = 'short'; opts.day = 'numeric'; opts.month = 'short'; }
    const label = Object.keys(TIMEZONES).find((k) => TIMEZONES[k] === tz) ?? 'WIB';
    return dt.toLocaleString('id-ID', opts) + ' ' + label;
  } catch { return '-'; }
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function formatDateFull(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function getDriverFlag(driver: any): string {
  if (!driver) return '🏁';
  const fromNationality = COUNTRY_FLAGS[driver.nationality ?? ''];
  if (fromNationality) return fromNationality;
  return DRIVER_FLAGS[driver.driverId ?? ''] ?? '🏁';
}

export function getDriverCode(driver: any): string {
  if (!driver) return '??';
  const fromNationality = COUNTRY_CODES[driver.nationality ?? ''];
  if (fromNationality) return fromNationality;
  return DRIVER_CODES[driver.driverId ?? ''] ?? '??';
}

// ─── GANTI SELURUH FUNGSI getDriverCareerStats di lib/api.ts ───────────────
// Fix: championships tidak muncul + data akurasi keseluruhan

export async function getDriverCareerStats(driverId: string) {
  try {
    async function fetchAllPages(urlBase: string): Promise<any[]> {
      const allItems: any[] = [];
      let offset = 0;
      const limit = 100;
      while (true) {
        const res = await fetch(`${urlBase}?limit=${limit}&offset=${offset}`);
        const data = await res.json();
        const mrData = data?.MRData;
        if (!mrData) break;
        const table = mrData.RaceTable ?? mrData.StandingsTable ?? mrData.QualifyingTable ?? mrData.DriverTable;
        if (!table) break;
        const key = Object.keys(table).find((k) => Array.isArray(table[k]));
        if (!key) break;
        const items: any[] = table[key];
        allItems.push(...items);
        const total = parseInt(mrData.total ?? '0');
        offset += limit;
        if (offset >= total || items.length === 0) break;
      }
      return allItems;
    }

    const [races, fastestRaces, standingsList] = await Promise.all([
      fetchAllPages(`${BASE}/drivers/${driverId}/results/`),
      fetchAllPages(`${BASE}/drivers/${driverId}/fastest/1/results/`),
      fetchAllPages(`${BASE}/drivers/${driverId}/driverstandings/`),
    ]);

    let wins = 0, podiums = 0, dnf = 0, dns = 0;
    let totalPoints = 0, polePositions = 0;

    for (const race of races) {
      const result = race.Results?.[0];
      if (!result) continue;
      const pos = parseInt(result.position ?? '99');
      const status: string = result.status ?? '';
      const grid = parseInt(result.grid ?? '99');
      const points = parseFloat(result.points ?? '0');
      if (pos === 1) wins++;
      if (pos >= 1 && pos <= 3 && !isNaN(pos)) podiums++;
      totalPoints += points;
      if (grid === 0) {
        dns++;
      } else {
        const isFinished = status === 'Finished' || /^\+\d+ Laps?/.test(status);
        if (!isFinished) dnf++;
      }
      if (grid === 1) polePositions++;
    }

    // ✅ FIX CHAMPIONSHIPS: parseInt bukan === '1'
    let championships = 0;
    for (const seasonItem of standingsList) {
      const driverStandings: any[] = seasonItem.DriverStandings ?? [];
      const thisDriver =
        driverStandings.find((ds: any) => ds.Driver?.driverId === driverId) ??
        driverStandings[0];
      if (!thisDriver) continue;
      if (parseInt(thisDriver.position ?? '99') === 1) championships++;
    }

    const seasons = [...new Set(races.map((r: any) => r.season as string))].sort();

    return {
      totalRaces: races.length,
      wins,
      podiums,
      dnf,
      dns,
      totalPoints: Math.round(totalPoints * 10) / 10,
      polePositions,
      fastestLaps: fastestRaces.length,
      championships,
      debutYear: seasons[0] ?? '',
      debutRace: races[0]?.raceName ?? '',
      seasons: seasons.length,
      lastSeason: seasons[seasons.length - 1] ?? '',
    };
  } catch (e) {
    console.error('Career stats error:', e);
    return null;
  }
}

// ─── TAMBAHAN: Fungsi debug untuk cek data championships driver tertentu ───
// Hapus setelah selesai testing
export async function debugChampionships(driverId: string) {
  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/drivers/${driverId}/driverstandings/?limit=100`
  );
  const data = await res.json();
  const list = data?.MRData?.StandingsTable?.StandingsLists ?? [];
  console.log(`[DEBUG] ${driverId} standings seasons: ${list.length}`);
  list.forEach((item: any) => {
    const ds = item.DriverStandings?.[0];
    console.log(
      `  Season ${item.season}: pos=${ds?.position} pts=${ds?.points}`
    );
  });
}
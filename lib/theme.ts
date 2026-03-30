import { AppTheme } from './settings';

export interface ThemeColors {
  bg: string;
  bgHero: string;
  bgSecondary: string;
  card: string;
  cardBorder: string;
  cardBorderWidth: number;
  cardRadius: number;
  cardAccentBg: string;
  accentBg: string;
  text: string;
  textSub: string;
  textMuted: string;
  accent: string;
  accentSecondary: string;
  cardLeftBorder: boolean;
  cardLeftBorderColor: string;
  cardShadow: object | null;
  cardElevatedBg: string;
  cardElevatedBorder: string;
  fontScale: number;
  titleWeight: '700' | '800' | '900';
  labelTracking: number;
  labelCase: 'uppercase' | 'none';
  labelFont: 'mono' | 'normal';
  showBgLines: boolean;
  showGridOverlay: boolean;
  showGlowOverlay: boolean;
  glowColor: string;
  topAccentBar: boolean;
  topAccentDashed: boolean;
  topAccentBarColor: string;
  heroGradient: string[];
  statusBar: 'light' | 'dark';
  isLight: boolean;
  raceTickerBg: string;
  raceCardBg: string;
  raceCardBorder: string;
  raceCountdownColor: string;
  raceBg: string;
  sectionLabel: string;
  toggleBg: string;
  toggleBorder: string;
  countdownFont: 'mono' | 'normal';
  driverRowBg: string;
  driverRowBorder: string;
}

export function getTheme(theme: AppTheme, isRaceWeekend: boolean): ThemeColors {
  const base = BASE_THEMES[theme];
  if (!isRaceWeekend) return base;
  return { ...base, ...RACE_OVERRIDES[theme] };
}

const BASE_THEMES: Record<AppTheme, ThemeColors> = {
  dark: {
    bg: '#080808',
    bgHero: '#0d0000',
    bgSecondary: '#111111',
    card: '#111111',
    cardBorder: '#1c1c1c',
    cardBorderWidth: 1,
    cardRadius: 8,
    cardAccentBg: '#150000',
    accentBg: '#1f0000',
    text: '#ffffff',
    textSub: '#bbbbbb',   // CONTRAST FIX: was #888
    textMuted: '#555555', // CONTRAST FIX: was #444
    accent: '#e10600',
    accentSecondary: '#ff4422',
    cardLeftBorder: true,
    cardLeftBorderColor: 'transparent',
    cardShadow: null,
    cardElevatedBg: '#161616',
    cardElevatedBorder: '#2a2a2a',
    fontScale: 1,
    titleWeight: '900',
    labelTracking: 1.5,
    labelCase: 'uppercase',
    labelFont: 'mono',
    showBgLines: false,
    showGridOverlay: false,
    showGlowOverlay: false,
    glowColor: 'transparent',
    topAccentBar: false,
    topAccentDashed: false,
    topAccentBarColor: '#e10600',
    heroGradient: ['#1c0000', '#0d0d0d'],
    statusBar: 'light',
    isLight: false,
    raceTickerBg: '#e10600',
    raceCardBg: 'rgba(225,6,0,0.08)',
    raceCardBorder: '#e1060050',
    raceCountdownColor: '#ff4444',
    raceBg: '#060006',
    sectionLabel: '#333333',
    toggleBg: '#111111',
    toggleBorder: '#1c1c1c',
    countdownFont: 'mono',
    driverRowBg: '#111111',
    driverRowBorder: '#1c1c1c',
  },

  carbon: {
    bg: '#0c0c0c',
    bgHero: '#0c0c0c',
    bgSecondary: '#131313',
    card: '#141414',
    cardBorder: '#202020',
    cardBorderWidth: 1,
    cardRadius: 4,
    cardAccentBg: '#1a0505',
    accentBg: '#200000',
    text: '#f0f0f0',
    textSub: '#cccccc',   // CONTRAST FIX: was #888
    textMuted: '#666666', // CONTRAST FIX: was #3a3a3a (too dark)
    accent: '#e10600',
    accentSecondary: '#cc0500',
    cardLeftBorder: true,
    cardLeftBorderColor: '#e10600',
    cardShadow: null,
    cardElevatedBg: '#181818',
    cardElevatedBorder: '#282828',
    fontScale: 1,
    titleWeight: '900',
    labelTracking: 2,
    labelCase: 'uppercase',
    labelFont: 'mono',
    showBgLines: false,
    showGridOverlay: true,
    showGlowOverlay: false,
    glowColor: 'transparent',
    topAccentBar: true,
    topAccentDashed: true,
    topAccentBarColor: '#e10600',
    heroGradient: ['#0c0c0c', '#0c0c0c'],
    statusBar: 'light',
    isLight: false,
    raceTickerBg: '#cc0500',
    raceCardBg: '#1a0808',
    raceCardBorder: '#e1060060',
    raceCountdownColor: '#e10600',
    raceBg: '#0a0505',
    sectionLabel: '#2a2a2a',
    toggleBg: '#141414',
    toggleBorder: '#202020',
    countdownFont: 'mono',
    driverRowBg: '#111111',
    driverRowBorder: '#1c1c1c',
  },

  light: {
    bg: '#f2f2f2',
    bgHero: '#ffffff',
    bgSecondary: '#f8f8f8',
    card: '#ffffff',
    cardBorder: '#ececec',
    cardBorderWidth: 1,
    cardRadius: 14,
    cardAccentBg: '#fff5f5',
    accentBg: '#fff0f0',
    text: '#0d0d0d',
    textSub: '#444444',
    textMuted: '#999999', // CONTRAST FIX: was #aaaaaa
    accent: '#e10600',
    accentSecondary: '#c80500',
    cardLeftBorder: false,
    cardLeftBorderColor: '#e10600',
    cardShadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardElevatedBg: '#ffffff',
    cardElevatedBorder: '#e0e0e0',
    fontScale: 1,
    titleWeight: '900',
    labelTracking: 1,
    labelCase: 'uppercase',
    labelFont: 'normal',
    showBgLines: false,
    showGridOverlay: false,
    showGlowOverlay: false,
    glowColor: 'transparent',
    topAccentBar: true,
    topAccentDashed: false,
    topAccentBarColor: '#e10600',
    heroGradient: ['#ffffff', '#ffffff'],
    statusBar: 'dark',
    isLight: true,
    raceTickerBg: '#e10600',
    raceCardBg: '#fff5f5',
    raceCardBorder: '#e10600',
    raceCountdownColor: '#e10600',
    raceBg: '#fff0f0',
    sectionLabel: '#cccccc',
    toggleBg: '#ececec',
    toggleBorder: '#e0e0e0',
    countdownFont: 'normal',
    driverRowBg: '#ffffff',
    driverRowBorder: '#ececec',
  },

  neon: {
    bg: '#03030f',
    bgHero: '#03030f',
    bgSecondary: '#07071a',
    card: '#0a0a1e',
    cardBorder: '#14143a',
    cardBorderWidth: 1,
    cardRadius: 10,
    cardAccentBg: '#130010',
    accentBg: '#180015',
    text: '#eeeeff',
    textSub: '#aaaacc',   // CONTRAST FIX: was #7777aa
    textMuted: '#555580', // CONTRAST FIX: was #2a2a50 (nearly invisible)
    accent: '#ff1744',
    accentSecondary: '#ff4466',
    cardLeftBorder: false,
    cardLeftBorderColor: '#ff1744',
    cardShadow: null,
    cardElevatedBg: '#0f0f28',
    cardElevatedBorder: '#ff174420',
    fontScale: 1,
    titleWeight: '800',
    labelTracking: 1.5,
    labelCase: 'uppercase',
    labelFont: 'normal',
    showBgLines: false,
    showGridOverlay: false,
    showGlowOverlay: true,
    glowColor: '#ff174412',
    topAccentBar: false,
    topAccentDashed: false,
    topAccentBarColor: '#ff1744',
    heroGradient: ['#03030f', '#03030f'],
    statusBar: 'light',
    isLight: false,
    raceTickerBg: '#ff1744',
    raceCardBg: 'rgba(255,23,68,0.07)',
    raceCardBorder: '#ff174440',
    raceCountdownColor: '#ff4466',
    raceBg: '#06000f',
    sectionLabel: '#1a1a40',
    toggleBg: '#0a0a1e',
    toggleBorder: '#14143a',
    countdownFont: 'mono',
    driverRowBg: 'rgba(255,255,255,0.03)',
    driverRowBorder: 'rgba(255,255,255,0.06)',
  },

  steel: {
    bg: '#060d1a',
    bgHero: '#071020',
    bgSecondary: '#0a1424',
    card: '#0d1929',
    cardBorder: '#1a2e4a',
    cardBorderWidth: 1,
    cardRadius: 10,
    cardAccentBg: '#071535',
    accentBg: '#071535',
    text: '#e8f0ff',
    textSub: '#8aabcc',   // CONTRAST FIX: was #6a8aaa
    textMuted: '#4a6080', // CONTRAST FIX: was #2a3d5a
    accent: '#2979ff',
    accentSecondary: '#448aff',
    cardLeftBorder: false,
    cardLeftBorderColor: '#2979ff',
    cardShadow: null,
    cardElevatedBg: '#101e30',
    cardElevatedBorder: '#2979ff25',
    fontScale: 1,
    titleWeight: '900',
    labelTracking: 1.5,
    labelCase: 'uppercase',
    labelFont: 'mono',
    showBgLines: false,
    showGridOverlay: false,
    showGlowOverlay: false,
    glowColor: 'transparent',
    topAccentBar: true,
    topAccentDashed: false,
    topAccentBarColor: '#2979ff',
    heroGradient: ['#071020', '#060d1a'],
    statusBar: 'light',
    isLight: false,
    raceTickerBg: '#1565c0',
    raceCardBg: 'rgba(41,121,255,0.08)',
    raceCardBorder: '#2979ff50',
    raceCountdownColor: '#448aff',
    raceBg: '#040b16',
    sectionLabel: '#1a2e4a',
    toggleBg: '#0d1929',
    toggleBorder: '#1a2e4a',
    countdownFont: 'mono',
    driverRowBg: '#0d1929',
    driverRowBorder: '#1a2e4a',
  },

  midnight: {
    bg: '#04080f',
    bgHero: '#050c18',
    bgSecondary: '#070e1c',
    card: '#080f1e',
    cardBorder: '#0f1e35',
    cardBorderWidth: 1,
    cardRadius: 10,
    cardAccentBg: '#020e1a',
    accentBg: '#021220',
    text: '#ddeeff',
    textSub: '#7aaabb',   // CONTRAST FIX: was #4a6888
    textMuted: '#3a5570', // CONTRAST FIX: was #182840 (nearly invisible)
    accent: '#00b4d8',
    accentSecondary: '#48cae4',
    cardLeftBorder: false,
    cardLeftBorderColor: '#00b4d8',
    cardShadow: null,
    cardElevatedBg: '#0c1828',
    cardElevatedBorder: '#00b4d820',
    fontScale: 1,
    titleWeight: '900',
    labelTracking: 1.5,
    labelCase: 'uppercase',
    labelFont: 'mono',
    showBgLines: false,
    showGridOverlay: false,
    showGlowOverlay: false,
    glowColor: 'transparent',
    topAccentBar: true,
    topAccentDashed: false,
    topAccentBarColor: '#00b4d8',
    heroGradient: ['#050c18', '#04080f'],
    statusBar: 'light',
    isLight: false,
    raceTickerBg: '#0077b6',
    raceCardBg: 'rgba(0,180,216,0.07)',
    raceCardBorder: '#00b4d840',
    raceCountdownColor: '#48cae4',
    raceBg: '#030710',
    sectionLabel: '#0f1e35',
    toggleBg: '#080f1e',
    toggleBorder: '#0f1e35',
    countdownFont: 'mono',
    driverRowBg: '#080f1e',
    driverRowBorder: '#0f1e35',
  },
};

// Race week overrides — setiap tema punya nuansa berbeda saat race weekend
const RACE_OVERRIDES: Record<AppTheme, Partial<ThemeColors>> = {
  // Dark: seluruh bg bergeser ke merah gelap, teks body kemerahan
  dark: {
    bg: '#060006',
    bgHero: '#130008',
    card: 'rgba(225,6,0,0.07)',
    cardBorder: '#e1060035',
    textSub: '#ffaaaa',
    textMuted: '#cc6666',
    raceCardBg: '#250000',
    raceCardBorder: '#e1060050',
    sectionLabel: '#3a0000',
  },
  // Carbon: lebih gelap + border merah pekat
  carbon: {
    bg: '#0a0303',
    bgHero: '#0a0303',
    card: '#1c0808',
    cardBorder: '#e1060045',
    textSub: '#ffbbbb',
    textMuted: '#cc5555',
    raceCardBg: '#200808',
    raceCardBorder: '#e1060060',
    sectionLabel: '#330000',
  },
  // Light: bg merah muda, border merah tegas — paling dramatis perubahannya
  light: {
    bg: '#fff0f0',
    bgHero: '#ffffff',
    card: '#fff5f5',
    cardBorder: '#ffcccc',
    cardAccentBg: '#ffe8e8',
    accentBg: '#ffe8e8',
    text: '#1a0000',
    textSub: '#880000',
    textMuted: '#cc4444',
    raceTickerBg: '#e10600',
    raceCardBg: '#fff0f0',
    raceCardBorder: '#e10600',
  },
  // Neon: bg lebih ungu-merah gelap, accent lebih terang
  neon: {
    bg: '#07000f',
    bgHero: '#07000f',
    card: 'rgba(255,23,68,0.06)',
    cardBorder: '#ff174435',
    textSub: '#ffaacc',
    textMuted: '#cc5577',
    raceCardBg: 'rgba(255,23,68,0.10)',
    raceCardBorder: '#ff174455',
    sectionLabel: '#200020',
  },
  // Steel: biru lebih pekat, nuansa malam race
  steel: {
    bg: '#040b16',
    bgHero: '#071020',
    card: 'rgba(41,121,255,0.08)',
    cardBorder: '#2979ff40',
    textSub: '#aaccff',
    textMuted: '#6688bb',
    accentBg: '#071535',
    raceTickerBg: '#1565c0',
    raceCardBg: 'rgba(41,121,255,0.12)',
    raceCardBorder: '#2979ff55',
  },
  // Midnight: cyan lebih neon, bg lebih pekat
  midnight: {
    bg: '#030710',
    bgHero: '#050c18',
    card: 'rgba(0,180,216,0.07)',
    cardBorder: '#00b4d840',
    textSub: '#99ddee',
    textMuted: '#4488aa',
    accentBg: '#021220',
    raceTickerBg: '#0077b6',
    raceCardBg: 'rgba(0,180,216,0.12)',
    raceCardBorder: '#00b4d855',
  },
};

export function isRaceWeekendNow(races: any[]): boolean {
  const now = new Date();
  for (const race of races) {
    const sessions = [
      race.FirstPractice, race.SecondPractice, race.ThirdPractice,
      race.SprintQualifying, race.Sprint, race.Qualifying,
      { date: race.date, time: race.time },
    ].filter(Boolean);
    const times = sessions
      .map((s: any) => new Date(`${s.date}T${s.time ?? '00:00:00Z'}`))
      .filter((d) => !isNaN(d.getTime()));
    if (!times.length) continue;
    const start = new Date(Math.min(...times.map((d) => d.getTime())));
    const end = new Date(`${race.date}T${race.time ?? '00:00:00Z'}`);
    end.setHours(end.getHours() + 3);
    if (now >= start && now <= end) return true;
  }
  return false;
}
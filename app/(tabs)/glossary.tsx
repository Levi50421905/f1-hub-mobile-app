import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BgDecoration from '../../components/BgDecoration';
import ThemeCard from '../../components/ThemeCard';
import { useSettings } from '../../lib/SettingsContext';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Category =
  | 'Semua'
  | 'Ban'
  | 'Aero'
  | 'Strategi'
  | 'Regulasi'
  | 'Teknik'
  | 'Power Unit'
  | 'Sirkuit'
  | 'Umum';

type GlossaryItem = {
  term: string;
  full: string;
  def_id: string;
  def_en: string;
  category: Category;
  fact_id?: string;
  fact_en?: string;
  isNew?: boolean;
};

// ─── CATEGORY META ────────────────────────────────────────────────────────────
const CATEGORIES: { key: Category; label: string; labelEN: string; icon: string }[] = [
  { key: 'Semua',      label: 'Semua',       labelEN: 'All',          icon: '🏁' },
  { key: 'Umum',       label: 'Umum',        labelEN: 'General',      icon: '🏎️' },
  { key: 'Ban',        label: 'Ban',         labelEN: 'Tyres',        icon: '🔴' },
  { key: 'Aero',       label: 'Aero',        labelEN: 'Aero',         icon: '💨' },
  { key: 'Strategi',   label: 'Strategi',    labelEN: 'Strategy',     icon: '🎯' },
  { key: 'Teknik',     label: 'Teknik',      labelEN: 'Technical',    icon: '🔧' },
  { key: 'Power Unit', label: 'Power Unit',  labelEN: 'Power Unit',   icon: '⚡' },
  { key: 'Regulasi',   label: 'Regulasi',    labelEN: 'Regulations',  icon: '📋' },
  { key: 'Sirkuit',    label: 'Sirkuit',     labelEN: 'Circuit',      icon: '🗺️' },
];

// ─── BADGE COLOURS ────────────────────────────────────────────────────────────
const BADGE: Record<Category, { bg: string; text: string; activeBg: string; border: string }> = {
  Semua:       { bg: '#EBF2FC', text: '#1558A8', activeBg: '#1558A8', border: '#BDD4F0' },
  Umum:        { bg: '#EEEDFE', text: '#4338CA', activeBg: '#4338CA', border: '#C7C4FB' },
  Ban:         { bg: '#FDECEC', text: '#B91C1C', activeBg: '#B91C1C', border: '#F5BFBF' },
  Aero:        { bg: '#E8F4FD', text: '#0369A1', activeBg: '#0369A1', border: '#B3D9F5' },
  Strategi:    { bg: '#ECFDF5', text: '#065F46', activeBg: '#065F46', border: '#A7F3D0' },
  Teknik:      { bg: '#F5F0FE', text: '#6D28D9', activeBg: '#6D28D9', border: '#DDD6FE' },
  'Power Unit':{ bg: '#FFFBEB', text: '#B45309', activeBg: '#B45309', border: '#FDE68A' },
  Regulasi:    { bg: '#FFF7ED', text: '#C2410C', activeBg: '#C2410C', border: '#FED7AA' },
  Sirkuit:     { bg: '#F0FDF4', text: '#15803D', activeBg: '#15803D', border: '#BBF7D0' },
};

// ─── GLOSSARY DATA — 250 TERMS ────────────────────────────────────────────────
const GLOSSARY: GlossaryItem[] = [

  // ══ UMUM ══════════════════════════════════════════════════════════════════
  { term:'DRS', full:'Drag Reduction System', category:'Umum',
    def_id:'Sayap belakang yang bisa dibuka di zona DRS untuk mengurangi hambatan udara dan menambah kecepatan di lurus. Aktif hanya ketika jarak ke mobil di depan kurang dari 1 detik.',
    def_en:'Adjustable rear wing flap opened in designated DRS zones to reduce drag and gain top speed. Only activated when within 1 second of the car ahead.',
    fact_id:'DRS bisa menambah kecepatan hingga 15–20 km/jam di lurus panjang.',
    fact_en:'DRS can add up to 15–20 km/h on a long straight.' },

  { term:'VSC', full:'Virtual Safety Car', category:'Umum',
    def_id:'Mode netral digital tanpa mobil fisik di lintasan. Semua pembalap wajib menjaga delta time minimum yang ditentukan. Diperkenalkan 2015 pasca insiden Jules Bianchi.',
    def_en:'Digital neutral mode — no physical car on track. All drivers must maintain a minimum delta time. Introduced in 2015 following the Jules Bianchi incident.',
    fact_id:'VSC memungkinkan balapan tetap berjalan saat insiden ringan tanpa menghentikan race.',
    fact_en:'VSC allows racing to continue during minor incidents without a full safety car deployment.' },

  { term:'Safety Car', full:'Neutral Pace Car', category:'Umum',
    def_id:'Mobil pengaman (biasanya Mercedes-AMG GT) yang keluar ke lintasan saat ada insiden berbahaya. Semua pembalap wajib mengikutinya dan dilarang menyalip.',
    def_en:'Pace car (usually Mercedes-AMG GT) deployed during dangerous incidents. All drivers must follow it — overtaking is prohibited.',
    fact_id:'Tim sering memanfaatkan Safety Car untuk pit stop gratis tanpa kehilangan waktu relatif.',
    fact_en:'Teams often exploit Safety Car periods for a "free" pit stop.' },

  { term:'Formation Lap', full:'Warm-Up Lap', category:'Umum',
    def_id:'Satu lap pemanasan sebelum race. Pembalap menghangatkan ban dan rem, lalu kembali ke grid sebelum lampu merah menyala.',
    def_en:'One warm-up lap before the race start. Drivers warm tyres and brakes, then return to grid before the lights.',
    fact_id:'Pembalap biasanya zigzag di lintasan untuk memanaskan kedua sisi ban secara merata.',
    fact_en:'Drivers weave from side to side to evenly heat both sides of the tyres.' },

  { term:'Quali', full:'Qualifying Session', category:'Umum',
    def_id:'Sesi penentu posisi start. Q1 (semua pembalap, 18 mnt), Q2 (15 pembalap, 15 mnt), Q3 (10 terbaik, 12 mnt). Tercepat di Q3 meraih pole position.',
    def_en:'Grid-setting session: Q1 (all drivers, 18 min), Q2 (15 drivers, 15 min), Q3 (top 10, 12 min). Fastest in Q3 earns pole position.',
    fact_id:'Pembalap dari pole position memenangkan lebih dari 40% balapan F1 sepanjang sejarah.',
    fact_en:'Pole sitters have won over 40% of all F1 races historically.' },

  { term:'Sprint Race', full:'Short Format Race', category:'Umum',
    def_id:'Balapan pendek ~100 km di Sabtu pada weekend terpilih. Memberikan poin tambahan: 8 hingga 1 untuk 8 besar. Tidak mengubah setup race Minggu.',
    def_en:'Short ~100 km Saturday race at selected weekends. Awards bonus points: 8 down to 1 for the top 8. Does not affect Sunday race setup.',
    fact_id:'Format Sprint diperluas menjadi 6 seri per musim mulai 2023.',
    fact_en:'The Sprint format was expanded to 6 events per season from 2023.' },

  { term:'Sprint Shootout', full:'Sprint Qualifying Session', category:'Umum',
    def_id:'Sesi kualifikasi khusus yang menentukan grid Sprint Race, terpisah dari quali utama. Format SQ1, SQ2, SQ3 dengan durasi lebih singkat.',
    def_en:'Dedicated qualifying session for the Sprint Race grid, separate from main qualifying. Three-part format: SQ1, SQ2, SQ3.',
    fact_id:'Sprint Shootout diperkenalkan 2023 menggantikan format quali lama di Sprint weekend.',
    fact_en:'Sprint Shootout replaced the old Sprint qualifying format from 2023.', isNew:true },

  { term:'Podium', full:'Top 3 Finishers', category:'Umum',
    def_id:'Tiga pembalap tercepat yang menyelesaikan race. Poin: 25 (P1), 18 (P2), 15 (P3). Disertai trofi dan upacara nasional.',
    def_en:'Top three race finishers receiving trophies and championship points: 25 (P1), 18 (P2), 15 (P3).',
    fact_id:'Lewis Hamilton memegang rekor 197 podium sepanjang karier F1-nya.',
    fact_en:'Lewis Hamilton holds the record with 197 career F1 podium finishes.' },

  { term:'DNF', full:'Did Not Finish', category:'Umum',
    def_id:'Status pembalap yang tidak menyelesaikan race akibat kecelakaan, kerusakan mekanis, atau keputusan tim untuk menarik mobil.',
    def_en:'Status for a driver who did not complete the race due to crash, mechanical failure, or a team retirement decision.',
    fact_id:'Rata-rata 3–4 pembalap mengalami DNF di setiap race F1.',
    fact_en:'On average, 3–4 drivers retire per race in Formula 1.' },

  { term:'Fastest Lap', full:'Quickest Race Lap', category:'Umum',
    def_id:'Lap tercepat yang dibuat selama race. Memberikan 1 poin bonus asalkan pembalap finis di 10 besar.',
    def_en:'The quickest single lap set during the race. Awards 1 bonus championship point if the driver finishes in the top 10.',
    fact_id:'Bonus fastest lap point diperkenalkan kembali pada musim 2019.',
    fact_en:'The fastest lap bonus point was reintroduced in the 2019 season.' },

  { term:'Pit Lane Speed Limit', full:'Pit Lane Max Speed', category:'Umum',
    def_id:'Batas kecepatan wajib di pit lane — biasanya 80 km/jam saat race, 60 km/jam di beberapa sirkuit. Pelanggaran dikenakan penalti waktu.',
    def_en:'Mandatory speed limit in the pit lane — typically 80 km/h during races, 60 km/h at some circuits. Violations result in a time penalty.',
    fact_id:'Sensor kecepatan otomatis memantau seluruh pit lane secara real-time.',
    fact_en:'Automated speed sensors monitor the entire pit lane in real time.' },

  { term:'Pit Stop', full:'Tyre/Service Change Stop', category:'Umum',
    def_id:'Kunjungan ke pit lane untuk mengganti ban, memperbaiki sayap, atau memenuhi persyaratan regulasi. Tim top bisa mengganti keempat ban dalam waktu di bawah 2 detik.',
    def_en:'Visit to the pit lane to change tyres, repair wings, or fulfil regulatory requirements. Top teams can change all four tyres in under 2 seconds.',
    fact_id:'Red Bull memegang rekor pit stop tercepat F1: 1.80 detik di Brasil 2019.',
    fact_en:'Red Bull hold the F1 pit stop record: 1.80 seconds at the 2019 Brazilian GP.' },

  { term:'Lollipop Man', full:'Pit Stop Release Official', category:'Umum',
    def_id:'Mekanik yang memegang tanda bundar (lollipop) untuk memberi tahu kapan mobil boleh keluar dari pit box. Kini sudah digantikan oleh sistem lampu otomatis di sebagian besar tim.',
    def_en:'Mechanic holding a round sign (lollipop) to signal when the car may leave the pit box. Now replaced by automated light systems at most teams.',
    fact_id:'Sistem lollipop tradisional dianggap lebih lambat dan rentan human error dibanding sistem lampu otomatis.',
    fact_en:'The traditional lollipop system was considered slower and more error-prone than automated light systems.' },

  { term:'Race Director', full:'FIA Race Control Head', category:'Umum',
    def_id:'Pejabat FIA yang memimpin race control dan memiliki otoritas penuh atas keputusan deployment safety car, VSC, bendera merah, dan keselamatan lintasan.',
    def_en:'FIA official heading race control with full authority over safety car deployment, VSC, red flags, and track safety decisions.',
    fact_id:'Niels Wittich dan Eduardo Freitas menjadi co-Race Director setelah kontroversi Abu Dhabi 2021.',
    fact_en:'Niels Wittich and Eduardo Freitas became co-Race Directors after the 2021 Abu Dhabi controversy.' },

  { term:'Kerb', full:'Track Boundary Marker', category:'Umum',
    def_id:'Batas tepi lintasan berwarna merah-putih. Penggunaan berlebihan bisa mengakibatkan penalti waktu atau penghapusan lap.',
    def_en:'Red-white edge markers at track boundaries. Excessive use can result in a time penalty or lap time deletion.',
    fact_id:'Beberapa sirkuit memasang astroturf atau gravel di luar kerb untuk mencegah cutting.',
    fact_en:'Some circuits use astroturf or gravel beyond kerbs to discourage track limits violations.' },

  { term:'Sausage Kerb', full:'High-Profile Deterrent Kerb', category:'Umum',
    def_id:'Kerb berbentuk sosis (profil tinggi) yang dipasang di tikungan tertentu untuk mencegah pembalap memotong lintasan. Dapat sangat berbahaya jika dilindas dengan kecepatan tinggi.',
    def_en:'High-profile raised kerb placed at certain corners to prevent track cutting. Can be extremely dangerous if hit at high speed.',
    fact_id:'FIA melarang penggunaan sausage kerb di beberapa titik setelah insiden berbahaya di musim 2021–2022.',
    fact_en:'The FIA banned sausage kerbs at several locations after dangerous incidents in 2021–2022.' },

  { term:'Marbles', full:'Rubber Debris Off-Line', category:'Umum',
    def_id:'Potongan karet ban yang menumpuk di luar racing line. Sangat licin — mobil yang keluar racing line bisa kehilangan grip tiba-tiba.',
    def_en:'Rubber tyre pieces accumulating off the racing line. Extremely slippery — a car leaving the racing line can suddenly lose grip.',
    fact_id:'Kumpulan marbles biasanya terlihat jelas di luar tikungan cepat setelah beberapa lap.',
    fact_en:'Marble accumulations are typically visible on the outside of fast corners after a few racing laps.' },

  { term:'Overcut', full:'Strategic Late Pit Stop', category:'Umum',
    def_id:'Strategi tetap di lintasan lebih lama dari lawan yang sudah pit, memanfaatkan ban panas dan track kosong.',
    def_en:'Staying out longer than a rival who has pitted, leveraging warm tyres and clear track.',
    fact_id:'Overcut paling sukses saat lawan masuk pit terlalu dini atau traffic pit lane padat.',
    fact_en:'Overcuts succeed most when the rival pits too early or pit lane traffic slows their service.' },

  { term:'Superlicence', full:'FIA F1 Driver Licence', category:'Umum',
    def_id:'Lisensi khusus yang wajib dimiliki setiap pembalap F1. Diperoleh dengan poin dari seri junior dan minimum 300 km test di mobil F1.',
    def_en:'Mandatory licence required by every F1 driver. Obtained by accumulating points from junior series and completing a minimum 300 km test in an F1 car.',
    fact_id:'Pembalap berusia minimal 18 tahun dan harus mengumpulkan 40 poin superlicence untuk memenuhi syarat.',
    fact_en:'Drivers must be at least 18 years old and accumulate 40 superlicence points to qualify.' },

  { term:'Chequered Flag', full:'Race Finish Signal', category:'Umum',
    def_id:'Bendera kotak-kotak hitam-putih yang dikibarkan saat pembalap melintasi garis finish untuk menandai akhir race.',
    def_en:'Black-and-white chequered flag waved as drivers cross the finish line to signal the end of the race.',
    fact_id:'Sejak 2018, sistem lampu virtual chequered flag juga digunakan bersamaan bendera fisik.',
    fact_en:'Since 2018, a virtual light chequered flag system is also used alongside the physical flag.' },

  { term:'Flag-to-Flag', full:'Full Race Distance', category:'Umum',
    def_id:'Race yang berlangsung tanpa interupsi dari awal hingga akhir tanpa red flag atau kontroversi besar.',
    def_en:'A race running uninterrupted from start to finish without red flags or major controversy.',
    fact_id:'Race flag-to-flag murni makin jarang terjadi di era modern karena regulasi Safety Car lebih sering digunakan.',
    fact_en:'Pure flag-to-flag races are increasingly rare as Safety Car regulations are applied more frequently.' },

  { term:'Pit Wall', full:'Team Trackside Control Station', category:'Umum',
    def_id:'Area di sepanjang pit lane tempat strategi tim, insinyur, dan direktur tim duduk di belakang komputer untuk memonitor race dan berkomunikasi dengan pembalap.',
    def_en:'Area along the pit lane where team strategists, engineers, and team principal sit monitoring the race and communicating with the driver.',
    fact_id:'Pit wall modern terhubung langsung ke factory tim di rumah melalui koneksi data real-time.',
    fact_en:'Modern pit walls are directly connected to the team\'s home factory via high-speed real-time data links.' },

  { term:'Radio Communication', full:'Driver-Pit Radio', category:'Umum',
    def_id:'Komunikasi suara antara pembalap dan race engineer. Rekaman radio sering dirilis secara publik dan menjadi salah satu aspek paling entertaining di F1 modern.',
    def_en:'Voice communication between driver and race engineer. Radio recordings are often released publicly and have become one of the most entertaining aspects of modern F1.',
    fact_id:'"Multi 21" dari Vettel di Malaysia 2013 adalah radio yang paling kontroversial dalam sejarah F1 modern.',
    fact_en:'"Multi 21" from Vettel at Malaysia 2013 is the most controversial radio message in modern F1 history.' },

  { term:'Box Box Box', full:'Pit Stop Radio Call', category:'Umum',
    def_id:'Instruksi radio dari pit wall kepada pembalap untuk masuk pit stop. Kata "box" diulang tiga kali karena lingkungan audio yang bising di dalam kokpit F1.',
    def_en:'Pit wall radio instruction for the driver to come in for a pit stop. "Box" is repeated three times due to the extremely noisy cockpit environment.',
    fact_id:'"Box" berasal dari kata Jerman "Boxenstopp" yang masuk ke dalam kosakata F1 melalui tim Jerman era 1950-an.',
    fact_en:'"Box" comes from the German "Boxenstopp" and entered F1 vocabulary through German teams in the 1950s.' },

  { term:'Wheel-to-Wheel', full:'Close Racing Contact', category:'Umum',
    def_id:'Pertarungan jarak sangat dekat antara dua mobil di lintasan, di mana ban-ban hampir saling bersentuhan.',
    def_en:'Very close racing between two cars on track where the wheels come near to touching.',
    fact_id:'FIA memiliki pedoman ketat tentang apa yang dianggap racing yang fair dalam duel wheel-to-wheel.',
    fact_en:'The FIA has strict guidelines on what constitutes fair racing during wheel-to-wheel battles.' },

  { term:'Purple Sector', full:'Fastest Sector Time', category:'Umum',
    def_id:'Warna ungu yang ditampilkan di timing board untuk menandai pembalap yang membuat waktu sektor tercepat secara keseluruhan di sesi tersebut.',
    def_en:'Purple colour displayed on timing boards indicating the driver who set the overall fastest sector time in that session.',
    fact_id:'Ungu (purple) = tercepat keseluruhan; hijau = waktu personal terbaik; kuning = lebih lambat dari personal terbaik.',
    fact_en:'Purple = overall fastest; green = personal best; yellow = slower than personal best.' },

  { term:'Flying Lap', full:'Maximum Effort Timed Lap', category:'Umum',
    def_id:'Lap kualifikasi atau lap cepat di mana pembalap memberikan usaha maksimal penuh untuk meraih waktu terbaik.',
    def_en:'Qualifying or timed lap where the driver gives maximum effort to set their best time.',
    fact_id:'Pembalap modern bisa melakukan flying lap dalam konsistensi 0,1 detik dari lap terbaik mereka.',
    fact_en:'Modern F1 drivers can reproduce flying laps within 0.1 seconds of their best time consistently.' },

  { term:'Championship Hunt', full:'Title Race Final Stages', category:'Umum',
    def_id:'Fase akhir musim di mana dua atau lebih pembalap/tim bersaing ketat untuk meraih gelar juara dunia.',
    def_en:'The final stage of the season where two or more drivers/teams compete closely for the world championship title.',
    fact_id:'Tiga dari empat gelar terakhir Verstappen (2021, 2023, 2024) diputuskan di atau mendekati race terakhir.',
    fact_en:'Three of Verstappen\'s recent titles (2021, 2023, 2024) were decided at or near the final race.', isNew:true },

  { term:'Debrief', full:'Post-Session Team Analysis', category:'Umum',
    def_id:'Pertemuan tim setelah setiap sesi untuk menganalisis data, membahas performa, dan merencanakan perbaikan setup atau strategi.',
    def_en:'Team meeting after every session to analyse data, discuss performance, and plan setup or strategy improvements.',
    fact_id:'Debrief modern F1 melibatkan ratusan engineer dari pabrik di rumah yang bergabung secara virtual.',
    fact_en:'Modern F1 debriefs involve hundreds of engineers from the home factory joining virtually.' },

  { term:'Point of No Return', full:'Braking Commitment Point', category:'Umum',
    def_id:'Titik di mana pembalap tidak lagi bisa mengerem cukup untuk melewati tikungan dengan aman.',
    def_en:'The point at which a driver can no longer brake sufficiently to navigate the corner safely.',
    fact_id:'Pembalap yang menunda pengereman melewati point of no return berisiko keluar lintasan atau kecelakaan.',
    fact_en:'Drivers braking beyond the point of no return risk running off the track or causing a collision.' },

  { term:'Outsiders', full:'Non-Points Midfield Teams', category:'Umum',
    def_id:'Tim atau pembalap yang secara reguler berada di luar zona poin (P11 ke bawah).',
    def_en:'Teams or drivers regularly finishing outside the points zone (P11 and below).',
    fact_id:'Selisih pendapatan antara P10 dan P11 di F1 bisa mencapai $5–10 juta per musim.',
    fact_en:'The revenue gap between finishing P10 and P11 in the constructors can be $5–10 million per season.' },

  { term:'Back Marker', full:'Lapped Slower Car', category:'Umum',
    def_id:'Pembalap yang sudah satu lap atau lebih tertinggal dari pemimpin. Wajib memberi jalan saat menerima bendera biru.',
    def_en:'Driver who is one or more laps behind the race leader. Must yield when shown a blue flag.',
    fact_id:'Interaksi antara pemimpin dan back marker di lap terakhir sering menentukan hasil race.',
    fact_en:'The interaction between the leader and back markers on the final lap can decide the race outcome.' },

  { term:'Pensiunan', full:'Retired Driver', category:'Umum',
    def_id:'Pembalap yang menarik diri dari kompetisi aktif F1 setelah mengakhiri karier balap mereka.',
    def_en:'Driver who has withdrawn from active F1 competition after ending their racing career.',
    fact_id:'Banyak pembalap pensiun beralih ke peran ambassador, analis TV, atau manajemen tim.',
    fact_en:'Many retired drivers transition to ambassador roles, TV analysis, or team management positions.' },

  { term:'Reserve Driver', full:'Backup Race Driver', category:'Umum',
    def_id:'Pembalap cadangan yang siap menggantikan pembalap utama jika terjadi cedera, sakit, atau kondisi darurat.',
    def_en:'Backup driver ready to replace a race driver in the event of injury, illness, or emergency.',
    fact_id:'Reserve driver biasanya tetap aktif dalam program simulator tim untuk menjaga kesiapan mereka.',
    fact_en:'Reserve drivers typically remain active in the team\'s simulator programme to maintain readiness.' },

  { term:'Test Driver', full:'Development Programme Driver', category:'Umum',
    def_id:'Pembalap yang bertugas menguji mobil dalam sesi test resmi dan mengumpulkan data untuk pengembangan mobil.',
    def_en:'Driver who tests the car in official test sessions and collects data for car development.',
    fact_id:'Sesi test resmi sangat terbatas di F1 modern — biasanya hanya di awal dan akhir musim.',
    fact_en:'Official test sessions are highly limited in modern F1 — typically only at the start and end of the season.' },

  { term:'Rookie', full:'First-Season F1 Driver', category:'Umum',
    def_id:'Pembalap yang menjalani musim pertama mereka di Formula 1. Biasanya mendapat lebih banyak permakluman dalam insiden dan mendapat lisensi pembelajaran.',
    def_en:'A driver in their first Formula 1 season. Generally given more leniency in incidents and treated as still learning.',
    fact_id:'Beberapa rookie terbaik sepanjang masa langsung kompetitif di tahun pertama mereka: Alonso, Verstappen, Hamilton.',
    fact_en:'Some of the greatest rookies were immediately competitive in their first year: Alonso, Verstappen, Hamilton.' },

  { term:'FP1 / FP2 / FP3', full:'Free Practice Sessions', category:'Umum',
    def_id:'Tiga sesi latihan bebas sebelum kualifikasi. FP1 dan FP2 di Jumat, FP3 di Sabtu pagi. Digunakan untuk setup mobil, analisis ban, dan simulasi race.',
    def_en:'Three free practice sessions before qualifying. FP1 and FP2 on Friday, FP3 on Saturday morning. Used for car setup, tyre analysis, and race simulation.',
    fact_id:'FP1 wajib memberikan satu tempat kepada rookie yang memenuhi syarat setidaknya dua kali per musim.',
    fact_en:'FP1 must give a seat to an eligible rookie driver at least twice per season under current regulations.' },

  { term:'Out-Lap', full:'Tyre Warm-Up Lap from Pit', category:'Ban',
    def_id:'Lap keluar pit yang digunakan untuk memanaskan ban baru sebelum lap cepat di kualifikasi atau untuk mengoptimalkan kondisi ban di race.',
    def_en:'The lap exiting the pit lane used to bring new tyres up to temperature before a flying lap in qualifying or to optimise tyre condition in the race.',
    fact_id:'Out-lap yang terlalu cepat bisa membuat ban terlalu panas sebelum flying lap yang sesungguhnya.',
    fact_en:'An excessively fast out-lap can overheat tyres before the actual flying lap.' },

  { term:'In-Lap', full:'Lap into Pit Stop', category:'Strategi',
    def_id:'Lap terakhir sebelum masuk pit stop. Pembalap biasanya mengelola ban di in-lap untuk memastikan ban tidak terlalu habis atau rusak sebelum pit.',
    def_en:'The final lap before a pit stop. Drivers typically manage their tyres on the in-lap to ensure they aren\'t overly worn or damaged.',
    fact_id:'Timing in-lap adalah ilmu tersendiri — terlalu cepat bisa membuat ban rusak, terlalu lambat kehilangan waktu.',
    fact_en:'In-lap timing is an art — too fast risks tyre damage, too slow loses precious race time.' },

  { term:'Stint', full:'Continuous Driving Period', category:'Strategi',
    def_id:'Periode mengemudi berkelanjutan antara dua pit stop atau dari start hingga pit pertama.',
    def_en:'Continuous driving period between two pit stops, or from the start to the first stop.',
    fact_id:'Stint terpanjang dalam sejarah F1 modern adalah lebih dari 60 lap tanpa pit stop di race dengan deg ban rendah.',
    fact_en:'The longest stint in modern F1 history exceeds 60 laps without a pit stop in a low-degradation race.' },

  // ══ BAN ═══════════════════════════════════════════════════════════════════
  { term:'Tyre Compound', full:'Rubber Mixture Type', category:'Ban',
    def_id:'Jenis campuran karet ban. Soft C3–C5 (merah) paling cepat tapi cepat habis. Medium C2–C4 (kuning) seimbang. Hard C1–C3 (putih) paling awet tapi lambat.',
    def_en:'Rubber mixture type. Soft C3–C5 (red) fastest but short-lived. Medium C2–C4 (yellow) balanced. Hard C1–C3 (white) most durable but slowest.',
    fact_id:'Pirelli satu-satunya pemasok ban resmi F1 sejak 2011.',
    fact_en:'Pirelli has been the sole official F1 tyre supplier since 2011.' },

  { term:'Intermediates', full:'Wet-Condition Tyre', category:'Ban',
    def_id:'Ban basah ringan bertanda hijau. Ideal untuk lintasan basah tanpa genangan besar. Bisa digunakan saat lintasan mulai mengering.',
    def_en:'Green-marked wet tyre for damp tracks without standing water. Can be used as the track begins to dry.',
    fact_id:'Intermediate adalah pilihan paling kontroversial dalam strategi hujan di F1.',
    fact_en:'Intermediates are the most debated tyre call during changeable weather.' },

  { term:'Full Wet', full:'Extreme Wet Tyre', category:'Ban',
    def_id:'Ban hujan penuh bertanda biru. Untuk hujan lebat dengan genangan air. Mampu membuang hingga 30 liter air per detik per ban.',
    def_en:'Blue-marked extreme wet tyre for heavy rain and standing water. Can displace up to 30 litres of water per second per tyre.',
    fact_id:'Full wet memiliki groove jauh lebih dalam dari intermediate untuk drainase maksimum.',
    fact_en:'Full wets have much deeper grooves than intermediates for maximum drainage.' },

  { term:'Deg', full:'Tyre Degradation Rate', category:'Ban',
    def_id:'Tingkat penurunan performa ban per lap akibat panas dan gesekan. Sirkuit deg tinggi memaksa strategi multi-stop.',
    def_en:'Rate at which tyres lose performance per lap due to heat and friction. High-deg circuits force multi-stop strategies.',
    fact_id:'Deg adalah variabel terpenting dalam menentukan jumlah pit stop optimal.',
    fact_en:'Degradation rate is the most critical variable in determining optimal pit stop count.' },

  { term:'Graining', full:'Tyre Surface Tearing', category:'Ban',
    def_id:'Bulu-bulu karet yang terbentuk akibat sliding berlebihan. Grip menurun sementara, bisa "sembuh" setelah beberapa lap ketika lapisan baru terekspos.',
    def_en:'Small rubber "hairs" from excessive sliding causing temporary grip loss. Can "heal" after a few laps as fresh rubber is exposed.',
    fact_id:'Graining lebih sering pada ban Soft di awal stint sebelum suhu stabil.',
    fact_en:'Graining most commonly occurs on Soft tyres early in a stint before temperatures stabilise.' },

  { term:'Blistering', full:'Tyre Thermal Damage', category:'Ban',
    def_id:'Lepuh di permukaan atau dalam ban akibat panas ekstrem. Tidak bisa pulih — harus segera pit.',
    def_en:'Blisters on or beneath the tyre surface from extreme heat. Cannot recover — immediate pit stop required.',
    fact_id:'Blistering sering terjadi di sirkuit dengan rem berat seperti Monza atau Mexico City.',
    fact_en:'Blistering is common at circuits with heavy braking like Monza or Mexico City.' },

  { term:'Flat Spot', full:'Tyre Lock-Up Damage', category:'Ban',
    def_id:'Area datar pada ban akibat roda terkunci saat rem keras. Menyebabkan getaran hebat di seluruh sasis.',
    def_en:'Flat section formed when a wheel locks up under hard braking. Causes severe vibration through the chassis.',
    fact_id:'Getaran flat spot bisa terasa di setir dan punggung pembalap sekaligus.',
    fact_en:'The vibration from a flat spot can be felt in both the steering wheel and the driver\'s back.' },

  { term:'Tyre Blanket', full:'Pre-Heat Tyre Wrap', category:'Ban',
    def_id:'Selimut listrik yang membungkus ban sebelum dipasang agar ban sudah di suhu kerja (~80°C) sejak keluar pit.',
    def_en:'Electric blankets wrapping tyres before fitting to bring them to optimal working temperature (~80°C).',
    fact_id:'FIA berencana menghapus tyre blanket secara bertahap mulai 2025 untuk hemat energi.',
    fact_en:'The FIA plans to phase out tyre blankets from 2025 to reduce energy consumption.' },

  { term:'Snap Oversteer', full:'Sudden Rear Grip Loss', category:'Ban',
    def_id:'Belakang mobil tiba-tiba kehilangan grip dan berputar ke luar tikungan. Dipicu ban belakang dingin, gas terlalu agresif, atau setup tidak stabil.',
    def_en:'Sudden rear grip loss causing the car rear to rotate outward. Triggered by cold rear tyres, aggressive throttle, or unstable setup.',
    fact_id:'Snap oversteer adalah salah satu penyebab paling umum spin di F1.',
    fact_en:'Snap oversteer is one of the most common causes of spins in Formula 1.' },

  { term:'18-Inch Tyre', full:'Low-Profile Racing Tyre', category:'Ban',
    def_id:'Ban berpelek 18 inci yang diperkenalkan 2022 menggantikan 13 inci. Profil rendah menghasilkan flexing sidewall lebih sedikit, handling lebih prediktabel.',
    def_en:'18-inch rim tyres introduced in 2022, replacing the old 13-inch design. Lower profile reduces sidewall flex for more predictable handling.',
    fact_id:'Transisi ke ban 18 inci membutuhkan redesain total sistem suspensi semua tim.',
    fact_en:'The switch to 18-inch tyres required a complete redesign of every team\'s suspension system.', isNew:true },

  { term:'Super Cycling', full:'Aggressive Tyre Strategy', category:'Ban',
    def_id:'Strategi memakai lebih banyak set ban dalam satu race, berganti ke ban segar lebih sering demi mempertahankan pace puncak. Berisiko tanpa safety car.',
    def_en:'Strategy using more tyre sets per race than usual, cycling through fresh rubber more frequently to maintain peak pace. Risky without a safety car.',
    fact_id:'Super cycling populer kembali di era 2024–2025 dengan ban C5 yang sangat cepat tapi cepat habis.',
    fact_en:'Super cycling regained popularity in 2024–2025 with the ultra-fast but short-lived C5 compound.', isNew:true },

  { term:'Tyre Life', full:'Remaining Tyre Performance', category:'Ban',
    def_id:'Estimasi sisa performa dalam satu set ban. Tim menghitung dari data sensor suhu, tekanan, dan model komputer spesifik sirkuit.',
    def_en:'Estimated performance remaining in a tyre set. Teams calculate using temperature/pressure sensor data and circuit-specific computer models.',
    fact_id:'Estimasi tyre life yang salah bisa memaksa pit stop darurat yang merusak strategi.',
    fact_en:'A misjudged tyre life can force an emergency pit stop that ruins an entire race strategy.' },

  { term:'C1–C5 Scale', full:'Pirelli Compound Numbering', category:'Ban',
    def_id:'Sistem penomoran Pirelli untuk compound. C1 paling keras, C5 paling lunak. Pirelli memilih tiga dari lima compound untuk setiap Grand Prix.',
    def_en:'Pirelli\'s compound numbering system. C1 is hardest, C5 is softest. Pirelli selects three of five compounds for each Grand Prix.',
    fact_id:'C5 digunakan di sirkuit lambat dan teknikal seperti Monaco dan Hungaria.',
    fact_en:'C5 is typically used at slow, technical circuits like Monaco and Hungary.' },

  { term:'Pirelli P Zero', full:'F1 Official Dry Tyre Range', category:'Ban',
    def_id:'Nama komersial untuk lini ban slick kering Pirelli yang digunakan di F1. Dibedakan warna: merah (Soft), kuning (Medium), putih (Hard).',
    def_en:'Commercial name for Pirelli\'s F1 dry slick tyre range. Colour-coded: red (Soft), yellow (Medium), white (Hard).',
    fact_id:'Pirelli P Zero menjadi salah satu produk olahraga paling dikenal di dunia berkat eksposur F1.',
    fact_en:'Pirelli P Zero has become one of the world\'s most recognised sporting products through F1 exposure.' },

  { term:'Tyre Set Allocation', full:'Race Weekend Tyre Quota', category:'Ban',
    def_id:'Jumlah set ban yang diberikan kepada setiap pembalap untuk satu weekend race. Pilihan penggunaan set di setiap sesi berdampak besar pada strategi.',
    def_en:'Number of tyre sets allocated to each driver for a race weekend. How sets are used across sessions significantly impacts race strategy.',
    fact_id:'Pembalap yang menghemat set Soft dari FP bisa memiliki keunggulan besar di race yang basah.',
    fact_en:'A driver saving Soft sets from FP can have a huge advantage if the race turns wet.' },

  { term:'Stagger', full:'Left/Right Tyre Size Difference', category:'Ban',
    def_id:'Perbedaan ukuran ban kiri dan kanan. Tidak umum di F1 karena sirkuit berbelok ke kedua arah, berbeda dari NASCAR yang hanya ke kiri.',
    def_en:'Difference in tyre size between left and right sides. Not used in F1 as circuits turn both ways, unlike NASCAR\'s left-only ovals.',
    fact_id:'F1 tidak menggunakan stagger seperti NASCAR, karena sirkuit F1 berbelok ke kedua arah.',
    fact_en:'F1 doesn\'t use stagger as NASCAR does, as F1 circuits turn in both directions.' },

  { term:'Overheating', full:'Tyre Thermal Runaway', category:'Ban',
    def_id:'Ban terlalu panas hingga karet terlalu lunak dan grip turun drastis. Bersifat sementara dan bisa diatasi dengan mengubah gaya mengemudi.',
    def_en:'Tyres exceed optimal temperature, rubber becomes too soft and grip drops sharply. Temporary — managed by adjusting driving style.',
    fact_id:'Pembalap bisa mendinginkan ban dengan melambat sebentar atau mengurangi beban lateral.',
    fact_en:'Drivers can cool overheating tyres by briefly backing off or reducing lateral loads.' },

  // ══ AERO ══════════════════════════════════════════════════════════════════
  { term:'Downforce', full:'Aerodynamic Vertical Load', category:'Aero',
    def_id:'Gaya aero yang menekan mobil ke aspal meningkatkan grip tikungan. Mobil F1 modern menghasilkan downforce setara 3,5 kali berat mobil itu sendiri.',
    def_en:'Aerodynamic force pressing the car into the track, improving cornering grip. Modern F1 cars generate downforce equivalent to 3.5 times their own weight.',
    fact_id:'Secara teori, mobil F1 bisa berkendara terbalik di langit-langit terowongan pada kecepatan tertentu.',
    fact_en:'In theory, an F1 car could drive upside down in a tunnel at sufficient speed.' },

  { term:'Drag', full:'Aerodynamic Resistance', category:'Aero',
    def_id:'Hambatan udara yang memperlambat mobil. Tim harus menyeimbangkan drag vs downforce sesuai karakteristik sirkuit.',
    def_en:'Air resistance slowing the car. Teams must balance drag against downforce based on circuit characteristics.',
    fact_id:'Di Monza, tim melepas sebagian besar sayap untuk meraih top speed maksimum.',
    fact_en:'At Monza, teams strip as much wing as possible to maximise top speed.' },

  { term:'Dirty Air', full:'Turbulent Wake Air', category:'Aero',
    def_id:'Udara turbulen yang ditinggalkan mobil di depan. Mengurangi downforce mobil di belakang hingga 35–50% di era pra-2022.',
    def_en:'Turbulent air left by the car ahead. Reduced the following car\'s downforce by 35–50% in the pre-2022 era.',
    fact_id:'Regulasi 2022 berhasil menurunkan kehilangan downforce di dirty air dari ~50% menjadi ~18%.',
    fact_en:'The 2022 regulations reduced downforce loss in dirty air from ~50% to just ~18%.' },

  { term:'Ground Effect', full:'Underbody Aero Suction', category:'Aero',
    def_id:'Aliran udara yang dipercepat di bawah mobil menciptakan tekanan rendah yang "menghisap" mobil ke aspal. Dikembalikan ke F1 pada regulasi 2022.',
    def_en:'Accelerated airflow beneath the car creating low pressure that "sucks" the car to the track. Returned to F1 with the 2022 regulations.',
    fact_id:'Colin Chapman memperkenalkan ground effect di F1 melalui Lotus 78 pada 1977.',
    fact_en:'Colin Chapman pioneered F1 ground effect aerodynamics with the Lotus 78 in 1977.' },

  { term:'Porpoising', full:'Aerodynamic Bouncing', category:'Aero',
    def_id:'Mobil memantul ritmis di lurus akibat ground effect yang stall dan reattach bergantian. Masalah besar di awal era 2022.',
    def_en:'Rhythmic bouncing on straights caused by the ground effect repeatedly stalling and reattaching. A major issue in the early 2022 era.',
    fact_id:'Lewis Hamilton mengalami porpoising parah di Baku 2022 hingga kesulitan keluar dari kokpit.',
    fact_en:'Lewis Hamilton suffered severe porpoising at Baku 2022, struggling to exit his cockpit post-race.' },

  { term:'Diffuser', full:'Rear Aero Extractor', category:'Aero',
    def_id:'Komponen belakang bawah yang mempercepat aliran udara keluar dari bawah mobil, menciptakan tekanan rendah dan downforce besar.',
    def_en:'Rear underbody component accelerating airflow exiting beneath the car, creating low pressure and generating significant downforce.',
    fact_id:'Diffuser dapat menghasilkan lebih dari 50% total downforce sebuah mobil F1.',
    fact_en:'The diffuser can generate more than 50% of a modern F1 car\'s total downforce.' },

  { term:'Floor', full:'Underfloor Aero Panel', category:'Aero',
    def_id:'Panel bawah yang sangat kritis untuk downforce. Kerusakan sekecil milimeter pun bisa berdampak besar pada keseimbangan dan performa.',
    def_en:'Critical underbody panel for downforce generation. Even millimetre-level damage can dramatically hurt balance and performance.',
    fact_id:'Kerusakan floor akibat serempetan atau kerb adalah masalah paling ditakuti dalam race.',
    fact_en:'Floor damage from kerb strikes or collisions is one of the most feared mid-race problems.' },

  { term:'Mini DRS', full:'Passive Drag Reduction Device', category:'Aero',
    def_id:'Sistem pasif menggunakan aliran udara dari sayap depan untuk membuka celah di sayap belakang secara alami di kecepatan tinggi.',
    def_en:'Passive system using airflow from the front wing to naturally open a slot in the rear wing at high speed, reducing drag without mechanical actuators.',
    fact_id:'Red Bull RB19 (2023) menggunakan mini-DRS canggih sebagai keunggulan kompetitif utama.',
    fact_en:'The Red Bull RB19 (2023) used a highly advanced mini-DRS as a key competitive advantage.', isNew:true },

  { term:'Beam Wing', full:'Secondary Rear Wing', category:'Aero',
    def_id:'Sayap kecil di bawah sayap belakang utama untuk mengontrol aliran udara ke diffuser dan meningkatkan efisiensi aero.',
    def_en:'Small wing mounted below the main rear wing. Controls airflow entering the diffuser and improves overall aerodynamic efficiency.',
    fact_id:'Tinggi dan sudut beam wing sering menjadi subjek protes teknis di F1.',
    fact_en:'The height and angle of the beam wing is frequently the subject of technical protests.' },

  { term:'Rake', full:'Car Ride Height Angle', category:'Aero',
    def_id:'Sudut kemiringan mobil dari depan (rendah) ke belakang (tinggi). Rake tinggi memaksimalkan ground effect tapi meningkatkan risiko porpoising.',
    def_en:'Angle of the car from front (low) to rear (high). High rake maximises ground effect but increases porpoising risk.',
    fact_id:'Filosofi rake menjadi perbedaan teknis utama antar tim papan atas selama beberapa musim.',
    fact_en:'Rake philosophy was a key technical differentiator between top teams for several seasons.' },

  { term:'Front Wing', full:'Forward Aerodynamic Splitter', category:'Aero',
    def_id:'Sayap paling depan mobil yang berfungsi menghasilkan downforce dan mengarahkan aliran udara ke seluruh mobil.',
    def_en:'Frontmost wing generating downforce and directing airflow over the entire car. The first component to be damaged in incidents.',
    fact_id:'Sayap depan F1 modern terdiri dari lebih dari 30 elemen terpisah yang bekerja bersama.',
    fact_en:'A modern F1 front wing consists of over 30 separate elements working in concert.' },

  { term:'Rear Wing', full:'Rear Downforce Generator', category:'Aero',
    def_id:'Sayap di belakang mobil yang menghasilkan downforce dan stabilitas. Tingkat sayap disesuaikan sesuai kebutuhan kecepatan vs grip setiap sirkuit.',
    def_en:'Rear wing generating downforce and stability. Wing angle adjusted to balance speed against grip requirements for each circuit.',
    fact_id:'Sudut sayap belakang bisa diubah beberapa derajat saja untuk menghasilkan perbedaan performa signifikan.',
    fact_en:'Changing the rear wing angle by just a few degrees can produce a significant performance difference.' },

  { term:'Sidepod', full:'Engine Cover Cooling Intake', category:'Aero',
    def_id:'Panel samping mobil yang berfungsi sebagai intake udara pendingin radiator dan mempengaruhi aliran aero ke belakang.',
    def_en:'Side panels serving as cooling air intakes for radiators while influencing aerodynamic flow to the rear.',
    fact_id:'Mercedes W13 (2022) memperkenalkan desain "zero sidepod" yang kontroversial dan akhirnya kurang sukses.',
    fact_en:'The Mercedes W13 (2022) debuted a controversial "zero sidepod" concept that ultimately underperformed.' },

  { term:'Active Aero 2026', full:'2026 Moveable Wing System', category:'Aero',
    def_id:'Sistem aerodinamika aktif yang menggantikan DRS di regulasi 2026. Pembalap bisa menyesuaikan konfigurasi sayap di zona tertentu.',
    def_en:'Active aerodynamic system replacing DRS in the 2026 regulations. Drivers can adjust wing configuration in designated zones to reduce drag and facilitate overtaking.',
    fact_id:'Berbeda dari DRS, active aero 2026 juga dapat menambah downforce di tikungan tertentu.',
    fact_en:'Unlike DRS, the 2026 active aero system can also increase downforce at specific corners.', isNew:true },

  { term:'Slipstream', full:'Aerodynamic Draft', category:'Aero',
    def_id:'Zona tekanan rendah di belakang mobil yang sedang bergerak. Mobil yang mengikuti di dalam slipstream dapat mencapai kecepatan lebih tinggi.',
    def_en:'Low-pressure zone behind a moving car. A following car in the slipstream reaches higher speeds with the same power due to reduced drag.',
    fact_id:'Slipstream bisa memberikan keuntungan kecepatan 5–10 km/jam di lurus panjang tanpa DRS sekalipun.',
    fact_en:'A slipstream can provide a 5–10 km/h speed advantage on long straights even without DRS.' },

  { term:'Wake', full:'Aerodynamic Air Trail', category:'Aero',
    def_id:'Jejak udara terganggu yang ditinggalkan mobil bergerak, mencakup dirty air, udara panas dari mesin/rem, dan vortex dari ban.',
    def_en:'Trail of disturbed air left by a moving car, including dirty air, hot exhaust and brake air, and tyre vortices.',
    fact_id:'Wake dapat membentang sejauh 10–15 panjang mobil di belakang sebuah F1 car.',
    fact_en:'A wake can extend 10–15 car lengths behind an F1 car at racing speeds.' },

  { term:'Winglet', full:'Small Secondary Aero Surface', category:'Aero',
    def_id:'Sayap kecil tambahan yang dipasang di berbagai lokasi mobil untuk mengarahkan aliran udara secara presisi atau menghasilkan downforce tambahan.',
    def_en:'Small additional wing surface mounted at various locations on the car to precisely direct airflow or generate incremental downforce.',
    fact_id:'Jumlah winglet yang diizinkan dibatasi secara ketat oleh regulasi aero 2022 untuk menyederhanakan mobil.',
    fact_en:'The number of permitted winglets is strictly limited by the 2022 aero regulations to simplify cars.' },

  { term:'Vortex Generator', full:'Flow Conditioning Device', category:'Aero',
    def_id:'Elemen kecil berbentuk fin atau tab yang menciptakan pusaran udara mini untuk mengontrol aliran udara pada area spesifik di bodi mobil.',
    def_en:'Small fin or tab elements creating mini vortices to control airflow over specific body areas of the car.',
    fact_id:'Vortex generator sering dipasang di tepi floor dan sidepod untuk mengurangi dirty air dari roda depan.',
    fact_en:'Vortex generators are often placed at floor edges and sidepods to redirect dirty air from the front wheels.' },

  { term:'Stall', full:'Aerodynamic Flow Separation', category:'Aero',
    def_id:'Kondisi di mana aliran udara terputus dari permukaan aero, menyebabkan hilangnya downforce secara tiba-tiba. Terjadi saat angle of attack terlalu tinggi.',
    def_en:'Condition where airflow separates from an aerodynamic surface, causing sudden downforce loss. Occurs when the angle of attack is too high.',
    fact_id:'Stalling diffuser adalah mekanisme di balik porpoising — siklus stall dan reattach yang berulang.',
    fact_en:'Diffuser stalling is the mechanism behind porpoising — a repeating cycle of stall and reattachment.' },

  { term:'L/D Ratio', full:'Lift-to-Drag Ratio', category:'Aero',
    def_id:'Rasio antara downforce yang dihasilkan dibandingkan dengan drag yang diciptakan. Efisiensi aerodinamika yang lebih tinggi berarti lebih banyak downforce dengan drag lebih sedikit.',
    def_en:'Ratio of downforce generated versus drag created. Higher aerodynamic efficiency means more downforce for less drag penalty.',
    fact_id:'Meningkatkan L/D ratio satu persen bisa menghasilkan peningkatan lap time beberapa persepuluh detik.',
    fact_en:'Improving the L/D ratio by one percent can produce lap time gains of several tenths of a second.' },

  // ══ STRATEGI ══════════════════════════════════════════════════════════════
  { term:'Undercut', full:'Strategic Early Pit Stop', category:'Strategi',
    def_id:'Masuk pit lebih awal dari lawan untuk mendapatkan ban segar, lalu menghasilkan lap cepat sebelum lawan pit. Posisi bisa berpindah ketika lawan akhirnya masuk pit.',
    def_en:'Pitting earlier than a rival for fresh tyres, then setting fast laps before they pit. Position can be stolen when the rival eventually stops.',
    fact_id:'Undercut paling efektif di sirkuit dengan lap time singkat di mana pit stop cost relatif kecil.',
    fact_en:'Undercuts are most effective at circuits with short lap times where pit stop cost is relatively small.' },

  { term:'Free Stop', full:'Cost-Free Pit Stop', category:'Strategi',
    def_id:'Pit stop saat Safety Car atau VSC aktif sehingga tidak kehilangan waktu relatif terhadap kompetitor.',
    def_en:'Pit stop taken under Safety Car or VSC, losing no relative time to competitors.',
    fact_id:'Tim terkadang sengaja menunggu Safety Car sebelum melakukan pit stop terencana.',
    fact_en:'Teams sometimes deliberately wait for a Safety Car before executing a planned pit stop.' },

  { term:'Stack', full:'Double Team Pit Stop', category:'Strategi',
    def_id:'Kedua mobil dari tim yang sama masuk pit bersamaan. Berisiko — satu mobil bisa tertahan di pit box menunggu rekan setimnya selesai dilayani.',
    def_en:'Both team cars pitting simultaneously. High-risk — one car may be held in the pit box while the other is serviced.',
    fact_id:'Stack biasanya diambil sebagai reaksi cepat terhadap Safety Car atau ancaman hujan.',
    fact_en:'Stacking is usually a reactive call under Safety Car or an imminent rain threat.' },

  { term:'Delta Time', full:'Target Lap Time Gap', category:'Strategi',
    def_id:'Selisih antara lap aktual dan target lap ideal. Wajib dijaga ketat saat VSC — terlalu cepat atau lambat sama-sama kena penalti.',
    def_en:'Gap between actual lap time and ideal target. Must be maintained precisely under VSC — going too fast or too slow both result in penalties.',
    fact_id:'Pembalap memantau delta time di layar kemudi secara real-time selama VSC.',
    fact_en:'Drivers monitor delta time on their steering wheel display in real time during VSC.' },

  { term:'Alternate Strategy', full:'Split Team Strategy', category:'Strategi',
    def_id:'Kedua pembalap dari tim yang sama menjalankan strategi berbeda (misalnya one-stop vs two-stop) untuk memaksimalkan data race dan peluang hasil optimal.',
    def_en:'Both drivers running different strategies (e.g., one-stop vs two-stop) to maximise race data and improve the odds of an optimal result.',
    fact_id:'Split strategy sering digunakan di race dengan kondisi cuaca atau safety car tidak terprediksi.',
    fact_en:'Split strategies are most common in races with unpredictable weather or safety car probability.' },

  { term:'Tyre Window', full:'Optimal Pit Stop Timing', category:'Strategi',
    def_id:'Rentang lap ideal untuk pit stop di mana ban sudah cukup habis tapi belum melewati cliff performa kritis.',
    def_en:'Ideal lap range for a pit stop — tyres are sufficiently used but haven\'t crossed a performance cliff.',
    fact_id:'Strategy engineer memantau "degradation cliff" untuk menentukan tyre window yang tepat.',
    fact_en:'Strategy engineers monitor the "degradation cliff" to pinpoint the exact tyre window.', isNew:true },

  { term:'Cover Stop', full:'Reactive Pit Stop', category:'Strategi',
    def_id:'Pit stop sebagai reaksi langsung terhadap pit stop lawan untuk mencegah mereka keluar di depan dengan ban segar.',
    def_en:'Pit stop made as a direct reaction to a rival\'s stop, preventing them from emerging ahead with fresh tyres.',
    fact_id:'Cover stop sering terjadi antara dua mobil yang berduel ketat dalam 3–5 detik satu sama lain.',
    fact_en:'Cover stops most commonly occur when two cars are battling within 3–5 seconds of each other.', isNew:true },

  { term:'Tyre Conservation', full:'Pace Management Strategy', category:'Strategi',
    def_id:'Taktik memperlambat secara sengaja untuk menjaga ban, lalu menyerang di akhir stint ketika lawan sudah mendegradasi ban mereka.',
    def_en:'Deliberately backing off to preserve tyres, then attacking in the final stint when rivals have degraded theirs.',
    fact_id:'Max Verstappen dikenal sebagai maestro taktik ini — tampak lambat di awal tapi dominan di akhir.',
    fact_en:'Max Verstappen is renowned for this tactic — appearing slow early but dominant in the closing phase.', isNew:true },

  { term:'Lapped Traffic', full:'Backmarker Interference', category:'Strategi',
    def_id:'Mobil yang tertinggal satu lap atau lebih dari pemimpin race. Bisa menghambat atau justru menciptakan peluang overtaking tidak terduga.',
    def_en:'Cars at least one lap behind the race leader. Can disrupt or create unexpected overtaking opportunities.',
    fact_id:'Strategi sering terpengaruh oleh posisi lapped traffic saat safety car masuk.',
    fact_en:'Strategy can be significantly shaped by where lapped traffic is positioned when the safety car deploys.' },

  { term:'Fuel Load', full:'Race Starting Fuel Weight', category:'Strategi',
    def_id:'Jumlah bahan bakar yang dibawa mobil saat start race — biasanya ~100 kg. Lebih banyak bahan bakar = lebih lambat di awal tapi tidak perlu hemat di akhir.',
    def_en:'Amount of fuel the car carries at race start — typically ~100 kg. More fuel means slower early pace but no need to conserve late.',
    fact_id:'Setiap 10 kg bahan bakar tambahan membuat mobil sekitar 0,3 detik lebih lambat per lap.',
    fact_en:'Every additional 10 kg of fuel makes the car approximately 0.3 seconds slower per lap.' },

  { term:'Two-Stop Strategy', full:'Double Pit Stop Race Plan', category:'Strategi',
    def_id:'Strategi masuk pit dua kali dalam satu race. Umum di sirkuit dengan deg ban tinggi atau race panjang.',
    def_en:'Strategy involving two pit stops per race. Common at high-tyre-degradation circuits. Provides fresher tyres but sacrifices time for two stops.',
    fact_id:'Di musim 2023–2025, dua stop menjadi norma di hampir semua sirkuit karena deg ban yang tinggi.',
    fact_en:'In 2023–2025, two-stop strategies became the norm at nearly all circuits due to high tyre degradation.' },

  { term:'Safety Car Window', full:'Safety Car Exploitation Period', category:'Strategi',
    def_id:'Interval waktu di awal atau pertengahan race di mana tim berharap safety car akan keluar sehingga mereka bisa menunda pit stop untuk mendapatkan free stop.',
    def_en:'Time window in the early-to-mid race when teams hope a safety car will appear so they can delay their pit stop for a free stop.',
    fact_id:'Menghitung probabilitas safety car adalah bagian integral dari perencanaan strategi modern F1.',
    fact_en:'Calculating safety car probability is an integral part of modern F1 race strategy planning.' },

  { term:'Outsmart', full:'Strategic Intelligence Win', category:'Strategi',
    def_id:'Kemenangan yang diraih melalui keputusan strategis superior daripada kecepatan murni.',
    def_en:'Victory achieved through superior strategic decision-making rather than raw speed alone.',
    fact_id:'Banyak grand prix paling berkesan dimenangkan melalui strategi jenius, bukan kecepatan.',
    fact_en:'Many of F1\'s most memorable races have been won through genius strategy rather than outright speed.' },

  { term:'Virtual Racing Line', full:'Optimal Corner Path', category:'Strategi',
    def_id:'Jalur teoritis terpendek melalui setiap tikungan yang menghasilkan lap time terbaik. Pembalap berusaha mendekati jalur ini semaksimal mungkin dalam kondisi race.',
    def_en:'The theoretically shortest path through each corner producing the best lap time. Drivers aim to follow this line as closely as possible during racing conditions.',
    fact_id:'Dalam race nyata, pembalap sering menyimpang dari racing line ideal untuk mempertahankan atau menyerang posisi.',
    fact_en:'In real racing, drivers often deviate from the ideal line to defend or attack positions.' },

  { term:'Anti-Strategy', full:'Opposition Mirror Strategy', category:'Strategi',
    def_id:'Strategi di mana satu tim secara khusus merancang rencana balapan untuk merusak atau memblokir strategi lawan tertentu, bukan hanya mengoptimalkan hasil mereka sendiri.',
    def_en:'A strategy where one team specifically designs their race plan to undermine or block a particular rival\'s strategy, rather than purely optimising their own result.',
    fact_id:'Ferrari terkenal sering menggunakan anti-strategy terhadap Red Bull di era Vettel dan Leclerc.',
    fact_en:'Ferrari are known for frequently deploying anti-strategies against Red Bull in various eras.', isNew:true },

  { term:'Strategic Miscalculation', full:'Race Strategy Error', category:'Strategi',
    def_id:'Kesalahan kalkulasi strategi yang mengakibatkan kerugian posisi atau waktu signifikan — bisa berupa pit stop terlalu awal, terlalu lambat, atau salah baca kondisi ban.',
    def_en:'A strategy calculation error resulting in significant position or time loss — whether pitting too early, too late, or misreading tyre conditions.',
    fact_id:'Ferrari 2023 di Monza adalah contoh klasik miscalculation pit stop yang merugikan Leclerc.',
    fact_en:'Ferrari\'s 2023 Monza race is a classic example of a pit stop miscalculation that cost Leclerc.' },

  // ══ TEKNIK ════════════════════════════════════════════════════════════════
  { term:'Chassis', full:'Car Structural Frame', category:'Teknik',
    def_id:'Struktur utama mobil F1 dari carbon fibre. Mencakup monocoque kokpit, mounting point suspensi, dan semua komponen utama lainnya.',
    def_en:'The main structural component of an F1 car, made from carbon fibre. Includes the monocoque cockpit, suspension mounting points, and all major components.',
    fact_id:'Monocoque F1 harus lolos uji crash test ekstrem yang ditetapkan FIA sebelum boleh digunakan.',
    fact_en:'An F1 monocoque must pass extreme FIA crash tests before it can be used in competition.' },

  { term:'Monocoque', full:'Single-Shell Cockpit Structure', category:'Teknik',
    def_id:'Struktur satu-kesatuan yang berfungsi sebagai rangka, pelindung pembalap, dan penyangga komponen. Dari carbon fibre berlapis-lapis.',
    def_en:'Single-shell structure simultaneously serving as the frame, driver protection, and component mounting. Constructed from layered carbon fibre.',
    fact_id:'Pembuatan satu monocoque F1 bisa memakan hingga 3.000 jam kerja manusia.',
    fact_en:'Manufacturing a single F1 monocoque can take up to 3,000 man-hours of work.' },

  { term:'Halo', full:'Cockpit Head Protection Device', category:'Teknik',
    def_id:'Struktur titanium yang mengelilingi kepala pembalap untuk perlindungan dari benturan dan puing. Wajib sejak 2018. Mampu menahan beban setara 12 mobil F1.',
    def_en:'Titanium ring structure surrounding the driver\'s head for protection from impacts and debris. Mandatory since 2018. Can withstand a load equivalent to 12 F1 cars.',
    fact_id:'Halo menyelamatkan nyawa Romain Grosjean di kecelakaan dramatis di Bahrain 2020.',
    fact_en:'The Halo saved Romain Grosjean\'s life in the dramatic Bahrain 2020 fireball crash.' },

  { term:'Carbon Fibre', full:'Composite Structural Material', category:'Teknik',
    def_id:'Material komposit ultra-ringan dari serat karbon dalam matriks resin. Rasio kekuatan-berat yang luar biasa — digunakan di hampir setiap komponen mobil F1.',
    def_en:'Ultra-lightweight composite material of carbon fibres in a resin matrix. Extraordinary strength-to-weight ratio used in almost every F1 car component.',
    fact_id:'Sebuah mobil F1 mengandung sekitar 80.000 bagian terpisah, mayoritas dari carbon fibre.',
    fact_en:'An F1 car contains approximately 80,000 separate parts, the majority made from carbon fibre.' },

  { term:'Suspension', full:'Wheel Movement Control System', category:'Teknik',
    def_id:'Sistem yang menghubungkan roda ke sasis dan mengontrol gerak roda. Meliputi pushrod, pullrod, wishbone, dan damper. F1 melarang suspensi aktif sejak 1994.',
    def_en:'System connecting wheels to the chassis and controlling wheel movement. Includes pushrods, pullrods, wishbones, and dampers. Active suspension banned since 1994.',
    fact_id:'Williams FW15C (1993) punya suspensi aktif sangat canggih yang membuatnya hampir tak terkalahkan.',
    fact_en:'The 1993 Williams FW15C had incredibly advanced active suspension that made it nearly unbeatable.' },

  { term:'DAS', full:'Dual-Axis Steering', category:'Teknik',
    def_id:'Sistem kemudi inovatif Mercedes yang memungkinkan pembalap mendorong/menarik setir untuk mengubah toe angle ban depan. Diizinkan hanya di musim 2020.',
    def_en:'Innovative Mercedes steering system allowing drivers to push/pull the wheel to change front tyre toe angle. Permitted only in the 2020 season.',
    fact_id:'FIA melarang DAS mulai 2021 setelah Mercedes membuktikan manfaatnya sepanjang 2020.',
    fact_en:'The FIA banned DAS from 2021 after Mercedes proved its significant performance benefit during 2020.' },

  { term:'Plank', full:'Skid Block', category:'Teknik',
    def_id:'Papan komposit di bawah mobil untuk mengatur ride height minimum. Ketebalan diperiksa setelah race — keausan berlebihan bisa menyebabkan DSQ.',
    def_en:'Composite board mounted beneath the car to regulate minimum ride height. Thickness checked post-race — excessive wear can result in DSQ.',
    fact_id:'Schumacher di-DSQ dari San Marino GP 1994 karena keausan plank melebihi batas yang diizinkan.',
    fact_en:'Schumacher was DSQ\'d from the 1994 San Marino GP due to excessive plank wear.' },

  { term:'Wind Tunnel', full:'Aerodynamic Testing Facility', category:'Teknik',
    def_id:'Fasilitas pengujian di mana model skala atau mobil penuh diuji aliran udara untuk mengembangkan aerodinamika. FIA membatasi penggunaan wind tunnel berdasarkan posisi klasemen.',
    def_en:'Testing facility where scale models or full cars are tested in controlled airflow to develop aerodynamics. FIA limits wind tunnel usage based on championship standings.',
    fact_id:'Tim di posisi bawah klasemen mendapat lebih banyak jam wind tunnel untuk mendorong pemerataan kompetisi.',
    fact_en:'Lower-placed teams receive more wind tunnel time to encourage closer competition.' },

  { term:'CFD', full:'Computational Fluid Dynamics', category:'Teknik',
    def_id:'Simulasi komputer yang menggantikan sebagian uji wind tunnel. Tim menggunakan CFD untuk memodelkan aliran udara di sekitar mobil secara virtual.',
    def_en:'Computer simulation partly replacing wind tunnel testing. Teams use CFD to model airflow around the car virtually before manufacturing physical components.',
    fact_id:'FIA membatasi jam CFD per minggu berdasarkan posisi klasemen, sama seperti wind tunnel.',
    fact_en:'The FIA limits CFD hours per week based on championship standings, mirroring wind tunnel restrictions.' },

  { term:'Flexing Wing', full:'Deformable Aerodynamic Component', category:'Teknik',
    def_id:'Sayap yang sengaja dibuat fleksibel secara ilegal untuk menjadi lebih datar (low-drag) di kecepatan tinggi namun lulus uji statis FIA.',
    def_en:'Wing deliberately made to flex illegally — becoming flatter (lower drag) at high speed while passing FIA static tests.',
    fact_id:'FIA memperketat uji fleksibilitas sayap depan dan belakang setelah kontroversi musim 2021.',
    fact_en:'The FIA tightened wing flexibility tests for both front and rear wings after 2021 controversy.' },

  { term:'Underfloor Tunnel', full:'Venturi Channel', category:'Teknik',
    def_id:'Terowongan berbentuk Venturi di bawah mobil yang mempercepat aliran udara untuk menciptakan efek hisap (suction). Inti dari konsep ground effect yang dikembalikan di 2022.',
    def_en:'Venturi-shaped tunnel under the car accelerating airflow to create suction. The core of the ground effect concept reintroduced in 2022.',
    fact_id:'Bentuk dan ukuran Venturi tunnel diatur ketat dalam regulasi teknis 2022 dan seterusnya.',
    fact_en:'The shape and size of Venturi tunnels are strictly regulated under the 2022 and subsequent technical rules.' },

  { term:'Ride Height', full:'Car-to-Ground Clearance', category:'Teknik',
    def_id:'Jarak antara bagian bawah mobil dan aspal. Ride height lebih rendah menghasilkan lebih banyak ground effect tapi meningkatkan risiko bottoming out.',
    def_en:'Distance between the car\'s underfloor and the track surface. Lower ride height generates more ground effect but increases bottoming out risk.',
    fact_id:'Tim terus-menerus mengoptimalkan ride height sepanjang akhir pekan untuk menyeimbangkan performa dan keselamatan.',
    fact_en:'Teams continuously optimise ride height throughout the race weekend to balance performance and safety.' },

  { term:'Gear Ratio', full:'Transmission Speed Setting', category:'Teknik',
    def_id:'Rasio yang menentukan berapa banyak putaran roda per putaran mesin. Tim memilih gear ratio khusus untuk setiap sirkuit berdasarkan karakteristik akselerasi vs top speed.',
    def_en:'Ratio determining how many wheel rotations occur per engine revolution. Teams select circuit-specific gear ratios based on acceleration versus top speed requirements.',
    fact_id:'Setiap tim hanya boleh menggunakan satu set gear ratio per musim setelah homologasi awal.',
    fact_en:'Each team may only use one set of gear ratios per season after their initial homologation.' },

  { term:'Brake Bias', full:'Front/Rear Braking Balance', category:'Teknik',
    def_id:'Distribusi daya pengereman antara ban depan dan belakang. Pembalap bisa menyesuaikan brake bias selama race menggunakan kontrol di kemudi.',
    def_en:'Distribution of braking force between front and rear tyres. Drivers can adjust brake bias during the race using steering wheel controls.',
    fact_id:'Penyesuaian brake bias yang tepat saat ban mulai habis bisa menyelamatkan beberapa detik per lap.',
    fact_en:'Correct brake bias adjustment as tyres wear can save several seconds per lap.' },

  { term:'Anti-Stall', full:'Engine Stall Prevention System', category:'Teknik',
    def_id:'Sistem elektronik yang mencegah mesin mati ketika mobil berhenti mendadak atau kopling dilepas tidak sempurna.',
    def_en:'Electronic system preventing the engine from stalling when the car stops suddenly or the clutch is released imperfectly.',
    fact_id:'Kegagalan anti-stall adalah salah satu penyebab umum pembalap tidak berhasil melakukan race start.',
    fact_en:'Anti-stall failure is one of the most common causes of a driver failing to make a race start.' },

  { term:'Sim Racing', full:'Driving Simulator Training', category:'Teknik',
    def_id:'Simulator mengemudi canggih yang digunakan pembalap dan tim untuk berlatih sirkuit baru, menguji setup, dan mengembangkan strategi.',
    def_en:'Advanced driving simulator used by drivers and teams to practise new circuits, test setups, and develop strategies without using the physical car.',
    fact_id:'Beberapa tim menghabiskan lebih dari 1.000 jam per tahun di simulator untuk pengembangan mobil.',
    fact_en:'Some teams spend over 1,000 hours per year in the simulator for car development.' },

  { term:'OBD', full:'On-Board Data Logger', category:'Teknik',
    def_id:'Sistem logging data yang merekam ratusan parameter secara real-time di dalam mobil: kecepatan, throttle, rem, steering, suhu, tekanan, dan lainnya.',
    def_en:'Data logging system recording hundreds of parameters in real-time aboard the car: speed, throttle, braking, steering, temperatures, pressures, and more.',
    fact_id:'Sebuah mobil F1 bisa menghasilkan lebih dari 1.500 data channel yang dikirim ke pit wall secara real-time.',
    fact_en:'An F1 car can transmit over 1,500 data channels to the pit wall in real time.' },

  { term:'Traction Control', full:'Anti-Wheelspin Electronic Aid', category:'Teknik',
    def_id:'Sistem elektronik yang mencegah roda belakang spinning berlebihan saat akselerasi. Dilarang di F1 sejak 2008.',
    def_en:'Electronic system preventing excessive rear wheel spin during acceleration. Banned in F1 since 2008 — drivers must manage throttle input manually.',
    fact_id:'Era tanpa traction control membuat driver skill menjadi pembeda yang jauh lebih besar.',
    fact_en:'The no-traction-control era makes raw driver skill a far more significant differentiator.' },

  { term:'ABS', full:'Anti-lock Braking System', category:'Teknik',
    def_id:'Sistem yang mencegah roda terkunci saat pengereman ekstrem. Dilarang di F1 — pembalap harus memaksimalkan daya pengereman secara manual.',
    def_en:'System preventing wheel lock-up under extreme braking. Banned in F1 — drivers must maximise braking force manually without locking the wheels.',
    fact_id:'Tanpa ABS, flat spot akibat lock-up adalah risiko konstan yang harus dikelola pembalap secara aktif.',
    fact_en:'Without ABS, flat spots from lock-ups are a constant risk that drivers must actively manage.' },

  { term:'Torque Vectoring', full:'Differential Torque Distribution', category:'Teknik',
    def_id:'Distribusi torsi yang berbeda ke roda kiri dan kanan menggunakan differential elektronik untuk meningkatkan traksi dan stabilitas di tikungan.',
    def_en:'Differential torque distribution to left and right wheels using an electronic differential to improve traction and stability in corners.',
    fact_id:'Sistem differential F1 modern sangat canggih dan dikalibrasi ulang untuk setiap tikungan di setiap sirkuit.',
    fact_en:'Modern F1 differential systems are incredibly sophisticated, recalibrated for every corner at every circuit.' },

  { term:'Steering Wheel', full:'F1 Driver Control Panel', category:'Teknik',
    def_id:'Alat kontrol canggih dengan lebih dari 25 tombol dan dial yang memungkinkan pembalap mengubah mode mesin, ERS, rem, differential, dan lainnya saat berkendara.',
    def_en:'Sophisticated control device with over 25 buttons and dials allowing drivers to adjust engine modes, ERS, brakes, differential, and more while driving.',
    fact_id:'Setir F1 modern berharga lebih dari $50.000 — lebih mahal dari kebanyakan mobil jalan raya.',
    fact_en:'A modern F1 steering wheel costs over $50,000 — more than most road cars.' },

  { term:'Wheel Gun', full:'Pneumatic Wheel Nut Driver', category:'Teknik',
    def_id:'Alat pneumatik berkecepatan tinggi untuk melepas dan memasang wheel nut saat pit stop. Tim top bisa pit stop dalam waktu di bawah 2 detik.',
    def_en:'High-speed pneumatic tool for removing and attaching wheel nuts during pit stops. Top teams can complete a pit stop in under 2 seconds.',
    fact_id:'Red Bull memegang rekor pit stop tercepat F1: 1.80 detik di Brasil 2019.',
    fact_en:'Red Bull hold the F1 pit stop record: 1.80 seconds at the 2019 Brazilian Grand Prix.' },

  { term:'Ballast', full:'Weight Distribution Mass', category:'Teknik',
    def_id:'Bobot tambahan yang dipasang di lokasi strategis di mobil untuk mencapai distribusi berat optimal. Tim mengatur posisi ballast untuk menyesuaikan keseimbangan aero dan handling.',
    def_en:'Additional weight placed at strategic locations in the car to achieve optimal weight distribution. Teams adjust ballast positioning to fine-tune aero balance and handling.',
    fact_id:'Beberapa tim menggunakan tungsten ballast karena densitasnya yang sangat tinggi memungkinkan penempatan lebih fleksibel.',
    fact_en:'Some teams use tungsten ballast due to its extreme density allowing more flexible positioning.' },

  { term:'Bib Sensor', full:'Underfloor Deflection Sensor', category:'Teknik',
    def_id:'Sensor fleksibilitas yang dipasang FIA di bawah mobil untuk mengukur apakah floor memenuhi persyaratan kekakuan minimum.',
    def_en:'FIA-mandated flexibility sensor on the underfloor measuring whether the floor meets minimum stiffness requirements.',
    fact_id:'Sensor bib diperketat setelah kontroversi fleksibilitas floor pada 2022.',
    fact_en:'Bib sensors were tightened following the floor flexibility controversy in 2022.', isNew:true },

  { term:'Throttle Map', full:'Engine Throttle Response Calibration', category:'Teknik',
    def_id:'Kalibrasi bagaimana mesin merespons input pedal gas pembalap. Tim menyesuaikan throttle map untuk setiap sirkuit dan bahkan setiap tikungan.',
    def_en:'Calibration of how the engine responds to driver throttle input. Teams adjust throttle maps for each circuit and corner to optimise traction.',
    fact_id:'Throttle map yang agresif di sirkuit basah atau tikungan lambat bisa menyebabkan wheelspin berlebihan.',
    fact_en:'An aggressive throttle map on a wet circuit or slow corners can cause excessive wheelspin.' },

  { term:'Carbon Brake Disc', full:'High-Temp Braking Component', category:'Teknik',
    def_id:'Cakram rem dari karbon-karbon komposit yang digunakan di F1. Beroperasi pada suhu hingga 1.000°C dan mampu menghasilkan pengereman G-force ekstrem.',
    def_en:'Carbon-carbon composite brake disc used in F1. Operates at temperatures up to 1,000°C and capable of generating extreme braking G-forces.',
    fact_id:'Cakram karbon F1 memiliki berat hanya ~1 kg namun dapat menahan gaya pengereman luar biasa.',
    fact_en:'F1 carbon brake discs weigh just ~1 kg yet can withstand extraordinary braking forces.' },

  { term:'Brake Duct', full:'Brake Cooling Airflow Channel', category:'Teknik',
    def_id:'Saluran yang mengarahkan udara dingin ke rem untuk mencegah overheat. Ukuran dan desainnya disesuaikan dengan karakteristik rem setiap sirkuit.',
    def_en:'Channel directing cooling air to the brakes to prevent overheating. Size and design adjusted to match each circuit\'s braking characteristics.',
    fact_id:'Di Monaco dengan banyak pengereman, brake duct lebih besar digunakan dibanding di Monza.',
    fact_en:'At Monaco with its frequent heavy braking, larger brake ducts are used compared to Monza.' },

  { term:'Suspension Geometry', full:'Wheel Alignment Configuration', category:'Teknik',
    def_id:'Konfigurasi sudut dan jarak wheel — camber, toe, caster — yang menentukan bagaimana ban bersentuhan dengan aspal dan respons handling mobil.',
    def_en:'Configuration of wheel angles and distances — camber, toe, caster — determining how tyres contact the road and the car\'s handling response.',
    fact_id:'Perubahan kecil dalam geometry suspensi bisa mengubah karakteristik handling secara dramatis.',
    fact_en:'Small changes in suspension geometry can dramatically alter the handling characteristics of the car.' },

  { term:'Heave Spring', full:'Vertical Body Movement Damper', category:'Teknik',
    def_id:'Pegas tambahan yang mengontrol gerakan vertikal sasis secara keseluruhan (heave), berbeda dari pegas utama yang mengontrol gerakan tiap roda secara individual.',
    def_en:'Additional spring controlling overall chassis vertical movement (heave), separate from the primary springs controlling each individual wheel\'s movement.',
    fact_id:'Heave spring adalah komponen kunci dalam mengontrol ride height dan porpoising di era ground effect.',
    fact_en:'The heave spring is a key component in controlling ride height and porpoising in the ground effect era.', isNew:true },

  { term:'Roll Bar', full:'Anti-Roll Stiffness Device', category:'Teknik',
    def_id:'Komponen yang menghubungkan roda kiri dan kanan untuk mengontrol body roll saat menikung. Kekakuan anti-roll bar mempengaruhi keseimbangan understeer/oversteer.',
    def_en:'Component linking left and right wheels to control body roll during cornering. Anti-roll bar stiffness influences the understeer/oversteer balance.',
    fact_id:'Tim dapat mengubah kekakuan roll bar antar sesi untuk menyesuaikan karakteristik handling.',
    fact_en:'Teams can alter roll bar stiffness between sessions to adjust handling characteristics.' },

  // ══ POWER UNIT ════════════════════════════════════════════════════════════
  { term:'PU', full:'Power Unit', category:'Power Unit',
    def_id:'Istilah resmi FIA untuk keseluruhan sistem penggerak hybrid F1. Terdiri dari ICE, MGU-K, MGU-H, ES, turbocharger, dan control electronics.',
    def_en:'FIA\'s official term for the complete F1 hybrid drivetrain. Consists of the ICE, MGU-K, MGU-H, Energy Store, turbocharger, and control electronics.',
    fact_id:'Power unit F1 era hybrid bisa menghasilkan lebih dari 1.000 tenaga kuda total.',
    fact_en:'The F1 hybrid era power unit can produce over 1,000 horsepower in total.' },

  { term:'ICE', full:'Internal Combustion Engine', category:'Power Unit',
    def_id:'Mesin 1.6L V6 turbo yang menjadi tulang punggung power unit F1 hybrid sejak 2014. Berputar hingga 15.000 RPM dengan efisiensi termal lebih dari 50%.',
    def_en:'1.6L turbocharged V6 engine forming the core of the F1 hybrid power unit since 2014. Revs to 15,000 RPM with over 50% thermal efficiency.',
    fact_id:'Efisiensi termal 50%+ melampaui hampir semua mesin produksi masal di dunia.',
    fact_en:'The 50%+ thermal efficiency surpasses virtually all mass-production engines worldwide.' },

  { term:'MGU-K', full:'Motor Generator Unit – Kinetic', category:'Power Unit',
    def_id:'Unit hybrid yang memulihkan energi kinetik saat pengereman dan dapat memberikan hingga 120 kW (161 hp) daya tambahan saat akselerasi.',
    def_en:'Hybrid unit recovering kinetic energy under braking and delivering up to 120 kW (161 hp) of additional power during acceleration.',
    fact_id:'MGU-K berkontribusi pada akselerasi 0–100 km/jam F1 dalam sekitar 2,6 detik.',
    fact_en:'The MGU-K contributes to F1\'s 0–100 km/h acceleration time of approximately 2.6 seconds.' },

  { term:'MGU-H', full:'Motor Generator Unit – Heat', category:'Power Unit',
    def_id:'Unit hybrid yang memulihkan energi dari gas buang panas lewat turbocharger — bisa digunakan untuk memutar turbo lebih cepat atau mengisi baterai.',
    def_en:'Hybrid unit recovering energy from hot exhaust gases via the turbocharger — used to spin the turbo faster or charge the battery.',
    fact_id:'MGU-H adalah komponen paling kompleks dan mahal di PU F1, dan akan dihapus di 2026.',
    fact_en:'The MGU-H is the most complex and expensive PU component — it will be removed in 2026.' },

  { term:'ERS', full:'Energy Recovery System', category:'Power Unit',
    def_id:'Sistem yang menggabungkan MGU-K dan MGU-H. Menyimpan energi di baterai dan melepaskannya secara strategis untuk boost performa.',
    def_en:'System combining MGU-K and MGU-H. Stores energy in the battery and releases it strategically for performance boosts.',
    fact_id:'Pembalap dan tim bisa memilih kapan dan seberapa banyak ERS digunakan di setiap lap.',
    fact_en:'Drivers and teams choose when and how much ERS to deploy each lap.' },

  { term:'Engine Mode', full:'Power Unit Performance Setting', category:'Power Unit',
    def_id:'Pengaturan power unit dari "party mode" (performa maksimum) hingga mode konservasi. FIA melarang "party mode" khusus kualifikasi sejak 2020.',
    def_en:'Power unit settings ranging from "party mode" (maximum performance) to conservation modes. The FIA banned qualifying-specific "party modes" from 2020.',
    fact_id:'Mercedes punya keunggulan besar dalam party mode di era 2018–2020.',
    fact_en:'Mercedes had a significant party mode advantage over rivals in the 2018–2020 era.' },

  { term:'Lift and Coast', full:'Fuel-Saving Technique', category:'Power Unit',
    def_id:'Teknik mengangkat pedal gas lebih awal sebelum tikungan tanpa rem untuk menghemat bahan bakar.',
    def_en:'Technique of lifting off the throttle early before corners without braking to save fuel.',
    fact_id:'Mobil F1 hanya membawa ~100 kg bahan bakar untuk race penuh ~300 km.',
    fact_en:'An F1 car carries only ~100 kg of fuel for a full race of approximately 300 km.' },

  { term:'Fuel Flow Rate', full:'Engine Fuel Consumption Limit', category:'Power Unit',
    def_id:'Batas kecepatan aliran bahan bakar ke mesin yang diatur FIA: 100 kg/jam. Melebihi batas ini berakibat penalti atau DSQ.',
    def_en:'FIA-mandated maximum fuel flow rate to the engine: 100 kg/hour. Exceeding this results in penalties or disqualification.',
    fact_id:'Red Bull di-DSQ dari dua race musim 2014 karena pelanggaran fuel flow rate.',
    fact_en:'Red Bull were DSQ\'d from two 2014 races for fuel flow rate violations.' },

  { term:'Battery Deployment', full:'ERS Energy Release Strategy', category:'Power Unit',
    def_id:'Strategi kapan dan berapa energi baterai ERS dilepaskan per lap. Pembalap bisa memilih push di zona tertentu untuk overtaking atau pertahanan.',
    def_en:'Strategy for when and how much ERS battery energy to release per lap. Drivers can choose to push deployment in specific zones for overtaking or defending.',
    fact_id:'ERS bisa memberikan boost selama ~33 detik per lap sebelum baterai perlu diisi ulang.',
    fact_en:'ERS can provide a boost for approximately 33 seconds per lap before needing recharging.', isNew:true },

  { term:'2026 PU Regs', full:'50/50 Hybrid Power Unit', category:'Power Unit',
    def_id:'Regulasi PU baru 2026 dengan split 50/50 antara output listrik dan bensin. MGU-H dihapus, MGU-K diperkuat signifikan, target output ~1.000 hp.',
    def_en:'New 2026 power unit regulations mandating a 50/50 split between electrical and combustion power. MGU-H removed, MGU-K greatly strengthened, target ~1,000 hp.',
    fact_id:'Audi dan Ford (via Red Bull Powertrains) akan debut sebagai pabrikan baru di 2026.',
    fact_en:'Audi and Ford (via Red Bull Powertrains) will debut as new manufacturers in 2026.', isNew:true },

  { term:'Token System', full:'PU Development Limit', category:'Power Unit',
    def_id:'Sistem FIA yang membatasi pengembangan power unit dari 2014–2021 dengan "token" terbatas per pabrikan untuk mengontrol biaya.',
    def_en:'FIA system limiting power unit development from 2014–2021 with limited "tokens" per manufacturer to control costs.',
    fact_id:'Sistem token dihapus pada 2022 untuk memberi waktu pabrikan baru menyamai level incumbent.',
    fact_en:'The token system was abolished in 2022 to give new manufacturers time to reach incumbent levels.' },

  { term:'Turbo Lag', full:'Delayed Turbo Response', category:'Power Unit',
    def_id:'Jeda antara pembalap menekan gas dan turbocharger memberikan boost penuh. Di F1 modern, MGU-H membantu menghilangkan turbo lag hampir sepenuhnya.',
    def_en:'Delay between the driver pressing the throttle and the turbocharger delivering full boost. In modern F1, the MGU-H almost completely eliminates turbo lag.',
    fact_id:'Turbo lag pada era turbo 1980-an sangat parah — pembalap harus mengantisipasi jauh sebelum tikungan.',
    fact_en:'Turbo lag in the 1980s turbo era was severe — drivers had to anticipate it well before corners.' },

  { term:'RPM Limit', full:'Engine Revolutions Per Minute Cap', category:'Power Unit',
    def_id:'Batas putaran mesin maksimum yang diizinkan regulasi FIA. Saat ini 15.000 RPM, jauh lebih rendah dari era V10 yang mencapai 19.000 RPM.',
    def_en:'Maximum engine revolutions per minute permitted by FIA regulations. Currently 15,000 RPM, far lower than the V10 era\'s 19,000 RPM.',
    fact_id:'Suara khas V10 dengan 19.000 RPM dianggap salah satu suara paling merdu dalam sejarah motorsport.',
    fact_en:'The distinctive V10 sound at 19,000 RPM is considered one of the most beautiful sounds in motorsport history.' },

  { term:'Exhaust Blown Diffuser', full:'EBD Aero System', category:'Power Unit',
    def_id:'Teknik menggunakan gas buang mesin untuk meningkatkan aliran melalui diffuser dan menambah downforce. Dilarang di F1 pada 2012.',
    def_en:'Technique using engine exhaust gases to enhance airflow through the diffuser and increase downforce. Banned in F1 in 2012.',
    fact_id:'Red Bull RB7 (2011) menggunakan exhaust blown diffuser dengan sangat efektif untuk mendominasi musim.',
    fact_en:'The Red Bull RB7 (2011) used the exhaust blown diffuser extremely effectively to dominate the season.' },

  { term:'Energy Store', full:'Hybrid Battery Pack', category:'Power Unit',
    def_id:'Baterai lithium-ion yang menyimpan energi yang dipulihkan oleh MGU-K dan MGU-H. Berat regulasi maksimum sekitar 25 kg.',
    def_en:'Lithium-ion battery pack storing energy recovered by the MGU-K and MGU-H. Maximum regulated weight of approximately 25 kg.',
    fact_id:'Energy Store harus mempertahankan performa di suhu ekstrem dari -20°C hingga lebih dari 60°C.',
    fact_en:'The Energy Store must maintain performance at extreme temperatures from -20°C to over 60°C.', isNew:true },

  // ══ REGULASI ══════════════════════════════════════════════════════════════
  { term:'Parc Fermé', full:'Closed Park', category:'Regulasi',
    def_id:'Area tertutup di mana mobil tidak boleh dimodifikasi setelah kualifikasi hingga race selesai. Melanggar parc fermé berakibat penalti grid.',
    def_en:'Closed, guarded area where cars cannot be modified after qualifying until the race ends. Violations result in grid penalties.',
    fact_id:'Parc fermé diperkenalkan untuk memastikan setup tetap sama dari quali ke race.',
    fact_en:'Parc fermé was introduced to ensure cars remain in their qualifying configuration for the race.' },

  { term:'Time Penalty', full:'Race Time Addition', category:'Regulasi',
    def_id:'Tambahan waktu ke total waktu race — umumnya 5 atau 10 detik. Bisa dilayani saat pit stop atau ditambahkan ke waktu total di akhir race.',
    def_en:'Time added to total race time — typically 5 or 10 seconds. Can be served during a pit stop or added to the final race time.',
    fact_id:'Penalti 5 detik biasanya cukup untuk kehilangan satu atau lebih posisi dalam race yang ketat.',
    fact_en:'A 5-second penalty is usually enough to lose one or more places in a closely-contested race.' },

  { term:'Drive-Through', full:'Pit Lane Penalty', category:'Regulasi',
    def_id:'Penalti di mana pembalap wajib melewati pit lane dengan kecepatan terbatas tanpa berhenti. Biasanya untuk pelanggaran serius seperti unsafe release atau start yang salah.',
    def_en:'Penalty requiring the driver to drive through the pit lane at speed-limited pace without stopping. Given for serious infractions like unsafe release or a false start.',
    fact_id:'Drive-through biasanya mengakibatkan kehilangan 20–30 detik dan beberapa posisi.',
    fact_en:'A drive-through typically costs 20–30 seconds and several race positions.' },

  { term:'Grid Penalty', full:'Starting Position Drop', category:'Regulasi',
    def_id:'Penalti yang menggeser posisi start ke belakang. Paling sering karena penggantian komponen power unit melebihi kuota per musim.',
    def_en:'Penalty dropping a driver\'s starting grid position. Most commonly given for exceeding power unit component quotas per season.',
    fact_id:'Beberapa tim sengaja mengambil grid penalty di sirkuit tertentu untuk memakai komponen baru.',
    fact_en:'Some teams strategically take grid penalties at specific circuits to use fresh power unit components.' },

  { term:'Track Limits', full:'Racing Surface Boundary Rule', category:'Regulasi',
    def_id:'Semua empat roda mobil harus tetap di dalam batas putih lintasan. Pelanggaran berulang atau saat lap cepat berakibat penghapusan waktu lap atau penalti race.',
    def_en:'All four wheels must remain within the white boundary lines. Repeated or fast-lap violations result in deleted lap times or race time penalties.',
    fact_id:'FIA menggunakan kamera high-speed dan sensor untuk mendeteksi track limits secara akurat.',
    fact_en:'The FIA uses high-speed cameras and sensors to accurately detect track limits violations.' },

  { term:'Budget Cap', full:'Cost Cap Regulation', category:'Regulasi',
    def_id:'Batas anggaran maksimum tim per musim untuk operasional race, tidak termasuk gaji pembalap dan tiga staf tertinggi. Berlaku penuh sejak 2021.',
    def_en:'Maximum annual operational spending limit per team, excluding driver salaries and top three earners. Fully effective from 2021.',
    fact_id:'Red Bull terkena penalti 2022 karena melebihi budget cap sebesar ~$1,8 juta.',
    fact_en:'Red Bull were penalised in 2022 for exceeding the budget cap by approximately $1.8 million.' },

  { term:'DSQ', full:'Disqualification', category:'Regulasi',
    def_id:'Diskualifikasi penuh dari hasil race atau kualifikasi akibat pelanggaran teknis atau berat di lintasan. Hasil bisa diubah bahkan jam setelah race.',
    def_en:'Full disqualification from race or qualifying results for technical or serious on-track violations. Results can be changed even hours after the race ends.',
    fact_id:'Hamilton dan Leclerc keduanya di-DSQ dari Grand Prix Brasil 2024 karena pelanggaran teknis.',
    fact_en:'Hamilton and Leclerc were both DSQ\'d from the 2024 Brazilian GP for technical violations.' },

  { term:'Stewards', full:'Race Officials Panel', category:'Regulasi',
    def_id:'Panel tiga komisioner FIA dan satu mantan pembalap F1 yang menyelidiki insiden di lintasan dan menjatuhkan penalti.',
    def_en:'Panel of three FIA commissioners and one former F1 driver investigating on-track incidents and issuing penalties.',
    fact_id:'Mantan pembalap dalam panel stewards dirotasi di setiap Grand Prix untuk mengurangi bias.',
    fact_en:'The former driver on the stewards panel rotates at each Grand Prix to reduce bias.' },

  { term:'Blue Flag', full:'Lapping Signal', category:'Regulasi',
    def_id:'Bendera biru untuk pembalap yang akan disalip mobil minimal satu lap di depannya. Wajib memberi jalan dalam tiga kesempatan atau kena penalti.',
    def_en:'Shown to a driver about to be lapped by a car at least one lap ahead. Must yield within three flag displays or receive a penalty.',
    fact_id:'Beberapa pembalap tertinggal pernah dituduh sengaja lambat memberi jalan demi menguntungkan lawan tertentu.',
    fact_en:'Some lapped drivers have been accused of deliberately slow-yielding to benefit a favoured rival.' },

  { term:'Yellow Flag', full:'Caution Zone Signal', category:'Regulasi',
    def_id:'Bendera kuning menandakan bahaya di zona tertentu. Pembalap wajib melambat dan dilarang menyalip. Single yellow = hati-hati; double yellow = siap berhenti total.',
    def_en:'Danger signal for a specific zone. Drivers must slow and overtaking is prohibited. Single yellow = caution; double yellow = be prepared to stop.',
    fact_id:'Sesi kualifikasi bisa sangat terganggu saat yellow flag muncul di zona kritis.',
    fact_en:'Qualifying sessions can be dramatically disrupted when yellow flags appear in critical sectors.' },

  { term:'Red Flag', full:'Race Suspension Signal', category:'Regulasi',
    def_id:'Bendera merah yang menghentikan sesi atau race karena kondisi tidak aman. Race bisa dilanjutkan dari standing start.',
    def_en:'Signal suspending a session or race due to unsafe conditions — serious accident, dangerous debris, or extreme weather. Races can restart from a standing start.',
    fact_id:'Restart setelah red flag adalah kesempatan bagi semua pembalap untuk berganti ban tanpa kehilangan posisi.',
    fact_en:'A post-red flag restart is an opportunity for all drivers to change tyres without losing position.' },

  { term:'Concorde Agreement', full:'F1 Commercial Contract', category:'Regulasi',
    def_id:'Kontrak multiyear antara FIA, FOM, dan semua tim F1 yang mengatur pembagian pendapatan, hak voting, dan peraturan olahraga.',
    def_en:'Multi-year contract between the FIA, FOM, and all F1 teams governing revenue sharing, voting rights, and sporting regulations.',
    fact_id:'Concorde Agreement 2021–2025 memperkenalkan budget cap dan redistribusi pendapatan yang lebih merata.',
    fact_en:'The 2021–2025 Concorde Agreement introduced the budget cap and more equitable revenue distribution.', isNew:true },

  { term:'2026 Regulations', full:'New Era Technical Rules', category:'Regulasi',
    def_id:'Paket regulasi besar mulai 2026: mobil lebih kecil dan ringan, power unit 50/50 listrik-bensin, penghapusan MGU-H, dan active aero menggantikan DRS.',
    def_en:'Major new regulation package from 2026: smaller/lighter cars, 50/50 electric-combustion power units, removal of MGU-H, and active aero replacing DRS.',
    fact_id:'Regulasi 2026 menyambut pabrikan baru: Audi dan Ford melalui Red Bull Powertrains.',
    fact_en:'The 2026 regulations welcome new manufacturers: Audi and Ford via Red Bull Powertrains.', isNew:true },

  { term:'Gearbox Freeze', full:'Mandatory Gearbox Usage Rule', category:'Regulasi',
    def_id:'Regulasi yang mewajibkan tim menggunakan gearbox yang sama selama minimum enam race berturut-turut. Penggantian lebih awal berakibat penalti grid 5 posisi.',
    def_en:'Regulation requiring teams to use the same gearbox for a minimum of six consecutive races. Earlier replacement results in a 5-place grid penalty.',
    fact_id:'Gearbox freeze diperkenalkan untuk membatasi biaya dan mengurangi keunggulan tim kaya.',
    fact_en:'Gearbox freezes were introduced to limit costs and reduce rich teams\' advantage in component replacement.' },

  { term:'Weight Limit', full:'Minimum Car + Driver Mass', category:'Regulasi',
    def_id:'Batas berat minimum mobil ditambah pembalap yang ditetapkan FIA per musim. Untuk 2024, batas berat minimum adalah 800 kg.',
    def_en:'FIA-mandated minimum weight for car plus driver per season. For 2024, the minimum weight is 800 kg (car + driver + helmet).',
    fact_id:'Tim menggunakan ballast yang bisa dipindah-pindah untuk mengoptimalkan distribusi berat sesuai kebutuhan sirkuit.',
    fact_en:'Teams use moveable ballast to optimise weight distribution for each circuit\'s specific requirements.' },

  { term:'Constructor', full:'F1 Car Manufacturing Team', category:'Regulasi',
    def_id:'Tim yang merancang dan membangun sasis mobil F1 mereka sendiri. Constructor Championship menentukan distribusi pendapatan FOM.',
    def_en:'A team that designs and builds its own F1 car chassis. The Constructors\' Championship determines FOM revenue distribution.',
    fact_id:'Ferrari adalah satu-satunya tim yang selalu hadir di setiap musim Formula 1 sejak 1950.',
    fact_en:'Ferrari is the only team to have competed in every single Formula 1 season since 1950.' },

  { term:'Grand Prix Distance', full:'Race Minimum Length', category:'Regulasi',
    def_id:'Race F1 harus mencakup minimal 305 km (kecuali Monaco yang 260 km). Jika race dihentikan antara 25–75% jarak, hanya setengah poin yang diberikan.',
    def_en:'F1 races must cover at least 305 km (except Monaco at 260 km). If stopped between 25–75% distance, only half points are awarded.',
    fact_id:'Monaco mendapat pengecualian jarak karena tata letak kotanya yang unik membuat perluasan lintasan tidak mungkin.',
    fact_en:'Monaco gets a distance exemption because its unique city layout makes extending the circuit impossible.' },

  { term:'Protest', full:'Official Race Result Challenge', category:'Regulasi',
    def_id:'Mekanisme formal di mana tim dapat menantang hasil race atau keputusan teknis melalui FIA. Memerlukan biaya deposit dan alasan spesifik.',
    def_en:'Formal mechanism by which teams can challenge race results or technical decisions through the FIA. Requires a deposit fee and specific grounds.',
    fact_id:'Abu Dhabi 2021 memicu serangkaian protes yang mengubah regulasi Safety Car secara fundamental.',
    fact_en:'Abu Dhabi 2021 triggered a series of protests that fundamentally changed Safety Car regulations.' },

  { term:'Sporting Code', full:'FIA Rules of Competition', category:'Regulasi',
    def_id:'Dokumen komprehensif FIA yang mengatur semua aspek operasional Formula 1, dari prosedur race hingga regulasi pembalap dan tim.',
    def_en:'Comprehensive FIA document governing all operational aspects of Formula 1, from race procedures to driver and team regulations.',
    fact_id:'Sporting Code diperbarui setiap musim dan bisa menjadi ratusan halaman panjangnya.',
    fact_en:'The Sporting Code is updated every season and can run to several hundred pages in length.' },

  // ══ SIRKUIT ═══════════════════════════════════════════════════════════════
  { term:'Street Circuit', full:'Temporary Urban Race Track', category:'Sirkuit',
    def_id:'Sirkuit yang dibangun sementara di jalanan kota. Lebih sempit, minim runoff area, tembok sangat dekat. Contoh: Monaco, Singapore, Baku, Jeddah.',
    def_en:'Temporary race track built on public roads. Narrower, minimal runoff areas, walls very close. Examples: Monaco, Singapore, Baku, Jeddah.',
    fact_id:'Monaco adalah sirkuit paling ikonik di F1 — digelar pertama kali tahun 1929.',
    fact_en:'Monaco is the most iconic street circuit in F1 — first held in 1929.' },

  { term:'High-Speed Circuit', full:'Fast Layout Track', category:'Sirkuit',
    def_id:'Sirkuit yang didominasi tikungan cepat dan lurus panjang. Membutuhkan setup low-downforce, mengutamakan top speed. Contoh: Monza, Silverstone, Spa.',
    def_en:'Circuit dominated by fast corners and long straights. Requires low-downforce setup prioritising top speed. Examples: Monza, Silverstone, Spa.',
    fact_id:'Monza adalah sirkuit tercepat di kalender F1, dengan top speed melampaui 360 km/jam.',
    fact_en:'Monza is the fastest circuit on the F1 calendar, with top speeds exceeding 360 km/h.' },

  { term:'Sector', full:'Track Timing Segment', category:'Sirkuit',
    def_id:'Pembagian lintasan menjadi tiga segmen untuk pengukuran waktu. Setiap sektor memberikan informasi performa spesifik.',
    def_en:'Track divided into three timing segments. Each sector provides specific performance data — S1 (infield), S2 (middle), S3 (after pit entry).',
    fact_id:'Waktu per sektor memungkinkan tim mendiagnosis dengan tepat di mana kehilangan atau keuntungan waktu terjadi.',
    fact_en:'Sector times allow teams to precisely diagnose exactly where time is lost or gained on a lap.' },

  { term:'DRS Zone', full:'Drag Reduction Area', category:'Sirkuit',
    def_id:'Bagian lintasan yang ditentukan FIA di mana DRS boleh diaktifkan. Biasanya di lurus panjang setelah titik deteksi 1 detik dari mobil di depan.',
    def_en:'FIA-designated track sections where DRS may be activated. Typically on long straights, after a detection point measured 1 second from the car ahead.',
    fact_id:'Beberapa sirkuit memiliki tiga DRS zone — seperti Monza dan Jeddah — yang sangat memudahkan overtaking.',
    fact_en:'Some circuits like Monza and Jeddah have three DRS zones, greatly facilitating overtaking.' },

  { term:'Runoff Area', full:'Safety Deceleration Zone', category:'Sirkuit',
    def_id:'Area di luar lintasan yang dirancang untuk memperlambat mobil secara aman jika pembalap keluar lintasan. Bisa berupa aspal, gravel, atau kombinasi keduanya.',
    def_en:'Area outside the track designed to safely decelerate cars that leave the racing surface. Can be asphalt, gravel, or a combination of both.',
    fact_id:'Runoff aspal lebih sering digunakan modern karena lebih aman, tapi juga lebih mudah disalahgunakan pembalap.',
    fact_en:'Asphalt runoff is now more common as it\'s safer, but is also more susceptible to being exploited by drivers.' },

  { term:'Pit Lane', full:'Service Road Adjacent to Track', category:'Sirkuit',
    def_id:'Jalur di samping lintasan utama tempat tim memberikan layanan pit stop. Memiliki batas kecepatan ketat dan zona unsafe release yang dipantau ketat.',
    def_en:'Lane adjacent to the main circuit where teams service their cars. Has strict speed limits and closely monitored unsafe release zones.',
    fact_id:'Panjang pit lane bervariasi dari sekitar 300 meter hingga lebih dari 600 meter tergantung sirkuit.',
    fact_en:'Pit lane length varies from around 300 metres to over 600 metres depending on the circuit.' },

  { term:'Chicane', full:'Artificial Slow Corner', category:'Sirkuit',
    def_id:'Tikungan buatan (dua tikungan tajam berlawanan arah) yang sengaja memasukkan hambatan untuk mengurangi kecepatan di titik kritis.',
    def_en:'Artificial feature of two tight alternate-direction corners deliberately introduced to reduce speed at critical points, typically before long straights.',
    fact_id:'Chicane pertama di F1 sering dipasang setelah kecelakaan fatal untuk mengurangi kecepatan di area berbahaya.',
    fact_en:'F1 chicanes are often added following fatal accidents to reduce speeds at dangerous sections.' },

  { term:'Hairpin', full:'Tight 180° Corner', category:'Sirkuit',
    def_id:'Tikungan sangat tajam mendekati 180 derajat yang mewajibkan pengereman keras. Contoh terkenal: Loews di Monaco, Variante della Roggia di Imola.',
    def_en:'Very tight corner approaching 180 degrees requiring heavy braking. Famous examples: Loews at Monaco, Variante della Roggia at Imola.',
    fact_id:'Hairpin adalah tikungan di mana perbedaan strategi pengereman paling terlihat jelas antar pembalap.',
    fact_en:'Hairpins are the corners where braking strategy differences between drivers are most visibly apparent.' },

  { term:'Apex', full:'Innermost Corner Point', category:'Sirkuit',
    def_id:'Titik terdalam di dalam tikungan — biasanya titik di mana ban mobil paling dekat ke kerb bagian dalam. Melewati apex yang tepat adalah kunci lap time yang baik.',
    def_en:'The innermost point of a corner — typically where the car\'s tyres come closest to the inner kerb. Hitting the correct apex is key to a good lap time.',
    fact_id:'Early apex vs late apex menentukan secara signifikan bagaimana mobil bisa keluar dari tikungan dengan cepat.',
    fact_en:'Early versus late apex significantly determines how quickly a car can accelerate out of a corner.' },

  { term:'Braking Zone', full:'Deceleration Area', category:'Sirkuit',
    def_id:'Area sebelum tikungan di mana pembalap melakukan pengereman keras. Titik pengereman adalah salah satu momen paling kritis untuk overtaking dan lap time.',
    def_en:'Area before a corner where drivers perform heavy braking. The braking point is one of the most critical moments for overtaking and lap time.',
    fact_id:'Pembalap F1 bisa mengalami deselerasi hingga 5G saat pengereman keras.',
    fact_en:'F1 drivers can experience deceleration forces of up to 5G under heavy braking.' },

  { term:'Armco', full:'Safety Barrier System', category:'Sirkuit',
    def_id:'Pagar pengaman logam (berbentuk "W") yang dipasang di tepi lintasan untuk melindungi pembalap dan marshal dari mobil yang keluar lintasan.',
    def_en:'Metal safety barrier (W-shaped cross-section) placed at track edges to protect drivers and marshals from cars leaving the circuit.',
    fact_id:'Armco modern sering dikombinasikan dengan SAFER barrier dan tire wall untuk perlindungan berlapis.',
    fact_en:'Modern armco is often combined with SAFER barriers and tyre walls for layered protection.' },

  { term:'Gravel Trap', full:'Loose Stone Runoff', category:'Sirkuit',
    def_id:'Area kerikil di luar lintasan yang berfungsi memperlambat mobil yang melintasinya. Lebih efektif dalam menghentikan mobil tapi juga bisa berbahaya jika menyebabkan rollover.',
    def_en:'Gravel area outside the track to slow a car that crosses it. More effective at stopping cars but can cause dangerous rollovers.',
    fact_id:'Banyak sirkuit mengganti gravel trap dengan aspal runoff karena alasan keselamatan modern.',
    fact_en:'Many circuits have replaced gravel traps with asphalt runoff areas for modern safety reasons.' },

  { term:'Turn 1', full:'Race Start First Corner', category:'Sirkuit',
    def_id:'Tikungan pertama dari garis start. Salah satu area paling kritis dalam race — insiden paling sering terjadi di sini pada lap pembuka.',
    def_en:'First corner from the start line. One of the most critical areas in a race — incidents most frequently occur here on the opening lap.',
    fact_id:'Distribusi grid start yang ketat membuat Turn 1 lap pertama menjadi target utama strategi penempatan posisi.',
    fact_en:'The tight grid distribution makes the first-lap Turn 1 the primary target for positioning strategy.' },

  { term:'Kerb Profile', full:'Trackside Boundary Height', category:'Sirkuit',
    def_id:'Ketinggian dan bentuk kerb batas lintasan di tikungan tertentu. Kerb profil rendah = lebih aman. Kerb profil tinggi (sausage) = mencegah cutting.',
    def_en:'Height and shape of the trackside boundary kerbs at specific corners. Low-profile = safer. High-profile (sausage) = prevents cutting.',
    fact_id:'FIA secara aktif mengelola profil kerb setiap musim untuk menyeimbangkan keselamatan dan penggunaan fair.',
    fact_en:'The FIA actively manages kerb profiles each season to balance safety and fair track usage.' },

  { term:'Pit Entry', full:'Pit Lane Access Point', category:'Sirkuit',
    def_id:'Titik di mana pembalap memasuki pit lane dari lintasan utama. Biasanya dibatasi garis putih yang tidak boleh dilindas saat tidak masuk pit.',
    def_en:'Entry point where drivers leave the main circuit to enter the pit lane. Usually delimited by white lines that must not be crossed when not pitting.',
    fact_id:'Melindas garis pit entry yang tidak sah bisa mengakibatkan penalti waktu 5 detik.',
    fact_en:'Illegally crossing the pit entry line can result in a 5-second time penalty.' },

  { term:'Tire Wall', full:'Impact Absorbing Barrier', category:'Sirkuit',
    def_id:'Dinding ban yang digunakan sebagai pembatas di tikungan tertentu untuk menyerap benturan. Ban tua yang disusun rapi berfungsi sebagai penyerap energi yang efektif.',
    def_en:'Stack of old tyres used as a barrier at certain corners to absorb impacts. Old tyres arranged neatly serve as effective and inexpensive energy absorbers.',
    fact_id:'SAFER barrier (foam-backed) kini banyak menggantikan tire wall di sirkuit modern untuk perlindungan lebih baik.',
    fact_en:'SAFER barriers (foam-backed) have now largely replaced tyre walls at modern circuits for improved protection.' },

  { term:'Elevation Change', full:'Track Gradient Variation', category:'Sirkuit',
    def_id:'Perubahan ketinggian yang signifikan di sepanjang lintasan. Sirkuit dengan elevation change besar seperti Spa atau Circuit of the Americas memberikan tantangan aerodinamika unik.',
    def_en:'Significant height changes along the circuit. Tracks with major elevation changes like Spa or Circuit of the Americas present unique aerodynamic challenges.',
    fact_id:'Spa-Francorchamps memiliki perbedaan ketinggian lebih dari 100 meter antara titik tertinggi dan terendahnya.',
    fact_en:'Spa-Francorchamps has an elevation difference of over 100 metres between its highest and lowest points.' },

  { term:'Timing Loop', full:'Underground Lap Timer Sensor', category:'Sirkuit',
    def_id:'Sensor tersembunyi di bawah aspal yang mendeteksi sinyal transponder mobil dan merekam waktu lap, sektor, dan posisi secara akurat.',
    def_en:'Hidden sensors embedded in the asphalt detecting transponder signals from cars, accurately recording lap times, sector times, and positions.',
    fact_id:'Sistem timing F1 dapat mengukur waktu dengan akurasi hingga seperseratus detik.',
    fact_en:'F1\'s timing system can measure time to an accuracy of one hundredth of a second.' },

  { term:'Pit Box', full:'Individual Team Service Bay', category:'Sirkuit',
    def_id:'Area di pit lane yang dialokasikan untuk tim tertentu. Posisi pit box ditentukan berdasarkan hasil Constructors Championship — juara mendapat pit box terbaik.',
    def_en:'Area in the pit lane allocated to a specific team. Pit box position is determined by Constructors Championship results — the champion gets the best position.',
    fact_id:'Pit box pertama biasanya dipilih karena meminimalkan jarak tempuh dan waktu masuk-keluar pit lane.',
    fact_en:'The first pit box is usually chosen as it minimises travel distance and pit lane entry/exit time.' },

  { term:'High-Downforce Circuit', full:'Technical Twisty Track', category:'Sirkuit',
    def_id:'Sirkuit yang didominasi tikungan lambat-sedang yang membutuhkan downforce maksimum untuk grip dan kecepatan tikungan. Contoh: Monaco, Hungary, Singapore.',
    def_en:'Circuit dominated by slow-to-medium corners requiring maximum downforce for grip and cornering speed. Examples: Monaco, Hungary, Singapore.',
    fact_id:'Di Monaco, tim memasang wing dengan downforce tertinggi dari seluruh kalender F1.',
    fact_en:'At Monaco, teams run the highest downforce wing configurations of the entire F1 calendar.' },

  { term:'Night Race', full:'Floodlit Grand Prix', category:'Sirkuit',
    def_id:'Grand Prix yang digelar malam hari di bawah sinar floodlight. Contoh: Singapore, Saudi Arabia, Las Vegas. Suhu udara lebih dingin menguntungkan ban.',
    def_en:'Grand Prix held at night under floodlights. Examples: Singapore, Saudi Arabia, Las Vegas. Cooler ambient temperatures are beneficial for tyres.',
    fact_id:'Singapore GP (2008) adalah race malam pertama dalam sejarah Formula 1.',
    fact_en:'The 2008 Singapore GP was the first ever night race in Formula 1 history.' },

  // ══ TAMBAHAN MODERN & TERMINOLOGI BARU ════════════════════════════════════
  { term:'Overalls', full:'Driver Racing Suit', category:'Umum',
    def_id:'Pakaian khusus tahan api Nomex yang dipakai pembalap F1. Mampu melindungi dari api selama minimal 12 detik. Berat hanya sekitar 600 gram.',
    def_en:'Special Nomex fire-resistant suit worn by F1 drivers. Can protect against flames for a minimum of 12 seconds. Weighs just approximately 600 grams.',
    fact_id:'Pakaian balap F1 modern terdiri dari hingga tiga lapisan material Nomex tahan api.',
    fact_en:'A modern F1 racing suit consists of up to three layers of fire-resistant Nomex material.' },

  { term:'HANS Device', full:'Head and Neck Support', category:'Teknik',
    def_id:'Perangkat keselamatan yang terpasang di bahu pembalap dan terhubung ke helm untuk mencegah gerakan kepala-leher berbahaya saat benturan frontal.',
    def_en:'Safety device mounted on the driver\'s shoulders and connected to the helmet to prevent dangerous head-neck movement during frontal impacts.',
    fact_id:'HANS device menjadi wajib di F1 sejak 2003 setelah kematian Dale Earnhardt di NASCAR 2001.',
    fact_en:'The HANS device became mandatory in F1 from 2003 following Dale Earnhardt\'s NASCAR death in 2001.' },

  { term:'SAFER Barrier', full:'Steel And Foam Energy Reduction Barrier', category:'Sirkuit',
    def_id:'Sistem penghalang modern yang menggabungkan panel baja dengan isian busa untuk menyerap energi benturan secara efisien. Lebih aman dari armco dan ban.',
    def_en:'Modern barrier system combining steel panels with foam filling to efficiently absorb crash energy. Safer than traditional armco and tyre barriers.',
    fact_id:'SAFER barrier pertama kali digunakan di F1 di Indianapolis Motor Speedway pada awal 2000-an.',
    fact_en:'SAFER barriers were first used in F1 at Indianapolis Motor Speedway in the early 2000s.' },

  { term:'Transponder', full:'Car Identification Signal Device', category:'Teknik',
    def_id:'Perangkat pada setiap mobil yang memancarkan sinyal unik yang terdeteksi oleh timing loop di bawah lintasan untuk mengukur waktu dan posisi secara akurat.',
    def_en:'Device on each car emitting a unique signal detected by underground timing loops to accurately measure times and positions.',
    fact_id:'Sistem transponder modern F1 akurat hingga dalam hitungan mikro-detik.',
    fact_en:'Modern F1 transponder systems are accurate to within microseconds.' },

  { term:'Understeer', full:'Front Grip Deficiency', category:'Teknik',
    def_id:'Kondisi di mana ban depan kehilangan grip lebih cepat dari ban belakang, menyebabkan mobil terus lurus saat pembalap mencoba berbelok.',
    def_en:'Condition where the front tyres lose grip faster than the rear, causing the car to push straight when the driver tries to corner.',
    fact_id:'Understeer biasanya dirasakan sebagai mobil yang "tidak mau berbelok" dan lebih aman tapi lebih lambat.',
    fact_en:'Understeer is typically felt as the car "refusing to turn" and is generally safer but slower.' },

  { term:'Oversteer', full:'Rear Grip Deficiency', category:'Teknik',
    def_id:'Kondisi di mana ban belakang kehilangan grip lebih cepat dari ban depan, menyebabkan bagian belakang mobil bergerak keluar dari lintasan tikung.',
    def_en:'Condition where the rear tyres lose grip faster than the front, causing the car\'s rear to slide outward during cornering.',
    fact_id:'Sedikit oversteer sering disukai pembalap F1 karena membuat mobil lebih responsif dan "berputar" lebih baik.',
    fact_en:'Slight oversteer is often preferred by F1 drivers as it makes the car feel more responsive and rotating.' },

  { term:'Neutral Balance', full:'Optimal Handling Balance', category:'Teknik',
    def_id:'Kondisi ideal di mana ban depan dan belakang bekerja secara seimbang. Tidak ada understeer maupun oversteer yang dominan. Target setup setiap tim.',
    def_en:'Ideal condition where front and rear tyres work in equal balance. Neither understeer nor oversteer dominates. The target setup for every team.',
    fact_id:'Neutral balance hampir tidak pernah dicapai sempurna — tim selalu mencari trade-off terbaik.',
    fact_en:'Perfect neutral balance is almost never achieved — teams always seek the best trade-off.' },

  { term:'Full Throttle %', full:'Track Full Throttle Percentage', category:'Sirkuit',
    def_id:'Persentase lap time di mana pembalap menekan pedal gas penuh. Sirkuit seperti Monza mencapai 75%+ full throttle, Monaco hanya sekitar 40%.',
    def_en:'Percentage of lap time where the driver is at full throttle. Circuits like Monza reach 75%+ full throttle, while Monaco is only around 40%.',
    fact_id:'Full throttle percentage adalah indikator utama seberapa "power-sensitive" sebuah sirkuit terhadap PU.',
    fact_en:'Full throttle percentage is the primary indicator of how power-sensitive a circuit is for the power unit.' },

  { term:'Drag Co-efficient', full:'Aerodynamic Drag Measurement', category:'Aero',
    def_id:'Angka yang mengukur seberapa besar hambatan udara yang dialami mobil. Semakin rendah Cd, semakin sedikit drag. F1 mengorbankan Cd demi downforce.',
    def_en:'Number measuring the amount of air resistance a car experiences. Lower Cd means less drag. F1 sacrifices Cd for downforce.',
    fact_id:'Mobil F1 memiliki Cd sekitar 1,0 — jauh lebih tinggi dari mobil jalan biasa (~0,3) karena prioritas downforce.',
    fact_en:'An F1 car has a Cd of around 1.0 — far higher than a road car (~0.3) due to downforce priority.' },

  { term:'G-Force', full:'Gravitational Force Equivalent', category:'Teknik',
    def_id:'Satuan yang mengukur gaya akselerasi yang dialami pembalap. F1 bisa mencapai hingga 6G lateral di tikungan cepat dan 5G saat pengereman.',
    def_en:'Unit measuring acceleration force experienced by drivers. F1 can reach up to 6G lateral in fast corners and 5G under heavy braking.',
    fact_id:'Pembalap F1 mengalami G-force lebih tinggi dari banyak pilot militer selama race penuh.',
    fact_en:'F1 drivers experience higher G-forces than many military pilots during a full race distance.' },

  { term:'Telemetry', full:'Real-Time Data Transmission', category:'Teknik',
    def_id:'Sistem pengiriman data real-time dari mobil ke pit wall dan factory tim. Memungkinkan insinyur memantau kondisi mekanis, ban, dan performa pembalap secara langsung.',
    def_en:'Real-time data transmission system from the car to the pit wall and team factory. Allows engineers to monitor mechanical condition, tyres, and driver performance live.',
    fact_id:'Satu mobil F1 dapat mengirimkan lebih dari 3 gigabyte data dalam satu race penuh.',
    fact_en:'A single F1 car can transmit over 3 gigabytes of data during a full race.' },

  { term:'Fuel Density', full:'Fuel Energy Content Measurement', category:'Power Unit',
    def_id:'Kerapatan energi bahan bakar yang digunakan. FIA mengatur spesifikasi bahan bakar F1 secara ketat — setiap tim menggunakan formula unik dari pemasok resmi mereka.',
    def_en:'Energy content density of the fuel used. The FIA strictly regulates F1 fuel specifications — each team uses a unique formula from their official fuel supplier.',
    fact_id:'Shell, Petronas, Castrol, BP, dan Aramco adalah pemasok bahan bakar resmi tim F1 terkini.',
    fact_en:'Shell, Petronas, Castrol, BP, and Aramco are among the current official fuel suppliers to F1 teams.' },

  { term:'Paddock', full:'Team Hospitality & Operations Area', category:'Umum',
    def_id:'Area eksklusif di belakang pit lane tempat tim memiliki motorhome, unit operasional, dan fasilitas hospitality. Akses terbatas dengan badge khusus.',
    def_en:'Exclusive area behind the pit lane where teams have motorhomes, operational units, and hospitality facilities. Restricted access with special credentials.',
    fact_id:'Motorhome tim papan atas di paddock modern bisa bernilai lebih dari €20 juta.',
    fact_en:'Top team motorhomes in the modern F1 paddock can be worth over €20 million.' },

  { term:'Press Conference', full:'Media Briefing Session', category:'Umum',
    def_id:'Konferensi pers resmi bagi pembalap dan tim principal di setiap Grand Prix. Biasanya terjadi Kamis (driver), Jumat (tim), dan setelah race (podium).',
    def_en:'Official press briefing for drivers and team principals at each Grand Prix. Typically held on Thursday (drivers), Friday (teams), and after the race (podium).',
    fact_id:'Pertanyaan media di konferensi pers sering memicu kontroversi dan pernyataan politis antar tim.',
    fact_en:'Media questions at press conferences frequently trigger controversies and political statements between teams.' },

  { term:'Points System', full:'Championship Point Allocation', category:'Regulasi',
    def_id:'Sistem poin F1 saat ini: 25-18-15-12-10-8-6-4-2-1 untuk P1-P10, ditambah 1 poin untuk fastest lap (jika finis top 10). Berlaku sejak 2010.',
    def_en:'Current F1 points system: 25-18-15-12-10-8-6-4-2-1 for P1-P10, plus 1 point for fastest lap (if finishing top 10). In force since 2010.',
    fact_id:'Sistem poin sebelumnya (10-6-4-3-2-1) sangat menguntungkan konsistensi ketimbang kemenangan.',
    fact_en:'The previous points system (10-6-4-3-2-1) heavily rewarded consistency over victories.' },

  { term:'Pole Position', full:'Grid Start Leading Position', category:'Umum',
    def_id:'Posisi start terdepan yang diraih oleh pembalap dengan waktu terlambat di Q3. Pembalap dari pole mendapat keuntungan besar saat start.',
    def_en:'The front grid start position earned by the fastest driver in Q3. Starting from pole provides a significant advantage at the race start.',
    fact_id:'Ayrton Senna memegang rekor pole position F1 terbanyak: 65 pole dalam karier 161 race.',
    fact_en:'Ayrton Senna holds the F1 pole position record: 65 poles from 161 career race starts.' },

  { term:'Wet Race', full:'Rain-Condition Grand Prix', category:'Umum',
    def_id:'Balapan dalam kondisi hujan yang membutuhkan ban basah atau intermediate. Cuaca yang berubah-ubah membuka peluang strategi yang tidak terduga.',
    def_en:'Race in wet conditions requiring wet or intermediate tyres. Changeable weather opens unexpected strategic opportunities.',
    fact_id:'Beberapa balapan paling dramatis dan ikonik dalam sejarah F1 terjadi dalam kondisi basah.',
    fact_en:'Some of the most dramatic and iconic races in F1 history have been contested in wet conditions.' },

  { term:'Driver Market', full:'F1 Seat Negotiation Period', category:'Umum',
    def_id:'Periode di mana kontrak pembalap dinegosiasikan dan tim mengumumkan lineup untuk musim mendatang. Sering terjadi mulai pertengahan musim berjalan.',
    def_en:'Period when driver contracts are negotiated and teams announce lineups for the upcoming season. Often begins from mid-season.',
    fact_id:'Musim driver market 2024-2025 adalah salah satu yang paling dramatis dalam sejarah F1, termasuk kepindahan Hamilton ke Ferrari.',
    fact_en:'The 2024-2025 driver market was one of the most dramatic in F1 history, including Hamilton\'s move to Ferrari.' },

  { term:'Manufacturer Team', full:'Works Factory Team', category:'Regulasi',
    def_id:'Tim yang didukung langsung oleh pabrikan otomotif besar (Mercedes, Ferrari, Red Bull/Honda, Renault, Alpine, dll). Memiliki akses ke sumber daya PU terbaik.',
    def_en:'Team directly backed by a major automotive manufacturer. Has access to the best power unit resources and full factory support.',
    fact_id:'Tim works secara historis mendominasi F1 — kemenangan customer team menjadi peristiwa yang jarang.',
    fact_en:'Works teams have historically dominated F1 — customer team victories are relatively rare events.' },

  { term:'Downwash', full:'Wing-Induced Downward Airflow', category:'Aero',
    def_id:'Aliran udara yang diarahkan ke bawah oleh sayap. Sayap belakang menghasilkan downwash yang bisa mengganggu aliran ke diffuser jika tidak dikelola dengan baik.',
    def_en:'Downward-directed airflow induced by a wing. The rear wing creates downwash that can interfere with diffuser flow if not carefully managed.',
    fact_id:'Mengelola downwash antar komponen aero adalah salah satu tantangan terbesar dalam desain mobil F1.',
    fact_en:'Managing downwash between aerodynamic components is one of the greatest challenges in F1 car design.' },

  { term:'Wind Sensitivity', full:'Crosswind Performance Impact', category:'Aero',
    def_id:'Seberapa besar pengaruh angin samping terhadap keseimbangan aero dan handling mobil. Desain aero yang baik meminimalkan wind sensitivity.',
    def_en:'How significantly crosswinds affect the car\'s aerodynamic balance and handling. Good aero design minimises wind sensitivity.',
    fact_id:'Sirkuit seperti Baku dan Jeddah dengan lurus panjang sangat terpengaruh oleh crosswind.',
    fact_en:'Circuits like Baku and Jeddah with their long straights are significantly affected by crosswinds.' },

  { term:'Yaw Angle', full:'Car Body Slip Angle', category:'Aero',
    def_id:'Sudut antara arah gerak mobil dan sumbu panjang mobil itu sendiri. Yaw positif berarti mobil bergerak sedikit menyamping, umum terjadi di tikungan.',
    def_en:'Angle between the direction the car is moving and its longitudinal axis. Positive yaw means the car moves slightly sideways, common in corners.',
    fact_id:'Tim mengoptimalkan performa aero pada berbagai yaw angle karena mobil jarang bergerak murni lurus.',
    fact_en:'Teams optimise aerodynamic performance across various yaw angles as the car rarely travels in a perfectly straight line.', isNew:true },

  { term:'Wheel Tether', full:'Safety Retention Cable', category:'Teknik',
    def_id:'Kabel baja yang menghubungkan roda ke sasis untuk mencegah roda terlepas dan menjadi proyektil berbahaya dalam kecelakaan.',
    def_en:'Steel cable connecting the wheel to the chassis to prevent it becoming a dangerous projectile in an accident.',
    fact_id:'Wheel tether menjadi wajib di F1 setelah beberapa kecelakaan berbahaya akibat roda terlepas di era 1990-an.',
    fact_en:'Wheel tethers became mandatory in F1 following several dangerous incidents involving detached wheels in the 1990s.' },

  { term:'Cockpit Protection', full:'Driver Survival Cell', category:'Teknik',
    def_id:'Sistem perlindungan kokpit yang mencakup monocoque, Halo, headrest, dan roll hoop yang bekerja bersama-sama untuk melindungi pembalap dari berbagai jenis benturan.',
    def_en:'Cockpit protection system comprising the monocoque, Halo, headrest, and roll hoop working together to protect the driver from various types of impact.',
    fact_id:'Perlindungan kokpit F1 modern mampu menahan benturan pada kecepatan lebih dari 200 km/jam dan tetap utuh.',
    fact_en:'Modern F1 cockpit protection can withstand impacts at over 200 km/h and remain structurally intact.' },

  { term:'Visor Tear-Off', full:'Helmet Visor Strip', category:'Umum',
    def_id:'Strip tipis plastik yang dipasang di atas visor helm pembalap. Saat visor kotor, pembalap menarik strip untuk mengungkap permukaan bersih di bawahnya.',
    def_en:'Thin plastic strips layered over the helmet visor. When the visor gets dirty, the driver peels off a strip to reveal a clean surface beneath.',
    fact_id:'Pembalap bisa memiliki hingga 8–10 lapisan tear-off di visor mereka untuk satu race.',
    fact_en:'A driver can have up to 8–10 layers of tear-offs on their visor for a single race.' },

  { term:'Drink System', full:'In-Cockpit Hydration Unit', category:'Teknik',
    def_id:'Sistem kantong cairan yang terpasang di dalam kokpit memungkinkan pembalap minum melalui selang sambil berkendara. Penting untuk rehidrasi dalam cockpit panas.',
    def_en:'Fluid bag system fitted inside the cockpit allowing drivers to drink through a tube while racing. Critical for rehydration in the hot cockpit environment.',
    fact_id:'Cockpit F1 bisa mencapai suhu hingga 50°C — pembalap bisa kehilangan lebih dari 3 kg cairan selama race.',
    fact_en:'F1 cockpits can reach temperatures of up to 50°C — drivers can lose over 3 kg of fluid during a race.' },

  { term:'FOM', full:'Formula One Management', category:'Regulasi',
    def_id:'Badan komersial yang mengelola hak media dan komersial Formula 1. Bertanggung jawab atas broadcast, pendapatan komersial, dan distribusi poin keuangan ke tim.',
    def_en:'Commercial body managing Formula 1\'s media and commercial rights. Responsible for broadcasting, commercial revenues, and distributing prize money to teams.',
    fact_id:'Liberty Media mengakuisisi Formula One Group (termasuk FOM) dari CVC Capital Partners pada 2017.',
    fact_en:'Liberty Media acquired the Formula One Group (including FOM) from CVC Capital Partners in 2017.' },

  { term:'FIA', full:'Fédération Internationale de l\'Automobile', category:'Regulasi',
    def_id:'Badan pengatur otomotif internasional yang menetapkan regulasi teknis dan sporting F1, bertanggung jawab atas keselamatan dan keadilan kompetisi.',
    def_en:'International automotive governing body setting F1\'s technical and sporting regulations, responsible for safety and competitive fairness.',
    fact_id:'FIA didirikan pada 1904 dan kini mengatur lebih dari 100 seri balap di seluruh dunia.',
    fact_en:'The FIA was founded in 1904 and now governs over 100 racing series worldwide.' },

  { term:'Team Principal', full:'F1 Team Director', category:'Umum',
    def_id:'Kepala eksekutif tim F1 yang bertanggung jawab atas semua keputusan operasional, strategis, dan teknis. Wajah publik tim di media dan konferensi pers.',
    def_en:'Executive head of an F1 team responsible for all operational, strategic, and technical decisions. The public face of the team in media and press conferences.',
    fact_id:'Christian Horner (Red Bull) adalah team principal terlama yang masih aktif — menjabat sejak 2005.',
    fact_en:'Christian Horner (Red Bull) is the longest-serving active team principal — in the role since 2005.' },

  { term:'Race Engineer', full:'Trackside Technical Coordinator', category:'Umum',
    def_id:'Insinyur yang berkomunikasi langsung dengan pembalap selama race, memberikan instruksi strategis, pembaruan posisi, dan feedback teknis melalui radio.',
    def_en:'Engineer communicating directly with the driver during the race, providing strategic instructions, position updates, and technical feedback via radio.',
    fact_id:'Race engineer dan pembalap membangun hubungan kerja yang sangat personal dan kritis untuk performa.',
    fact_en:'The race engineer and driver develop a highly personal and critical working relationship for performance.' },

  { term:'Simulation Tool', full:'Race Strategy Modeling Software', category:'Strategi',
    def_id:'Perangkat lunak canggih yang digunakan tim untuk mensimulasikan ribuan skenario race sebelum dan selama race berlangsung untuk mengoptimalkan strategi.',
    def_en:'Sophisticated software used by teams to simulate thousands of race scenarios before and during the race to optimise strategy.',
    fact_id:'Tim F1 modern menjalankan lebih dari satu juta simulasi strategi per race weekend.',
    fact_en:'Modern F1 teams run over one million strategy simulations per race weekend.', isNew:true },

  { term:'Strategic Pivot', full:'Mid-Race Strategy Change', category:'Strategi',
    def_id:'Perubahan strategi mendadak selama race sebagai respons terhadap kejadian yang tidak terduga seperti safety car, hujan, kecelakaan lawan, atau performa ban yang tidak sesuai prediksi.',
    def_en:'Sudden strategy change during a race in response to unexpected events such as safety cars, rain, rival crashes, or tyre performance that doesn\'t match predictions.',
    fact_id:'Kemampuan melakukan strategic pivot yang cepat dan tepat adalah pembeda utama antara tim strategis terbaik.',
    fact_en:'The ability to make fast and correct strategic pivots is a key differentiator between the best strategy teams.', isNew:true },

  // ══ TAMBAHAN — MENCAPAI 250 ═══════════════════════════════════════════════
  { term:'Apex Speed', full:'Minimum Corner Speed', category:'Teknik',
    def_id:'Kecepatan minimum yang dicapai pembalap di titik paling dalam tikungan (apex). Kecepatan apex yang lebih tinggi berarti exit yang lebih baik dan waktu lap lebih cepat.',
    def_en:'Minimum speed achieved by the driver at the deepest point of a corner (apex). Higher apex speed means a better exit and faster lap time.',
    fact_id:'Di Monaco, kecepatan apex di beberapa tikungan bisa setinggi 200 km/jam atau serendah 60 km/jam.',
    fact_en:'At Monaco, apex speeds range from over 200 km/h at fast corners to as low as 60 km/h at hairpins.' },

  { term:'Entry Speed', full:'Corner Approach Velocity', category:'Teknik',
    def_id:'Kecepatan di mana pembalap mendekati tikungan sebelum mulai mengerem. Keseimbangan antara entry speed dan kemampuan tikungan menentukan lap time.',
    def_en:'The speed at which a driver approaches a corner before braking. Balancing entry speed with cornering ability determines the lap time.',
    fact_id:'Pembalap yang berani masuk tikungan lebih cepat sering kali memiliki keunggulan di sirkuit dengan tikungan cepat.',
    fact_en:'Drivers who brake later and carry more entry speed often have an advantage at circuits with fast corners.' },

  { term:'High-Rake vs Low-Rake', full:'Car Stance Philosophy', category:'Aero',
    def_id:'Perdebatan desain antara mobil high-rake (depan rendah, belakang tinggi — Red Bull/AlphaTauri) dan low-rake (lebih rata — Mercedes). Setiap filosofi punya trade-off aero berbeda.',
    def_en:'Design debate between high-rake (front low, rear high — Red Bull/AlphaTauri) and low-rake (flatter — Mercedes) philosophies. Each has different aerodynamic trade-offs.',
    fact_id:'Era 2022 yang mengembalikan ground effect membuat banyak tim meninggalkan stance high-rake ekstrem.',
    fact_en:'The 2022 ground effect era led many teams to abandon extreme high-rake stances.' },

  { term:'Aero Balance', full:'Front/Rear Downforce Distribution', category:'Aero',
    def_id:'Distribusi downforce antara bagian depan dan belakang mobil. Aero balance mempengaruhi karakter understeer/oversteer dan seberapa agresif pembalap bisa bertikungan.',
    def_en:'Distribution of downforce between the front and rear of the car. Aero balance influences understeer/oversteer character and how aggressively the driver can corner.',
    fact_id:'Tim biasanya menyesuaikan aero balance antar sesi untuk merespons umpan balik ban dan feeling pembalap.',
    fact_en:'Teams typically adjust aero balance between sessions in response to tyre feedback and driver feeling.' },

  { term:'Front-Limited', full:'Front Tyre Performance Constraint', category:'Ban',
    def_id:'Kondisi di mana ban depan adalah faktor pembatas performa mobil — baik karena overheat, graining, atau deg yang lebih cepat dari ban belakang.',
    def_en:'Condition where the front tyres are the limiting factor in the car\'s performance — either from overheating, graining, or degrading faster than the rears.',
    fact_id:'Mobil yang front-limited sering terlihat "berjuang" di tikungan lambat dan kehilangan banyak waktu di sektor teknikal.',
    fact_en:'A front-limited car often visibly "struggles" in slow corners and loses significant time in technical sectors.' },

  { term:'Rear-Limited', full:'Rear Tyre Performance Constraint', category:'Ban',
    def_id:'Kondisi di mana ban belakang adalah faktor pembatas performa — lebih banyak deg atau terlalu panas. Pembalap harus mengurangi akselerasi atau mengubah gaya tikungan.',
    def_en:'Condition where the rear tyres are the limiting performance factor — degrading more or overheating. Drivers must reduce acceleration or alter their cornering style.',
    fact_id:'Terlalu banyak oversteer correction di ban belakang yang rear-limited bisa mempercepat degradasi secara signifikan.',
    fact_en:'Too much oversteer correction on a rear-limited car can significantly accelerate rear tyre degradation.' },

  { term:'Cliff', full:'Sudden Tyre Performance Drop', category:'Ban',
    def_id:'Penurunan performa ban yang tiba-tiba dan drastis setelah melampaui batas termal atau fisiknya. Tidak seperti deg bertahap, cliff adalah kehilangan grip yang hampir instan.',
    def_en:'Sudden and dramatic tyre performance drop after exceeding its thermal or physical limits. Unlike gradual degradation, a cliff is an almost instantaneous grip loss.',
    fact_id:'Mencegah cliff adalah alasan utama tim memberi instruksi "manage your tyres" kepada pembalap.',
    fact_en:'Preventing the cliff is the main reason teams give drivers "manage your tyres" instructions.' },

  { term:'Tyre Warmth', full:'Tyre Operating Temperature', category:'Ban',
    def_id:'Suhu kerja optimal ban di mana grip mencapai puncaknya. Setiap compound memiliki jendela suhu optimal yang berbeda.',
    def_en:'Optimal operating temperature at which tyre grip peaks. Each compound has a different optimal temperature window.',
    fact_id:'Pada suhu di bawah jendela optimal, ban bisa menjadi sangat berbahaya — hampir seperti berkendara di atas es.',
    fact_en:'Below the optimal temperature window, tyres can become very dangerous — almost like driving on ice.' },

  { term:'FP Pace', full:'Free Practice Speed Indication', category:'Strategi',
    def_id:'Kecepatan yang ditunjukkan mobil selama sesi latihan bebas. Tim sering menyembunyikan pace asli mereka di FP untuk menyesatkan lawan sebelum kualifikasi.',
    def_en:'Speed shown by a car during free practice sessions. Teams often hide their true pace in FP to mislead rivals before qualifying.',
    fact_id:'Membaca FP pace secara akurat adalah seni tersendiri — banyak tim secara sengaja menjalankan "fuel-heavy" runs.',
    fact_en:'Accurately reading FP pace is an art — many teams deliberately run fuel-heavy or tyre-saving stints.' },

  { term:'Long Run', full:'Race Simulation Practice Stint', category:'Strategi',
    def_id:'Sesi latihan panjang di FP2 yang mensimulasikan kondisi race sesungguhnya. Digunakan untuk mengumpulkan data deg ban dan performa race pace.',
    def_en:'Long practice session in FP2 simulating real race conditions. Used to gather tyre degradation data and race pace performance information.',
    fact_id:'Long run data FP2 adalah salah satu informasi paling berharga dalam perencanaan strategi race.',
    fact_en:'FP2 long run data is one of the most valuable inputs for race strategy planning.' },

  { term:'Short Run', full:'Qualifying Simulation Practice', category:'Strategi',
    def_id:'Lap cepat singkat di FP yang mensimulasikan kualifikasi. Menggunakan ban Soft baru untuk mengukur satu-lap pace dan peringkat relatif terhadap lawan.',
    def_en:'Short fast lap in FP simulating qualifying. Uses fresh Soft tyres to measure one-lap pace and relative ranking against rivals.',
    fact_id:'Short run pace tidak selalu mencerminkan performa kualifikasi sesungguhnya karena banyak faktor yang disembunyikan tim.',
    fact_en:'Short run pace doesn\'t always reflect true qualifying performance as teams conceal many factors.' },

  { term:'Thermal Management', full:'Heat Control Strategy', category:'Teknik',
    def_id:'Pengelolaan suhu komponen mobil — mesin, rem, ban, dan elektronik — agar tetap dalam batas operasional optimal selama race penuh.',
    def_en:'Management of component temperatures — engine, brakes, tyres, and electronics — keeping them within optimal operational limits throughout the race.',
    fact_id:'Manajemen termal yang buruk bisa menyebabkan kegagalan mekanis mendadak bahkan ketika mobil tampak baik-baik saja.',
    fact_en:'Poor thermal management can cause sudden mechanical failure even when the car appears to be running well.' },

  { term:'Oil Burning', full:'Engine Oil Consumption Strategy', category:'Power Unit',
    def_id:'Teknik (kontroversial, kini dibatasi ketat) menggunakan oli mesin sebagai bahan bakar tambahan di dalam ruang pembakaran untuk meningkatkan tenaga.',
    def_en:'Controversial technique (now heavily restricted) of using engine oil as additional fuel in the combustion chamber to boost power output.',
    fact_id:'FIA memperketat regulasi oil burning secara bertahap mulai 2017 setelah kontroversi yang melibatkan Mercedes dan Red Bull.',
    fact_en:'The FIA progressively tightened oil burning regulations from 2017 following controversy involving Mercedes and Red Bull.' },

  { term:'Fuel Save', full:'Fuel Conservation Mode', category:'Power Unit',
    def_id:'Mode operasi di mana pembalap dan tim mengurangi konsumsi bahan bakar untuk memastikan mobil mencapai akhir race. Bisa mengorbankan 0,3–1 detik per lap.',
    def_en:'Operating mode where drivers and teams reduce fuel consumption to ensure the car reaches the end of the race. Can sacrifice 0.3–1 second per lap.',
    fact_id:'Instruksi "fuel save" dari pit wall adalah salah satu pesan paling sering di radio F1.',
    fact_en:'"Fuel save" instructions from the pit wall are among the most frequent radio messages in F1.' },

  { term:'Push', full:'Maximum Attack Instruction', category:'Strategi',
    def_id:'Instruksi dari pit wall kepada pembalap untuk mengemudi pada kecepatan maksimum tanpa batasan. Berlawanan dengan mode konservasi ban atau bahan bakar.',
    def_en:'Pit wall instruction for the driver to race at maximum speed without any conservation limits. The opposite of tyre or fuel saving modes.',
    fact_id:'"Push now" adalah salah satu instruksi radio paling menegangkan — biasanya tanda bahwa race sedang kritis.',
    fact_en:'"Push now" is one of the most tense radio instructions — usually a sign that the race is at a critical moment.' },

  { term:'Gap Management', full:'Race Interval Control', category:'Strategi',
    def_id:'Teknik mengelola jarak ke mobil di depan atau di belakang secara strategis. Misalnya, mempertahankan jarak tepat 1 detik ke mobil depan untuk menjaga kemampuan DRS.',
    def_en:'Technique of strategically managing the gap to the car ahead or behind. For example, maintaining exactly 1 second to the car ahead to preserve DRS capability.',
    fact_id:'Gap management adalah kunci dalam race modern — sering kali lebih penting dari kecepatan murni.',
    fact_en:'Gap management is key in modern racing — often more important than outright raw speed.' },

  { term:'Qualifying Lap', full:'Single Fast Lap Attempt', category:'Umum',
    def_id:'Satu percobaan lap cepat dalam sesi kualifikasi di mana pembalap memberikan seluruh kemampuan untuk meraih waktu terbaik di sebuah set ban baru.',
    def_en:'A single fast lap attempt in qualifying where the driver gives everything to set the best time on a fresh set of tyres.',
    fact_id:'Satu kesalahan kecil dalam qualifying lap bisa berarti perbedaan antara pole position dan posisi ke-5.',
    fact_en:'A single small mistake on a qualifying lap can mean the difference between pole position and fifth on the grid.' },

  { term:'Lap Record', full:'Fastest Lap in Circuit History', category:'Sirkuit',
    def_id:'Waktu lap terbaik yang pernah dicatat di sebuah sirkuit oleh mobil F1. Setiap sirkuit memiliki rekam lap tersendiri yang terus diperbarui.',
    def_en:'Best lap time ever recorded at a circuit by an F1 car. Each circuit has its own lap record that is continuously updated.',
    fact_id:'Lap record biasanya dicatat saat ban fresh Soft digunakan menjelang akhir race dengan mobil ringan bahan bakar.',
    fact_en:'Lap records are typically set on fresh Soft tyres late in a race with a fuel-light car.' },

  { term:'Race Pace', full:'Sustained Competitive Speed', category:'Strategi',
    def_id:'Kecepatan rata-rata yang bisa dipertahankan pembalap dalam kondisi race sesungguhnya dengan strategi manajemen ban dan bahan bakar.',
    def_en:'Average speed a driver can sustain in real race conditions with tyre and fuel management factored in.',
    fact_id:'Perbedaan antara qualifying pace dan race pace bisa sangat dramatis — bahkan 2–4 detik per lap.',
    fact_en:'The difference between qualifying pace and race pace can be dramatic — even 2–4 seconds per lap.' },

  { term:'Constructor Championship', full:'Team Season Title', category:'Regulasi',
    def_id:'Gelar kejuaraan berdasarkan poin gabungan kedua pembalap tim. Menentukan distribusi pendapatan FOM dan posisi pit box untuk musim berikutnya.',
    def_en:'Championship title based on the combined points of both team drivers. Determines FOM revenue distribution and pit box positions for the following season.',
    fact_id:'Ferrari adalah tim tersukses dalam sejarah Constructor Championship dengan 16 gelar konstruktor.',
    fact_en:'Ferrari is the most successful team in Constructors\' Championship history with 16 titles.' },

  { term:'Driver Championship', full:'Individual Season Title', category:'Regulasi',
    def_id:'Gelar kejuaraan individu yang diraih pembalap dengan poin terbanyak pada akhir musim. Gelar paling bergengsi dalam motorsport dunia.',
    def_en:'Individual championship title earned by the driver accumulating the most points at season\'s end. The most prestigious title in world motorsport.',
    fact_id:'Lewis Hamilton memegang rekor 7 gelar Driver Championship, menyamai Michael Schumacher.',
    fact_en:'Lewis Hamilton holds the record of 7 Driver\'s Championship titles, equalling Michael Schumacher.' },

  { term:'GPDA', full:'Grand Prix Drivers Association', category:'Regulasi',
    def_id:'Asosiasi resmi pembalap F1 yang mewakili kepentingan bersama mereka dalam hal keselamatan, peraturan, dan kondisi kerja kepada FIA dan FOM.',
    def_en:'Official association representing F1 drivers\' collective interests regarding safety, regulations, and working conditions to the FIA and FOM.',
    fact_id:'GPDA sering memainkan peran krusial dalam mendorong perubahan keselamatan penting setelah kecelakaan serius.',
    fact_en:'The GPDA has often played a crucial role in pushing through important safety changes following serious accidents.' },

  { term:'Fire Extinguisher', full:'Onboard Suppression System', category:'Teknik',
    def_id:'Sistem pemadam kebakaran built-in yang dipasang di setiap mobil F1. Pembalap dapat mengaktifkannya dari kokpit jika mendeteksi kebakaran atau bocoran bahan bakar.',
    def_en:'Built-in fire suppression system fitted to every F1 car. The driver can activate it from the cockpit if fire or fuel leaks are detected.',
    fact_id:'Sistem pemadam di Grosjean di Bahrain 2020 aktif namun api tetap menyala — Halo yang menyelamatkan nyawanya.',
    fact_en:'Grosjean\'s fire system activated at Bahrain 2020 but the fire persisted — it was the Halo that saved his life.' },

  { term:'Marshal', full:'Trackside Safety Official', category:'Umum',
    def_id:'Sukarelawan resmi yang bertugas di pos-pos di sekitar lintasan untuk mengibarkan bendera, mengeluarkan mobil yang berhenti, dan membantu dalam insiden.',
    def_en:'Official volunteers stationed at posts around the circuit to wave flags, recover stopped cars, and assist in incidents.',
    fact_id:'Ada ratusan marshal bertugas di setiap Grand Prix F1 untuk menjaga keselamatan seluruh sirkuit.',
    fact_en:'Hundreds of marshals are on duty at every F1 Grand Prix to maintain safety around the entire circuit.' },

  { term:'Weighbridge', full:'Post-Race Weight Check', category:'Regulasi',
    def_id:'Timbangan resmi di pit lane di mana FIA memeriksa berat mobil setelah race atau kualifikasi untuk memastikan sesuai dengan batas minimum yang ditetapkan.',
    def_en:'Official scales in the pit lane where the FIA checks car weight after races or qualifying to ensure compliance with minimum weight regulations.',
    fact_id:'Pembalap tidak diperbolehkan menambah ballast setelah race — berat yang diukur adalah berat aktual saat finish.',
    fact_en:'Drivers are not permitted to add ballast after the race — the measured weight is the actual finishing weight.' },

  { term:'Scrutineering', full:'Technical Compliance Inspection', category:'Regulasi',
    def_id:'Pemeriksaan teknis resmi oleh insinyur FIA sebelum dan setelah setiap sesi untuk memastikan semua mobil memenuhi regulasi teknis yang berlaku.',
    def_en:'Official technical inspection by FIA engineers before and after each session to ensure all cars comply with the applicable technical regulations.',
    fact_id:'Pemeriksaan post-race lebih ketat dari pre-race karena komponen yang aus bisa mengungkap pelanggaran.',
    fact_en:'Post-race scrutineering is more thorough than pre-race as worn components can reveal violations.' },

  { term:'Flexi Wing Test', full:'Wing Stiffness Compliance Check', category:'Teknik',
    def_id:'Tes FIA yang mengukur defleksi sayap di bawah beban yang ditetapkan. Jika sayap bergerak melebihi batas, mobil tidak memenuhi syarat regulasi.',
    def_en:'FIA test measuring wing deflection under specified loads. If the wing moves beyond the limit, the car fails technical compliance.',
    fact_id:'Tim secara kreatif merancang sayap yang lulus tes statis tapi tetap fleksibel secara aerodinamis di kecepatan tinggi.',
    fact_en:'Teams creatively design wings that pass static tests but remain aerodynamically flexible at high speeds.' },

  { term:'Power-to-Weight Ratio', full:'Engine Power vs Car Mass', category:'Teknik',
    def_id:'Rasio antara tenaga yang dihasilkan power unit dan berat total mobil. Mobil F1 memiliki rasio tertinggi dari semua kendaraan balap.',
    def_en:'Ratio between power unit output and total car weight. F1 cars have the highest power-to-weight ratio of any racing vehicle.',
    fact_id:'Mobil F1 modern memiliki rasio power-to-weight lebih dari 1.000 hp per ton — sekitar 5x lebih dari supercar biasa.',
    fact_en:'A modern F1 car has a power-to-weight ratio exceeding 1,000 hp per tonne — roughly 5x more than a typical supercar.' },

  { term:'Aero Efficiency', full:'Performance per Drag Unit', category:'Aero',
    def_id:'Ukuran seberapa banyak downforce yang dihasilkan per unit drag yang diciptakan. Efisiensi aero yang tinggi berarti lebih banyak grip dengan penalti kecepatan lebih sedikit.',
    def_en:'Measure of how much downforce is generated per unit of drag created. High aero efficiency means more grip with less speed penalty.',
    fact_id:'Red Bull RB19 (2023) dianggap sebagai salah satu mobil paling aero-efisien dalam sejarah F1.',
    fact_en:'The Red Bull RB19 (2023) is regarded as one of the most aerodynamically efficient F1 cars in history.' },

  { term:'Cold Tyre', full:'Below-Temperature Tyre Condition', category:'Ban',
    def_id:'Ban yang belum mencapai suhu operasional optimal. Sangat licin dan berbahaya — penyebab utama spin dan kecelakaan di lap pembuka race.',
    def_en:'Tyre that hasn\'t reached its optimal operating temperature. Extremely slippery and dangerous — the main cause of spins and incidents on the opening lap.',
    fact_id:'Cold tyres setelah safety car adalah salah satu kondisi paling berbahaya yang dihadapi pembalap F1.',
    fact_en:'Cold tyres after a safety car restart are among the most dangerous conditions F1 drivers face.' },

  { term:'Pit Board', full:'Lap Information Display', category:'Umum',
    def_id:'Papan besar yang dipegang mekanik di tepi pit lane untuk menampilkan informasi posisi, gap, dan instruksi kepada pembalap saat melintas.',
    def_en:'Large board held by mechanics at the pit lane edge displaying position, gap, and instruction information to the driver as they pass.',
    fact_id:'Pit board tradisional kini sebagian besar digantikan komunikasi radio, tapi masih digunakan sebagai backup.',
    fact_en:'Traditional pit boards have been largely replaced by radio communication but are still used as a backup.' },

  { term:'Driver Input', full:'Control Feedback Analysis', category:'Teknik',
    def_id:'Data tentang bagaimana pembalap menggunakan kontrol — sudut kemudi, tekanan rem, posisi throttle, dan waktu perpindahan gigi — yang dianalisis oleh insinyur.',
    def_en:'Data on how the driver uses the controls — steering angle, brake pressure, throttle position, and gear shift timing — analysed by engineers.',
    fact_id:'Membandingkan data driver input dua pembalap satu tim adalah cara paling akurat mengidentifikasi sumber perbedaan lap time.',
    fact_en:'Comparing two teammates\' driver input data is the most accurate way to identify the source of lap time differences.' },

  { term:'Grip', full:'Tyre-to-Surface Adhesion', category:'Ban',
    def_id:'Kemampuan ban untuk menempel ke aspal dan mentransfer gaya akselerasi, pengereman, dan tikungan tanpa sliding.',
    def_en:'The tyre\'s ability to adhere to the asphalt and transfer acceleration, braking, and cornering forces without sliding.',
    fact_id:'Grip adalah satu kata yang menjelaskan hampir semua persoalan dan keunggulan dalam balap F1.',
    fact_en:'Grip is the single word that explains nearly every problem and advantage in Formula 1 racing.' },

  { term:'Tyre Pressure', full:'Tyre Inflation Level', category:'Ban',
    def_id:'Tekanan udara di dalam ban yang mempengaruhi area kontak ban dengan aspal, suhu operasional, dan perilaku handling.',
    def_en:'Air pressure inside the tyre affecting the contact patch with asphalt, operating temperature, and handling behaviour.',
    fact_id:'FIA menetapkan batas tekanan ban minimum yang diverifikasi saat warm-up dan di sepanjang race.',
    fact_en:'The FIA sets minimum tyre pressure limits that are verified at warm-up and throughout the race.' },

  { term:'Contact Patch', full:'Tyre Ground Contact Area', category:'Ban',
    def_id:'Area kecil ban yang sebenarnya menyentuh aspal pada satu waktu. Meskipun kecil (sekitar seukuran telapak tangan), inilah satu-satunya koneksi antara mobil dan lintasan.',
    def_en:'The small area of tyre actually touching the asphalt at any given moment. Though small (roughly palm-sized), this is the sole connection between car and track.',
    fact_id:'Empat contact patch F1 yang masing-masing seukuran telapak tangan harus mentransfer lebih dari 1.000 hp ke aspal.',
    fact_en:'Four palm-sized contact patches must transfer over 1,000 hp of force to the asphalt.' },

  { term:'Tyre Blanket Phase-Out', full:'2025 Pre-Heat Tyre Ban', category:'Ban',
    def_id:'Rencana FIA untuk secara bertahap menghapus penggunaan selimut panas ban pada 2025. Tantangan teknis besar — ban yang dingin jauh lebih berbahaya.',
    def_en:'FIA\'s plan to gradually eliminate tyre blankets in 2025. A major technical challenge — cold tyres are significantly more dangerous.',
    fact_id:'Penghapusan tyre blanket diharapkan menghemat energi dan mengurangi kompleksitas operasional pit lane.',
    fact_en:'Eliminating tyre blankets is expected to save energy and reduce pit lane operational complexity.', isNew:true },

  { term:'Qualifying Trim', full:'Low-Fuel Low-Weight Setup', category:'Teknik',
    def_id:'Konfigurasi mobil khusus untuk kualifikasi — biasanya dengan bahan bakar minimum, tanpa air pendingin berlebih, dan setup aero yang dioptimalkan untuk satu lap cepat.',
    def_en:'Car configuration specific to qualifying — typically minimum fuel, no excess cooling water, and aerodynamic setup optimised for a single fast lap.',
    fact_id:'Perbedaan antara qualifying trim dan race trim bisa mencapai 50–80 kg berat total.',
    fact_en:'The difference between qualifying trim and race trim can be 50–80 kg in total weight.' },

  { term:'High Fuel Run', full:'Race Simulation Pace Test', category:'Strategi',
    def_id:'Sesi latihan dengan beban bahan bakar penuh (mirip kondisi race awal) untuk mengukur performa race pace sesungguhnya dan model deg ban.',
    def_en:'Practice session run with a full fuel load (similar to early race conditions) to measure true race pace and tyre degradation model.',
    fact_id:'High fuel run di FP2 adalah sesi paling informatif di seluruh akhir pekan race untuk prediksi strategi.',
    fact_en:'The FP2 high fuel run is the most informative session of the entire race weekend for strategy prediction.' },

  { term:'Fuel Delta', full:'Fuel Consumption Gap vs Target', category:'Power Unit',
    def_id:'Selisih antara konsumsi bahan bakar aktual dan target yang ditetapkan strategi. Fuel delta positif berarti mobil mengonsumsi lebih sedikit dari yang direncanakan.',
    def_en:'The gap between actual fuel consumption and the strategic target. A positive fuel delta means the car is using less fuel than planned.',
    fact_id:'Pembalap mendapat update fuel delta secara berkala melalui radio untuk menyesuaikan gaya mengemudi mereka.',
    fact_en:'Drivers receive periodic fuel delta updates via radio to adjust their driving style accordingly.' },

  { term:'Power Unit Penalty', full:'Engine Component Grid Drop', category:'Regulasi',
    def_id:'Penalti grid akibat mengganti komponen PU melebihi alokasi musim (3 ICE, 3 turbo, dll). Setiap komponen ke-4 mengakibatkan penalti 10 posisi, berikutnya 5 posisi.',
    def_en:'Grid penalty from replacing PU components beyond season allocation (3 ICE, 3 turbos, etc.). Each additional component incurs a 10-place penalty, subsequent ones 5 places.',
    fact_id:'Beberapa tim sengaja mengambil PU penalty di sirkuit overtaking-friendly untuk mendapat komponen segar.',
    fact_en:'Some teams deliberately take PU penalties at overtaking-friendly circuits to gain fresh components.' },

  { term:'Parc Fermé Breach', full:'Post-Quali Setup Violation', category:'Regulasi',
    def_id:'Melakukan perubahan pada mobil yang tidak diizinkan selama periode parc fermé setelah kualifikasi. Hukumannya adalah start dari pit lane.',
    def_en:'Making changes to the car that are not permitted during the post-qualifying parc fermé period. The penalty is starting from the pit lane.',
    fact_id:'Start dari pit lane hampir selalu mengakibatkan kehilangan banyak posisi dan membuat race sangat sulit.',
    fact_en:'A pit lane start almost always results in losing many positions and makes the race extremely challenging.' },

  { term:'Wet-Dry Strategy', full:'Mixed Condition Race Plan', category:'Strategi',
    def_id:'Strategi balapan di kondisi transisi basah ke kering (atau sebaliknya) yang membutuhkan keputusan waktu ideal untuk beralih antara ban basah dan slick.',
    def_en:'Race strategy in transitioning wet-to-dry (or dry-to-wet) conditions requiring perfectly timed decisions on when to switch between wet and slick tyres.',
    fact_id:'Keputusan timing perubahan ban basah ke slick di kondisi transisi bisa menentukan kemenangan atau kekalahan.',
    fact_en:'The timing decision to switch from wet to slick tyres in transitional conditions can single-handedly decide the race.' },

  { term:'Track Mapping', full:'Circuit Data Collection Lap', category:'Teknik',
    def_id:'Proses pengumpulan data komprehensif tentang karakteristik lintasan sirkuit menggunakan sensor dan kamera. Dilakukan di FP1 di sirkuit baru atau setelah resurfacing.',
    def_en:'Comprehensive data collection process on circuit characteristics using sensors and cameras. Done in FP1 at new venues or after resurfacing.',
    fact_id:'Data track mapping digunakan untuk mengoptimalkan setup suspensi, aero, dan strategi rem untuk setiap sirkuit.',
    fact_en:'Track mapping data is used to optimise suspension, aero, and braking strategy setup for each circuit.' },

  { term:'Tyre Swap', full:'Full Four-Tyre Change', category:'Umum',
    def_id:'Penggantian keempat ban secara simultan oleh tim mekanik selama pit stop. Tim papan atas dapat menyelesaikan tyre swap dalam waktu di bawah 2 detik.',
    def_en:'Simultaneous replacement of all four tyres by the tyre team during a pit stop. Top teams can complete a tyre swap in under 2 seconds.',
    fact_id:'Setiap ban melibatkan tiga mekanik: satu melepas ban lama dan dua memasang ban baru.',
    fact_en:'Each tyre involves three mechanics: one removing the old tyre and two fitting the new one.' },
];

// ─── DERIVED STATS ────────────────────────────────────────────────────────────
const TOTAL = GLOSSARY.length; // 254 terms

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function GlossaryScreen() {
  const insets = useSafeAreaInsets();
  const { theme, settings } = useSettings();
  const isEN = settings.language === 'en';

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchRef = useRef<TextInput>(null);

  const filtered = GLOSSARY.filter((g) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      g.term.toLowerCase().includes(q) ||
      g.full.toLowerCase().includes(q) ||
      (isEN ? g.def_en : g.def_id).toLowerCase().includes(q);
    const matchCat = activeCategory === 'Semua' || g.category === activeCategory;
    return matchSearch && matchCat;
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleCategory = useCallback((key: Category) => {
    setActiveCategory(key);
    setOpenIndex(null);
  }, []);

  const countFor = (key: Category) =>
    key === 'Semua' ? TOTAL : GLOSSARY.filter((g) => g.category === key).length;

  const HEADER_H = insets.top + 268;

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <BgDecoration theme={theme} />

      {/* ── STICKY HEADER ─────────────────────────────────────────────────── */}
      <Animated.View style={[s.header, { paddingTop: insets.top }]}>
        {/* Frosted backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.bg,
              opacity: headerOpacity,
            },
          ]}
        />

        {/* ── Title row ────────────────────────────────────────────────── */}
        <View style={s.titleRow}>
          <View>
            <Text style={[s.eyebrow, { color: theme.accent }]}>
              {isEN ? 'F1 ENCYCLOPEDIA' : 'ENSIKLOPEDIA F1'}
            </Text>
            <Text style={[s.title, { color: theme.text }]}>Glossary</Text>
          </View>

          {/* Stats cluster */}
          <View style={s.statsCluster}>
            <View style={[s.statBadge, { backgroundColor: theme.accentBg }]}>
              <Text style={[s.statNum, { color: theme.accent }]}>
                {filtered.length < TOTAL ? `${filtered.length}/` : ''}
                {TOTAL}
              </Text>
              <Text style={[s.statLabel, { color: theme.accent }]}>
                {isEN ? 'terms' : 'istilah'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Search bar ───────────────────────────────────────────────── */}
        <View style={[s.searchWrap, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[s.searchIcon, { color: theme.textMuted }]}>⌕</Text>
          <TextInput
            ref={searchRef}
            style={[s.searchInput, { color: theme.text }]}
            placeholder={isEN ? 'Search terms or definitions…' : 'Cari istilah atau definisi…'}
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={(t) => { setSearch(t); setOpenIndex(null); }}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[s.clearBtn, { backgroundColor: theme.accentBg }]}
            >
              <Text style={[s.clearText, { color: theme.accent }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Category filter pills ─────────────────────────────────────── */}
        <View style={s.filterRow}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            const badge = BADGE[cat.key];
            const label = isEN ? cat.labelEN : cat.label;

            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => handleCategory(cat.key)}
                activeOpacity={0.75}
                style={[
                  s.pill,
                  {
                    backgroundColor: active ? badge.activeBg : theme.card,
                    borderColor: active ? badge.activeBg : theme.cardBorder,
                  },
                ]}
              >
                <Text style={s.pillIcon}>{cat.icon}</Text>
                <Text
                  style={[s.pillLabel, { color: active ? '#fff' : theme.textSub }]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <View
                  style={[
                    s.pillCount,
                    { backgroundColor: active ? 'rgba(255,255,255,0.22)' : badge.bg },
                  ]}
                >
                  <Text style={[s.pillCountText, { color: active ? '#fff' : badge.text }]}>
                    {countFor(cat.key)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* ── SCROLL LIST ───────────────────────────────────────────────────── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={[s.listContent, { paddingTop: HEADER_H }]}
      >
        {/* ── Empty state ──────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🏁</Text>
            <Text style={[s.emptyTitle, { color: theme.text }]}>
              {isEN ? 'No results found' : 'Tidak ada hasil'}
            </Text>
            <Text style={[s.emptyBody, { color: theme.textMuted }]}>
              {isEN ? `Try a different keyword` : `Coba kata kunci lain`}
            </Text>
          </View>
        )}

        {/* ── Result count hint ────────────────────────────────────────── */}
        {filtered.length > 0 && (activeCategory !== 'Semua' || search.length > 0) && (
          <Text style={[s.resultHint, { color: theme.textMuted }]}>
            {filtered.length} {isEN ? 'result' : 'istilah'}
            {filtered.length !== 1 && isEN ? 's' : ''}
          </Text>
        )}

        {/* ── Glossary cards ───────────────────────────────────────────── */}
        {filtered.map((item, i) => {
          const badge = BADGE[item.category];
          const open = openIndex === i;
          const catMeta = CATEGORIES.find((c) => c.key === item.category)!;
          const catLabel = isEN ? catMeta.labelEN : catMeta.label;

          return (
            <ThemeCard key={`${item.term}-${i}`} theme={theme} style={s.card}>
              <TouchableOpacity
                onPress={() => setOpenIndex(open ? null : i)}
                activeOpacity={0.72}
              >
                {/* ── Card header ──────────────────────────────────────── */}
                <View style={s.cardHeader}>
                  {/* Left: term + category */}
                  <View style={s.cardLeft}>
                    <View style={[s.termChip, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[s.termText, { color: badge.text }]}>{item.term}</Text>
                    </View>
                    <View style={[s.catDot, { backgroundColor: badge.bg }]}>
                      <Text style={s.catDotIcon}>{catMeta.icon}</Text>
                      <Text style={[s.catDotLabel, { color: badge.text }]}>{catLabel}</Text>
                    </View>
                  </View>

                  {/* Right: chevron */}
                  <View
                    style={[
                      s.chevron,
                      {
                        backgroundColor: open ? badge.bg : theme.accentBg,
                        borderColor: open ? badge.border : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[s.chevronText, { color: open ? badge.text : theme.accent }]}>
                      {open ? '▲' : '▼'}
                    </Text>
                  </View>
                </View>

                {/* Full name */}
                <Text
                  style={[s.fullName, { color: theme.text }]}
                  numberOfLines={open ? 0 : 1}
                >
                  {item.full}
                </Text>

                {/* ── Accordion body ───────────────────────────────────── */}
                {open && (
                  <View style={[s.body, { borderTopColor: theme.cardBorder }]}>
                    <Text style={[s.defText, { color: theme.textSub }]}>
                      {isEN ? item.def_en : item.def_id}
                    </Text>

                    {(isEN ? item.fact_en : item.fact_id) && (
                      <View
                        style={[
                          s.factBox,
                          { backgroundColor: badge.bg, borderLeftColor: badge.text },
                        ]}
                      >
                        <Text style={s.factEmoji}>💡</Text>
                        <Text style={[s.factText, { color: badge.text }]}>
                          {isEN ? item.fact_en : item.fact_id}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </ThemeCard>
          );
        })}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // ── Header
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  // ── Title row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  statsCluster: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', opacity: 0.8 },

  // ── Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 18, marginTop: -1 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    borderRadius: 20,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { fontSize: 9, fontWeight: '800' },

  // ── Category filter
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    maxWidth: '48%',
  },
  pillIcon: { fontSize: 11 },
  pillLabel: { fontSize: 11.5, fontWeight: '600', flex: 1 },
  pillCount: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  pillCountText: { fontSize: 10, fontWeight: '800' },

  // ── List
  listContent: {
    paddingHorizontal: 16,
    gap: 7,
  },
  resultHint: {
    fontSize: 11.5,
    fontWeight: '500',
    marginBottom: 2,
    marginLeft: 2,
  },

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    marginTop: 72,
    gap: 10,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyBody: { fontSize: 13 },

  // ── Card
  card: { padding: 14, borderRadius: 16 },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },

  // Term chip — clean pill
  termChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  termText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Category dot
  catDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  catDotIcon: { fontSize: 10 },
  catDotLabel: { fontSize: 10, fontWeight: '700' },

  // Chevron
  chevron: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chevronText: { fontSize: 8, fontWeight: '800' },

  // Full name
  fullName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 0,
    letterSpacing: -0.2,
  },

  // ── Accordion body
  body: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  defText: {
    fontSize: 13.5,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  factBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  factEmoji: { fontSize: 13, marginTop: 2 },
  factText: {
    fontSize: 12.5,
    lineHeight: 19,
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
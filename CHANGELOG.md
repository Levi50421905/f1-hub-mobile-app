# Changelog

Semua perubahan penting pada project ini akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan project ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [1.4.8] — 2026-03-30

### ✨ Ditambahkan
- Race Detail: Tab Race, Qualifying, Sprint (hanya tampil di sprint weekend)
- Race Detail: Tabel hasil dengan kolom POS / DRIVER / TIM / WAKTU / PTS
- Race Detail: Podium 🥇🥈🥉 di atas hasil race
- Race Detail: Cuaca sirkuit real-time
- Race Detail: Animated header — background muncul saat scroll
- Semua circuit bisa di-tap dari Kalender (selesai maupun akan datang)
- Navbar bottom bar muncul di halaman Race Detail & Glossary
- Tombol back Race Detail langsung ke Kalender

### 🐛 Diperbaiki
- Notif bar HP tidak lagi tabrakan dengan konten
- Tab Sprint hanya muncul di sprint weekend
- Back button warna merah mengikuti tema

---

## [1.4.7] — 2026-03-30

### ✨ Ditambahkan
- Driver profil: Statistik karier lengkap (total race, wins, podium, pole, fastest lap, gelar dunia)
- Driver profil: Animated hero yang fade saat scroll
- World Championship fix — data pagination penuh dari API

### 🐛 Diperbaiki
- Bug `const insets` nyasar ke dalam JSX di drivers.tsx
- Bahasa di halaman Setting sekarang ikut setting language

---

## [1.4.5] — 2026-03-30

### ✨ Ditambahkan
- 4 tema: Dark, Carbon, Light Sports, Neon
- Race Weekend Mode — tema berubah otomatis saat race weekend berlangsung
- Ticker "RACE WEEKEND LIVE" di semua halaman
- FlagBadge component — emoji flag di HP, kode negara di web

### 🐛 Diperbaiki
- Duplicate declaration TEAM_COLORS di settings.tsx
- Import path error di race/[round].tsx

---

## [1.4.4] — 2026-03-30

### ✨ Ditambahkan
- Sistem notifikasi lokal — pengingat 30 menit sebelum setiap sesi F1
- Notifikasi support FP1, FP2, FP3, Qualifying, Sprint, Race
- Reschedule notifikasi dari Setting

---

## [1.0.1] — 2026-03-27

### ✨ Ditambahkan
- Halaman Race Detail dengan jadwal sesi
- Halaman F1 Glossary dengan search
- Cuaca di Next Race Card (Home)
- SafeArea support — konten tidak overlap dengan notif bar

---

## [1.0.0] — 2026-03-27

### 🎉 Rilis Pertama
- Home: Next Race Card dengan countdown live
- Klasemen: Driver & Konstruktor 2026
- Kalender: 23 race dengan filter Semua/Akan Datang/Selesai
- Driver: List driver dengan profil dasar
- Setting: Timezone (WIB/WITA/WIT), Bahasa (ID/EN), Tema (Dark)
- Data real-time dari Jolpica API
- Bendera negara driver & tim

---

[1.4.8]: https://github.com/leviar/f1-hub-mobile/releases/tag/v1.4.8
[1.4.7]: https://github.com/leviar/f1-hub-mobile/releases/tag/v1.4.7
[1.4.5]: https://github.com/leviar/f1-hub-mobile/releases/tag/v1.4.5
[1.4.4]: https://github.com/leviar/f1-hub-mobile/releases/tag/v1.4.4
[1.0.1]: https://github.com/leviar/f1-hub-mobile/releases/tag/v1.0.1
[1.0.0]: https://github.com/leviar/f1-hub-mobile/releases/tag/v1.0.0
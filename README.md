# F1HUB Mobile 🏎️

<div align="center">
  <img src="assets/images/AppIcon_F1Hub.png" width="120" alt="F1 Hub Logo" />
  
  <h3>Aplikasi F1 terlengkap untuk penggemar Formula 1 Indonesia</h3>

  ![Version](https://img.shields.io/badge/version-1.0.0-e10600?style=flat-square)
  ![Platform](https://img.shields.io/badge/platform-Android-brightgreen?style=flat-square)
  ![Built with](https://img.shields.io/badge/built%20with-Expo-000020?style=flat-square&logo=expo)
  ![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

  [📥 Download APK](#download) · [✨ Fitur](#fitur) · [🛠️ Development](#development)
</div>

---

## 📥 Download

| Versi | Tanggal | Link |
|-------|---------|------|
| v1.0.0 (Latest) | 31 Mar 2026 | [Download APK](https://github.com/Levi50421905/f1-hub-mobile/releases/latest) |

> **Cara Install:** Aktifkan *"Install dari sumber tidak dikenal"* di pengaturan HP sebelum install APK.

> **Requirements:** Android 8.0+ · Koneksi internet

---

## ✨ Fitur

### 🏠 Home
- **Next Race Card** — countdown live ke race berikutnya
- **Cuaca sirkuit** real-time via Open-Meteo API
- **Driver Standings** top 5 dengan warna tim
- **Race Berikutnya** dengan jadwal WIB/WITA/WIT
- **F1 Glossary** preview — istilah F1 untuk pemula

### 🏆 Klasemen
- Driver Standings & Constructor Standings 2026
- Data real-time dari Jolpica API
- Bendera negara setiap driver & tim
- Highlight driver favorit ⭐

### 📅 Kalender
- Jadwal lengkap 23 race musim 2026
- Filter: Semua / Akan Datang / Selesai
- Tap race untuk detail lengkap

### 🏁 Race Detail
- Jadwal semua sesi (FP1, FP2, FP3, Qualifying, Race)
- Hasil Race dengan podium 🥇🥈🥉
- Hasil Qualifying (Q1/Q2/Q3)
- Hasil Sprint (khusus sprint weekend)
- Cuaca sirkuit real-time
- Status sesi selesai / akan datang

### 👤 Driver
- Profil lengkap semua driver 2026
- **Statistik Karier** — total race, menang, podium, pole, fastest lap
- Set driver favorit ⭐

### 📚 F1 Glossary
- 200+ istilah F1 dalam Bahasa Indonesia & English
- Search real-time
- Penjelasan lengkap setiap istilah

### ⚙️ Setting
- **4 Tema**: Dark, Carbon, Light Sports, Neon, Steel Blue, Midnight Cyan
- **Race Weekend Mode** — tema berubah otomatis saat race weekend
- **Timezone**: WIB / WITA / WIT
- **Bahasa**: Indonesia / English
- **Notifikasi**: Pengingat 30 menit sebelum setiap sesi

---

## 📸 Screenshot

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="assets/screenshots/f1-hub-home.jpg" width="180" alt="Home" />
        <br /><sub><b>🏠 Home</b></sub>
      </td>
      <td align="center">
        <img src="assets/screenshots/f1-hub-klasemen.jpg" width="180" alt="Klasemen" />
        <br /><sub><b>🏆 Klasemen</b></sub>
      </td>
      <td align="center">
        <img src="assets/screenshots/f1-hub-kalender.jpg" width="180" alt="Kalender" />
        <br /><sub><b>📅 Kalender</b></sub>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="assets/screenshots/f1-hub-driver.jpg" width="180" alt="Driver" />
        <br /><sub><b>👤 Driver</b></sub>
      </td>
      <td align="center">
        <img src="assets/screenshots/f1-hub-driver-detail.jpg" width="180" alt="Driver Detail" />
        <br /><sub><b>👤 Driver Detail</b></sub>
      </td>
      <td align="center">
        <img src="assets/screenshots/f1-hub-race-detail.jpg" width="180" alt="Race Detail" />
        <br /><sub><b>🏁 Race Detail</b></sub>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="3">
        <img src="assets/screenshots/f1-hub-glossary.jpg" width="180" alt="F1 Glossary" />
        <br /><sub><b>📚 F1 Glossary</b></sub>
      </td>
    </tr>
  </table>
</div>

---

## 🛠️ Development

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo Router |
| Build | EAS Build |
| Data | Jolpica API (Ergast) |
| Cuaca | Open-Meteo API |
| Notifikasi | Expo Notifications |
| Storage | AsyncStorage |

### Setup

```bash
# Clone repo
git clone https://github.com/Levi50421905/f1-hub-mobile.git
cd f1-hub-mobile

# Install dependencies
npm install

# Start development
npx expo start
```

### Build APK

```bash
# Preview APK (internal testing)
eas build --profile preview --platform android

# Production APK
eas build --profile production --platform android
```

### Struktur Project

```
f1-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home
│   │   ├── standings.tsx      # Klasemen
│   │   ├── calendar.tsx       # Kalender
│   │   ├── drivers.tsx        # Driver
│   │   ├── settings.tsx       # Setting
│   │   ├── glossary.tsx       # F1 Glossary
│   │   └── race/[round].tsx   # Race Detail
│   └── _layout.tsx
├── components/
│   ├── ThemeCard.tsx
│   ├── BgDecoration.tsx
│   └── FlagBadge.tsx
├── lib/
│   ├── api.ts                 # API calls & utils
│   ├── theme.ts               # Theme system
│   ├── settings.ts            # Settings types
│   ├── SettingsContext.tsx    # Global settings
│   └── notifications.ts      # Push notifications
└── assets/
```

---

## 🗓️ Changelog

Lihat [CHANGELOG.md](CHANGELOG.md) untuk riwayat lengkap update.

---

## 📄 License

[MIT](LICENSE) © 2026 LeviAR

---

<div align="center">
  Dibuat dengan ❤️ untuk komunitas F1 Indonesia 🇮🇩
</div>
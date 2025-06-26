# FlashSmart

FlashSmart adalah aplikasi mobile flashcard dengan fitur AI untuk membantu proses belajar menjadi lebih efisien. Aplikasi ini memungkinkan pengguna untuk membuat dan mengelola flashcard, mengimpor konten dari dokumen, serta memanfaatkan algoritma Spaced Repetition System (SRS) untuk mengoptimalkan proses pembelajaran.

## Fitur Utama

- **Sistem Flashcard**: Membuat dan mengelola koleksi flashcard dengan animasi flip dan swipe.
- **Spaced Repetition System (SRS)**: Algoritma berdasarkan SM-2 untuk mengatur jadwal review kartu.
- **OCR & Ekstraksi Teks**: Scan gambar atau dokumen untuk mengekstrak teks secara otomatis.
- **Generasi AI**: Membuat flashcard otomatis dari teks yang diekstrak.
- **Sinkronisasi Cloud**: Menyimpan dan mengakses flashcard dari berbagai perangkat.
- **Mode Offline**: Menggunakan aplikasi tanpa koneksi internet.
- **Upload File**: Mendukung gambar dan dokumen PDF.

## Teknologi

- React Native & Expo
- TypeScript
- SQLite (penyimpanan lokal)
- Supabase (backend & autentikasi)
- Tesseract.js (OCR)
- Firebase (penyimpanan cloud)

## Struktur Proyek

```
/src
  /components      # Komponen UI yang dapat digunakan kembali
  /screens         # Layar aplikasi
  /navigation      # Struktur navigasi aplikasi
  /services        # Layanan (database, AI, Supabase)
  /utils           # Utilitas dan helpers
  /assets          # Aset aplikasi (gambar, font, dll)
```

## Instalasi

```bash
# Instal dependensi
npm install

# Jalankan di perangkat Android
npm run android

# Jalankan di perangkat iOS
npm run ios
```

## Dependensi Utama

- `@react-navigation/native`: Navigasi
- `@supabase/supabase-js`: Backend & autentikasi
- `react-native-sqlite-storage`: Penyimpanan lokal
- `expo-document-picker`, `expo-image-picker`: Pemilihan file
- `tesseract.js`: OCR
- `lottie-react-native`: Animasi
- `react-native-reanimated`: Animasi advanced

## Model Data

### Deck
- `id`: String
- `title`: String
- `description`: String (opsional)
- `coverImagePath`: String (opsional)
- `isPublic`: Boolean
- `tags`: String[] (opsional)
- `createdAt`: Date
- `updatedAt`: Date

### Card
- `id`: String
- `deckId`: String
- `frontContent`: String
- `backContent`: String
- `tags`: String[] (opsional)
- `mediaPath`: String (opsional)
- `srsData`: CardReviewData
- `createdAt`: Date
- `updatedAt`: Date

### CardReviewData (SRS)
- `easeFactor`: Number
- `interval`: Number
- `repetitions`: Number
- `dueDate`: Date
- `lastReviewedAt`: Date

## Alur Kerja

1. Pengguna membuat deck baru atau memilih deck yang ada
2. Pengguna dapat menambahkan kartu secara manual atau menggunakan AI
3. Untuk generasi AI, pengguna dapat mengupload gambar/dokumen
4. Algoritma SRS menentukan kartu mana yang perlu direview
5. Pengguna melakukan review dengan menggeser kartu (swipe) berdasarkan tingkat kesulitan
6. Data review disimpan dan digunakan untuk mengoptimalkan jadwal review berikutnya

## Catatan Pengembangan

- Gunakan file `.env` untuk menyimpan kunci API (tidak disertakan dalam repo)
- Pastikan izin kamera dan penyimpanan dikonfigurasi dengan benar di Android dan iOS

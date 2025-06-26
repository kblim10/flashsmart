import * as FileSystem from 'expo-file-system';
import Tesseract from 'tesseract.js';
import SQLite from 'react-native-sqlite-storage';
import { FlashcardReview } from '../utils/srs';

// Mengaktifkan promise dan debugging
SQLite.enablePromise(true);
SQLite.DEBUG(true);

// Definisi tabel database
const DATABASE = {
  name: 'flashsmart.db',
  version: '1.0',
  displayName: 'FlashSmart Database',
  size: 200000,
};

// Interface untuk model data
export interface Flashcard {
  id?: string;
  term: string;
  definition: string;
  category: string;
  createdAt?: Date;
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isPremium: boolean;
  createdAt?: Date;
}

// Interface untuk data flashcard yang dihasilkan
export interface ExtractedFlashcard {
  term: string;
  definition: string;
  category?: string;
}

// Layanan ekstraksi teks dari gambar menggunakan Tesseract OCR
export const extractTextFromImage = async (imageUri: string): Promise<string> => {
  try {
    // Load gambar dari URI
    const imageInfo = await FileSystem.getInfoAsync(imageUri);
    if (!imageInfo.exists) {
      throw new Error('File gambar tidak ditemukan');
    }

    // Konversi URI file ke format base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Proses OCR menggunakan Tesseract
    const result = await Tesseract.recognize(
      `data:image/jpeg;base64,${base64Image}`,
      'eng', // Bahasa - bisa diganti dengan 'ind' untuk Bahasa Indonesia jika tersedia
      {
        logger: (m) => console.log(m), // Opsional, untuk debug
      }
    );

    return result.data.text;
  } catch (error) {
    console.error('Error during OCR processing:', error);
    throw new Error('Gagal mengekstrak teks dari gambar');
  }
};

// Simulasi ekstraksi data dari teks menggunakan NLP (akan diganti dengan API asli)
// Dalam implementasi sebenarnya, ini akan memanggil backend dengan model NLP seperti spaCy
export const extractFlashcardsFromText = async (
  text: string,
  category?: string
): Promise<ExtractedFlashcard[]> => {
  try {
    // Simulasi delay pemrosesan server
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulasi ekstraksi flashcard
    // Dalam implementasi sebenarnya, ini akan menggunakan model NLP untuk
    // mengidentifikasi pasangan istilah-definisi
    
    // Algoritma sederhana: cari kalimat dengan pola "A adalah B" atau "A yaitu B" atau "A ialah B"
    const flashcards: ExtractedFlashcard[] = [];
    
    // Bagi teks menjadi paragraf
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    for (const paragraph of paragraphs) {
      // Cari pola kalimat definisi
      const definitions = paragraph.match(/([^.?!]+)\s+(?:adalah|yaitu|ialah)\s+([^.?!]+[.?!])/gi);
      
      if (definitions && definitions.length > 0) {
        for (const def of definitions) {
          // Pisahkan menjadi istilah dan definisi
          const match = def.match(/(.+?)\s+(?:adalah|yaitu|ialah)\s+(.+)/i);
          
          if (match && match.length >= 3) {
            const term = match[1].trim();
            const definition = match[2].trim();
            
            // Pastikan term dan definition tidak kosong dan memiliki panjang yang masuk akal
            if (term.length > 1 && definition.length > 5) {
              flashcards.push({
                term,
                definition,
                category,
              });
            }
          }
        }
      } else {
        // Jika tidak ada pola yang ditemukan, coba deteksi dengan pendekatan baris-per-baris
        // Mencari teks yang diikuti dengan titik dua (:)
        const lines = paragraph.split('\n').filter(l => l.trim().length > 0);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const colonIndex = line.indexOf(':');
          
          if (colonIndex > 0 && colonIndex < line.length - 1) {
            const term = line.substring(0, colonIndex).trim();
            const definition = line.substring(colonIndex + 1).trim();
            
            if (term.length > 1 && definition.length > 5) {
              flashcards.push({
                term,
                definition,
                category,
              });
            }
          }
        }
      }
    }
    
    // Jika tidak ada flashcard yang berhasil diekstrak, buat simulasi data
    if (flashcards.length === 0) {
      // Buat beberapa flashcard simulasi
      const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
      
      for (let i = 0; i < Math.min(sentences.length, 5); i++) {
        const sentence = sentences[i].trim();
        const words = sentence.split(' ').filter(w => w.length > 3);
        
        if (words.length >= 2) {
          const term = words[0].charAt(0).toUpperCase() + words[0].slice(1);
          const definition = sentence;
          
          flashcards.push({
            term,
            definition,
            category,
          });
        }
      }
    }
    
    return flashcards;
  } catch (error) {
    console.error('Error extracting flashcards from text:', error);
    throw new Error('Gagal mengekstrak flashcard dari teks');
  }
};

// Simulasi ekstraksi data dari PDF (akan diganti dengan implementasi sebenarnya)
export const extractTextFromPDF = async (pdfUri: string): Promise<string> => {
  try {
    // Simulasi delay pemrosesan
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Ini hanya simulasi - dalam implementasi sebenarnya akan menggunakan
    // library PDF parsing seperti pdf.js atau memanggil backend API
    return 'Ini adalah teks yang diekstrak dari PDF.\n\n' +
      'Fotosintesis adalah proses pembuatan makanan oleh tumbuhan hijau.\n\n' +
      'Metabolisme adalah proses kimia yang terjadi dalam tubuh makhluk hidup.\n\n' +
      'Ekosistem adalah sistem ekologi yang terbentuk dari hubungan timbal balik antara makhluk hidup dengan lingkungannya.\n\n' +
      'Klorofil yaitu pigmen hijau yang terdapat dalam tumbuhan.';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Gagal mengekstrak teks dari PDF');
  }
};

// Kelas Database Service untuk mengelola koneksi dan operasi database
class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  // Inisialisasi database
  async initDatabase(): Promise<void> {
    try {
      const db = await SQLite.openDatabase(
        DATABASE.name,
        DATABASE.version,
        DATABASE.displayName,
        DATABASE.size
      );
      this.db = db;
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Menutup koneksi database
  async closeDatabase(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        this.db = null;
        console.log('Database closed successfully');
      } catch (error) {
        console.error('Error closing database:', error);
        throw error;
      }
    }
  }

  // Membuat tabel-tabel yang diperlukan
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Tabel user
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          is_premium INTEGER DEFAULT 0,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
      `);

      // Tabel flashcard
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS flashcards (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          term TEXT NOT NULL,
          definition TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at INTEGER DEFAULT (strftime('%s', 'now')),
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
      `);

      // Tabel review (untuk SRS)
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS reviews (
          flashcard_id TEXT PRIMARY KEY,
          easiness REAL NOT NULL DEFAULT 2.5,
          interval INTEGER NOT NULL DEFAULT 0,
          repetitions INTEGER NOT NULL DEFAULT 0,
          next_review_date INTEGER NOT NULL,
          last_review_date INTEGER NOT NULL,
          FOREIGN KEY (flashcard_id) REFERENCES flashcards (id) ON DELETE CASCADE
        );
      `);

      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // === User Operations ===

  // Menambahkan pengguna baru
  async addUser(user: User): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      await this.db!.executeSql(
        `INSERT INTO users (id, email, name, is_premium) VALUES (?, ?, ?, ?);`,
        [user.id, user.email, user.name || null, user.isPremium ? 1 : 0]
      );
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  // Mendapatkan pengguna berdasarkan ID
  async getUserById(userId: string): Promise<User | null> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const [result] = await this.db!.executeSql(
        `SELECT * FROM users WHERE id = ?;`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows.item(0);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.is_premium === 1,
        createdAt: new Date(user.created_at * 1000),
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // === Flashcard Operations ===

  // Menambahkan flashcard baru
  async addFlashcard(flashcard: Flashcard): Promise<string> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const id = flashcard.id || Date.now().toString();
      await this.db!.executeSql(
        `INSERT INTO flashcards (id, user_id, term, definition, category) VALUES (?, ?, ?, ?, ?);`,
        [id, flashcard.userId, flashcard.term, flashcard.definition, flashcard.category]
      );
      return id;
    } catch (error) {
      console.error('Error adding flashcard:', error);
      throw error;
    }
  }

  // Mendapatkan semua flashcard milik user
  async getFlashcardsByUser(userId: string): Promise<Flashcard[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const [result] = await this.db!.executeSql(
        `SELECT * FROM flashcards WHERE user_id = ? ORDER BY created_at DESC;`,
        [userId]
      );

      const flashcards: Flashcard[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const item = result.rows.item(i);
        flashcards.push({
          id: item.id,
          userId: item.user_id,
          term: item.term,
          definition: item.definition,
          category: item.category,
          createdAt: new Date(item.created_at * 1000),
        });
      }

      return flashcards;
    } catch (error) {
      console.error('Error getting flashcards by user:', error);
      throw error;
    }
  }

  // Mendapatkan flashcard berdasarkan kategori
  async getFlashcardsByCategory(userId: string, category: string): Promise<Flashcard[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const [result] = await this.db!.executeSql(
        `SELECT * FROM flashcards WHERE user_id = ? AND category = ? ORDER BY created_at DESC;`,
        [userId, category]
      );

      const flashcards: Flashcard[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const item = result.rows.item(i);
        flashcards.push({
          id: item.id,
          userId: item.user_id,
          term: item.term,
          definition: item.definition,
          category: item.category,
          createdAt: new Date(item.created_at * 1000),
        });
      }

      return flashcards;
    } catch (error) {
      console.error('Error getting flashcards by category:', error);
      throw error;
    }
  }

  // === Review Operations (SRS) ===

  // Menyimpan data review flashcard
  async saveReview(flashcardId: string, review: FlashcardReview): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const nextReviewTimestamp = Math.floor(review.nextReviewDate.getTime() / 1000);
      const lastReviewTimestamp = Math.floor(review.lastReviewDate.getTime() / 1000);

      await this.db!.executeSql(
        `INSERT OR REPLACE INTO reviews 
         (flashcard_id, easiness, interval, repetitions, next_review_date, last_review_date) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          flashcardId,
          review.easiness,
          review.interval,
          review.repetitions,
          nextReviewTimestamp,
          lastReviewTimestamp,
        ]
      );
    } catch (error) {
      console.error('Error saving review:', error);
      throw error;
    }
  }

  // Mendapatkan flashcard yang siap untuk direview hari ini
  async getDueFlashcards(userId: string): Promise<Flashcard[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      const [result] = await this.db!.executeSql(
        `SELECT f.* FROM flashcards f
         JOIN reviews r ON f.id = r.flashcard_id
         WHERE f.user_id = ? AND r.next_review_date <= ?
         ORDER BY r.next_review_date ASC;`,
        [userId, now]
      );

      const flashcards: Flashcard[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const item = result.rows.item(i);
        flashcards.push({
          id: item.id,
          userId: item.user_id,
          term: item.term,
          definition: item.definition,
          category: item.category,
          createdAt: new Date(item.created_at * 1000),
        });
      }

      return flashcards;
    } catch (error) {
      console.error('Error getting due flashcards:', error);
      throw error;
    }
  }
}

// Ekspor instance singleton
export const databaseService = new DatabaseService();
export default databaseService; 
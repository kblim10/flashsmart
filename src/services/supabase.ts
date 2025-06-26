import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Ini hanya placeholder, nanti akan diganti dengan konfigurasi asli
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';

// Interface untuk model User
export interface User {
  id: string;
  email: string;
  premium: boolean;
  createdAt: Date;
}

// Interface untuk model Flashcard
export interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  category: string;
  createdAt: Date;
}

// Interface untuk model Session (review)
export interface Session {
  userId: string;
  flashcardId: string;
  nextReview: Date;
  difficulty: number;
}

// Buat instance Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Layanan Autentikasi
export const authService = {
  // Mendaftar pengguna baru
  register: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  // Login pengguna
  login: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Logout pengguna
  logout: async () => {
    return await supabase.auth.signOut();
  },

  // Mendapatkan pengguna saat ini
  getCurrentUser: async () => {
    return await supabase.auth.getUser();
  },
};

// Layanan Flashcard
export const flashcardService = {
  // Mendapatkan semua flashcard pengguna
  getFlashcards: async (userId: string) => {
    return await supabase
      .from('flashcards')
      .select('*')
      .eq('userId', userId);
  },

  // Mendapatkan flashcard berdasarkan kategori
  getFlashcardsByCategory: async (userId: string, category: string) => {
    return await supabase
      .from('flashcards')
      .select('*')
      .eq('userId', userId)
      .eq('category', category);
  },

  // Menambahkan flashcard baru
  addFlashcard: async (flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => {
    return await supabase.from('flashcards').insert([
      {
        ...flashcard,
        createdAt: new Date().toISOString(),
      },
    ]);
  },

  // Memperbarui flashcard
  updateFlashcard: async (id: string, updates: Partial<Flashcard>) => {
    return await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', id);
  },

  // Menghapus flashcard
  deleteFlashcard: async (id: string) => {
    return await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
  },
};

// Layanan Session (untuk SRS)
export const sessionService = {
  // Mendapatkan sesi review untuk flashcard
  getSession: async (userId: string, flashcardId: string) => {
    return await supabase
      .from('sessions')
      .select('*')
      .eq('userId', userId)
      .eq('flashcardId', flashcardId)
      .single();
  },

  // Mendapatkan semua flashcard yang harus ditinjau hari ini
  getDueFlashcards: async (userId: string) => {
    const today = new Date().toISOString();
    
    return await supabase
      .from('sessions')
      .select('*, flashcards(*)')
      .eq('userId', userId)
      .lte('nextReview', today);
  },

  // Membuat atau memperbarui sesi review
  updateSession: async (session: Session) => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('userId', session.userId)
      .eq('flashcardId', session.flashcardId);

    if (data && data.length > 0) {
      // Update existing session
      return await supabase
        .from('sessions')
        .update({
          nextReview: session.nextReview,
          difficulty: session.difficulty,
        })
        .eq('userId', session.userId)
        .eq('flashcardId', session.flashcardId);
    } else {
      // Create new session
      return await supabase.from('sessions').insert([session]);
    }
  },
};

export default supabase; 
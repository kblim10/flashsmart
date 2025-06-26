/**
 * Implementasi algoritma SM-2 untuk Spaced Repetition System (SRS)
 * Berdasarkan algoritma SuperMemo-2
 */

export interface FlashcardReview {
  easiness: number;       // Faktor kemudahan (EF) - biasanya dimulai dari 2.5
  interval: number;       // Interval dalam hari
  repetitions: number;    // Jumlah pengulangan berturut-turut yang berhasil
  nextReviewDate: Date;   // Tanggal peninjauan berikutnya
  lastReviewDate: Date;   // Tanggal peninjauan terakhir
}

// Rating kesulitan (quality of response)
export enum Rating {
  VeryDifficult = 0,  // "Sangat Sulit"
  Difficult = 1,      // "Sulit"
  Moderate = 2,       // "Biasa"
  Easy = 3,           // "Mudah"
  VeryEasy = 4,       // "Sangat Mudah"
  Perfect = 5,        // "Sempurna"
}

// Inisialisasi review baru untuk flashcard
export const initializeReview = (): FlashcardReview => {
  return {
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date(),
    lastReviewDate: new Date(),
  };
};

/**
 * Menghitung jadwal pengulangan berikutnya berdasarkan rating
 * @param review - Data review flashcard saat ini
 * @param rating - Rating yang diberikan pengguna (0-5)
 * @returns FlashcardReview yang diperbarui
 */
export const calculateNextReview = (
  review: FlashcardReview,
  rating: Rating
): FlashcardReview => {
  const { easiness, repetitions } = review;
  
  // Buat salinan review untuk diperbarui
  const updatedReview: FlashcardReview = { ...review };
  
  // Perbarui faktor kemudahan (EF)
  let newEasiness = easiness + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  
  // Batasi EF minimum ke 1.3
  if (newEasiness < 1.3) {
    newEasiness = 1.3;
  }
  
  updatedReview.easiness = newEasiness;
  updatedReview.lastReviewDate = new Date();
  
  // Jika jawaban buruk (rating < 3), reset pengulangan
  if (rating < 3) {
    updatedReview.repetitions = 0;
    updatedReview.interval = 1; // Tinjau lagi besok
  } else {
    // Tingkatkan jumlah pengulangan yang berhasil
    updatedReview.repetitions += 1;
    
    // Hitung interval baru
    if (updatedReview.repetitions === 1) {
      updatedReview.interval = 1; // Ulangi sehari setelah pertama kali berhasil
    } else if (updatedReview.repetitions === 2) {
      updatedReview.interval = 6; // Ulangi 6 hari setelah kedua kali berhasil
    } else {
      // Untuk pengulangan ketiga dan seterusnya, gunakan rumus SM-2
      updatedReview.interval = Math.round(updatedReview.interval * updatedReview.easiness);
    }
  }
  
  // Hitung tanggal peninjauan berikutnya
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + updatedReview.interval);
  updatedReview.nextReviewDate = nextDate;
  
  return updatedReview;
};

/**
 * Memeriksa apakah flashcard perlu ditinjau hari ini
 * @param review - Data review flashcard
 * @returns boolean - true jika perlu ditinjau hari ini
 */
export const isDueForReview = (review: FlashcardReview): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextReviewDate = new Date(review.nextReviewDate);
  nextReviewDate.setHours(0, 0, 0, 0);
  
  return nextReviewDate <= today;
}; 
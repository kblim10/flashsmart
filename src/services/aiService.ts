import * as FileSystem from 'expo-file-system';
import Tesseract from 'tesseract.js';

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

// Layanan AI untuk pemrosesan teks dan pembuatan flashcard
const aiService = {
  extractTextFromImage,
  extractFlashcardsFromText,
  extractTextFromPDF,
  
  // Proses file dan ekstrak flashcard
  processFile: async (
    fileUri: string,
    fileType: string,
    category?: string
  ): Promise<ExtractedFlashcard[]> => {
    try {
      let text: string;
      
      // Ekstrak teks dari file berdasarkan tipe
      if (fileType === 'pdf') {
        text = await extractTextFromPDF(fileUri);
      } else if (['jpg', 'jpeg', 'png'].includes(fileType)) {
        text = await extractTextFromImage(fileUri);
      } else {
        throw new Error('Tipe file tidak didukung');
      }
      
      // Ekstrak flashcard dari teks
      const flashcards = await extractFlashcardsFromText(text, category);
      return flashcards;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  },
};

export default aiService; 
export interface VocabularyItem {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string; // Từ loại: danh từ, động từ, tính từ, trạng từ... (n., v., adj., adv.)
  meaning: string;
  example?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyVocabularyState {
  date: string;
  wordIds: string[];
}

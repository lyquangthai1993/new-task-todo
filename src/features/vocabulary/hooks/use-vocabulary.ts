import { useCallback, useEffect, useMemo } from "react";
import { useLocalState } from "../../../hooks/use-local-state";
import { createStorage } from "../../../utils/create-storage";
import { getTodayIso } from "../../../utils/date";
import {
  VOCABULARY_DAILY_STORAGE_KEY,
  VOCABULARY_STORAGE_KEY,
} from "../constants/storage-keys";
import type { DailyVocabularyState, VocabularyItem } from "../types";

export interface VocabularyInput {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaning: string;
  example?: string;
}

const vocabularyStorage = createStorage<VocabularyItem[]>(
  VOCABULARY_STORAGE_KEY,
  [],
);

const dailyStateStorage = createStorage<DailyVocabularyState>(
  VOCABULARY_DAILY_STORAGE_KEY,
  { date: "", wordIds: [] },
);

// Hàm xáo trộn mảng ngẫu nhiên (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useVocabulary() {
  const [words, persistWords, isWordsLoading] = useLocalState<VocabularyItem[]>(
    vocabularyStorage,
    [],
  );

  const [dailyState, persistDailyState, isDailyLoading] =
    useLocalState<DailyVocabularyState>(dailyStateStorage, {
      date: "",
      wordIds: [],
    });

  const todayIso = getTodayIso();

  // Kiểm tra và tự động cập nhật 3 từ ngẫu nhiên của ngày hôm nay
  useEffect(() => {
    if (isWordsLoading || isDailyLoading) return;

    const existingWordMap = new Map(words.map((item) => [item.id, item]));
    const validWordIds = dailyState.wordIds.filter((id) => existingWordMap.has(id));

    const isDateCurrent = dailyState.date === todayIso;
    const targetCount = Math.min(3, words.length);

    // Nếu khác ngày, hoặc ID không còn hợp lệ, hoặc từ vựng mới được thêm làm tăng tổng số từ mà ngày hôm nay chưa đủ 3 từ
    const needsNewSelection =
      !isDateCurrent ||
      validWordIds.length !== dailyState.wordIds.length ||
      (validWordIds.length < targetCount && words.length > validWordIds.length);

    if (needsNewSelection) {
      if (words.length === 0) {
        if (dailyState.wordIds.length > 0 || dailyState.date !== todayIso) {
          persistDailyState({ date: todayIso, wordIds: [] });
        }
        return;
      }

      // Chọn ngẫu nhiên targetCount từ vựng từ danh sách khả dụng
      let selectedIds: string[] = [];

      if (isDateCurrent && validWordIds.length > 0) {
        // Giữ lại các từ hợp lệ của ngày hôm nay, chỉ bổ sung thêm từ mới nếu cần
        const remainingWords = words.filter((w) => !validWordIds.includes(w.id));
        const additionalWords = shuffleArray(remainingWords).slice(
          0,
          targetCount - validWordIds.length,
        );
        selectedIds = [...validWordIds, ...additionalWords.map((w) => w.id)];
      } else {
        // Ngày mới: chọn mới hoàn toàn 3 từ ngẫu nhiên
        const shuffled = shuffleArray(words);
        selectedIds = shuffled.slice(0, targetCount).map((w) => w.id);
      }

      persistDailyState({
        date: todayIso,
        wordIds: selectedIds,
      });
    }
  }, [
    words,
    dailyState,
    todayIso,
    isWordsLoading,
    isDailyLoading,
    persistDailyState,
  ]);

  // Lấy ra danh sách 3 đối tượng từ vựng của ngày hôm nay
  const dailyWords = useMemo(() => {
    const wordMap = new Map(words.map((item) => [item.id, item]));
    return dailyState.wordIds
      .map((id) => wordMap.get(id))
      .filter((item): item is VocabularyItem => Boolean(item));
  }, [words, dailyState.wordIds]);

  const addWord = useCallback(
    (input: VocabularyInput): VocabularyItem => {
      const now = new Date().toISOString();
      const newWord: VocabularyItem = {
        id: crypto.randomUUID(),
        word: input.word.trim(),
        phonetic: input.phonetic?.trim() || undefined,
        partOfSpeech: input.partOfSpeech?.trim() || undefined,
        meaning: input.meaning.trim(),
        example: input.example?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      const updatedWords = [newWord, ...words];
      persistWords(updatedWords);
      return newWord;
    },
    [words, persistWords],
  );

  const editWord = useCallback(
    (id: string, input: VocabularyInput) => {
      const now = new Date().toISOString();
      const updatedWords = words.map((item) =>
        item.id === id
          ? {
              ...item,
              word: input.word.trim(),
              phonetic: input.phonetic?.trim() || undefined,
              partOfSpeech: input.partOfSpeech?.trim() || undefined,
              meaning: input.meaning.trim(),
              example: input.example?.trim() || undefined,
              updatedAt: now,
            }
          : item,
      );
      persistWords(updatedWords);
    },
    [words, persistWords],
  );

  const deleteWord = useCallback(
    (id: string) => {
      const updatedWords = words.filter((item) => item.id !== id);
      persistWords(updatedWords);

      // Nếu từ vừa xóa đang nằm trong danh sách gợi ý 3 từ hôm nay, loại bỏ khỏi dailyState
      if (dailyState.wordIds.includes(id)) {
        persistDailyState({
          ...dailyState,
          wordIds: dailyState.wordIds.filter((wId) => wId !== id),
        });
      }
    },
    [words, dailyState, persistWords, persistDailyState],
  );

  // Đổi thủ công 3 từ gợi ý khác cho ngày hôm nay (nếu người dùng bấm nút làm mới)
  const refreshDailyWords = useCallback(() => {
    if (words.length === 0) return;
    const targetCount = Math.min(3, words.length);
    const shuffled = shuffleArray(words);
    const selectedIds = shuffled.slice(0, targetCount).map((w) => w.id);
    persistDailyState({
      date: todayIso,
      wordIds: selectedIds,
    });
  }, [words, todayIso, persistDailyState]);

  return {
    words,
    dailyWords,
    isLoading: isWordsLoading || isDailyLoading,
    addWord,
    editWord,
    deleteWord,
    refreshDailyWords,
  };
}

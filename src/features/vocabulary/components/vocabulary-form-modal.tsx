import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/button/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

import type { VocabularyInput } from "../hooks/use-vocabulary";
import type { VocabularyItem } from "../types";
import { fetchVocabularyWithAi } from "../utils/gemini-vocabulary";

interface VocabularyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: VocabularyInput) => void;
  editingItem?: VocabularyItem | null;
}

export default function VocabularyFormModal({
  open,
  onOpenChange,
  onSubmit,
  editingItem,
}: VocabularyFormModalProps) {
  const [word, setWord] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setWord(editingItem.word);
      setPhonetic(editingItem.phonetic || "");
      setPartOfSpeech(editingItem.partOfSpeech || "");
      setMeaning(editingItem.meaning);
      setExample(editingItem.example || "");
    } else {
      setWord("");
      setPhonetic("");
      setPartOfSpeech("");
      setMeaning("");
      setExample("");
    }
    setAiError(null);
    setIsAiLoading(false);
  }, [editingItem, open]);

  async function handleAiGenerate() {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetchVocabularyWithAi(trimmedWord);
      if (res.phonetic) setPhonetic(res.phonetic);
      if (res.partOfSpeech) setPartOfSpeech(res.partOfSpeech);
      if (res.meaning) setMeaning(res.meaning);
      if (res.example) setExample(res.example);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi gọi AI.",
      );
    } finally {
      setIsAiLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    onSubmit({
      word: word.trim(),
      phonetic: phonetic.trim() || undefined,
      partOfSpeech: partOfSpeech.trim() || undefined,
      meaning: meaning.trim(),
      example: example.trim() || undefined,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Ô nhập Từ mới + Nút AI Tra từ */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="word-input"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>
                Từ mới <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-muted">
                Gõ từ vựng & bấm nút AI để tự động điền
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="word-input"
                type="text"
                required
                placeholder="VD: Serendipity"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiLoading || !word.trim()}
                title="Tự động tra phiên âm, từ loại, nghĩa và ví dụ bằng Gemini AI"
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tra...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Tra AI</span>
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="text-xs text-rose-500 mt-1">{aiError}</p>
            )}
          </div>

          {/* Hàng 2 cột: Phiên âm (IPA) & Từ loại (Part of Speech) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phonetic-input"
                className="text-xs font-semibold text-foreground"
              >
                Phiên âm (IPA)
              </label>
              <input
                id="phonetic-input"
                type="text"
                placeholder="VD: /ˌser.ənˈdɪp.ə.ti/"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="pos-input"
                className="text-xs font-semibold text-foreground"
              >
                Từ loại
              </label>
              <input
                id="pos-input"
                type="text"
                placeholder="VD: adj., v., n., adv."
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="meaning-input"
              className="text-xs font-semibold text-foreground"
            >
              Nghĩa tiếng Việt <span className="text-rose-500">*</span>
            </label>
            <input
              id="meaning-input"
              type="text"
              required
              placeholder="VD: Sự tình cờ may mắn"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="example-input"
              className="text-xs font-semibold text-foreground"
            >
              Ví dụ đặt câu
            </label>
            <textarea
              id="example-input"
              rows={2}
              placeholder="VD: We met by pure serendipity."
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>

          <DialogFooter className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingItem ? "Lưu thay đổi" : "Thêm từ vựng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

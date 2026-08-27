import { Edit3, Plus, Search, Trash2, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../components/button/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

import type { VocabularyInput } from "../hooks/use-vocabulary";
import type { VocabularyItem } from "../types";
import VocabularyFormModal from "./vocabulary-form-modal";
import HighlightWord from "./highlight-word";

interface VocabularyManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  words: VocabularyItem[];
  onAddWord: (input: VocabularyInput) => void;
  onEditWord: (id: string, input: VocabularyInput) => void;
  onDeleteWord: (id: string) => void;
}

export default function VocabularyManagerModal({
  open,
  onOpenChange,
  words,
  onAddWord,
  onEditWord,
  onDeleteWord,
}: VocabularyManagerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);

  const filteredWords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.example && w.example.toLowerCase().includes(q)),
    );
  }, [words, searchQuery]);

  function handleOpenAdd() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(item: VocabularyItem) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function handleFormSubmit(values: VocabularyInput) {
    if (editingItem) {
      onEditWord(editingItem.id, values);
    } else {
      onAddWord(values);
    }
  }

  function handleSpeak(wordText: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }, 80);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-row items-center justify-between gap-4">
            <div>
              <DialogTitle>Kho từ vựng của bạn</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng số: {words.length} từ vựng
              </p>
            </div>
            <Button
              onClick={handleOpenAdd}
              className="rounded-full px-3 py-1.5 text-xs mr-6"
            >
              <Plus className="h-4 w-4" />
              Thêm từ mới
            </Button>
          </DialogHeader>

          {/* Thanh tìm kiếm */}
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng, nghĩa, ví dụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Danh sách từ vựng */}
          <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] pr-1 mt-2">
            {filteredWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
                <p className="text-sm">
                  {searchQuery
                    ? "Không tìm thấy từ vựng phù hợp."
                    : "Chưa có từ vựng nào trong kho. Hãy thêm từ mới đầu tiên!"}
                </p>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-1">
                {filteredWords.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-base">
                          {item.word}
                        </span>
                        {item.phonetic && (
                          <span className="text-xs font-mono text-muted italic">
                            {item.phonetic}
                          </span>
                        )}
                        {item.partOfSpeech && (
                          <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-brand uppercase">
                            {item.partOfSpeech}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSpeak(item.word)}
                          title="Nghe phát âm"
                          className="rounded p-1 text-muted hover:bg-background hover:text-brand transition-colors"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-medium text-foreground/90">
                        {item.meaning}
                      </p>

                      {item.example && (
                        <div className="flex items-start justify-between gap-1.5 border-l-2 border-brand/30 pl-2 mt-0.5">
                          <p className="text-xs text-muted italic leading-relaxed flex-1">
                            "<HighlightWord text={item.example} word={item.word} />"
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSpeak(item.example!)}
                            title="Nghe đọc câu ví dụ"
                            className="rounded p-1 text-muted hover:bg-background hover:text-brand transition-colors shrink-0 cursor-pointer"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Sửa từ vựng"
                        className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteWord(item.id)}
                        title="Xóa từ vựng"
                        className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <VocabularyFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
      />
    </>
  );
}

import { Eye, EyeOff, Trash2, Volume2 } from "lucide-react";
import { useState } from "react";
import type { VocabularyItem } from "../types";
import HighlightWord from "./highlight-word";

interface DailyWordCardProps {
  item: VocabularyItem;
  index: number;
  onDelete?: (id: string) => void;
}

export default function DailyWordCard({
  item,
  index,
  onDelete,
}: DailyWordCardProps) {
  const [isRevealed, setIsRevealed] = useState(true);

  function handleSpeakText(textToSpeak: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }, 80);
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-background/60 p-3.5 ring-1 ring-border-card transition-all hover:bg-background/90 hover:shadow-md">
      <div className="flex flex-col gap-1.5">
        {/* Header từ vựng + Nút đọc, Ẩn/Hiện, Xóa */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
              {index + 1}
            </span>
            <h3 className="text-base font-bold text-foreground tracking-wide">
              {item.word}
            </h3>
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
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => handleSpeakText(item.word, e)}
              title="Nghe đọc từ vựng"
              className="rounded-lg p-1 text-muted hover:bg-surface hover:text-brand transition-colors cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsRevealed(!isRevealed)}
              title={isRevealed ? "Ẩn ý nghĩa (Tự ghi nhớ)" : "Hiện ý nghĩa"}
              className="rounded-lg p-1 text-muted hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
            >
              {isRevealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                title="Loại bỏ từ này khỏi kho từ vựng"
                className="rounded-lg p-1 text-muted hover:bg-surface hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Nội dung Nghĩa & Ví dụ */}
        {isRevealed ? (
          <div className="mt-1 flex flex-col gap-1.5 text-sm">
            <p className="font-medium text-foreground/90">{item.meaning}</p>
            {item.example && (
              <div className="flex items-start justify-between gap-1.5 border-l-2 border-brand/30 pl-2 mt-0.5">
                <p className="text-xs text-muted italic leading-relaxed flex-1">
                  "<HighlightWord text={item.example} word={item.word} />"
                </p>
                <button
                  type="button"
                  onClick={(e) => handleSpeakText(item.example!, e)}
                  title="Nghe đọc câu ví dụ"
                  className="rounded p-1 text-muted hover:bg-surface hover:text-brand transition-colors shrink-0 cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="mt-1 rounded-lg bg-surface/50 p-2 text-center text-xs text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            🙈 Bấm để hiện nghĩa tiếng Việt...
          </button>
        )}
      </div>
    </div>
  );
}

import { BookOpen, Layers, Plus, RotateCw } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/button/button";
import WidgetCard from "../../../components/widget-card/widget-card";
import { useVocabulary } from "../hooks/use-vocabulary";
import DailyWordCard from "./daily-word-card";
import VocabularyFormModal from "./vocabulary-form-modal";
import VocabularyManagerModal from "./vocabulary-manager-modal";

export default function VocabularyWidget() {
  const {
    words,
    dailyWords,
    isLoading,
    addWord,
    editWord,
    deleteWord,
    refreshDailyWords,
  } = useVocabulary();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

  const action = (
    <div className="flex items-center gap-1.5">
      {words.length > 3 && (
        <button
          type="button"
          onClick={refreshDailyWords}
          title="Đổi 3 từ gợi ý khác cho hôm nay"
          className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-brand transition-colors cursor-pointer"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        onClick={() => setIsManagerModalOpen(true)}
        title="Quản lý toàn bộ từ vựng"
        className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground px-2 py-1 rounded-lg hover:bg-background transition-colors cursor-pointer"
      >
        <Layers className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Quản lý ({words.length})</span>
      </button>
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="rounded-full px-2.5 py-1 text-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Thêm từ</span>
      </Button>
    </div>
  );

  return (
    <WidgetCard
      title="Từ vựng hôm nay"
      icon={<BookOpen className="h-5 w-5 text-brand" />}
      action={action}
    >
      <VocabularyFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={addWord}
      />

      <VocabularyManagerModal
        open={isManagerModalOpen}
        onOpenChange={setIsManagerModalOpen}
        words={words}
        onAddWord={addWord}
        onEditWord={editWord}
        onDeleteWord={deleteWord}
      />

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Đang tải từ vựng…</p>
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-muted opacity-80 mb-3">
            Bạn chưa có từ vựng nào. Hãy thêm từ vựng mới để nhận 3 gợi ý học tập mỗi ngày!
          </p>
          
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {dailyWords.map((item, index) => (
            <DailyWordCard
              key={item.id}
              item={item}
              index={index}
              onDelete={deleteWord}
            />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_OPTIONS } from "../constants/categories";
import type { Bookmark, BookmarkCategory } from "../types/bookmark";

interface BookmarkFormValues {
  name: string;
  url: string;
  category: BookmarkCategory;
}

interface BookmarkFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BookmarkFormValues) => void;
  bookmark?: Bookmark | null;
}

const EMPTY_FIELDS: BookmarkFormValues = {
  name: "",
  url: "",
  category: "daily",
};

export default function BookmarkFormModal({
  open,
  onOpenChange,
  onSubmit,
  bookmark,
}: BookmarkFormModalProps) {
  const isEdit = Boolean(bookmark);
  const [fields, setFields] = useState<BookmarkFormValues>(EMPTY_FIELDS);

  useEffect(() => {
    if (!open) return;

    if (bookmark) {
      setFields({ name: bookmark.name, url: bookmark.url, category: bookmark.category });
      return;
    }

    setFields(EMPTY_FIELDS);
  }, [open, bookmark]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleCategoryChange(value: string): void {
    setFields((prev) => ({ ...prev, category: value as BookmarkCategory }));
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!fields.name.trim() || !fields.url.trim()) return;

    onSubmit(fields);
    onOpenChange(false);
  }

  const isValid = fields.name.trim() !== "" && fields.url.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa bookmark" : "Thêm bookmark"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bookmark-name">Tên</Label>
            <Input
              id="bookmark-name"
              name="name"
              value={fields.name}
              onChange={handleInputChange}
              placeholder="Ví dụ: Học AI Engineer"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bookmark-url">URL</Label>
            <Input
              id="bookmark-url"
              name="url"
              value={fields.url}
              onChange={handleInputChange}
              placeholder="https://… hoặc file:///Users/…"
            />
            {fields.url.startsWith("file://") && (
              <p className="text-xs text-muted-foreground">
                Để mở file local, bật "Allow access to file URLs" trong
                chrome://extensions cho extension này.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bookmark-category">Danh mục</Label>
            <Select value={fields.category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="bookmark-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={!isValid}>
              {isEdit ? "Lưu" : "Thêm bookmark"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

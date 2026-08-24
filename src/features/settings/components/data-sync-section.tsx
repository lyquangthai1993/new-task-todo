import React, { useEffect, useState } from "react";
import {
  Download,
  Upload,
  Server,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  checkSyncServerHealth,
  clearAllData,
  exportAllData,
  importDataFromFile,
  migrateLocalDataToSQLite,
  type SyncHealth,
} from "@/utils/backup-restore";

export default function DataSyncSection() {
  const [health, setHealth] = useState<SyncHealth>({ connected: false });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Modal reset dữ liệu state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      const h = await checkSyncServerHealth();
      setHealth(h);
    }
    checkHealth();

    const interval = setInterval(checkHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  async function handleMigrate() {
    setIsMigrating(true);
    setStatusMsg("Đang chuyển đổi dữ liệu từ bộ nhớ Chrome vào SQLite...");
    const res = await migrateLocalDataToSQLite();
    setStatusMsg(res.message);
    setIsMigrating(false);
  }

  async function handleExport() {
    try {
      await exportAllData();
      setStatusMsg("Đã xuất file sao lưu thành công!");
    } catch {
      setStatusMsg("Lỗi khi xuất file sao lưu.");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMsg("Đang xử lý nhập dữ liệu...");

    const result = await importDataFromFile(file);
    setStatusMsg(result.message);
    setIsImporting(false);

    if (result.success) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  async function handleConfirmReset() {
    if (resetConfirmInput.trim() !== "RESET") return;

    setIsClearing(true);
    setStatusMsg("Đang xóa toàn bộ dữ liệu...");

    const res = await clearAllData();
    setIsClearing(false);
    setIsResetModalOpen(false);
    setResetConfirmInput("");

    setStatusMsg(res.message);

    if (res.success) {
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Đồng bộ & Lưu trữ dữ liệu</Label>
        <div className="flex items-center gap-1.5 text-xs">
          {health.connected ? (
            <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              SQLite Server (Online)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              Chưa bật SQLite Sync Server
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {health.connected
          ? `Đang lưu đồng bộ vào file SQLite: ${health.dbPath || "data/db.sqlite"}. Dữ liệu tự động đồng bộ giữa các trình duyệt!`
          : `Để tự động đồng bộ dữ liệu thời gian thực giữa các trình duyệt, hãy chạy lệnh "npm run server" trong thư mục project.`}
      </p>


      {statusMsg && (
        <div className="rounded bg-muted p-2 text-xs text-foreground font-medium">
          {statusMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {health.connected && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleMigrate}
            disabled={isMigrating}
            className="gap-2 text-xs"
          >
            <Database className="h-4 w-4" />
            Migrate dữ liệu sang SQLite
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2 text-xs"
        >
          <Download className="h-4 w-4 text-brand" />
          Xuất dữ liệu (.json)
        </Button>

        <label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={isImporting}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="gap-2 text-xs cursor-pointer"
          >
            <span>
              <Upload className="h-4 w-4 text-brand" />
              Nhập dữ liệu từ file
            </span>
          </Button>
        </label>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsResetModalOpen(true)}
          className="gap-1.5 text-xs font-medium"
        >
          <Trash2 className="h-4 w-4" />
          Xóa sạch dữ liệu
        </Button>

        {!health.connected && (
          <div className="flex items-center gap-2 rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-foreground border border-border shadow-2xs ml-auto">
            <Server className="h-3.5 w-3.5 text-brand" />
            <span>Lưu vào SQLite:</span>
            <code className="rounded bg-brand/15 text-brand px-2 py-0.5 font-mono text-xs font-bold border border-brand/30">
              npm run server
            </code>
          </div>
        )}

      </div>

      {/* Modal Xác nhận Reset dữ liệu */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa toàn bộ dữ liệu (Reset)
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              Hành động này sẽ xóa vĩnh viễn tất cả công việc, thói quen, nhắc nhở, dấu trang và cài đặt hiện tại trên trình duyệt này
              {health.connected ? " (và toàn bộ dữ liệu SQLite server)" : ""}.
              <strong className="block mt-1.5 text-destructive font-semibold">
                Dữ liệu sau khi xóa không thể phục hồi!
              </strong>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 py-2">
            <Label
              htmlFor="reset-confirm-input"
              className="text-xs font-semibold text-foreground"
            >
              Nhập chữ <span className="font-mono font-bold text-destructive">RESET</span> để xác nhận:
            </Label>
            <Input
              id="reset-confirm-input"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="RESET"
              className="font-mono text-sm tracking-wider uppercase focus-visible:ring-destructive"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetConfirmInput("");
              }}
            >
              Hủy
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={resetConfirmInput.trim() !== "RESET" || isClearing}
              onClick={handleConfirmReset}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? "Đang xóa..." : "Xóa sạch dữ liệu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

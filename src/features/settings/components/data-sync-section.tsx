import React, { useEffect, useState } from "react";
import { Download, Upload, Server, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  checkSyncServerHealth,
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
          ? `Đang lưu đồng bộ vào file SQLite: ${health.dbPath || "data/db.sqlite"}. Dữ liệu tự động đồng bộ giữa Chrome và Brave!`
          : `Để tự động đồng bộ dữ liệu thời gian thực giữa các trình duyệt (Chrome, Brave), hãy chạy lệnh "npm run server" trong thư mục project.`}
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

        {!health.connected && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-auto">
            <Server className="h-3.5 w-3.5" />
            Lưu vào SQLite: <code className="rounded bg-muted px-1">npm run server</code>
          </div>
        )}
      </div>
    </div>
  );
}

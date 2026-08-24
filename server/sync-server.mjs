import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const DATA_DIR = path.resolve("data");
const DB_PATH = path.join(DATA_DIR, "db.sqlite");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

const prepareSelect = db.prepare("SELECT key, value, updated_at FROM store WHERE key = ?");
const prepareSelectAll = db.prepare("SELECT key, value, updated_at FROM store");
const prepareInsert = db.prepare(`
  INSERT INTO store (key, value, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = excluded.updated_at
`);

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === "/api/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", db: DB_PATH }));
      return;
    }

    if (url.pathname === "/api/sync" && req.method === "GET") {
      const key = url.searchParams.get("key");
      if (key) {
        const row = prepareSelect.get(key);
        if (!row) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Key not found" }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ key: row.key, value: JSON.parse(row.value), updated_at: row.updated_at }));
        return;
      }

      const rows = prepareSelectAll.all();
      const data = {};
      rows.forEach((row) => {
        data[row.key] = {
          value: JSON.parse(row.value),
          updated_at: row.updated_at,
        };
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === "/api/sync" && req.method === "POST") {
      const { key, value } = await parseJsonBody(req);
      if (!key) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing key" }));
        return;
      }

      const timestamp = Date.now();
      prepareInsert.run(key, JSON.stringify(value), timestamp);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, key, updated_at: timestamp }));
      return;
    }

    if (url.pathname === "/api/export" && req.method === "GET") {
      const rows = prepareSelectAll.all();
      const exportData = {};
      rows.forEach((row) => {
        exportData[row.key] = JSON.parse(row.value);
      });
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="new-tab-todo-sqlite-export.json"',
      });
      res.end(JSON.stringify(exportData, null, 2));
      return;
    }

    if (url.pathname === "/api/import" && req.method === "POST") {
      const payload = await parseJsonBody(req);
      const timestamp = Date.now();
      db.exec("BEGIN TRANSACTION");
      try {
        for (const [k, v] of Object.entries(payload)) {
          prepareInsert.run(k, JSON.stringify(v), timestamp);
        }
        db.exec("COMMIT");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, importedKeys: Object.keys(payload) }));
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
      return;
    }

    if (url.pathname === "/api/clear" && (req.method === "POST" || req.method === "DELETE")) {
      db.exec("DELETE FROM store");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Cleared all database rows" }));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });

    res.end(JSON.stringify({ error: "Not found" }));
  } catch (err) {
    console.error("Server error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Cổng ${PORT} đang được sử dụng bởi một tiến trình khác.`);
    console.error(`👉 Bạn có thể giải phóng cổng bằng: npx kill-port ${PORT}`);
    process.exit(1);
  } else {
    console.error("Lỗi server:", err);
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 New Tab Todo Sync Server running at http://localhost:${PORT}`);
  console.log(`📁 Physical SQLite database: ${DB_PATH}`);
  console.log(`====================================================`);
});

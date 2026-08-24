import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";

const ARTIFACT_DIR = "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\b22656b2-6881-44f3-bb35-5425f8bd39d0";
const SCREENSHOT_PATH = path.join(ARTIFACT_DIR, "habits_dashboard_e2e.png");

async function main() {
  console.log("🚀 Starting Vite dev server for E2E capture...");
  const server = await createServer({
    root: process.cwd(),
    server: { port: 5173 },
  });
  await server.listen();

  const url = "http://localhost:5173";
  console.log(`🌐 Server running at ${url}. Launching Playwright Chromium...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  console.log(`📸 Capturing E2E screenshot to ${SCREENSHOT_PATH}...`);
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });

  await browser.close();
  await server.close();

  console.log("✅ E2E Capture Complete!");
}

main().catch((err) => {
  console.error("❌ Capture Error:", err);
  process.exit(1);
});

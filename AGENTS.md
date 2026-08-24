# Project Knowledge

## Overview

This project is a Chrome New Tab replacement called `new-tab-todo`. It is a personal dashboard for todos, recurring reminders, habits, bookmarks, greeting/status widgets, and settings. 

Data persistence uses `chrome.storage.local` in the Chrome extension environment with a `localStorage` fallback in dev mode. An optional local Node.js SQLite server (`server/sync-server.mjs`) provides real-time cross-browser sync between Chrome and Brave browsers. Settings (theme/accent/background) use local-only storage (`skipServerSync: true`) to ensure zero-delay initial loads without FOUC (Flash of Unstyled Content).

## Stack

- React 18 with TypeScript.
- Vite 5 build pipeline.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Radix UI primitives for dialogs, popovers, select, and slots.
- `lucide-react` for icons.
- Node.js built-in `node:sqlite` for the sync server (`server/sync-server.mjs`).
- Manifest V3 Chrome extension output in `dist/`.

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Start SQLite sync server: `npm run server` (runs at `http://localhost:3001`)
- Type-check only: `npm run typecheck`
- Production build: `npm run build`

There is no `npm run lint` script in this repo.

## Source Map

- App entry & HTML: `index.html` (includes inline theme FOUC prevention script), `src/main.tsx`, `src/app.tsx`
- Global styles and Tailwind setup: `src/index.css`
- Extension manifest: `public/manifest.json`
- SQLite Sync Server: `server/sync-server.mjs`
- Storage System: `src/utils/create-storage.ts` (supports `skipServerSync` option)
- Backup, Export, Import & Clear: `src/utils/backup-restore.ts`
- Vietnamese Lunar Calendar Utility: `src/utils/lunar-date.ts` (Dr. Ho Ngoc Duc UTC+7 astronomical algorithm)
- Dashboard shell & Header: `src/features/dashboard` (greeting, solar date, lunar date header)
- Todo board, forms, calendar, task storage: `src/features/todo`
- Recurring reminders: `src/features/reminders`
- Habits: `src/features/habits`
- Bookmarks: `src/features/bookmarks`
- Settings, theme, accent, background, reset data: `src/features/settings`
- Shared UI primitives: `src/components`, `src/components/ui`
- Shared helpers: `src/utils`, `src/hooks`

## Key Features & Conventions

- **Header Greeting & Calendar**: Displays solar date `DD/MM/YYYY` and Vietnamese Lunar Date (`convertSolarToLunar`) with customizable lunar calendar toggle in Settings.
- **FOUC Prevention**: `index.html` head script synchronously applies dark mode, `--brand` CSS variables, and background images from `localStorage` before initial paint.
- **Data Sync & Backup**: Supports exporting JSON backups, importing JSON backups, migrating local data to SQLite, and resetting all data (with required `RESET` string modal confirmation).
- **Conventions**:
  - Prefer existing feature-folder patterns before introducing new abstractions.
  - Keep feature logic close to its feature directory, with shared helpers only when reused.
  - Use `@/` imports for `src` aliases when matching nearby files.
  - Keep UI copy Vietnamese, matching the current app language.
  - Preserve existing local-storage keys (`tasks`, `settings`, `reminders`, `habits`, `bookmarks`).
  - Use existing shared UI components before adding new ones.

## Verification

- For normal changes, run `npm run typecheck`.
- For user-facing or extension output changes, run `npm run build` so `dist/` is refreshed.
- On Windows sandboxed runs, Vite/esbuild may fail with `spawn EPERM`; rerun `npm run build` with elevated approval if needed.

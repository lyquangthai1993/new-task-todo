# Project Knowledge

## Overview

This project is a Chrome New Tab replacement called `new-tab-todo`. It is a personal dashboard for todos, recurring reminders, habits, bookmarks, greeting/status widgets, and settings. Data is local-only, using `chrome.storage.local` in the extension and a localStorage fallback in dev.

## Stack

- React 18 with TypeScript.
- Vite 5 build pipeline.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Radix UI primitives for dialogs, popovers, select, and slots.
- `lucide-react` for icons.
- Manifest V3 Chrome extension output in `dist/`.

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Type-check only: `npm run typecheck`
- Production build: `npm run build`

There is no `npm run lint` script in this repo.

## Source Map

- App entry: `src/main.tsx`, `src/app.tsx`
- Global styles and Tailwind setup: `src/index.css`
- Extension manifest: `public/manifest.json`
- Dashboard shell: `src/features/dashboard`
- Todo board, forms, calendar, task storage: `src/features/todo`
- Recurring reminders: `src/features/reminders`
- Habits: `src/features/habits`
- Bookmarks: `src/features/bookmarks`
- Settings, background, accent preferences: `src/features/settings`
- Shared UI primitives: `src/components`
- Shared helpers: `src/utils`, `src/hooks`

## Conventions

- Prefer existing feature-folder patterns before introducing new abstractions.
- Keep feature logic close to its feature directory, with shared helpers only when reused.
- Use `@/` imports for `src` aliases when matching nearby files.
- Keep UI copy Vietnamese, matching the current app language.
- Preserve existing local-storage keys and migration utilities when changing persisted data.
- Use existing shared UI components before adding new ones.

## Verification

- For normal changes, run `npm run typecheck`.
- For user-facing or extension output changes, run `npm run build` so `dist/` is refreshed.
- On Windows sandboxed runs, Vite/esbuild may fail with `spawn EPERM`; rerun `npm run build` with elevated approval if needed.

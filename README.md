# New Tab Todo — Personal Tracker

Extension Chrome ghi đè trang **New Tab** thành dashboard cá nhân: mỗi lần mở tab
mới (`Cmd/Ctrl+T`) là thấy ngay todo, nhắc lặp lại, thói quen, bookmark, lời chào
theo giờ. Dữ liệu lưu **local trong máy** (`chrome.storage.local`) — không server,
không đăng nhập.

## Cần cài sẵn

- [Node.js](https://nodejs.org) 18 trở lên (kèm `npm`).
- Trình duyệt nhân Chromium: Chrome, Edge, Brave, Cốc Cốc…

## Cài & build

```bash
npm install      # cài dependencies (chạy 1 lần)
npm run build    # build ra thư mục dist/
```

## Load vào Chrome

1. Mở `chrome://extensions`.
2. Bật **Developer mode** (góc trên bên phải).
3. Bấm **Load unpacked** → chọn thư mục **`dist/`** vừa build ra.
4. Mở một tab mới để thấy dashboard.

> Mỗi lần sửa code: chạy lại `npm run build`, rồi vào `chrome://extensions` bấm
> **Reload** ở extension, mở lại tab mới.

## Chạy thử nhanh (không cần load vào Chrome)

```bash
npm run dev
```

Mở link localhost hiện ra. Ở chế độ này data lưu tạm bằng `localStorage` của trình
duyệt (fallback khi không có `chrome.storage`).

## Tech stack

React 18 + Vite 5 + TypeScript + Tailwind CSS v4. Manifest V3, dùng
`chrome_url_overrides.newtab`.

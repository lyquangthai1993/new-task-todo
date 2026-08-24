# 🚀 New Tab Todo — Personal Dashboard & Cross-Browser Sync

Extension dành cho trình duyệt Chrome, Brave, Edge, Cốc Cốc... ghi đè trang **New Tab** mặc định thành một **Dashboard cá nhân toàn diện**. Mỗi khi mở tab mới (`Ctrl+T` / `Cmd+T`), bạn có thể quản lý công việc, nhắc lịch lặp lại, theo dõi thói quen, xem bookmark và nhận thông báo ngay lập tức.

---

## ✨ Tính năng nổi bật

### 1. 📋 Quản lý Công việc (Todo & Kanban Board)
- **Kanban Board 3 cột**: *Chờ làm*, *Đang làm*, *Đã hoàn thành*.
- **Chế độ Xem Lịch (Calendar View)**: Theo dõi công việc theo ngày trực quan.
- Phân loại độ ưu tiên, ngày hết hạn và ghi chú chi tiết.

### 2. ⏰ Nhắc việc Lặp lại (Recurring Reminders)
- Thiết lập nhắc việc theo chu kỳ (Hàng ngày, Hàng tuần, Hàng tháng...).
- Bộ lọc nhắc việc theo người (Dành cho bản thân, người thân, đồng nghiệp...).

### 3. 🔥 Theo dõi Thói quen (Habit Tracker)
- Đếm chuỗi ngày hoàn thành liên tục (**Streak Counter**).
- Đánh dấu hoàn thành thói quen hàng ngày với 1 cú click.

### 4. 🔖 Thẻ Bookmark & Trang web Yêu thích
- Lưu trữ liên kết nhanh theo danh mục (Công việc, Học tập, Giải trí...).
- Tự động tải favicon trang web.

### 5. 🎨 Cá nhân hóa & Giao diện Premium
- Giao diện Sáng (Light), Tối (Dark), hoặc Tự động (Auto đổi theo giờ).
- Bộ sưu tập Ảnh nền HD thiên nhiên/nghệ thuật và màu chủ đạo tùy chỉnh.

### 6. 🔄 Đồng bộ Đa trình duyệt qua SQLite & File Vật lý
- **Local SQLite Sync Server**: Tự động lưu trữ và đồng bộ dữ liệu thời gian thực giữa các trình duyệt trên cùng máy tính qua file vật lý `data/db.sqlite`.

- **Tự động Migrate dữ liệu**: Tự động chuyển toàn bộ dữ liệu có sẵn trong bộ nhớ Chrome vào file SQLite.
- **Sao lưu & Khôi phục File (.json)**: Xuất và Nhập dữ liệu sao lưu vật lý dạng JSON an toàn, 100% offline.

---

## 🛠️ Yêu cầu Hệ thống

- **Node.js** v18.0 trở lên (Đã hỗ trợ tốt nhất trên Node.js v22).
- Trình duyệt nhân Chromium: **Google Chrome, Brave Browser, Microsoft Edge, Cốc Cốc...**

---

## 🚀 Hướng dẫn Cài đặt

### Bước 1: Clone dự án & Cài đặt thư viện
```bash
git clone https://github.com/lyquangthai1993/new-task-todo.git
cd new-task-todo
npm install
```

### Bước 2: Build Extension
```bash
npm run build
```
Sau khi chạy xong, thư mục đóng gói `dist/` sẽ được tạo ra.

### Bước 3: Cài đặt Extension vào Chrome / Brave
1. Truy cập trang quản lý Extension:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
2. Bật chế độ **Developer mode** (Góc trên bên phải).
3. Bấm nút **Load unpacked** (Tải tiện ích đã giải nén).
4. Chọn thư mục **`dist/`** vừa được build ra.
5. Mở một tab mới (`Ctrl+T`) để trải nghiệm Dashboard!

---

## 🔄 Hướng dẫn Sử dụng Đồng bộ SQLite (Chrome <-> Brave)

Để dữ liệu tự động đồng bộ thời gian thực giữa **Chrome** và **Brave**:

1. Mở Terminal trong thư mục dự án và chạy lệnh:
   ```bash
   npm run server
   ```
2. Server SQLite sẽ khởi động tại `http://localhost:3001` và tạo file cơ sở dữ liệu `data/db.sqlite`.
3. **Migrate dữ liệu cũ**:
   - Mở Dashboard trên Chrome -> Vào **Cài đặt** (Icon bánh răng) -> Cuộn xuống mục **"Đồng bộ & Lưu trữ dữ liệu"**.
   - Bấm nút **`Migrate dữ liệu sang SQLite`**.
4. Giờ đây, mọi thay đổi công việc trên Chrome sẽ tự động cập nhật ngay trên Brave và ngược lại!

> 💡 **Sao lưu thủ công**: Bạn cũng có thể bấm nút **Xuất dữ liệu (.json)** hoặc **Nhập dữ liệu từ file** trong menu Cài đặt để sao lưu/khôi phục dữ liệu không cần server.

---

## 💻 Danh sách Lệnh (Scripts)

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Chạy ứng dụng ở chế độ Web Dev Server (Vite) |
| `npm run server` | Khởi động SQLite Sync Server đồng bộ Chrome & Brave |
| `npm run build` | Đóng gói Extension sản phẩm ra thư mục `dist/` |
| `npm run typecheck` | Kiểm tra lỗi Type safety trong TypeScript |

---

## 📁 Cấu trúc Dự án

```text
new-tab-todo/
├── data/                    # Thư mục lưu trữ file SQLite vật lý (data/db.sqlite)
├── public/                  # Manifest V3 & Ảnh nền asset
├── server/
│   └── sync-server.mjs      # Local Sync Server (node:sqlite + HTTP API)
├── src/
│   ├── components/          # UI Components dùng chung (Button, Dialog, Input...)
│   ├── features/            # Các tính năng chính (todo, reminders, habits, bookmarks, settings)
│   ├── hooks/               # React Hooks tùy chỉnh
│   ├── utils/               # Storage Engine, Backup & Restore, Date helpers
│   ├── app.tsx              # React Root Component
│   └── main.tsx             # Main Entry Point
├── package.json
└── vite.config.ts
```

---

## 📄 Giấy phép
Dự án cá nhân mã nguồn mở - Phát triển với React + TypeScript + Tailwind CSS.

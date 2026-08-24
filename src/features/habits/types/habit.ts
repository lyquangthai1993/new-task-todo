export interface Habit {
  id: string;
  name: string;
  completedDates?: string[]; // Danh sách các ngày 'YYYY-MM-DD' đã hoàn thành
  createdAt?: string;
}

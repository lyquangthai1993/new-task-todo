import { createStorage } from "../../../utils/create-storage";
import { STORAGE_KEY } from "../constants/storage-keys";
import type { Task } from "../types/task";

export const taskStorage = createStorage<Task[]>(STORAGE_KEY, []);

import { create } from 'zustand';
import { Task } from '@/types/task';
import { getTasks, getSubtasks, createTask, updateTaskStatus, updateTask, deleteTask } from '@/services/taskService';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => Promise<void>;
  loadSubtasks: (parentId: string) => Promise<Task[]>;
  addTask: (title: string, description?: string | null, status?: string, priority?: number, dueDate?: number | null, projectId?: string | null, parentId?: string | null) => Promise<Task>;
  toggleTaskStatus: (id: string, currentStatus: string) => Promise<Task>;
  editTask: (id: string, title?: string, description?: string | null, status?: string, priority?: number, dueDate?: number | null, projectId?: string | null) => Promise<Task>;
  removeTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,

  loadTasks: async () => {
    set({ loading: true });
    try {
      const data = await getTasks();
      set({ tasks: data });
    } finally {
      set({ loading: false });
    }
  },

  loadSubtasks: async (parentId: string) => {
    return getSubtasks(parentId);
  },

  addTask: async (title, description, status, priority, dueDate, projectId, parentId) => {
    const task = await createTask(title, description ?? null, status, priority, dueDate ?? null, projectId ?? null, parentId ?? null);
    set(s => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  toggleTaskStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const updated = await updateTaskStatus(id, newStatus);
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }));
    return updated;
  },

  editTask: async (id, title, description, status, priority, dueDate, projectId) => {
    const updated = await updateTask(id, title, description, status, priority, dueDate, projectId);
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }));
    return updated;
  },

  removeTask: async (id) => {
    await deleteTask(id);
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
  },
}));

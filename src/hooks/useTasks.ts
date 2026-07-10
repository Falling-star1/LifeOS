import { useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { getTasks, getSubtasks, createTask, updateTaskStatus, updateTask, deleteTask } from '@/services/taskService';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubtasks = useCallback(async (parentId: string): Promise<Task[]> => {
    return getSubtasks(parentId);
  }, []);

  const addTask = useCallback(async (
    title: string,
    description?: string | null,
    status?: string,
    priority?: number,
    dueDate?: number | null,
    projectId?: string | null,
    parentId?: string | null,
  ) => {
    const task = await createTask(title, description ?? null, status, priority, dueDate ?? null, projectId ?? null, parentId ?? null);
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const toggleTaskStatus = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const updated = await updateTaskStatus(id, newStatus);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, []);

  const editTask = useCallback(async (
    id: string,
    title?: string,
    description?: string | null,
    status?: string,
    priority?: number,
    dueDate?: number | null,
    projectId?: string | null,
  ) => {
    const updated = await updateTask(id, title, description, status, priority, dueDate, projectId);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, []);

  const removeTask = useCallback(async (id: string) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, loadTasks, loadSubtasks, addTask, toggleTaskStatus, editTask, removeTask };
}
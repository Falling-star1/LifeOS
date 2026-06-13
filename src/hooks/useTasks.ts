import { useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { getTasks, createTask, updateTaskStatus, deleteTask } from '@/services/taskService';

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

  const addTask = useCallback(async (title: string) => {
    const task = await createTask(title);
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const toggleTaskStatus = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const updated = await updateTaskStatus(id, newStatus);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, []);

  const removeTask = useCallback(async (id: string) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, loadTasks, addTask, toggleTaskStatus, removeTask };
}
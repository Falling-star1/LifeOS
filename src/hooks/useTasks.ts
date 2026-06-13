import { useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { getTasks, createTask } from '@/services/taskService';

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

  return { tasks, loading, loadTasks, addTask };
}
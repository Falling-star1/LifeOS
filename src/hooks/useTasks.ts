import { useState } from 'react';
import { Task } from '@/types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  return { tasks, setTasks };
}

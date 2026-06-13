import { Task } from '@/types/task';
import { invoke } from '@tauri-apps/api/tauri';

export async function getTasks(): Promise<Task[]> {
  return invoke('get_tasks');
}

export async function createTask(title: string): Promise<Task> {
  return invoke('create_task', { title });
}
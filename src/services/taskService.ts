import { Task } from '@/types/task';
import { invoke } from '@tauri-apps/api/tauri';

export async function getTasks(): Promise<Task[]> {
  return invoke('get_tasks');
}

export async function createTask(title: string): Promise<Task> {
  return invoke('create_task', { title });
}

export async function updateTaskStatus(id: string, status: string): Promise<Task> {
  return invoke('update_task_status', { id, status });
}

export async function deleteTask(id: string): Promise<void> {
  return invoke('delete_task', { id });
}
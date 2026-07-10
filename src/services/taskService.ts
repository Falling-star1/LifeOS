import { Task } from '@/types/task';
import { invoke } from '@tauri-apps/api/core';

export async function getTasks(status?: string): Promise<Task[]> {
  return invoke('get_tasks', { status: status ?? null });
}

export async function getSubtasks(parentId: string): Promise<Task[]> {
  return invoke('get_subtasks', { parentId });
}

export async function createTask(
  title: string,
  description?: string | null,
  status?: string,
  priority?: number,
  dueDate?: number | null,
  projectId?: string | null,
  parentId?: string | null,
): Promise<Task> {
  return invoke('create_task', {
    title,
    description: description === undefined ? undefined : description ?? null,
    status,
    priority,
    dueDate: dueDate === undefined ? undefined : dueDate ?? null,
    projectId: projectId === undefined ? undefined : projectId ?? null,
    parentId: parentId === undefined ? undefined : parentId ?? null,
  });
}

export async function updateTaskStatus(id: string, status: string): Promise<Task> {
  return invoke('update_task_status', { id, status });
}

export async function updateTask(
  id: string,
  title?: string,
  description?: string | null,
  status?: string,
  priority?: number,
  dueDate?: number | null,
  projectId?: string | null,
): Promise<Task> {
  return invoke('update_task', {
    id,
    title,
    description: description === undefined ? undefined : description ?? null,
    status,
    priority,
    dueDate: dueDate === undefined ? undefined : dueDate ?? null,
    projectId: projectId === undefined ? undefined : projectId ?? null,
  });
}

export async function deleteTask(id: string): Promise<void> {
  return invoke('delete_task', { id });
}
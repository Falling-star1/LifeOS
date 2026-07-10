import { invoke } from '@tauri-apps/api/core';
import { Tag } from '@/types/tag';

export async function getTags(): Promise<Tag[]> {
  return invoke('get_tags');
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  return invoke('create_tag', { name, color });
}

export async function deleteTag(id: string): Promise<void> {
  return invoke('delete_tag', { id });
}

export async function getTaskTags(taskId: string): Promise<Tag[]> {
  return invoke('get_task_tags', { taskId });
}

export async function setTaskTags(taskId: string, tagIds: string[]): Promise<void> {
  return invoke('set_task_tags', { taskId, tagIds });
}
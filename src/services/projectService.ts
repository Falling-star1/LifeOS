import { invoke } from '@tauri-apps/api/core';

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export async function getProjects(): Promise<Project[]> {
  return invoke('get_projects');
}

export async function createProject(name: string, color: string, icon?: string): Promise<Project> {
  return invoke('create_project', { name, color, icon });
}

export async function updateProject(id: string, name?: string, color?: string, icon?: string): Promise<Project> {
  return invoke('update_project', { id, name, color, icon });
}

export async function deleteProject(id: string): Promise<void> {
  return invoke('delete_project', { id });
}

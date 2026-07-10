import { invoke } from '@tauri-apps/api/core';

export interface SearchResult {
  id: string;
  result_type: 'task' | 'note' | 'study_plan';
  title: string;
  subtitle: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  return invoke('global_search', { query });
}

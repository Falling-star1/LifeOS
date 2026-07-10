import { invoke } from '@tauri-apps/api/core';

export async function exportData(): Promise<string> {
  const data = await invoke<Record<string, unknown>>('export_data');
  return JSON.stringify(data, null, 2);
}

export async function importData(json: string): Promise<string> {
  return invoke('import_data', { json });
}

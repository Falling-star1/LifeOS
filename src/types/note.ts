export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: number;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
}
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: number;
  due_date?: number;
  project_id?: string;
  parent_id?: string;
  sort_order?: number;
  created_at: number;
  updated_at: number;
  subtasks?: Task[];
}
# LifeOS API 设计

## 概述

所有 API 通过 Tauri 命令（invoke）从前端调用，后端使用 Rust 处理 SQLite 操作。

## 通用约定

- 所有 ID 使用 UUID 格式
- 时间戳使用 Unix 秒
- 错误返回格式：`{ error: string, code: number }`
- 分页参数：`page`（默认1）、`limit`（默认50）

## 1. 任务 API

### 获取任务列表
```typescript
invoke('get_tasks', {
  filters?: {
    status?: 'todo' | 'in_progress' | 'done',
    priority?: number,
    project_id?: string,
    tag_id?: string,
    due_date_from?: number,
    due_date_to?: number
  },
  sort?: { field: string, order: 'asc' | 'desc' },
  page?: number,
  limit?: number
}): Promise<Task[]>
```

### 创建任务
```typescript
invoke('create_task', {
  title: string,
  description?: string,
  priority?: number,
  due_date?: number,
  project_id?: string,
  tag_ids?: string[]
}): Promise<Task>
```

### 更新任务
```typescript
invoke('update_task', {
  id: string,
  updates: Partial<Task>
}): Promise<Task>
```

### 删除任务（软删除）
```typescript
invoke('delete_task', { id: string }): Promise<void>
```

### 批量更新任务
```typescript
invoke('bulk_update_tasks', {
  ids: string[],
  updates: Partial<Task>
}): Promise<Task[]>
```

## 2. 日历事件 API

### 获取日历事件
```typescript
invoke('get_calendar_events', {
  start_time: number,
  end_time: number,
  task_id?: string,
  study_plan_id?: string
}): Promise<CalendarEvent[]>
```

### 创建日历事件
```typescript
invoke('create_calendar_event', {
  title: string,
  description?: string,
  start_time: number,
  end_time: number,
  all_day?: boolean,
  color?: string,
  task_id?: string,
  study_plan_id?: string
}): Promise<CalendarEvent>
```

### 更新日历事件
```typescript
invoke('update_calendar_event', {
  id: string,
  updates: Partial<CalendarEvent>
}): Promise<CalendarEvent>
```

### 删除日历事件
```typescript
invoke('delete_calendar_event', { id: string }): Promise<void>
```

## 3. 学习计划 API

### 获取学习计划列表
```typescript
invoke('get_study_plans', {
  filters?: {
    status?: 'active' | 'completed' | 'archived',
    subject?: string
  },
  page?: number,
  limit?: number
}): Promise<StudyPlan[]>
```

### 创建学习计划
```typescript
invoke('create_study_plan', {
  title: string,
  description?: string,
  subject: string,
  goal?: string,
  target_hours?: number,
  start_date?: number,
  end_date?: number,
  recurrence?: object
}): Promise<StudyPlan>
```

### 更新学习计划
```typescript
invoke('update_study_plan', {
  id: string,
  updates: Partial<StudyPlan>
}): Promise<StudyPlan>
```

### 删除学习计划
```typescript
invoke('delete_study_plan', { id: string }): Promise<void>
```

### 获取学习统计
```typescript
invoke('get_study_stats', {
  study_plan_id: string,
  date_from?: number,
  date_to?: number
}): Promise<StudyStats>
```

## 4. 番茄钟 API

### 开始番茄钟
```typescript
invoke('start_pomodoro', {
  task_id?: string,
  study_plan_id?: string,
  duration?: number  // 秒，默认1500
}): Promise<PomodoroSession>
```

### 暂停番茄钟
```typescript
invoke('pause_pomodoro', { id: string }): Promise<PomodoroSession>
```

### 恢复番茄钟
```typescript
invoke('resume_pomodoro', { id: string }): Promise<PomodoroSession>
```

### 完成番茄钟
```typescript
invoke('complete_pomodoro', {
  id: string,
  notes?: string
}): Promise<PomodoroSession>
```

### 获取番茄钟历史
```typescript
invoke('get_pomodoro_history', {
  task_id?: string,
  study_plan_id?: string,
  date_from?: number,
  date_to?: number
}): Promise<PomodoroSession[]>
```

## 5. 备忘录 API

### 获取备忘录列表
```typescript
invoke('get_notes', {
  filters?: {
    task_id?: string,
    study_plan_id?: string
  },
  search?: string,
  page?: number,
  limit?: number
}): Promise<Note[]>
```

### 创建备忘录
```typescript
invoke('create_note', {
  title: string,
  content?: string,
  task_id?: string,
  study_plan_id?: string
}): Promise<Note>
```

### 更新备忘录
```typescript
invoke('update_note', {
  id: string,
  updates: Partial<Note>
}): Promise<Note>
```

### 删除备忘录
```typescript
invoke('delete_note', { id: string }): Promise<void>
```

## 6. 标签 API

### 获取标签列表
```typescript
invoke('get_tags'): Promise<Tag[]>
```

### 创建标签
```typescript
invoke('create_tag', {
  name: string,
  color?: string
}): Promise<Tag>
```

### 更新标签
```typescript
invoke('update_tag', {
  id: string,
  updates: Partial<Tag>
}): Promise<Tag>
```

### 删除标签
```typescript
invoke('delete_tag', { id: string }): Promise<void>
```

## 7. 项目 API

### 获取项目列表
```typescript
invoke('get_projects'): Promise<Project[]>
```

### 创建项目
```typescript
invoke('create_project', {
  name: string,
  color?: string,
  icon?: string
}): Promise<Project>
```

### 更新项目
```typescript
invoke('update_project', {
  id: string,
  updates: Partial<Project>
}): Promise<Project>
```

### 删除项目
```typescript
invoke('delete_project', { id: string }): Promise<void>
```

## 8. 设置 API

### 获取设置
```typescript
invoke('get_settings', { key?: string }): Promise<Settings | Record<string, string>>
```

### 更新设置
```typescript
invoke('update_settings', {
  key: string,
  value: string
}): Promise<void>
```

### 批量更新设置
```typescript
invoke('update_settings_bulk', {
  settings: Record<string, string>
}): Promise<void>
```

## 9. 全局搜索 API

### 搜索
```typescript
invoke('global_search', {
  query: string,
  types?: ('tasks' | 'notes' | 'study_plans')[],
  limit?: number
}): Promise<SearchResult[]>
```

返回类型：
```typescript
interface SearchResult {
  type: 'task' | 'note' | 'study_plan';
  id: string;
  title: string;
  snippet: string;
  relevance: number;
}
```

## 10. 数据导入导出 API

### 导出数据
```typescript
invoke('export_data', {
  format?: 'json' | 'csv',
  types?: ('tasks' | 'notes' | 'study_plans' | 'settings')[]
}): Promise<string>
```

### 导入数据
```typescript
invoke('import_data', {
  data: string,
  format: 'json' | 'csv',
  overwrite?: boolean
}): Promise<{ imported: number, skipped: number }>
```

## 11. 仪表盘统计 API

### 获取今日统计
```typescript
invoke('get_dashboard_stats'): Promise<DashboardStats>
```

返回类型：
```typescript
interface DashboardStats {
  today_tasks: number;
  completed_today: number;
  overdue_tasks: number;
  active_study_plans: number;
  pomodoro_today: number;
  focus_minutes_today: number;
}
```

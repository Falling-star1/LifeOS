# LifeOS SQLite 数据库设计

## 设计原则

- 所有时间字段使用 Unix 时间戳（秒）
- 软删除：使用 `deleted_at` 字段
- 外键约束确保数据完整性
- 索引优化查询性能

## 表结构

### 1. tasks - 任务表

```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',  -- todo/in_progress/done
    priority INTEGER NOT NULL DEFAULT 0,  -- 0=none, 1=low, 2=medium, 3=high, 4=urgent
    due_date INTEGER,                     -- Unix timestamp
    due_date_time INTEGER,                -- Unix timestamp, null = all day
    completed_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER,
    parent_id TEXT,                        -- 父任务ID，支持子任务
    project_id TEXT,                       -- 所属项目/标签
    FOREIGN KEY (parent_id) REFERENCES tasks(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
```

### 2. projects - 项目/标签表

```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    color TEXT,                            -- HEX颜色值
    icon TEXT,                             -- 图标名称
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER
);
```

### 3. calendar_events - 日历事件表

```sql
CREATE TABLE calendar_events (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    start_time INTEGER NOT NULL,           -- Unix timestamp
    end_time INTEGER NOT NULL,             -- Unix timestamp
    all_day INTEGER NOT NULL DEFAULT 0,   -- 0=否, 1=是
    color TEXT,
    task_id TEXT,                          -- 关联任务
    study_plan_id TEXT,                    -- 关联学习计划
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (study_plan_id) REFERENCES study_plans(id)
);

CREATE INDEX idx_calendar_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_end_time ON calendar_events(end_time);
```

### 4. study_plans - 学习计划表

```sql
CREATE TABLE study_plans (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,                 -- 科目
    goal TEXT,                             -- 学习目标
    target_hours REAL DEFAULT 0,           -- 目标时长（小时）
    actual_hours REAL DEFAULT 0,           -- 实际时长（小时）
    status TEXT NOT NULL DEFAULT 'active', -- active/completed/archived
    start_date INTEGER,                    -- 计划开始日期
    end_date INTEGER,                      -- 计划结束日期
    recurrence TEXT,                       -- 重复规则JSON
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER
);

CREATE INDEX idx_study_plans_status ON study_plans(status);
CREATE INDEX idx_study_plans_subject ON study_plans(subject);
```

### 5. pomodoro_sessions - 番茄钟会话表

```sql
CREATE TABLE pomodoro_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    task_id TEXT,                          -- 关联任务
    study_plan_id TEXT,                    -- 关联学习计划
    duration INTEGER NOT NULL DEFAULT 1500, -- 时长（秒），默认25分钟
    started_at INTEGER NOT NULL,           -- 开始时间
    completed_at INTEGER,                  -- 结束时间
    status TEXT NOT NULL DEFAULT 'running', -- running/paused/completed/interrupted
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (study_plan_id) REFERENCES study_plans(id)
);

CREATE INDEX idx_pomodoro_task_id ON pomodoro_sessions(task_id);
CREATE INDEX idx_pomodoro_started_at ON pomodoro_sessions(started_at);
```

### 6. notes - 备忘录表

```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    content TEXT,                          -- Markdown内容
    task_id TEXT,                          -- 关联任务
    study_plan_id TEXT,                    -- 关联学习计划
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (study_plan_id) REFERENCES study_plans(id)
);

CREATE INDEX idx_notes_task_id ON notes(task_id);
```

### 7. settings - 设置表

```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 8. tags - 标签表

```sql
CREATE TABLE tags (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER
);
```

### 9. task_tags - 任务标签关联表

```sql
CREATE TABLE task_tags (
    task_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

## 数据关系图

```
tasks ──┬──< tasks (parent_id)
        ├──< calendar_events
        ├──< pomodoro_sessions
        ├──< notes
        ├──> projects
        └──< task_tags >── tags

calendar_events ──> tasks
calendar_events ──> study_plans

pomodoro_sessions ──> tasks
pomodoro_sessions ──> study_plans

study_plans ──< calendar_events
study_plans ──< pomodoro_sessions
study_plans ──< notes
```

## 索引汇总

- tasks: status, due_date, priority, deleted_at
- calendar_events: start_time, end_time
- study_plans: status, subject
- pomodoro_sessions: task_id, started_at
- notes: task_id

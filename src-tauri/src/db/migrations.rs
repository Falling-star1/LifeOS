use rusqlite::{Connection, Result};

pub fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch("CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        priority INTEGER NOT NULL DEFAULT 0,
        due_date INTEGER,
        project_id TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        deleted_at INTEGER
    );")?;

    conn.execute_batch("CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL DEFAULT '无标题备忘',
        content TEXT NOT NULL DEFAULT '',
        pinned INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        deleted_at INTEGER
    );")?;

    conn.execute_batch("CREATE TABLE IF NOT EXISTS study_plans (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        color TEXT NOT NULL DEFAULT 'blue',
        total_hours REAL NOT NULL DEFAULT 0,
        completed_hours REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        deleted_at INTEGER
    );")?;

    conn.execute_batch("CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        duration_minutes INTEGER NOT NULL DEFAULT 25,
        completed INTEGER NOT NULL DEFAULT 0,
        study_plan_id TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );")?;

    conn.execute_batch("CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT 'blue',
        icon TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        deleted_at INTEGER
    );")?;

    conn.execute_batch("CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        description TEXT,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        all_day INTEGER NOT NULL DEFAULT 0,
        color TEXT NOT NULL DEFAULT 'blue',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        deleted_at INTEGER
    );")?;

    // ALTER TABLE for existing databases: add study_plan_id to pomodoro_sessions if missing
    let has_col: bool = conn.prepare("SELECT study_plan_id FROM pomodoro_sessions LIMIT 1").is_ok();
    if !has_col {
        conn.execute_batch("ALTER TABLE pomodoro_sessions ADD COLUMN study_plan_id TEXT;")?;
    }


    conn.execute_batch("CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL DEFAULT 'gray',
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );")?;

    conn.execute_batch("CREATE TABLE IF NOT EXISTS task_tags (
        task_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (task_id, tag_id)
    );")?;

    // Subtask support: add parent_id and sort_order to tasks if missing
    let has_parent: bool = conn.prepare("SELECT parent_id FROM tasks LIMIT 1").is_ok();
    if !has_parent {
        conn.execute_batch("ALTER TABLE tasks ADD COLUMN parent_id TEXT;")?;
    }
    let has_sort: bool = conn.prepare("SELECT sort_order FROM tasks LIMIT 1").is_ok();
    if !has_sort {
        conn.execute_batch("ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;")?;
    }
    Ok(())
}
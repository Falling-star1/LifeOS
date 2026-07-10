use rusqlite::{Connection, Result, params};
use crate::models::task::Task;

fn row_to_task(row: &rusqlite::Row) -> rusqlite::Result<Task> {
    Ok(Task {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        status: row.get(3)?,
        priority: row.get(4)?,
        due_date: row.get(5)?,
        project_id: row.get(6)?,
        parent_id: row.get(7)?,
        sort_order: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}

const SELECT_COLS: &str = "id, title, description, status, priority, due_date, project_id, parent_id, sort_order, created_at, updated_at";

pub fn list_tasks(conn: &Connection, status: Option<&str>) -> Result<Vec<Task>> {
    let mut sql = format!("SELECT {} FROM tasks WHERE deleted_at IS NULL", SELECT_COLS);
    if let Some(s) = status {
        sql.push_str(&format!(" AND status='{}'", s));
    }
    sql.push_str(" ORDER BY sort_order ASC, priority DESC, created_at DESC");
    let mut stmt = conn.prepare(&sql)?;
    let tasks = stmt.query_map([], |row| row_to_task(row))?.collect::<Result<Vec<_>>>()?;
    Ok(tasks)
}

pub fn list_subtasks(conn: &Connection, parent_id: &str) -> Result<Vec<Task>> {
    let sql = format!("SELECT {} FROM tasks WHERE deleted_at IS NULL AND parent_id = ?1 ORDER BY sort_order ASC, created_at ASC", SELECT_COLS);
    let mut stmt = conn.prepare(&sql)?;
    let tasks = stmt.query_map(params![parent_id], |row| row_to_task(row))?.collect::<Result<Vec<_>>>()?;
    Ok(tasks)
}

pub fn insert_task(
    conn: &Connection,
    title: &str,
    description: Option<&str>,
    status: Option<&str>,
    priority: Option<i32>,
    due_date: Option<i64>,
    project_id: Option<&str>,
    parent_id: Option<&str>,
) -> Result<Task> {
    let status = status.unwrap_or("todo");
    let priority = priority.unwrap_or(0);
    conn.execute(
        "INSERT INTO tasks (title, description, status, priority, due_date, project_id, parent_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![title, description, status, priority, due_date, project_id, parent_id],
    )?;
    let task = conn.query_row(
        &format!("SELECT {} FROM tasks WHERE id = last_insert_rowid()", SELECT_COLS),
        [],
        |row| row_to_task(row),
    )?;
    Ok(task)
}

pub fn update_task_fields(
    conn: &Connection,
    id: &str,
    title: Option<&str>,
    description: Option<&str>,
    status: Option<&str>,
    priority: Option<i32>,
    due_date: Option<i64>,
    project_id: Option<&str>,
) -> Result<Task> {
    let current = conn.query_row(
        &format!("SELECT {} FROM tasks WHERE id = ?1 AND deleted_at IS NULL", SELECT_COLS),
        params![id],
        |row| row_to_task(row),
    )?;
    let title = title.unwrap_or(&current.title);
    let description = description.or(current.description.as_deref());
    let status = status.unwrap_or(&current.status);
    let priority = priority.unwrap_or(current.priority);
    let due_date = due_date.or(current.due_date);
    let project_id = project_id.or(current.project_id.as_deref());
    conn.execute(
        "UPDATE tasks SET title=?1, description=?2, status=?3, priority=?4, due_date=?5, project_id=?6, updated_at=unixepoch() WHERE id=?7",
        params![title, description, status, priority, due_date, project_id, id],
    )?;
    conn.query_row(
        &format!("SELECT {} FROM tasks WHERE id = ?1", SELECT_COLS),
        params![id],
        |row| row_to_task(row),
    ).map_err(|e| e.into())
}

pub fn update_task_status(conn: &Connection, id: &str, status: &str) -> Result<Task> {
    conn.execute(
        "UPDATE tasks SET status = ?1, updated_at = unixepoch() WHERE id = ?2",
        params![status, id],
    )?;
    conn.query_row(
        &format!("SELECT {} FROM tasks WHERE id = ?1", SELECT_COLS),
        params![id],
        |row| row_to_task(row),
    ).map_err(|e| e.into())
}

pub fn delete_task(conn: &Connection, id: &str) -> Result<()> {
    // Soft delete task and its subtasks
    conn.execute("UPDATE tasks SET deleted_at = unixepoch() WHERE id = ?1 OR parent_id = ?1", params![id])?;
    Ok(())
}
use rusqlite::{Connection, Result, params};
use crate::models::task::Task;

pub fn list_tasks(conn: &Connection, status: Option<&str>) -> Result<Vec<Task>> {
    let mut sql = String::from("SELECT id,title,description,status,priority,due_date,created_at,updated_at FROM tasks WHERE deleted_at IS NULL");
    if let Some(status) = status {
        sql.push_str(&format!(" AND status='{}'", status));
    }
    let mut stmt = conn.prepare(&sql)?;
    let tasks = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
                due_date: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    Ok(tasks)
}

pub fn insert_task(conn: &Connection, title: &str) -> Result<Task> {
    conn.execute("INSERT INTO tasks (title) VALUES (?1)", params![title])?;
    let id = conn.last_insert_rowid().to_string();
    let task = conn.query_row(
        "SELECT id,title,description,status,priority,due_date,created_at,updated_at FROM tasks WHERE id=?1",
        params![id],
        |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
                due_date: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )?;
    Ok(task)
}
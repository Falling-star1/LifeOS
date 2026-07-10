use rusqlite::{Connection, Result, params};
use crate::models::project::Project;

pub fn list_projects(conn: &Connection) -> Result<Vec<Project>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, color, icon, sort_order, created_at, updated_at FROM projects WHERE deleted_at IS NULL ORDER BY sort_order, created_at"
    )?;
    let projects = stmt.query_map([], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            icon: row.get(3)?,
            sort_order: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?.collect::<Result<Vec<_>>>()?;
    Ok(projects)
}

pub fn insert_project(conn: &Connection, name: &str, color: &str, icon: Option<&str>) -> Result<Project> {
    conn.execute(
        "INSERT INTO projects (name, color, icon) VALUES (?1, ?2, ?3)",
        params![name, color, icon],
    )?;
    let project = conn.query_row(
        "SELECT id, name, color, icon, sort_order, created_at, updated_at FROM projects WHERE rowid = last_insert_rowid()",
        [], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                icon: row.get(3)?,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    )?;
    Ok(project)
}

pub fn update_project(conn: &Connection, id: &str, name: Option<&str>, color: Option<&str>, icon: Option<&str>) -> Result<Project> {
    if let Some(n) = name {
        conn.execute("UPDATE projects SET name = ?1, updated_at = unixepoch() WHERE id = ?2", params![n, id])?;
    }
    if let Some(c) = color {
        conn.execute("UPDATE projects SET color = ?1, updated_at = unixepoch() WHERE id = ?2", params![c, id])?;
    }
    if icon.is_some() {
        conn.execute("UPDATE projects SET icon = ?1, updated_at = unixepoch() WHERE id = ?2", params![icon, id])?;
    }
    let project = conn.query_row(
        "SELECT id, name, color, icon, sort_order, created_at, updated_at FROM projects WHERE id = ?1",
        params![id], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                icon: row.get(3)?,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    )?;
    Ok(project)
}

pub fn delete_project(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("UPDATE projects SET deleted_at = unixepoch() WHERE id = ?1", params![id])?;
    Ok(())
}

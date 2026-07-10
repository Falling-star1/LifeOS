use rusqlite::{Connection, Result, params};
use crate::models::tag::Tag;

pub fn list_tags(conn: &Connection) -> Result<Vec<Tag>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, color FROM tags ORDER BY name ASC"
    )?;
    let tags = stmt.query_map([], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
        })
    })?.collect::<Result<Vec<_>>>()?;
    Ok(tags)
}

pub fn insert_tag(conn: &Connection, name: &str, color: &str) -> Result<Tag> {
    conn.execute(
        "INSERT INTO tags (name, color) VALUES (?1, ?2)",
        params![name, color],
    )?;
    let id: String = conn.query_row("SELECT last_insert_rowid() || ''", [], |r| r.get(0))?;
    // Get the real id
    let tag = conn.query_row(
        "SELECT id, name, color FROM tags WHERE name = ?1",
        params![name],
        |row| Ok(Tag { id: row.get(0)?, name: row.get(1)?, color: row.get(2)? }),
    )?;
    Ok(tag)
}

pub fn delete_tag(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM task_tags WHERE tag_id = ?1", params![id])?;
    conn.execute("DELETE FROM tags WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn get_tags_for_task(conn: &Connection, task_id: &str) -> Result<Vec<Tag>> {
    let mut stmt = conn.prepare(
        "SELECT t.id, t.name, t.color FROM tags t INNER JOIN task_tags tt ON t.id = tt.tag_id WHERE tt.task_id = ?1 ORDER BY t.name ASC"
    )?;
    let tags = stmt.query_map(params![task_id], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
        })
    })?.collect::<Result<Vec<_>>>()?;
    Ok(tags)
}

pub fn set_task_tags(conn: &Connection, task_id: &str, tag_ids: &[String]) -> Result<()> {
    conn.execute("DELETE FROM task_tags WHERE task_id = ?1", params![task_id])?;
    for tag_id in tag_ids {
        conn.execute(
            "INSERT INTO task_tags (task_id, tag_id) VALUES (?1, ?2)",
            params![task_id, tag_id],
        )?;
    }
    Ok(())
}
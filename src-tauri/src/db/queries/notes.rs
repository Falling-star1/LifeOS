use rusqlite::{Connection, Result, params};
use crate::models::note::Note;

fn row_to_note(row: &rusqlite::Row) -> rusqlite::Result<Note> {
    Ok(Note {
        id: row.get(0)?,
        title: row.get(1)?,
        content: row.get(2)?,
        pinned: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
        deleted_at: row.get(6)?,
    })
}

const SELECT_COLS: &str = "id, title, content, pinned, created_at, updated_at, deleted_at";

pub fn list_notes(conn: &Connection) -> Result<Vec<Note>> {
    let mut stmt = conn.prepare(&format!(
        "SELECT {} FROM notes WHERE deleted_at IS NULL ORDER BY pinned DESC, updated_at DESC", SELECT_COLS
    ))?;
    let notes = stmt.query_map([], row_to_note)?.collect::<Result<Vec<_>>>()?;
    Ok(notes)
}

pub fn insert_note(conn: &Connection, title: &str, content: &str) -> Result<Note> {
    conn.execute("INSERT INTO notes (title, content) VALUES (?1, ?2)", params![title, content])?;
    let note = conn.query_row(
        &format!("SELECT {} FROM notes WHERE rowid = last_insert_rowid()", SELECT_COLS),
        [], row_to_note,
    )?;
    Ok(note)
}

pub fn update_note(conn: &Connection, id: &str, title: Option<&str>, content: Option<&str>, pinned: Option<i32>) -> Result<Note> {
    if let Some(t) = title {
        conn.execute("UPDATE notes SET title = ?1, updated_at = unixepoch() WHERE id = ?2", params![t, id])?;
    }
    if let Some(c) = content {
        conn.execute("UPDATE notes SET content = ?1, updated_at = unixepoch() WHERE id = ?2", params![c, id])?;
    }
    if let Some(p) = pinned {
        conn.execute("UPDATE notes SET pinned = ?1, updated_at = unixepoch() WHERE id = ?2", params![p, id])?;
    }
    let note = conn.query_row(
        &format!("SELECT {} FROM notes WHERE id = ?1", SELECT_COLS),
        params![id], row_to_note,
    )?;
    Ok(note)
}

pub fn toggle_pin(conn: &Connection, id: &str) -> Result<Note> {
    conn.execute("UPDATE notes SET pinned = CASE WHEN pinned = 1 THEN 0 ELSE 1 END, updated_at = unixepoch() WHERE id = ?1", params![id])?;
    let note = conn.query_row(
        &format!("SELECT {} FROM notes WHERE id = ?1", SELECT_COLS),
        params![id], row_to_note,
    )?;
    Ok(note)
}

pub fn delete_note(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("UPDATE notes SET deleted_at = unixepoch() WHERE id = ?1", params![id])?;
    Ok(())
}
use rusqlite::{Connection, Result, params};
use crate::models::calendar_event::CalendarEvent;

pub fn list_events_in_range(conn: &Connection, start: i64, end: i64) -> Result<Vec<CalendarEvent>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, description, start_time, end_time, all_day, color, created_at, updated_at FROM calendar_events WHERE deleted_at IS NULL AND start_time >= ?1 AND start_time <= ?2 ORDER BY start_time"
    )?;
    let events = stmt.query_map(params![start, end], |row| {
        Ok(CalendarEvent {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            start_time: row.get(3)?,
            end_time: row.get(4)?,
            all_day: row.get(5)?,
            color: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    })?.collect::<Result<Vec<_>>>()?;
    Ok(events)
}

pub fn get_event(conn: &Connection, id: &str) -> Result<CalendarEvent> {
    let event = conn.query_row(
        "SELECT id, title, description, start_time, end_time, all_day, color, created_at, updated_at FROM calendar_events WHERE deleted_at IS NULL AND id = ?1",
        params![id],
        |row| {
            Ok(CalendarEvent {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_time: row.get(3)?,
                end_time: row.get(4)?,
                all_day: row.get(5)?,
                color: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    )?;
    Ok(event)
}

pub fn insert_event(conn: &Connection, title: &str, description: Option<&str>, start_time: i64, end_time: Option<i64>, all_day: bool, color: &str) -> Result<CalendarEvent> {
    conn.execute(
        "INSERT INTO calendar_events (title, description, start_time, end_time, all_day, color) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![title, description, start_time, end_time, if all_day { 1 } else { 0 }, color],
    )?;
    let event = conn.query_row(
        "SELECT id, title, description, start_time, end_time, all_day, color, created_at, updated_at FROM calendar_events WHERE rowid = last_insert_rowid()",
        [],
        |row| {
            Ok(CalendarEvent {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_time: row.get(3)?,
                end_time: row.get(4)?,
                all_day: row.get(5)?,
                color: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    )?;
    Ok(event)
}

pub fn update_event(
    conn: &Connection,
    id: &str,
    title: Option<&str>,
    description: Option<Option<&str>>,
    start_time: Option<i64>,
    end_time: Option<Option<i64>>,
    color: Option<&str>,
) -> Result<CalendarEvent> {
    if let Some(t) = title {
        conn.execute("UPDATE calendar_events SET title = ?1, updated_at = unixepoch() WHERE id = ?2", params![t, id])?;
    }
    if let Some(d) = description {
        match d {
            Some(v) => {
                conn.execute("UPDATE calendar_events SET description = ?1, updated_at = unixepoch() WHERE id = ?2", params![v, id])?;
            }
            None => {
                conn.execute("UPDATE calendar_events SET description = NULL, updated_at = unixepoch() WHERE id = ?2", params![id])?;
            }
        }
    }
    if let Some(s) = start_time {
        conn.execute("UPDATE calendar_events SET start_time = ?1, updated_at = unixepoch() WHERE id = ?2", params![s, id])?;
    }
    if let Some(v) = end_time {
        match v {
            Some(v) => {
                conn.execute("UPDATE calendar_events SET end_time = ?1, updated_at = unixepoch() WHERE id = ?2", params![v, id])?;
            }
            None => {
                conn.execute("UPDATE calendar_events SET end_time = NULL, updated_at = unixepoch() WHERE id = ?2", params![id])?;
            }
        }
    }
    if let Some(c) = color {
        conn.execute("UPDATE calendar_events SET color = ?1, updated_at = unixepoch() WHERE id = ?2", params![c, id])?;
    }
    let event = conn.query_row(
        "SELECT id, title, description, start_time, end_time, all_day, color, created_at, updated_at FROM calendar_events WHERE id = ?1",
        params![id],
        |row| {
            Ok(CalendarEvent {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_time: row.get(3)?,
                end_time: row.get(4)?,
                all_day: row.get(5)?,
                color: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    )?;
    Ok(event)
}

pub fn delete_event(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("UPDATE calendar_events SET deleted_at = unixepoch() WHERE id = ?1", params![id])?;
    Ok(())
}
use crate::db::connection::Database;
use crate::models::calendar_event::CalendarEvent;

#[tauri::command(async)]
pub async fn get_calendar_events(db: tauri::State<'_, Database>, start: i64, end: i64) -> Result<Vec<CalendarEvent>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::calendar::list_events_in_range(&conn, start, end).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn get_calendar_event(db: tauri::State<'_, Database>, id: String) -> Result<CalendarEvent, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::calendar::get_event(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn create_calendar_event(
    db: tauri::State<'_, Database>,
    title: String,
    description: Option<Option<String>>,
    start_time: i64,
    end_time: Option<Option<i64>>,
    all_day: Option<bool>,
    color: Option<String>,
) -> Result<CalendarEvent, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::calendar::insert_event(
        &conn,
        &title,
        description.as_ref().and_then(|v| v.as_deref()),
        start_time,
        end_time.and_then(|v| v),
        all_day.unwrap_or(false),
        color.as_deref().unwrap_or("blue"),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn update_calendar_event(
    db: tauri::State<'_, Database>,
    id: String,
    title: Option<String>,
    description: Option<Option<String>>,
    start_time: Option<i64>,
    end_time: Option<Option<i64>>,
    color: Option<String>,
    all_day: Option<bool>,
) -> Result<CalendarEvent, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    if let Some(val) = all_day {
        conn.execute(
            "UPDATE calendar_events SET all_day = ?1, updated_at = unixepoch() WHERE id = ?2",
            rusqlite::params![if val { 1 } else { 0 }, id],
        )
        .map_err(|e| e.to_string())?;
    }

    crate::db::queries::calendar::update_event(
        &conn,
        &id,
        title.as_deref(),
        description.as_ref().map(|v| v.as_deref()),
        start_time,
        end_time,
        color.as_deref(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn delete_calendar_event(db: tauri::State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::calendar::delete_event(&conn, &id).map_err(|e| e.to_string())
}
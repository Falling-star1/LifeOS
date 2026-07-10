use crate::db::connection::Database;
use crate::models::pomodoro_session::{PomodoroSession, PomodoroTodayStats};

#[tauri::command(async)]
pub async fn save_pomodoro_session(
    db: tauri::State<'_, Database>,
    duration_minutes: i32,
    completed: bool,
    study_plan_id: Option<String>,
) -> Result<PomodoroSession, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::pomodoro::insert_session(&conn, duration_minutes, completed, study_plan_id.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn get_pomodoro_sessions(
    db: tauri::State<'_, Database>,
) -> Result<Vec<PomodoroSession>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::pomodoro::list_sessions(&conn).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn get_pomodoro_today_stats(
    db: tauri::State<'_, Database>,
) -> Result<PomodoroTodayStats, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::pomodoro::get_today_stats(&conn).map_err(|e| e.to_string())
}
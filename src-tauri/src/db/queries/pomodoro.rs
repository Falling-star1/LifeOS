use rusqlite::{Connection, Result, params};
use crate::models::pomodoro_session::{PomodoroSession, PomodoroTodayStats};

pub fn insert_session(conn: &Connection, duration_minutes: i32, completed: bool, study_plan_id: Option<&str>) -> Result<PomodoroSession> {
    conn.execute(
        "INSERT INTO pomodoro_sessions (duration_minutes, completed, study_plan_id) VALUES (?1, ?2, ?3)",
        params![duration_minutes, if completed { 1 } else { 0 }, study_plan_id],
    )?;

    // Update study plan completed_hours if linked
    if let Some(plan_id) = study_plan_id {
        let added_hours = duration_minutes as f64 / 60.0;
        conn.execute(
            "UPDATE study_plans SET completed_hours = completed_hours + ?1, updated_at = unixepoch() WHERE id = ?2",
            params![added_hours, plan_id],
        )?;
    }

    let session = conn.query_row(
        "SELECT id, duration_minutes, completed, study_plan_id, created_at FROM pomodoro_sessions WHERE rowid = last_insert_rowid()",
        [],
        |row| {
            Ok(PomodoroSession {
                id: row.get(0)?,
                duration_minutes: row.get(1)?,
                completed: row.get(2)?,
                study_plan_id: row.get(3)?,
                created_at: row.get(4)?,
            })
        },
    )?;
    Ok(session)
}

pub fn list_sessions(conn: &Connection) -> Result<Vec<PomodoroSession>> {
    let mut stmt = conn.prepare(
        "SELECT id, duration_minutes, completed, study_plan_id, created_at FROM pomodoro_sessions ORDER BY created_at DESC LIMIT 50"
    )?;
    let sessions = stmt.query_map([], |row| {
        Ok(PomodoroSession {
            id: row.get(0)?,
            duration_minutes: row.get(1)?,
            completed: row.get(2)?,
            study_plan_id: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?.collect::<Result<Vec<_>>>()?;
    Ok(sessions)
}

pub fn get_today_stats(conn: &Connection) -> Result<PomodoroTodayStats> {
    let stats = conn.query_row(
        "SELECT COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0), COALESCE(SUM(CASE WHEN completed = 1 THEN duration_minutes ELSE 0 END), 0) FROM pomodoro_sessions WHERE date(created_at, 'unixepoch', 'localtime') = date('now', 'localtime')",
        [],
        |row| {
            Ok(PomodoroTodayStats {
                completed_count: row.get(0)?,
                total_minutes: row.get(1)?,
            })
        },
    )?;
    Ok(stats)
}
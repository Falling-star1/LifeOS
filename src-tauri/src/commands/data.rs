use serde::{Serialize, Deserialize};
use rusqlite::Connection;
use crate::db::connection::Database;

#[derive(Serialize, Deserialize)]
pub struct ExportData {
    tasks: Vec<serde_json::Value>,
    notes: Vec<serde_json::Value>,
    study_plans: Vec<serde_json::Value>,
    projects: Vec<serde_json::Value>,
    calendar_events: Vec<serde_json::Value>,
    tags: Vec<serde_json::Value>,
    pomodoro_sessions: Vec<serde_json::Value>,
}

fn query_all(conn: &Connection, sql: &str) -> Vec<serde_json::Value> {
    let mut stmt = match conn.prepare(sql) {
        Ok(s) => s,
        Err(_) => return vec![],
    };
    let columns: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
    let rows = stmt.query_map([], |row| {
        let mut map = serde_json::Map::new();
        for (i, col) in columns.iter().enumerate() {
            let val: serde_json::Value = match row.get::<_, Option<String>>(i) {
                Ok(Some(s)) => serde_json::Value::String(s),
                Ok(None) => serde_json::Value::Null,
                Err(_) => match row.get::<_, Option<f64>>(i) {
                    Ok(Some(n)) => serde_json::json!(n),
                    Ok(None) => serde_json::Value::Null,
                    Err(_) => match row.get::<_, Option<i64>>(i) {
                        Ok(Some(n)) => serde_json::json!(n),
                        Ok(None) => serde_json::Value::Null,
                        Err(_) => serde_json::Value::Null,
                    },
                },
            };
            map.insert(col.clone(), val);
        }
        Ok(serde_json::Value::Object(map))
    });
    match rows {
        Ok(r) => r.filter_map(|r| r.ok()).collect(),
        Err(_) => vec![],
    }
}

#[tauri::command(async)]
pub async fn export_data(db: tauri::State<'_, Database>) -> Result<ExportData, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    Ok(ExportData {
        tasks: query_all(&conn, "SELECT * FROM tasks WHERE deleted_at IS NULL"),
        notes: query_all(&conn, "SELECT * FROM notes WHERE deleted_at IS NULL"),
        study_plans: query_all(&conn, "SELECT * FROM study_plans WHERE deleted_at IS NULL"),
        projects: query_all(&conn, "SELECT * FROM projects WHERE deleted_at IS NULL"),
        calendar_events: query_all(&conn, "SELECT * FROM calendar_events WHERE deleted_at IS NULL"),
        tags: query_all(&conn, "SELECT * FROM tags"),
        pomodoro_sessions: query_all(&conn, "SELECT * FROM pomodoro_sessions"),
    })
}

#[tauri::command(async)]
pub async fn import_data(db: tauri::State<'_, Database>, json: String) -> Result<String, String> {
    let data: ExportData = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Clear existing data
    conn.execute("DELETE FROM task_tags", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM notes", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM study_plans", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM projects", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM calendar_events", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM pomodoro_sessions", []).map_err(|e| e.to_string())?;

    // Insert projects
    for p in &data.projects {
        if let (Some(id), Some(name), Some(color)) = (p.get("id").and_then(|v| v.as_str()), p.get("name").and_then(|v| v.as_str()), p.get("color").and_then(|v| v.as_str())) {
            conn.execute("INSERT OR IGNORE INTO projects (id, name, color) VALUES (?1, ?2, ?3)", rusqlite::params![id, name, color]).ok();
        }
    }
    // Insert tasks
    for t in &data.tasks {
        if let (Some(id), Some(title)) = (t.get("id").and_then(|v| v.as_str()), t.get("title").and_then(|v| v.as_str())) {
            conn.execute("INSERT OR IGNORE INTO tasks (id, title, description, status, priority, due_date, project_id, parent_id, sort_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                rusqlite::params![
                    id, title,
                    t.get("description").and_then(|v| v.as_str()),
                    t.get("status").and_then(|v| v.as_str()).unwrap_or("todo"),
                    t.get("priority").and_then(|v| v.as_f64()).unwrap_or(0.0) as i32,
                    t.get("due_date").and_then(|v| v.as_f64()).map(|n| n as i64),
                    t.get("project_id").and_then(|v| v.as_str()),
                    t.get("parent_id").and_then(|v| v.as_str()),
                    t.get("sort_order").and_then(|v| v.as_f64()).unwrap_or(0.0) as i32,
                ]).ok();
        }
    }
    // Insert notes
    for n in &data.notes {
        if let (Some(id), Some(title), Some(content)) = (n.get("id").and_then(|v| v.as_str()), n.get("title").and_then(|v| v.as_str()), n.get("content").and_then(|v| v.as_str())) {
            conn.execute("INSERT OR IGNORE INTO notes (id, title, content) VALUES (?1, ?2, ?3)", rusqlite::params![id, title, content]).ok();
        }
    }
    // Insert study plans
    for sp in &data.study_plans {
        if let (Some(id), Some(title)) = (sp.get("id").and_then(|v| v.as_str()), sp.get("title").and_then(|v| v.as_str())) {
            conn.execute("INSERT OR IGNORE INTO study_plans (id, title, category, color, total_hours, completed_hours, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![
                    id, title,
                    sp.get("category").and_then(|v| v.as_str()).unwrap_or(""),
                    sp.get("color").and_then(|v| v.as_str()).unwrap_or("blue"),
                    sp.get("total_hours").and_then(|v| v.as_f64()).unwrap_or(20.0),
                    sp.get("completed_hours").and_then(|v| v.as_f64()).unwrap_or(0.0),
                    sp.get("status").and_then(|v| v.as_str()).unwrap_or("active"),
                ]).ok();
        }
    }
    // Insert calendar events
    for ev in &data.calendar_events {
        if let (Some(id), Some(title)) = (ev.get("id").and_then(|v| v.as_str()), ev.get("title").and_then(|v| v.as_str())) {
            conn.execute("INSERT OR IGNORE INTO calendar_events (id, title, description, start_time, end_time, all_day, color) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![
                    id, title,
                    ev.get("description").and_then(|v| v.as_str()),
                    ev.get("start_time").and_then(|v| v.as_f64()).unwrap_or(0.0) as i64,
                    ev.get("end_time").and_then(|v| v.as_f64()).map(|n| n as i64),
                    ev.get("all_day").and_then(|v| v.as_f64()).unwrap_or(0.0) as i32,
                    ev.get("color").and_then(|v| v.as_str()).unwrap_or("blue"),
                ]).ok();
        }
    }
    // Insert tags
    for tg in &data.tags {
        if let (Some(id), Some(name)) = (tg.get("id").and_then(|v| v.as_str()), tg.get("name").and_then(|v| v.as_str())) {
            conn.execute("INSERT OR IGNORE INTO tags (id, name) VALUES (?1, ?2)", rusqlite::params![id, name]).ok();
        }
    }
    // Insert pomodoro sessions
    for ps in &data.pomodoro_sessions {
        if let Some(id) = ps.get("id").and_then(|v| v.as_str()) {
            conn.execute("INSERT OR IGNORE INTO pomodoro_sessions (id, duration_minutes, completed, study_plan_id) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![
                    id,
                    ps.get("duration_minutes").and_then(|v| v.as_f64()).unwrap_or(0.0) as i32,
                    ps.get("completed").and_then(|v| v.as_f64()).unwrap_or(1.0) as i32,
                    ps.get("study_plan_id").and_then(|v| v.as_str()),
                ]).ok();
        }
    }

    Ok("ok".to_string())
}

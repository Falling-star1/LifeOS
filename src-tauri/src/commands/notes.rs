use crate::db::connection::Database;
use crate::models::note::Note;

#[tauri::command(async)]
pub async fn get_notes(db: tauri::State<'_, Database>) -> Result<Vec<Note>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::notes::list_notes(&conn).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn create_note(db: tauri::State<'_, Database>, title: Option<String>, content: Option<String>) -> Result<Note, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::notes::insert_note(&conn, title.as_deref().unwrap_or("无标题笔记"), content.as_deref().unwrap_or("")).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn update_note(db: tauri::State<'_, Database>, id: String, title: Option<String>, content: Option<String>, pinned: Option<i32>) -> Result<Note, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::notes::update_note(&conn, &id, title.as_deref(), content.as_deref(), pinned).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn toggle_note_pin(db: tauri::State<'_, Database>, id: String) -> Result<Note, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::notes::toggle_pin(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn delete_note(db: tauri::State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::notes::delete_note(&conn, &id).map_err(|e| e.to_string())
}
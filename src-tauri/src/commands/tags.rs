use crate::db::connection::Database;
use crate::models::tag::Tag;

#[tauri::command(async)]
pub async fn get_tags(db: tauri::State<'_, Database>) -> Result<Vec<Tag>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tags::list_tags(&conn).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn create_tag(db: tauri::State<'_, Database>, name: String, color: Option<String>) -> Result<Tag, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let c = color.unwrap_or_else(|| "gray".to_string());
    crate::db::queries::tags::insert_tag(&conn, &name, &c).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn delete_tag(db: tauri::State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tags::delete_tag(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn get_task_tags(db: tauri::State<'_, Database>, taskId: String) -> Result<Vec<Tag>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tags::get_tags_for_task(&conn, &taskId).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn set_task_tags(db: tauri::State<'_, Database>, taskId: String, tagIds: Vec<String>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tags::set_task_tags(&conn, &taskId, &tagIds).map_err(|e| e.to_string())
}
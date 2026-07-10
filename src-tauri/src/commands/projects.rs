use crate::db::connection::Database;
use crate::models::project::Project;

#[tauri::command(async)]
pub async fn get_projects(db: tauri::State<'_, Database>) -> Result<Vec<Project>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::projects::list_projects(&conn).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn create_project(db: tauri::State<'_, Database>, name: String, color: String, icon: Option<String>) -> Result<Project, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::projects::insert_project(&conn, &name, &color, icon.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn update_project(db: tauri::State<'_, Database>, id: String, name: Option<String>, color: Option<String>, icon: Option<String>) -> Result<Project, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::projects::update_project(&conn, &id, name.as_deref(), color.as_deref(), icon.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn delete_project(db: tauri::State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::projects::delete_project(&conn, &id).map_err(|e| e.to_string())
}

use crate::db::connection::Database;
use crate::models::task::Task;

#[tauri::command(async)]
pub async fn get_tasks(db: tauri::State<'_, Database>, status: Option<String>) -> Result<Vec<Task>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tasks::list_tasks(&conn, status.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn get_subtasks(db: tauri::State<'_, Database>, parentId: String) -> Result<Vec<Task>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tasks::list_subtasks(&conn, &parentId).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn create_task(
    db: tauri::State<'_, Database>,
    title: String,
    description: Option<String>,
    status: Option<String>,
    priority: Option<i32>,
    dueDate: Option<i64>,
    projectId: Option<String>,
    parentId: Option<String>,
) -> Result<Task, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tasks::insert_task(
        &conn, &title, description.as_deref(), status.as_deref(),
        priority, dueDate, projectId.as_deref(), parentId.as_deref(),
    ).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn update_task(
    db: tauri::State<'_, Database>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    status: Option<String>,
    priority: Option<i32>,
    dueDate: Option<i64>,
    projectId: Option<String>,
) -> Result<Task, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tasks::update_task_fields(
        &conn, &id, title.as_deref(), description.as_deref(),
        status.as_deref(), priority, dueDate, projectId.as_deref(),
    ).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn update_task_status(db: tauri::State<'_, Database>, id: String, status: String) -> Result<Task, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tasks::update_task_status(&conn, &id, &status).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn delete_task(db: tauri::State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::tasks::delete_task(&conn, &id).map_err(|e| e.to_string())
}
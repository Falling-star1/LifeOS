use crate::db::connection::Database;
use crate::models::task::Task;

#[tauri::command(async)]
pub async fn get_tasks(db: tauri::State<'_, Database>) -> Result<Vec<Task>, String> {
    crate::db::queries::tasks::list_tasks(&db.conn, None).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn create_task(db: tauri::State<'_, Database>, title: String) -> Result<Task, String> {
    crate::db::queries::tasks::insert_task(&db.conn, &title).map_err(|e| e.to_string())
}
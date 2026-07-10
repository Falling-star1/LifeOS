use crate::db::connection::Database;
use crate::models::study_plan::StudyPlan;

#[tauri::command(async)]
pub async fn get_study_plans(db: tauri::State<'_, Database>) -> Result<Vec<StudyPlan>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::study::list_study_plans(&conn).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn create_study_plan(db: tauri::State<'_, Database>, title: String, category: String, color: String, total_hours: f64) -> Result<StudyPlan, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::study::insert_study_plan(&conn, &title, &category, &color, total_hours).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn update_study_plan(db: tauri::State<'_, Database>, id: String, title: String, total_hours: f64) -> Result<StudyPlan, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::study::update_study_plan(&conn, &id, &title, total_hours).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn update_study_plan_hours(db: tauri::State<'_, Database>, id: String, completed_hours: f64) -> Result<StudyPlan, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::study::update_study_plan_hours(&conn, &id, completed_hours).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub async fn delete_study_plan(db: tauri::State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::study::delete_study_plan(&conn, &id).map_err(|e| e.to_string())
}

use crate::db::connection::Database;
use crate::db::queries::search::SearchResult;

#[tauri::command(async)]
pub async fn global_search(db: tauri::State<'_, Database>, query: String) -> Result<Vec<SearchResult>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    crate::db::queries::search::search_all(&conn, &query).map_err(|e| e.to_string())
}

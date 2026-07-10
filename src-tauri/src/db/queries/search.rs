use rusqlite::{Connection, params};

#[derive(serde::Serialize, Clone)]
pub struct SearchResult {
    pub id: String,
    pub result_type: String,  // "task", "note", "study_plan"
    pub title: String,
    pub subtitle: String,
}

pub fn search_all(conn: &Connection, query: &str) -> rusqlite::Result<Vec<SearchResult>> {
    let pattern = format!("%{}%", query);
    let mut results = Vec::new();

    // Search tasks
    {
        let mut stmt = conn.prepare(
            "SELECT id, title, COALESCE(description, '') FROM tasks WHERE deleted_at IS NULL AND (title LIKE ?1 OR description LIKE ?1) ORDER BY updated_at DESC LIMIT 10"
        )?;
        let rows = stmt.query_map(params![pattern], |row| {
            Ok(SearchResult {
                id: row.get(0)?,
                result_type: "task".to_string(),
                title: row.get(1)?,
                subtitle: row.get(2)?,
            })
        })?;
        for row in rows {
            results.push(row?);
        }
    }

    // Search notes
    {
        let mut stmt = conn.prepare(
            "SELECT id, title, content FROM notes WHERE deleted_at IS NULL AND (title LIKE ?1 OR content LIKE ?1) ORDER BY updated_at DESC LIMIT 10"
        )?;
        let rows = stmt.query_map(params![pattern], |row| {
            let content: String = row.get(2)?;
            Ok(SearchResult {
                id: row.get(0)?,
                result_type: "note".to_string(),
                title: row.get(1)?,
                subtitle: content.chars().take(60).collect(),
            })
        })?;
        for row in rows {
            results.push(row?);
        }
    }

    // Search study plans
    {
        let mut stmt = conn.prepare(
            "SELECT id, title, category FROM study_plans WHERE deleted_at IS NULL AND (title LIKE ?1 OR category LIKE ?1) ORDER BY updated_at DESC LIMIT 5"
        )?;
        let rows = stmt.query_map(params![pattern], |row| {
            Ok(SearchResult {
                id: row.get(0)?,
                result_type: "study_plan".to_string(),
                title: row.get(1)?,
                subtitle: row.get(2)?,
            })
        })?;
        for row in rows {
            results.push(row?);
        }
    }

    Ok(results)
}

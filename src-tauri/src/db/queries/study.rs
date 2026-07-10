use rusqlite::{Connection, Result, params};
use crate::models::study_plan::StudyPlan;

pub fn list_study_plans(conn: &Connection) -> Result<Vec<StudyPlan>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, category, color, total_hours, completed_hours, status, created_at, updated_at FROM study_plans WHERE deleted_at IS NULL ORDER BY updated_at DESC"
    )?;
    let plans = stmt.query_map([], |row| {
        Ok(StudyPlan {
            id: row.get(0)?,
            title: row.get(1)?,
            category: row.get(2)?,
            color: row.get(3)?,
            total_hours: row.get(4)?,
            completed_hours: row.get(5)?,
            status: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    })?.collect::<Result<Vec<_>>>()?;
    Ok(plans)
}

pub fn insert_study_plan(conn: &Connection, title: &str, category: &str, color: &str, total_hours: f64) -> Result<StudyPlan> {
    conn.execute(
        "INSERT INTO study_plans (title, category, color, total_hours) VALUES (?1, ?2, ?3, ?4)",
        params![title, category, color, total_hours],
    )?;
    let plan = conn.query_row(
        "SELECT id, title, category, color, total_hours, completed_hours, status, created_at, updated_at FROM study_plans WHERE rowid = last_insert_rowid()",
        [], |row| {
            Ok(StudyPlan {
                id: row.get(0)?,
                title: row.get(1)?,
                category: row.get(2)?,
                color: row.get(3)?,
                total_hours: row.get(4)?,
                completed_hours: row.get(5)?,
                status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    )?;
    Ok(plan)
}

pub fn update_study_plan_hours(conn: &Connection, id: &str, completed_hours: f64) -> Result<StudyPlan> {
    conn.execute(
        "UPDATE study_plans SET completed_hours = ?1, updated_at = unixepoch() WHERE id = ?2",
        params![completed_hours, id],
    )?;
    let plan = conn.query_row(
        "SELECT id, title, category, color, total_hours, completed_hours, status, created_at, updated_at FROM study_plans WHERE id = ?1",
        params![id], |row| {
            Ok(StudyPlan {
                id: row.get(0)?,
                title: row.get(1)?,
                category: row.get(2)?,
                color: row.get(3)?,
                total_hours: row.get(4)?,
                completed_hours: row.get(5)?,
                status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    )?;
    Ok(plan)
}

pub fn update_study_plan(conn: &Connection, id: &str, title: &str, total_hours: f64) -> Result<StudyPlan> {
    conn.execute(
        "UPDATE study_plans SET title = ?1, total_hours = ?2, updated_at = unixepoch() WHERE id = ?3",
        params![title, total_hours, id],
    )?;
    let plan = conn.query_row(
        "SELECT id, title, category, color, total_hours, completed_hours, status, created_at, updated_at FROM study_plans WHERE id = ?1",
        params![id], |row| {
            Ok(StudyPlan {
                id: row.get(0)?,
                title: row.get(1)?,
                category: row.get(2)?,
                color: row.get(3)?,
                total_hours: row.get(4)?,
                completed_hours: row.get(5)?,
                status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    )?;
    Ok(plan)
}

pub fn delete_study_plan(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("UPDATE study_plans SET deleted_at = unixepoch() WHERE id = ?1", params![id])?;
    Ok(())
}

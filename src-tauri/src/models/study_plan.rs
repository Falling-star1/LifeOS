use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct StudyPlan {
    pub id: String,
    pub title: String,
    pub category: String,
    pub color: String,
    pub total_hours: f64,
    pub completed_hours: f64,
    pub status: String,
    pub created_at: i64,
    pub updated_at: i64,
}

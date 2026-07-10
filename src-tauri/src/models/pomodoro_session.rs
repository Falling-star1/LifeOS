use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PomodoroSession {
    pub id: String,
    pub duration_minutes: i32,
    pub completed: i32,
    pub study_plan_id: Option<String>,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PomodoroTodayStats {
    pub completed_count: i32,
    pub total_minutes: i32,
}
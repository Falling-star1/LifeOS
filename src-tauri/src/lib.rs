mod commands;
mod db;
mod models;
mod utils;

use tauri::Manager;
use db::connection::Database;
use commands::tasks::{get_tasks, get_subtasks, create_task, update_task, update_task_status, delete_task};
use commands::notes::{get_notes, create_note, update_note, delete_note};
use commands::study::{get_study_plans, create_study_plan, update_study_plan, update_study_plan_hours, delete_study_plan};
use commands::pomodoro::{save_pomodoro_session, get_pomodoro_sessions, get_pomodoro_today_stats};
use commands::projects::{get_projects, create_project, update_project, delete_project};
use commands::calendar::{get_calendar_events, get_calendar_event, create_calendar_event, update_calendar_event, delete_calendar_event};
use commands::data::{export_data, import_data};
use commands::search::global_search;
use commands::tags::{get_tags, create_tag, delete_tag, get_task_tags, set_task_tags};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("failed to resolve app dir");
            std::fs::create_dir_all(&app_dir).ok();
            let db = Database::new(app_dir.join("lifeos.db")).expect("failed to open database");
            app.manage(db);

            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_tasks, create_task, update_task, update_task_status, delete_task,
            get_subtasks,
            get_notes, create_note, update_note, delete_note,
            get_study_plans, create_study_plan, update_study_plan, update_study_plan_hours, delete_study_plan,
            save_pomodoro_session, get_pomodoro_sessions, get_pomodoro_today_stats,
            get_projects, create_project, update_project, delete_project,
            get_calendar_events, get_calendar_event, create_calendar_event, update_calendar_event, delete_calendar_event,
            global_search, export_data, import_data,
            get_tags, create_tag, delete_tag, get_task_tags, set_task_tags
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

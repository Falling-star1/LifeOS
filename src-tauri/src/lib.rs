mod commands;
mod db;
mod models;
mod utils;

use tauri::Manager;
use db::connection::Database;
use commands::tasks::{get_tasks, create_task};

#[tauri::command(async)]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app.path_resolver().app_data_dir().expect("failed to resolve app dir");
            std::fs::create_dir_all(&app_dir).ok();
            let db = Database::new(app_dir.join("lifeos.db")).expect("failed to open database");
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_tasks, create_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
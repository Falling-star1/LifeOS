use std::path::PathBuf;
use std::sync::Mutex;
use rusqlite::{Connection, Result};
use super::migrations;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(path: PathBuf) -> Result<Self> {
        let conn = Connection::open(path)?;
        migrations::run_migrations(&conn)?;
        Ok(Self { conn: Mutex::new(conn) })
    }
}

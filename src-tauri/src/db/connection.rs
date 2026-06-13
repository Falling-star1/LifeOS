use std::path::PathBuf;
use rusqlite::{Connection, Result};
use super::migrations;

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn new(path: PathBuf) -> Result<Self> {
        let conn = Connection::open(path)?;
        migrations::run_migrations(&conn)?;
        Ok(Self { conn })
    }
}
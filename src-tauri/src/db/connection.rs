use std::path::PathBuf;
use rusqlite::{Connection, Result};

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn new(path: PathBuf) -> Result<Self> {
        let conn = Connection::open(path)?;
        Ok(Self { conn })
    }
}

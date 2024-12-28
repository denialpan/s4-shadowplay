const sqlite3 = require('sqlite3').verbose();

// Path to the SQLite database file
const db = new sqlite3.Database('./filesystem.db');

db.serialize(() => {

    // users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            admin BOOLEAN DEFAULT 1
        )
    `);

    // folder table
    db.run(`
        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            owner TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            s3_key TEXT NOT NULL,
            name TEXT NOT NULL,
            folder_id TEXT,
            size INTEGER,
            type TEXT,
            owner TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            modified_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
            FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE
        );   
    `)

    db.run(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL
        );
    `)

    db.run(`
        CREATE TABLE IF NOT EXISTS file_tags (
            file_id TEXT NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (file_id, tag_id),
            FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        );
    `)

    console.log("Filesystem database has been created.");
});

db.close();
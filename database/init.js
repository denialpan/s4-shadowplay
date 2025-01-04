const argon2 = require('argon2');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./filesystem.db');

const username = "admin";
const password = "admin";
var hashedPassword = "";

const initializeDatabase = async () => {

    try {
        hashedPassword = await argon2.hash(password);

        db.serialize(() => {

            db.run("PRAGMA foreign_keys = ON;");

            // users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    admin BOOLEAN DEFAULT 0
                );
            `);


            // folders table
            db.run(`
                CREATE TABLE IF NOT EXISTS folders (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    parent_id TEXT,
                    owner INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE,
                    FOREIGN KEY (owner) REFERENCES users (id) ON DELETE CASCADE,
                    UNIQUE (name, parent_id)
                );
            `);

            // files table
            db.run(`
                CREATE TABLE IF NOT EXISTS files (
                    id TEXT PRIMARY KEY,
                    s3_key TEXT NOT NULL,
                    name TEXT NOT NULL,
                    folder_id TEXT,
                    size INTEGER,
                    type TEXT,
                    file_extension TEXT,
                    owner INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE,
                    FOREIGN KEY (owner) REFERENCES users (id) ON DELETE CASCADE,
                    UNIQUE (name, folder_id)
                );
            `);

            // tags table
            db.run(`
                CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL
                );
            `);

            // file_tags table
            db.run(`
                CREATE TABLE IF NOT EXISTS file_tags (
                    file_id TEXT NOT NULL,
                    tag_id INTEGER NOT NULL,
                    PRIMARY KEY (file_id, tag_id),
                    FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
                );
            `);


            // Insert admin user
            db.run(
                `INSERT INTO users (username, password, admin) VALUES (?, ?, ?)`,
                [username, hashedPassword, 1],
                (err) => {
                    if (err) {
                        console.error("Error inserting user:", err.message);
                    } else {
                        console.log("Admin user has been added.");
                    }
                }
            );

            db.run(`
                INSERT INTO folders (id, name, parent_id, owner) VALUES ('root', 'root', NULL, 1);
            `);

            console.log("Filesystem database has been created.");
        });

    } finally {
        db.close();
    }
}

initializeDatabase();
const sqlite3 = require('sqlite3').verbose();

// Path to the SQLite database file
const db = new sqlite3.Database('./database/users.db');

db.serialize(() => {
    // Create the "users" table if it doesn't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Users table has been created.");
});

db.close();
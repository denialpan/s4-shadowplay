const sqlite3 = require('sqlite3').verbose();

const connectFileSystem = () => {
    const db = new sqlite3.Database('./database/filesystem.db');
    db.run("PRAGMA foreign_keys = ON;", (err) => {
        if (err) {
            console.error("Failed to enable foreign keys:", err.message);
        } else {
            console.log("Foreign keys are enabled.");
        }
    });

    return db;
}

module.exports = {
    connectFileSystem
}
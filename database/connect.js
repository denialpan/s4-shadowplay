const sqlite3 = require('sqlite3').verbose();

const connectFileSystem = () => {
    return new sqlite3.Database('./database/filesystem.db');
}

module.exports = {
    connectFileSystem
}
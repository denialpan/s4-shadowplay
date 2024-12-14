const sqlite3 = require('sqlite3').verbose();

const connectUser = () => {
    return new sqlite3.Database('./database/users.db');
}

module.exports = {
    connectUser
}
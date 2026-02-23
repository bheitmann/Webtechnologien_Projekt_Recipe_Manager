const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');


// Datenbank setup
const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

// Promisify database methods for cleaner async/await usage
const dbUtils = {
    run: (sql, params = []) => new Promise((res, rej) => {
        db.run(sql, params, function(err) { (err) ? rej(err) : res({ id: this.lastID, changes: this.changes }); });
    }),
    get: (sql, params = []) => new Promise((res, rej) => {
        db.get(sql, params, (err, row) => { (err) ? rej(err) : res(row); });
    }),
    all: (sql, params = []) => new Promise((res, rej) => {
        db.all(sql, params, (err, rows) => { (err) ? rej(err) : res(rows); });
    })
};

async function initDb() { // Funktion um Datenbank zu starten
    // User Tabelle
    await dbUtils.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `); // IF NOT EXISTS -> für den ersten Start der Datenbank jemals

    // Rezept Tabelle
    await dbUtils.run(`
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            title TEXT NOT NULL,
            ingredients TEXT NOT NULL,
            steps TEXT NOT NULL,
            category TEXT,
            image TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);

    // Deafult User erstellen, falls noch nicht vorhanden
    const admin = await dbUtils.get('SELECT * FROM users WHERE username = "admin"');
    if (!admin) {
        const hashedPw = await bcrypt.hash('password123', 10);
        await dbUtils.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPw, 'admin']);
        await dbUtils.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user', hashedPw, 'user']);
    }
}  

module.exports = {...dbUtils, initDb};
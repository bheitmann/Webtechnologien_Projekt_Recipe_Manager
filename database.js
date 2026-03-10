//database.js (backend)
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

    // Mengeneinheiten Tabelle
    await dbUtils.run(`
        CREATE TABLE IF NOT EXISTS units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    `);

    // Zutaten Tabelle
    await dbUtils.run(`
        CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    `);

    // Rezept Tabelle (ohne ingredients - jetzt n:n über junction table)
    await dbUtils.run(`
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            title TEXT NOT NULL,
            instructions TEXT NOT NULL,
            category TEXT,
            imageUrl TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);

    // Bestehende Datenbank auf neue Spalte migrieren, falls sie fehlt
    const recipeColumns = await dbUtils.all('PRAGMA table_info(recipes)');
    const hasImageUrl = recipeColumns.some((column) => column.name === 'imageUrl');
    if (!hasImageUrl) {
        await dbUtils.run('ALTER TABLE recipes ADD COLUMN imageUrl TEXT');
    }

    // Junction-Tabelle für n:n Beziehung zwischen Rezepten und Zutaten
    await dbUtils.run(`
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
            recipeId INTEGER NOT NULL,
            ingredientId INTEGER NOT NULL,
            quantity REAL NOT NULL,
            unitId INTEGER NOT NULL,
            PRIMARY KEY (recipeId, ingredientId),
            FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
            FOREIGN KEY (ingredientId) REFERENCES ingredients(id),
            FOREIGN KEY (unitId) REFERENCES units(id)
        )
    `);

    // Standard-Mengeneinheiten einfügen
    const defaultUnits = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs'];
    for (const unit of defaultUnits) {
        await dbUtils.run('INSERT OR IGNORE INTO units (name) VALUES (?)', [unit]);
    }
    
    
    // Deafult User erstellen, falls noch nicht vorhanden
    const admin = await dbUtils.get('SELECT * FROM users WHERE username = "admin"');
    if (!admin) {
        const hashedPw = await bcrypt.hash('password123', 10);
        await dbUtils.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPw, 'admin']);
        await dbUtils.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user', hashedPw, 'user']);
    }

}  

module.exports = {...dbUtils, initDb};
const express = require('express');  //Das Express Framework wird verwendet
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./database');

// Statische Dateien aus dem Ordner "public" bereitstellen
app.use(express.static('public'));

// Erlaubt dem Server, JSON-Daten vom Frontend zu lesen
app.use(express.json());

app.use(session({
    secret: 'simple-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' } // Basic security against XSS/CSRF
}));

// Login(-API)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Suchen des Users in der SQLite Datenbank
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            // User nicht gefunden
            return res.status(401).json({ success: false, message: "Benutzer nicht gefunden!" });
        }

        // Passwort abgleichen
        // Bcrypt nimmt das Klartext-Passwort und vergleicht es mit dem Hash in der DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Erfolgreich eingeloggt
            res.json({ success: true, message: "Login erfolgreich!", role: user.role });
        } else {
            // Falsches Passwort
            res.status(401).json({ success: false, message: "Falsches Passwort!" });
        }
    } catch (err) {
        // Falls die Datenbank abstürzt, fangen wir den Fehler ab
        console.error("Login Fehler:", err);
        res.status(500).json({ success: false, message: "Interner Serverfehler." });
    }
});

// Server starten
db.initDb().then(() => {
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
});
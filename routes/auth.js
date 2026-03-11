//auth.js (backend)
const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// Login(-API)
router.post('/login', async (req, res) => {
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

        if (isMatch) { // Erfolgreich eingeloggt
            req.session.user = { id: user.id, username: user.username, role: user.role };
            res.json({ success: true, message: "Login erfolgreich!", user: req.session.user });
        } else { // Falsches Passwort
            res.status(401).json({ success: false, message: "Falsches Passwort!" });
        }
    } catch (err) {
        // Falls die Datenbank abstürzt, wird der Fehler abgefangen
        console.error("Login Fehler:", err);
        res.status(500).json({ success: false, message: "Interner Serverfehler." });
    }
});

router.post('/logout', (req, res) => req.session.destroy(() => res.json({ success: true })));

router.get('/me', (req, res) => req.session.user ? res.json(req.session.user) : res.status(401).end());




module.exports = router;
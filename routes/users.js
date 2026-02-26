//users.js (backend)
const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

//alle User abfragen
router.get('/', async (req, res) => {
    try {
        const users = await db.all('SELECT id, username, role FROM users');
        res.json({ success: true, users: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fehler beim Laden der User.' });
    }
})

//User erstellen
router.post('/', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPw = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPw, role]);
        res.json({ success: true, message: 'Benutzer erfolgreich angelegt!' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Fehler beim Erstellen.' });
    }
})

//User löschen
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    //Man darf sich nicht selbst löschen
    if (id == req.session.user.id) {
        return res.status(400).json({ success: false, message: 'Du kannst dich nicht selbst löschen!' });
    }

    try {
        await db.run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fehler beim Löschen.' });
    }
})




module.exports = router;
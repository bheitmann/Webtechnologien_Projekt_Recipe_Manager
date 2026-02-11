const express = require('express');  //Das Express Framework wird verwendet
const app = express();
const users = require('./database'); // Importiert die Datenbank

// Statische Dateien aus dem Ordner "public" bereitstellen
app.use(express.static('public'));

// Erlaubt dem Server, JSON-Daten vom Frontend zu lesen
app.use(express.json());

// Login(-API)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // User in statischer "Datenbank" suchen
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, message: "Login erfolgreich!" });
    } else {
        res.status(401).json({ success: false, message: "Falsche Daten!" });
    }
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});
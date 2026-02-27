//server.js (backend)
const express = require('express');  //Das Express Framework wird verwendet
const app = express();
const session = require('express-session');
const db = require('./database');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

// Middleware

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

const auth = (req, res, next) => req.session.user ? next() : res.status(401).json({ error: 'Unauthorized' });
const adminOnly = (req, res, next) => (req.session.user?.role === 'admin') ? next() : res.status(403).json({ error: 'Forbidden' });


// Routes
app.use('/users', adminOnly, userRoutes);
app.use('/auth', authRoutes);
app.use('/recipes', auth, recipeRoutes);



// Server starten
db.initDb().then(() => {
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
});
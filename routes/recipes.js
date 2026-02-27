//recipes.js (backend)
const express = require('express');
const router = express.Router();
const db = require('../database');

// Dashboard-API

//Route zum Abrufen aller Rezepte eines Benutzers
router.get('/', async (req, res) => {
    if (!req.session.user.id) {
        return res.status(401).json({ error: "Nicht autorisiert" });
    }

    try{
        const sql = 'SELECT * FROM recipes WHERE userId = ?'; 
        const recipes = await db.all(sql, [req.session.user.id]); //Nutzt Prepared Statements gegen SQL-Injection
        res.json(recipes);
    } catch (err) {
        console.error("Fehler beim Abrufen der Rezepte:", err);
        res.status(500).json({ success: false, message: "Interner Serverfehler." });
    }
});

router.delete('/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    const sql = 'DELETE FROM recipes WHERE id = ? AND userId = ?';
    await db.run(sql, [recipeId, req.session.user.id]);
    res.json({ success: true });
});




module.exports = router;
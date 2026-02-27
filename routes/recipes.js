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

    const { category } = req.query; // Optionales Filterkriterium

    try{
        let sql = 'SELECT * FROM recipes WHERE userId = ?'; 
        const params = [req.session.user.id];
        if (category && category !== "") {
            sql += ' AND category = ?';
            params.push(category);
        }
        const recipes = await db.all(sql, params); //Nutzt Prepared Statements gegen SQL-Injection
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
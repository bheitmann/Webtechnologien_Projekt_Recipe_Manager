//recipes.js (backend)
const express = require('express');
const router = express.Router();
const db = require('../database');

// Dashboard-API

//Route zum Abrufen aller Rezepte eines Benutzers
router.get('/', async (req, res) => {
    try{
        const sql = 'SELECT * FROM recipes WHERE userId = ?'; 
        const recipes = await dbUtils.all(sql, [req.session.user.id]); //Nutzt Prepared Statements gegen SQL-Injection
        res.json(recipes);
    } catch (err) {
        console.error("Fehler beim Abrufen der Rezepte:", err);
        res.status(500).json({ success: false, message: "Interner Serverfehler." });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await dbUtils.run('DELETE FROM recipes WHERE id = ?', [id]);
    res.json({ success: true });
});




module.exports = router;
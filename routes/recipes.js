//recipes.js (backend)
const express = require('express');
const router = express.Router();
const db = require('../database'); // exports run, get, all, etc.

// Dashboard-API

//Route zum Abrufen aller Rezepte eines Benutzers (mit Zutaten über JOIN)
router.get('/', async (req, res) => {
    try{
        const recipes = await db.all('SELECT * FROM recipes WHERE userId = ?', [req.session.user.id]);
        
        // Für jedes Rezept die Zutaten laden
        for (const recipe of recipes) {
            const ingredientsData = await db.all(`
                SELECT i.name as ingredient, ri.quantity, u.name as unit
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredientId = i.id
                JOIN units u ON ri.unitId = u.id
                WHERE ri.recipeId = ?
            `, [recipe.id]);
            recipe.ingredients = ingredientsData;
        }
        
        res.json(recipes);
    } catch (err) {
        console.error("Fehler beim Abrufen der Rezepte:", err);
        res.status(500).json({ success: false, message: "Interner Serverfehler." });
    }
});

// Create new recipe (n:n mit ingredients)
router.post('/', async (req, res) => {
    try {
        const { title, ingredients, instructions, category } = req.body;
        
        // 1. Rezept einfügen (ohne ingredients)
        const recipeResult = await db.run(
            'INSERT INTO recipes (userId, title, instructions, category) VALUES (?, ?, ?, ?)',
            [req.session.user.id, title, instructions, category]
        );
        const recipeId = recipeResult.id;
        
        // 2. Für jede Zutat: in ingredients-Tabelle einfügen (falls nicht vorhanden) und Verknüpfung erstellen
        for (const item of ingredients) {
            const ingredientName = item.ingredient.toLowerCase().trim();
            
            // Prüfen ob Zutat existiert
            let ingredient = await db.get(
                'SELECT id FROM ingredients WHERE LOWER(name) = ?',
                [ingredientName]
            );
            
            // Falls nicht, einfügen
            if (!ingredient) {
                const result = await db.run('INSERT INTO ingredients (name) VALUES (?)', [ingredientName]);
                ingredient = { id: result.id };
            }
            
            // unitId aus unit-Name holen
            const unitRow = await db.get('SELECT id FROM units WHERE name = ?', [item.unit]);
            const unitId = unitRow ? unitRow.id : 1;
            
            // Verknüpfung in recipe_ingredients erstellen
            await db.run(
                'INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unitId) VALUES (?, ?, ?, ?)',
                [recipeId, ingredient.id, parseFloat(item.quantity), unitId]
            );
        }
        
        res.json({ success: true, id: recipeId });
    } catch (err) {
        console.error("Fehler beim Erstellen des Rezepts:", err);
        res.status(500).json({ success: false, message: "Fehler beim Speichern" });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await db.run('DELETE FROM recipes WHERE id = ?', [id]);
    res.json({ success: true });
});




module.exports = router;
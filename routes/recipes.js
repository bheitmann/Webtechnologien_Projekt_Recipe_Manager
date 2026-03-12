//recipes.js (backend)
const express = require('express');
const router = express.Router();
const db = require('../database'); // exports run, get, all, etc.

async function getOrCreateIngredientId(ingredientName) {
    const normalizedName = ingredientName.toLowerCase().trim();
    let ingredient = await db.get(
        'SELECT id FROM ingredients WHERE LOWER(name) = ?',
        [normalizedName]
    );

    if (!ingredient) {
        const result = await db.run('INSERT INTO ingredients (name) VALUES (?)', [normalizedName]);
        ingredient = { id: result.id };
    }

    return ingredient.id;
}

async function getUnitId(unitName) {
    const unitRow = await db.get('SELECT id FROM units WHERE name = ?', [unitName]);
    return unitRow ? unitRow.id : 1;
}

// Dashboard-API

//Route zum Abrufen aller Rezepte eines Benutzers (mit Zutaten Ã¼ber JOIN)
router.get('/', async (req, res) => {
    if (!req.session.user.id) {
        return res.status(401).json({ error: "Nicht autorisiert" });
    }

    const { category, search } = req.query; // Optionales Filterkriterium

    try{
        let sql = `SELECT DISTINCT r.* FROM recipes r
            LEFT JOIN recipe_ingredients ri ON r.id = ri.recipeId
            LEFT JOIN ingredients i ON ri.ingredientId = i.id
            WHERE r.userId = ?
        `; 
        const params = [req.session.user.id];
        if (category && category !== "") {
            sql += ' AND category = ?';
            params.push(category);
        }
         if (search && search.trim() !== "") {
            sql += ' AND (r.title LIKE ? OR i.name LIKE ?)';
            const searchVal = `%${search}%`; 
            params.push(searchVal, searchVal);
        }
        const recipes = await db.all(sql, params); //Nutzt Prepared Statements gegen SQL-Injection
        res.json(recipes);
    } catch (err) {
        console.error("Fehler beim Abrufen der Rezepte:", err);
        res.status(500).json({ success: false, message: "Interner Serverfehler." });
    }
});

router.get('/:recipeId', async (req, res) => {
    const { recipeId } = req.params;

    try {
        const recipe = await db.get(
            'SELECT id, title, instructions, category, imageUrl FROM recipes WHERE id = ? AND userId = ?',
            [recipeId, req.session.user.id]
        );

        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Rezept nicht gefunden' });
        }

        const ingredients = await db.all(
            `SELECT i.name AS ingredient, ri.quantity, u.name AS unit
             FROM recipe_ingredients ri
             JOIN ingredients i ON i.id = ri.ingredientId
             JOIN units u ON u.id = ri.unitId
             WHERE ri.recipeId = ?`,
            [recipeId]
        );

        res.json({ ...recipe, ingredients });
    } catch (err) {
        console.error('Fehler beim Abrufen des Rezepts:', err);
        res.status(500).json({ success: false, message: 'Interner Serverfehler.' });
    }
});

// Create new recipe (n:n mit ingredients)
router.post('/', async (req, res) => {
    try {
        const { title, ingredients, instructions, category, imageUrl } = req.body;
        
        // 1. Rezept einfÃ¼gen (ohne ingredients)
        const recipeResult = await db.run(
            'INSERT INTO recipes (userId, title, instructions, category, imageUrl) VALUES (?, ?, ?, ?, ?)',
            [req.session.user.id, title, instructions, category, imageUrl]
        );
        const recipeId = recipeResult.id;
        
        // 2. FÃ¼r jede Zutat: in ingredients-Tabelle einfÃ¼gen (falls nicht vorhanden) und VerknÃ¼pfung erstellen
        for (const item of ingredients) {
            const ingredientId = await getOrCreateIngredientId(item.ingredient);
            const unitId = await getUnitId(item.unit);

            await db.run(
                'INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unitId) VALUES (?, ?, ?, ?)',
                [recipeId, ingredientId, parseFloat(item.quantity), unitId]
            );
        }
        
        res.json({ success: true, id: recipeId });
    } catch (err) {
        console.error("Fehler beim Erstellen des Rezepts:", err);
        res.status(500).json({ success: false, message: "Fehler beim Speichern" });
    }
});

router.put('/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    const { title, ingredients, instructions, category, imageUrl } = req.body;

    try {
        const existingRecipe = await db.get(
            'SELECT id FROM recipes WHERE id = ? AND userId = ?',
            [recipeId, req.session.user.id]
        );

        if (!existingRecipe) {
            return res.status(404).json({ success: false, message: 'Rezept nicht gefunden' });
        }

        await db.run('BEGIN TRANSACTION');

        await db.run(
            'UPDATE recipes SET title = ?, instructions = ?, category = ?, imageUrl = ? WHERE id = ? AND userId = ?',
            [title, instructions, category, imageUrl, recipeId, req.session.user.id]
        );

        await db.run('DELETE FROM recipe_ingredients WHERE recipeId = ?', [recipeId]);

        for (const item of ingredients) {
            const ingredientId = await getOrCreateIngredientId(item.ingredient);
            const unitId = await getUnitId(item.unit);

            await db.run(
                'INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unitId) VALUES (?, ?, ?, ?)',
                [recipeId, ingredientId, parseFloat(item.quantity), unitId]
            );
        }

        await db.run('COMMIT');
        res.json({ success: true, id: Number(recipeId) });
    } catch (err) {
        try {
            await db.run('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Rollback fehlgeschlagen:', rollbackErr);
        }

        console.error('Fehler beim Aktualisieren des Rezepts:', err);
        res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren' });
    }
});

router.delete('/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    const sql = 'DELETE FROM recipes WHERE id = ? AND userId = ?';
    await db.run(sql, [recipeId, req.session.user.id]);
    res.json({ success: true });
});




module.exports = router;

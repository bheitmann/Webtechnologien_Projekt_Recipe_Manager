//edit-recipes.js (Frontend)

import { show } from './ui.js';

// helper that sends recipe data to server
async function postRecipe(recipeData) {
    const response = await fetch('/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
    });
    return response;
}

export function edit_recipes_eventlisteners() {
    

    const createBtn = document.getElementById('create-btn');
    const cancelEditBtn = document.getElementById('cancel_edit-btn');
    const addIngredientsBtn = document.getElementById('add-ingredient-btn');
    const clearIngredientsBtn = document.getElementById('clear-ingredients-btn');
    const ingredientsList = document.getElementById('ingredients-list');
    const saveRecipeBtn = document.getElementById('save_recipe-btn');

    if (saveRecipeBtn) {
        saveRecipeBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const instructions = document.getElementById('instructions').value;
            const category = document.getElementById('category').value;

            const resp = await postRecipe({ title, ingredients: ingredientArray, instructions, category });
            if (resp.ok) {
                show('dashboard-section');
                // TODO: reload dashboard recipes
            } else {
                console.error('Error saving recipe', await resp.text());
            }
        });
    }
        //Add Recipe Logik
        
        if (createBtn) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                show('recipe_edit-section');
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Abbrechen geklickt');
                show('dashboard-section');
            });
        }

        // Zutatenverwaltung (Add / Clear)
        const ingredientArray = [];
        const ingredientsTbody = document.getElementById('ingredients-tbody');

        if (addIngredientsBtn) {
            addIngredientsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const ingredientInput = document.getElementById('ingredients');
                const quantityInput = document.getElementById('ingredient-quantity');
                const unitSelect = document.getElementById('ingredient-unit');
                
                if (!ingredientInput || !quantityInput || !unitSelect) return;
                
                const ingredient = ingredientInput.value.trim();
                const quantity = quantityInput.value.trim();
                const unit = unitSelect.value;
                
                if (!ingredient || !quantity) return; // Beide Felder müssen gefüllt sein

                // UI: neue Tabellenzeile
                const tr = document.createElement('tr');
                tr.classList.add('ingredient-row');
                tr.innerHTML = `
                    <td>${ingredient}</td>
                    <td>${quantity}</td>
                    <td>${unit}</td>
                `;
                ingredientsTbody.appendChild(tr);

                // Array aktualisieren und Eingaben leeren
                ingredientArray.push({ ingredient, quantity, unit });
                ingredientInput.value = '';
                quantityInput.value = '';
            });
        }

        if (clearIngredientsBtn) {
            clearIngredientsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Anzeige und Array leeren
                ingredientsTbody.innerHTML = '';
                ingredientArray.length = 0;
            });
        }
}
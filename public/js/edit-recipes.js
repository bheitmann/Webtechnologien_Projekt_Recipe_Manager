//edit-recipes.js (Frontend)

import { show } from './ui.js';

// helper that sends recipe data to server
async function saveRecipe(recipeData, recipeId = null) {
    const isEditMode = recipeId !== null;
    const response = await fetch(isEditMode ? `/recipes/${recipeId}` : '/recipes', {
        method: isEditMode ? 'PUT' : 'POST',
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
    const saveRecipeBtn = document.getElementById('save_recipe-btn');
    const ingredientsTbody = document.getElementById('ingredients-tbody');
    const titleInput = document.getElementById('title');
    const imageUrlInput = document.getElementById('image-url');
    const instructionsInput = document.getElementById('instructions');
    const categoryInput = document.getElementById('category');
    const editTitle = document.querySelector('.recipe-edit-title');

    const ingredientArray = [];
    let editRecipeId = null;

    const renderIngredients = () => {
        ingredientsTbody.innerHTML = '';

        ingredientArray.forEach(({ ingredient, quantity, unit }) => {
            const tr = document.createElement('tr');
            tr.classList.add('ingredient-row');
            tr.innerHTML = `
                <td>${ingredient}</td>
                <td>${quantity}</td>
                <td>${unit}</td>
            `;
            ingredientsTbody.appendChild(tr);
        });
    };

    const resetRecipeForm = () => {
        editRecipeId = null;
        ingredientArray.length = 0;
        renderIngredients();

        titleInput.value = '';
        imageUrlInput.value = '';
        instructionsInput.value = '';
        categoryInput.value = 'Uncategorized';

        if (editTitle) {
            editTitle.textContent = 'Add Recipe';
        }
        if (saveRecipeBtn) {
            saveRecipeBtn.textContent = 'Rezept speichern';
        }
    };

    const fillRecipeForm = (recipe) => {
        editRecipeId = recipe.id;
        titleInput.value = recipe.title ?? '';
        imageUrlInput.value = recipe.imageUrl ?? '';
        instructionsInput.value = recipe.instructions ?? '';
        categoryInput.value = recipe.category ?? 'Uncategorized';

        ingredientArray.length = 0;
        recipe.ingredients.forEach((item) => ingredientArray.push(item));
        renderIngredients();

        if (editTitle) {
            editTitle.textContent = 'Edit Recipe';
        }
        if (saveRecipeBtn) {
            saveRecipeBtn.textContent = 'Rezept aktualisieren';
        }
    };

    if (saveRecipeBtn) {
        saveRecipeBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const title = titleInput.value;
            const imageUrl = imageUrlInput.value;
            const instructions = instructionsInput.value;
            const category = categoryInput.value;
            const resp = await saveRecipe({ title, imageUrl, ingredients: ingredientArray, instructions, category }, editRecipeId);
            if (resp.ok) {
                resetRecipeForm();
                show('dashboard-section');
            } else {
                console.error('Error saving recipe', await resp.text());
            }
        });
    }

    document.addEventListener('recipe:edit', async (event) => {
        const recipeId = event.detail?.id;
        if (!recipeId) {
            return;
        }

        try {
            const response = await fetch(`/recipes/${recipeId}`);
            if (!response.ok) {
                console.error('Error loading recipe', await response.text());
                return;
            }

            const recipe = await response.json();
            fillRecipeForm(recipe);
            show('recipe_edit-section');
        } catch (err) {
            console.error('Error loading recipe', err);
        }
    });

    //Add Recipe Logik
    if (createBtn) {
        createBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetRecipeForm();
            show('recipe_edit-section');
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetRecipeForm();
            show('dashboard-section');
        });
    }

    // Zutatenverwaltung (Add / Clear)

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

            ingredientArray.push({ ingredient, quantity, unit });
            renderIngredients();

            ingredientInput.value = '';
            quantityInput.value = '';
        });
    }

    if (clearIngredientsBtn) {
        clearIngredientsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            ingredientArray.length = 0;
            renderIngredients();
        });
    }
}
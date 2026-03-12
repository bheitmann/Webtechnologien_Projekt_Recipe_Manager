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
    const ingredientInput = document.getElementById('ingredients');
    const quantityInput = document.getElementById('ingredient-quantity');
    const unitSelect = document.getElementById('ingredient-unit');

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

    const markQuantityAsInvalid = () => {
        if (quantityInput) {
            quantityInput.classList.add('input-error');
        }
    };

    const markTitleAsInvalid = () => {
        if (titleInput) {
            titleInput.classList.add('input-error');
        }
    };

    const markIngredientAsInvalid = () => {
        if (ingredientInput) {
            ingredientInput.classList.add('input-error');
        }
    };

    const markInstructionsAsInvalid = () => {
        if (instructionsInput) {
            instructionsInput.classList.add('input-error');
        }
    };

    const clearQuantityInvalidState = () => {
        if (quantityInput) {
            quantityInput.classList.remove('input-error');
        }
    };

    const clearTitleInvalidState = () => {
        if (titleInput) {
            titleInput.classList.remove('input-error');
        }
    };

    const clearIngredientInvalidState = () => {
        if (ingredientInput) {
            ingredientInput.classList.remove('input-error');
        }
    };

    const clearInstructionsInvalidState = () => {
        if (instructionsInput) {
            instructionsInput.classList.remove('input-error');
        }
    };

    const resetRecipeForm = () => {
        editRecipeId = null;
        ingredientArray.length = 0;
        renderIngredients();

        titleInput.value = '';
        clearTitleInvalidState();
        imageUrlInput.value = '';
        instructionsInput.value = '';
        clearInstructionsInvalidState();
        categoryInput.value = 'Uncategorized';

        if (editTitle) {
            editTitle.textContent = 'Rezept erstellen';
        }
        if (saveRecipeBtn) {
            saveRecipeBtn.textContent = 'Rezept speichern';
        }

        if (ingredientInput) {
            ingredientInput.value = '';
            clearIngredientInvalidState();
        }

        if (quantityInput) {
            quantityInput.value = '';
            clearQuantityInvalidState();
        }

        if (unitSelect) {
            unitSelect.value = 'g';
        }
    };

    const fillRecipeForm = (recipe) => {
        editRecipeId = recipe.id;
        titleInput.value = recipe.title ?? '';
        clearTitleInvalidState();
        imageUrlInput.value = recipe.imageUrl ?? '';
        instructionsInput.value = recipe.instructions ?? '';
        clearInstructionsInvalidState();
        categoryInput.value = recipe.category ?? 'Uncategorized';

        ingredientArray.length = 0;
        recipe.ingredients.forEach((item) => ingredientArray.push(item));
        renderIngredients();

        if (editTitle) {
            editTitle.textContent = 'Rezept bearbeiten';
        }
        if (saveRecipeBtn) {
            saveRecipeBtn.textContent = 'Rezept aktualisieren';
        }

        if (ingredientInput) {
            ingredientInput.value = '';
            clearIngredientInvalidState();
        }

        if (quantityInput) {
            quantityInput.value = '';
            clearQuantityInvalidState();
        }

        if (unitSelect) {
            unitSelect.value = 'g';
        }
    };

    if (saveRecipeBtn) {
        saveRecipeBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const title = titleInput.value.trim();
            if (!title) {
                markTitleAsInvalid();
                return;
            }

            clearTitleInvalidState();
            const imageUrl = imageUrlInput.value;
            const instructions = instructionsInput.value.trim();
            if (!instructions) {
                markInstructionsAsInvalid();
                return;
            }

            clearInstructionsInvalidState();
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

    if (quantityInput) {
        quantityInput.addEventListener('input', () => {
            // Keep only digits (0-9) in the quantity field.
            quantityInput.value = quantityInput.value.replace(/\D/g, '');
            if (quantityInput.value.trim() !== '') {
                clearQuantityInvalidState();
            }
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            if (titleInput.value.trim() !== '') {
                clearTitleInvalidState();
            }
        });
    }

    if (instructionsInput) {
        instructionsInput.addEventListener('input', () => {
            if (instructionsInput.value.trim() !== '') {
                clearInstructionsInvalidState();
            }
        });
    }

    if (ingredientInput) {
        ingredientInput.addEventListener('input', () => {
            if (ingredientInput.value.trim() !== '') {
                clearIngredientInvalidState();
            }
        });
    }

    if (addIngredientsBtn) {
        addIngredientsBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (!ingredientInput || !quantityInput || !unitSelect) return;
            
            const ingredient = ingredientInput.value.trim();
            const quantity = quantityInput.value.trim();
            const unit = unitSelect.value;

            if (!quantity) {
                markQuantityAsInvalid();
                return;
            }

            if (!ingredient) {
                markIngredientAsInvalid();
                return;
            }

            const ingredientAlreadyExists = ingredientArray.some((item) =>
                item.ingredient?.trim().toLowerCase() === ingredient.toLowerCase()
            );

            if (ingredientAlreadyExists) {
                markIngredientAsInvalid();
                return;
            }

            clearIngredientInvalidState();
            clearQuantityInvalidState();

            ingredientArray.push({ ingredient, quantity, unit });
            renderIngredients();

            ingredientInput.value = '';
            quantityInput.value = '';
            clearIngredientInvalidState();
            clearQuantityInvalidState();
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
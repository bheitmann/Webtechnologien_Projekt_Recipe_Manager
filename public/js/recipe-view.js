//recipe-view.js (frontend)
import { show } from './ui.js';

export function view_recipes_eventlisteners() {
    
    const backBtn = document.getElementById('btn-back-to-dashboard');
    
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            show('dashboard-section'); 
        });
    }

    document.addEventListener('recipe:view', async (event) => {
        const id = event.detail?.id; 
        
        if (!id) return;

        try {
            document.getElementById('view-title').innerText = "Lade...";
            document.getElementById('view-ingredients').innerHTML = '';
            document.getElementById('view-image').classList.add('hidden');

            // Daten holen
            const response = await fetch(`/recipes/${id}`);
            if (!response.ok) throw new Error("Rezept konnte nicht geladen werden.");
            const recipe = await response.json();

            document.getElementById('view-title').innerText = recipe.title;
            document.getElementById('view-category').innerText = recipe.category || '-';
            document.getElementById('view-instructions').innerText = recipe.instructions;

            if (recipe.imageUrl && recipe.imageUrl.trim() !== "") {
                const imgElement = document.getElementById('view-image');
                imgElement.src = recipe.imageUrl;
                imgElement.classList.remove('hidden'); 
            }

            // Generiert dynamisch die HTML-Zutatenliste
            const ingredientsList = document.getElementById('view-ingredients');
            if (recipe.ingredients && recipe.ingredients.length > 0) {
                recipe.ingredients.forEach(ing => {
                    const li = document.createElement('li');
                    li.innerText = `${ing.quantity} ${ing.unit} ${ing.ingredient}`; 
                    ingredientsList.appendChild(li);
                });
            } else {
                ingredientsList.innerHTML = '<li>Keine Zutaten hinterlegt.</li>';
            }

            show('recipe_view-section');

        } catch (error) {
            console.error(error);
            alert("Fehler beim Laden des Rezepts.");
            show('dashboard-section');
        }
    });
}
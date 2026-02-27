//recipes.js (frontend)
// Rezepte ins Dashboard laden
export const loadRecipes = async () => {

    const list = document.getElementById('recipe-list');
    

    try{
        const response = await fetch('/recipes');
        const recipes = await response.json();

        // Den Container leeren, um den Lade-Text zu entfernen
        list.innerHTML = ''; 

        // Prüfung auf leeren Zustand
        if (recipes.length === 0) {
            // Nachricht anzeigen, wenn keine Rezepte vorhanden sind
            list.innerHTML = `
                <div class="empty-recipes">
                    <p>Du hast noch keine Rezepte angelegt.</p>
                    <p>Klicke auf "+ neues Rezept", um zu starten!</p>
                </div>
            `;
            return;
        }


        recipes.forEach(recipe => {
            const article = document.createElement('article');
            article.innerHTML = `
                <h3>${recipe.title}</h3>
                <p>Kategorie: ${recipe.category}</p>
                <button class="delete-btn" data-id="${recipe.id}">Löschen</button>
                <button class="edit-btn" data-id="${recipe.id}">Bearbeiten</button>
            `;
        list.appendChild(article);
    });

    } catch (err) {
        list.innerHTML = `<p style="color:red;">Fehler beim Laden der Rezepte. Bitte versuche es später erneut.</p>`;
    }
};

document.getElementById('recipe-list').addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Rezept wirklich löschen?')) {
            const res = await fetch(`/recipes/${id}`, { method: 'DELETE' });
            if (res.ok) loadRecipes(); // Nach Löschen Liste erneuern
        }
    }
});

//recipes.js (frontend)
// Rezepte ins Dashboard laden
export const loadRecipes = async (category = '', search = '') => {

    const list = document.getElementById('recipe-list');
    

    try{
        let url = `/recipes?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;

        const response = await fetch(url);
        const recipes = await response.json();

        // Den Container leeren, um den Lade-Text zu entfernen
        list.innerHTML = ''; 

        // Prüfung auf leeren Zustand
        if (recipes.length === 0) {
            // Nachricht anzeigen, wenn keine Rezepte vorhanden sind
            list.innerHTML = `
                <div class="empty-recipes">
                    <p>Keine Rezepte gefunden.</p>
                    <p>Klicke auf "+ neues Rezept", um welche hinzuzufügen!</p>
                </div>
            `;
            return;
        }


        recipes.forEach(recipe => {
            const article = document.createElement('article');
            const imageSrc = recipe.imageUrl ? recipe.imageUrl : 'https://th.bing.com/th/id/OIP.hYV5XwAJ7YXK0cb2zPOGyAHaHa?w=180&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3';
            const title = recipe.title ? recipe.title : 'Kein Titel';
            article.innerHTML = `
                <div class="recipe-info">
                    <img src="${imageSrc}" class="recipe-image">
                    <h3 class="recipe-title">${title}</h3>
                    <p>Kategorie: ${recipe.category}</p>
                    <div class="recipe-actions">
                        <button class="view-btn" data-id="${recipe.id}">Ansehen</button>
                        <button class="edit-btn" data-id="${recipe.id}">Bearbeiten</button>
                        <button class="delete-btn" data-id="${recipe.id}">Löschen</button>
                    </div>
                </div>
            `;
        list.appendChild(article);
    });

    } catch (err) {
        list.innerHTML = `<p style="color:red;">Fehler beim Laden der Rezepte. Bitte versuche es später erneut.</p>`;
    }
};

document.getElementById('recipe-list').addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');

    if (e.target.classList.contains('view-btn')) {
        document.dispatchEvent(new CustomEvent('recipe:view', { detail: { id } }));
    }

    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Rezept wirklich löschen?')) {
            const res = await fetch(`/recipes/${id}`, { method: 'DELETE' });
            if (res.ok) loadRecipes(); // Nach Löschen Liste erneuern
        }
    }

    if (e.target.classList.contains('edit-btn')) {
        document.dispatchEvent(new CustomEvent('recipe:edit', { detail: { id } }));
    }
});

const filterSelect = document.getElementById('filter-select');
const searchInput = document.getElementById('search-input');
// Funktion, um die aktuellen Werte beider Felder zu sammeln
const triggerLoad = () => {
    const category = filterSelect ? filterSelect.value : '';
    const search = searchInput ? searchInput.value : '';
    loadRecipes(category, search);
};

// Suche bei jeder Eingabe auslösen
if (searchInput) {
    searchInput.addEventListener('input', triggerLoad);
}

// Kategorie-Filter ebenfalls anpassen, damit Suche erhalten bleibt
if (filterSelect) {
    filterSelect.addEventListener('change', triggerLoad);
}

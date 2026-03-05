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

            const imageSrc = recipe.image ? recipe.image : 'https://via.placeholder.com/300x200?text=Kein+Bild';

            article.innerHTML = `
                <img src="${imageSrc}" alt="${recipe.title}" class = "recipe-image">
                <div class="recipe-info">
                    <h3>${recipe.title}</h3>
                    <p>Kategorie: ${recipe.category}</p>
                    <div class="recipe-actions">
                        <button class="delete-btn" data-id="${recipe.id}">Löschen</button>
                        <button class="edit-btn" data-id="${recipe.id}">Bearbeiten</button>
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
    
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Rezept wirklich löschen?')) {
            const res = await fetch(`/recipes/${id}`, { method: 'DELETE' });
            if (res.ok) loadRecipes(); // Nach Löschen Liste erneuern
        }
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

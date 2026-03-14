//recipes.js (frontend)
// Rezepte ins Dashboard laden
const filterSelect = document.getElementById('filter-select');
const searchInput = document.getElementById('search-input');

export const loadRecipes = async () => {

    const list = document.getElementById('recipe-list');
    const category = filterSelect ? filterSelect.value : '';
    const search = searchInput ? searchInput.value : '';

    try{
        const params = new URLSearchParams({ category, search });
        const response = await fetch(`/recipes?${params.toString()}`);
        
        if (!response.ok) throw new Error("Fehler beim Laden");
        const recipes = await response.json();

        list.innerHTML = ''; 

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
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'recipe-image';
            img.alt = recipe.title;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'recipe-info';

            const h3 = document.createElement('h3');
            h3.className = 'recipe-title';
            h3.textContent = recipe.title || 'Kein Titel'; 

            const p = document.createElement('p');
            p.textContent = `Kategorie: ${recipe.category || 'Nicht angegeben'}`;


            const createButton = (label, className, id) => {
                const btn = document.createElement('button');
                btn.className = className;
                btn.textContent = label;
                btn.setAttribute('data-id', id); 
                return btn;
            };

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'recipe-actions';
            actionsDiv.append(
                createButton('Ansehen', 'view-btn', recipe.id),
                createButton('Bearbeiten', 'edit-btn', recipe.id),
                createButton('Löschen', 'delete-btn', recipe.id)
                
            );


            infoDiv.append(img, h3, p, actionsDiv);
            article.append(infoDiv);
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
            if (res.ok) loadRecipes(); 
        }
    }

    if (e.target.classList.contains('edit-btn')) {
        document.dispatchEvent(new CustomEvent('recipe:edit', { detail: { id } }));
    }
});



if (searchInput) {
    searchInput.addEventListener('input', () => loadRecipes());
}

if (filterSelect) {
    filterSelect.addEventListener('change', () => loadRecipes());
}

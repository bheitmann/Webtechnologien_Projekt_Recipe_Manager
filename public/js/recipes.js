//recipes.js (frontend)
// Rezepte ins Dashboard laden
export const loadRecipes = async () => {

    const list = document.getElementById('recipe-list');
    list.innerHTML = '<p>Lade Rezepte...</p>';

    try{
        const response = await fetch('/recipes/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
        });
        const recipes = await response.json();

        // Den Container leeren, um den Lade-Text zu entfernen
        list.innerHTML = ''; 

        // Prüfung auf leeren Zustand
        if (recipes.length === 0) {
            // Nachricht anzeigen, wenn keine Rezepte vorhanden sind
            list.innerHTML = `
                <div class="empty-state">
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
                <button onclick="deleteRecipe(${recipe.id})">Löschen</button>
            `;
        list.appendChild(article);
    });
    } catch (err) {
        list.innerHTML = `<p style="color:red;">Fehler beim Laden der Rezepte. Bitte versuche es später erneut.</p>`;
    }
};
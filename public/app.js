document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;

    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnDiv = document.getElementById('logout-button-div');
    const showUser= document.getElementById('show-user');
    const homeLink = document.getElementById('home-link');
    const userMngmtBtn = document.getElementById('user-management-button');
    const userMngmtBtnDiv = document.getElementById('user-management-button-div');

    // Helferfunktion um zwischen Sections zu wechseln
    const show = (id) => {
            document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
            document.getElementById(id).classList.remove('hidden');
            if(id === 'dashboard-section') {
                loadRecipes();
            }
        };

    const updateUI = () => {

        if(currentUser.role === 'admin') {
            userMngmtBtnDiv.classList.remove('hidden');
        }

        logoutBtnDiv.classList.remove('hidden');
        showUser.classList.remove('hidden');
        showUser.textContent = `Hallo, ${currentUser.username}`;
        errorMsg.textContent = '';
    };
    

    //Überprüfen ob der Nutzer dem Server bereits bekannt ist (Session vorhanden?)
    async function checkAuth() {
        try {
            const response = await fetch('/api/me');
            //Prüfen, ob der Server ein "OK" (Status 200) gibt
            if (response.ok) { 
                currentUser = await response.json();
                show('dashboard-section');
                updateUI();
            } else {
                // Wenn Status 401 (Unauthorized) kommt, ist niemand eingeloggt
                currentUser = null;
                show('login-section');
            }
        } catch (err) {
            // Falls der Server gar nicht erreichbar ist
            console.error("Verbindungsfehler bei checkAuth:", err);
            show('login-section');
        }
    }

    // Wartet darauf, dass das Login Formular abgeschickt wird
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Verhindert, dass die Seite neu lädt -> unsere App ist SPA (Single Page App)

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Daten an den Node.js Server senden
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }) 
        });

        const result = await response.json();

        if (result.success) {
            currentUser = result.user;
            // Dashboard zeigen
            show('dashboard-section');
            updateUI();
        } else {
            // Fehler anzeigen
            errorMsg.textContent = result.message;
        }
    });

    // Logout Logik
    const logout = async () => { await fetch('/api/logout', { method: 'POST' }); currentUser = null; location.reload(); };

    logoutBtn.addEventListener('click', async () => {
        logout();
        // Ansicht wieder tauschen
        show('login-section');
        logoutBtnDiv.classList.add('hidden');
        showUser.classList.add('hidden');
        // Formular leeren
        loginForm.reset();
    });

    // Home Button "Rezept Manager" Logik
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!logoutBtnDiv.classList.contains('hidden')) {
            show('dashboard-section');
        } else {
            show('login-section');
        }
    });

    userMngmtBtn.addEventListener('click', (e) => {
        e.preventDefault();
        show('user-management-section');
    });

    // Rezepte ins Dashboard laden
    const loadRecipes = async () => {  
    
        const list = document.getElementById('recipe-list');
        list.innerHTML = '<p>Lade Rezepte...</p>';

        try{
            const response = await fetch('/recipes', {
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

    //Initialisieren
    checkAuth();
});
document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;

    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnDiv = document.getElementById('logout-button-div');
    const showUser= document.getElementById('show-user');
    const homeLink = document.getElementById('home-link');

    // Helferfunktion um zwischen Sections zu wechseln
    const show = (id) => {
            document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
            document.getElementById(id).classList.remove('hidden');
        };

    const updateUI = () => {
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

    //Initialisieren
    checkAuth();
});
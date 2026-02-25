//auth.js (frontend)
import { currentUser } from './global.js';
import { setCurrentUser } from './global.js';
import { show } from './ui.js';
import { updateUI } from './ui.js';


//Überprüfen ob der Nutzer dem Server bereits bekannt ist (Session vorhanden?)
export async function checkAuth() {
    try {
        const response = await fetch('/auth/me');
        //Prüfen, ob der Server ein "OK" (Status 200) gibt
        if (response.ok) { 
            const User = await response.json();
            setCurrentUser(User);
            show('dashboard-section');
            updateUI();
        } else {
            // Wenn Status 401 (Unauthorized) kommt, ist niemand eingeloggt
            setCurrentUser(null);
            show('login-section');
        }
    } catch (err) {
        // Falls der Server gar nicht erreichbar ist
        console.error("Verbindungsfehler bei checkAuth:", err);
        show('login-section');
    }
}

export function login_logout_eventlisteners() {

    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnDiv = document.getElementById('logout-button-div');

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Verhindert, dass die Seite neu lädt -> unsere App ist SPA (Single Page App)

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Daten an den Node.js Server senden
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }) 
            });

            const result = await response.json();

            if (result.success) {
                setCurrentUser(result.user);
                // Dashboard zeigen
                show('dashboard-section');
                updateUI();
            } else {
                // Fehler anzeigen
                errorMsg.textContent = result.message;
            }
        });
    }
    

    const logout = async () => { await fetch('/auth/logout', { method: 'POST' }); setCurrentUser(null); location.reload(); }; 

    if(logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            logout();
            //location.reload lädt bereits die ganze Seite neu, deshalb muss nach logout() nichts mehr folgen.
        });
    }

}
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

// Wartet darauf, dass das Login Formular abgeschickt wird
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Verhindert, dass die Seite neu lädt -> unsere App ist SPA (Single Page Site)

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Daten an den Node.js Server senden
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) 
    });

    const result = await response.json();

    if (result.success) {
        // Dashboard zeigen
        show('dashboard-section');

        //Navbar Elemente einblenden
        logoutBtnDiv.classList.remove('hidden');
        showUser.classList.remove('hidden');
        showUser.textContent = `Hallo, ${username}`;
        errorMsg.textContent = '';
    } else {
        // Fehler anzeigen
        errorMsg.textContent = result.message;
    }
});

// Logout Logik
logoutBtn.addEventListener('click', async () => {
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
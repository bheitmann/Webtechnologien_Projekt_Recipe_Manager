const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const errorMsg = document.getElementById('error-msg');
const logoutBtn = document.getElementById('logout-btn');

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
        // Wenn Login okay: Login verstecken, Dashboard zeigen
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        errorMsg.textContent = '';
    } else {
        // Fehler anzeigen
        errorMsg.textContent = result.message;
    }
});

// Logout Logik
logoutBtn.addEventListener('click', () => {
    // Einfach Ansicht wieder tauschen
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    // Formular leeren
    loginForm.reset();
});
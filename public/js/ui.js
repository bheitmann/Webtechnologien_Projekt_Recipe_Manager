//ui.js (frontend)
import { currentUser } from './global.js';
import { loadRecipes } from './recipes.js';

// Helferfunktion um zwischen Sections zu wechseln
export const show = (id) => {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'dashboard-section') {
        loadRecipes();
    }
};

export const updateUI = () => {

    const errorMsg = document.getElementById('error-msg');
    const logoutBtnDiv = document.getElementById('logout-button-div');
    const showUser= document.getElementById('show-user');
    const userMngmtBtnDiv = document.getElementById('user-management-button-div');

    if(currentUser?.role === 'admin') {
        userMngmtBtnDiv.classList.remove('hidden');
    }
    logoutBtnDiv.classList.remove('hidden');
    showUser.classList.remove('hidden');
    showUser.textContent = `Hallo, ${currentUser.username}`;
    errorMsg.textContent = '';
};

export function setupUiEventListeners() {

    const logoutBtnDiv = document.getElementById('logout-button-div');
    const homeLink = document.getElementById('home-link');


    // Home Button "Rezept Manager" Logik
    if(homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();

            if (!logoutBtnDiv.classList.contains('hidden')) {
                show('dashboard-section');
            } else {
                show('login-section');
            }
        });
    }

}

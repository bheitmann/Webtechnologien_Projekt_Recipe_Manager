//main.js (frontend)
import { checkAuth } from './auth.js';
import { login_logout_eventlisteners } from './auth.js';
import { setupUserMngmtEventListeners } from './userMngmt.js';
import { setupUiEventListeners } from './ui.js';
import { edit_recipes_eventlisteners} from './edit-recipes.js';

document.addEventListener('DOMContentLoaded', () => {

    setupUiEventListeners();
    login_logout_eventlisteners();
    setupUserMngmtEventListeners();
    edit_recipes_eventlisteners();

    //Initialisieren
    checkAuth();
});
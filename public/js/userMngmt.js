//userMngmt.js (frontend)
import { show } from "./ui.js";


export function setupUserMngmtEventListeners() {

    const userMngmtBtn = document.getElementById('user-management-button');

    if(userMngmtBtn) {
        userMngmtBtn.addEventListener('click', (e) => {
            e.preventDefault();
            show('user-management-section');
        });
    }

}
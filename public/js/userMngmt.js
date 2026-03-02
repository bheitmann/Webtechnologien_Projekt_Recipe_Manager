// userMngmt.js (Frontend)
import { show } from "./ui.js";

export function setupUserMngmtEventListeners() {
    const userMngmtBtn = document.getElementById('user-management-button');
    const addUserForm = document.getElementById('add-user-form');
    const msg = document.getElementById('user-management-msg');
    
    //Klick auf den Button in der Navigation
    if (userMngmtBtn) {
        userMngmtBtn.addEventListener('click', (e) => {
            e.preventDefault();
            show('user-management-section');
            loadUsers(); // WICHTIG: Liste laden, sobald die Section geöffnet wird!
        });
    }

    //Formular abschicken (Neuen User anlegen)
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;
            const role = document.getElementById('new-role').value;

            const response = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });
            
            const result = await response.json();
            
            if (result.success) {
                msg.style.color = 'green';
                msg.textContent = result.message;
                addUserForm.reset(); // Formular leeren
                loadUsers(); // Liste direkt neu laden, damit der neue User auftaucht!
            } else {
                msg.style.color = 'red';
                msg.textContent = result.message;
            }
        });
    }
}

//Holt die User und baut das HTML
async function loadUsers() {
    const list = document.getElementById('user-list');
    if (!list) return;
    
    list.innerHTML = '<li>Lade Benutzer...</li>';
    
    try {
        const response = await fetch('/users');
        const result = await response.json();
        
        if (result.success) {
            list.innerHTML = ''; // Lade-Text entfernen
            
            // Für jeden User ein <li> Element bauen
            result.users.forEach(user => {
                const li = document.createElement('li');
                li.style = 'display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;';
                
                li.innerHTML = `
                    <span><strong>${user.username}</strong> (Rolle: ${user.role})</span>
                    <button class="delete-user-btn" data-id="${user.id}" style="background-color: #ff4c4c; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Löschen</button>
                `;
                list.appendChild(li);
            });

            //Erst jetzt existieren die Löschen-Buttons im HTML. 
            //Also müssen wir ihnen jetzt erst ihre Event-Listener geben!
            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = e.target.getAttribute('data-id'); // ID aus dem HTML ziehen
                    await deleteUser(userId);
                });
            });
        }
    } catch (error) {
        list.innerHTML = '<li style="color:red;">Fehler beim Laden der Benutzerliste.</li>';
    }
}

//Einen User löschen
async function deleteUser(id) {
    // Kurze Sicherheitsabfrage im Browser
    if (!confirm('Möchtest du diesen Benutzer wirklich löschen?')) return;
    
    const response = await fetch(`/users/${id}`, { method: 'DELETE' });
    const result = await response.json();
    
    if (result.success) {
        loadUsers(); // Wenn erfolgreich gelöscht, Liste neu aufbauen
    } else {
        alert(result.message); // Fehlermeldung zeigen (z.B. wenn man sich selbst löschen will)
    }
}
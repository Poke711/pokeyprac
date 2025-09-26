import { initializeAuth, triggerLogin, triggerLogout } from './auth.js';
import { setupInputPage } from './inputPage.js';
import { setupDataPage } from './dataPage.js';
import { setupGraphsPage } from './graphsPage.js';
// ADDED: Import the sync function from the data manager
import { syncLocalDataToFirestore } from './dataManager.js';

// This function sets up the header and login/logout buttons
function setupGlobalUI(user) {
    const loginButton = document.getElementById("login-button");
    const userInfo = document.getElementById("user-info");

    if (loginButton) {
        loginButton.addEventListener("click", () => {
            if (user) {
                triggerLogout();
            } else {
                triggerLogin();
            }
        });
    }

    if (user) {
        if(userInfo) userInfo.textContent = `Welcome, ${user.displayName}`;
        if(loginButton) loginButton.textContent = "Log Out";
    } else {
        if(userInfo) userInfo.textContent = "";
        if(loginButton) loginButton.textContent = "Log In to Sync";
    }
}

// --- Main Application Entry Point ---
async function main() {
    // 1. Call our definitive function and wait for the correct user state.
    const user = await initializeAuth();

    // Check if the user is now logged in AND if there is local data waiting to be synced.
    const localData = localStorage.getItem('pokeyprac_submissions');
    if (user && localData && localData.length > 2) { // check for more than just '[]'
        const result = await syncLocalDataToFirestore(user);
        if (result.synced > 0) {
            alert(`${result.synced} local submission(s) have been synced to your account! The page will now reload to show your updated data.`);
            // Reload to ensure all pages fetch the newly synced data from Firestore
            location.reload();
            return; // Stop further execution on this load, as the page will reload.
        }
    }
    // --- End of Sync Logic ---

    // 2. Set up the header and login/logout button functionality.
    setupGlobalUI(user);

    // 3. Set up the logic for the specific page we're on.
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);
    
    const page = pageName === '' || pageName === 'index.html' || pageName.toLowerCase() === 'pokeyprac' ? 'index' : pageName.split('.')[0];
    
    if (page === 'index') {
        setupInputPage(user);
    } else if (page === 'data') {
        setupDataPage(user);
    } else if (page === 'graphs') {
        setupGraphsPage(user);
    }
}

// Run the main function when the DOM is ready.
document.addEventListener('DOMContentLoaded', main);
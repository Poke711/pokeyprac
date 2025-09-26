// js/main.js

import { initializeAuth, triggerLogin, triggerLogout } from './auth.js';
import { setupInputPage } from './inputPage.js';
import { setupDataPage } from './dataPage.js';
import { setupGraphsPage } from './graphsPage.js';
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
    console.log("Firebase Auth Ready. User:", user);

    // --- UPDATED: Sync logic with sessionStorage flag to prevent loops ---
    const localData = localStorage.getItem('pokeyprac_submissions');
    // Check for user, local data, AND ensure the sync hasn't already run in this session.
    if (user && localData && localData.length > 2 && !sessionStorage.getItem('syncCompleted')) {
        const result = await syncLocalDataToFirestore(user);
        
        // IMPORTANT: Set the flag in sessionStorage AFTER a successful sync.
        // This flag will persist through reloads but will be cleared when the tab is closed.
        sessionStorage.setItem('syncCompleted', 'true');

        if (result.synced > 0) {
            alert(`${result.synced} local submission(s) have been synced to your account! The page will now reload to show your updated data.`);
            location.reload();
            return; // Stop further execution, the page is reloading.
        }
    }
    // --- End of Updated Sync Logic ---

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
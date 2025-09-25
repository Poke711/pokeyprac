// js/main.js

import { initializeAuth, triggerLogin, triggerLogout } from './auth.js'; 
import { setupInputPage } from './inputPage.js';
import { setupDataPage } from './dataPage.js';
import { setupGraphsPage } from './graphsPage.js';

// This function sets up the header and login/logout buttons
function setupGlobalUI(user) {
    const loginButton = document.getElementById("login-button");
    const userInfo = document.getElementById("user-info");

    if (loginButton) {
        loginButton.addEventListener("click", () => {
            if (user) {
                triggerLogout(); // This function now handles its own reload
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
        if(loginButton) loginButton.textContent = "Log In";
    }
}

// --- Main Application Entry Point ---
async function main() {
    // 1. Call our new definitive function and wait for the correct user state.
    const user = await initializeAuth();
    console.log("Firebase Auth Ready. User:", user); 
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
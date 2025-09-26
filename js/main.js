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
        if(loginButton) loginButton.textContent = "Log In";
    }
}

// --- Main Application Entry Point ---
async function main() {
    // ADDED: Get references to the loader and content wrapper
    const loader = document.getElementById('loader');
    const appContent = document.getElementById('app-content');

    try {
        const user = await initializeAuth();
        console.log("Firebase Auth Ready. User:", user);

        const localData = localStorage.getItem('pokeyprac_submissions');
        if (user && localData && localData.length > 2 && !sessionStorage.getItem('syncCompleted')) {
            const result = await syncLocalDataToFirestore(user);
            sessionStorage.setItem('syncCompleted', 'true');
            if (result.synced > 0) {
                alert(`${result.synced} local submission(s) have been synced to your account! The page will now reload to show your updated data.`);
                location.reload();
                return;
            }
        }

        setupGlobalUI(user);

        // This uses the body ID for more reliable page detection
        const pageId = document.body.id;
        if (pageId === 'home-page-body') { // Make sure your index.html body has this ID
            setupInputPage(user);
        } else if (pageId === 'data-page-body') {
            setupDataPage(user);
        } else if (pageId === 'graphs-page-body') { // Make sure your graphs.html body has this ID
            setupGraphsPage(user);
        }

    } catch (error) {
        console.error("An error occurred during application startup:", error);
        // Optionally display an error message to the user on the page
        appContent.innerHTML = `<div style="text-align: center; padding: 2rem; color: #ff8a80;"><h2>Oops! Something went wrong.</h2><p>Please try refreshing the page. Check the console for more details.</p></div>`;

    } finally {
        // UPDATED: This code runs whether startup succeeded or failed.
        // It ensures the loader always goes away.
        if (loader && appContent) {
            appContent.classList.add('loaded'); // Fade in the main content
            loader.classList.add('hidden'); // Fade out the loader
        }
    }
}

document.addEventListener('DOMContentLoaded', main);
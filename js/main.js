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

// UPDATED: The logic for showing and handling the sync button is improved.
function setupSyncButton(user) {
    const syncButton = document.getElementById('force-sync-button');
    if (!syncButton) return;

    const localData = localStorage.getItem('pokeyprac_submissions');
    const syncHasCompletedThisSession = sessionStorage.getItem('syncCompleted') === 'true';

    // Show the button ONLY if:
    // 1. The user is logged in.
    // 2. Local data exists.
    // 3. A sync has NOT already been completed in this session.
    if (user && localData && localData.length > 2 && !syncHasCompletedThisSession) {
        syncButton.style.display = 'inline-block';
    } else {
        syncButton.style.display = 'none';
    }

    // This listener only needs to be added once.
    syncButton.addEventListener('click', async () => {
        if (!confirm("This will upload any new local submissions to your account. Are you sure?")) {
            return;
        }
        syncButton.disabled = true;
        syncButton.textContent = 'Syncing...';

        try {
            const result = await syncLocalDataToFirestore(user);
            if (result.synced > 0) {
                // IMPORTANT: Set the flag BEFORE reloading the page.
                sessionStorage.setItem('syncCompleted', 'true');
                alert(`${result.synced} submission(s) synced successfully! The page will now reload.`);
                location.reload(); // Reload to show the fresh data and hide the button.
            } else {
                alert("No new local data was found to sync.");
                // Even if nothing was synced, we set the flag because we've checked.
                sessionStorage.setItem('syncCompleted', 'true');
                syncButton.style.display = 'none'; // Hide the button immediately.
            }
        } catch (err) {
            console.error("Manual sync failed:", err);
            alert("An error occurred during the sync process.");
        } finally {
            syncButton.disabled = false;
            syncButton.textContent = 'Sync Local Data';
        }
    });
}


// --- Main Application Entry Point ---
async function main() {
    const loader = document.getElementById('loader');
    const appContent = document.getElementById('app-content');

    try {
        const user = await initializeAuth();
        console.log("Firebase Auth Ready. User:", user);

        setupGlobalUI(user);
        setupSyncButton(user);

        const pageId = document.body.id;
        if (pageId === 'home-page-body') {
            setupInputPage(user);
        } else if (pageId === 'data-page-body') {
            setupDataPage(user);
        } else if (pageId === 'graphs-page-body') {
            setupGraphsPage(user);
        }

    } catch (error) {
        console.error("An error occurred during application startup:", error);
        appContent.innerHTML = `<div style="text-align: center; padding: 2rem; color: #ff8a80;"><h2>Oops! Something went wrong.</h2><p>Please try refreshing the page.</p></div>`;

    } finally {
        if (loader && appContent) {
            appContent.classList.add('loaded');
            loader.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', main);
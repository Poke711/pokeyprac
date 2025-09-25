// js/main.js

import { isLocalStorageAvailable } from './utils.js';
import { setupInputPage } from './inputPage.js';
import { setupDataPage } from './dataPage.js';
import { setupGraphsPage } from './graphsPage.js';
import { authReady } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLocalStorageAvailable()) {
        alert('Error: localStorage is not available.');
        return;
    }

    try {
        const user = await authReady;

        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);

        if (page === 'index.html' || page === '') {
            setupInputPage(user);
        } else if (page === 'data.html') {
            setupDataPage(user);
        } else if (page === 'graphs.html') {
            setupGraphsPage(user);
        }
    } catch (error) {
        console.error("Authentication failed to initialize:", error);
        // Optionally, display a message to the user
    }
});
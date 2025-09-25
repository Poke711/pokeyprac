import { authReady } from './auth.js';
import { setupInputPage } from './inputPage.js';
import { setupDataPage } from './dataPage.js';
import { setupGraphsPage } from './graphsPage.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Firebase to determine the authentication state.
    // The 'user' object will be the user's data or 'null' if logged out.
    const user = await authReady;

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    // Pass the user object to the appropriate setup function.
    if (page === 'index.html' || page === '' || page === 'pokeyprac') { // Added 'pokeyprac' for GitHub pages root
        setupInputPage(user);
    } else if (page === 'data.html') {
        setupDataPage(user);
    } else if (page === 'graphs.html') {
        setupGraphsPage(user);
    }
});
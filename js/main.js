// js/main.js

import { isLocalStorageAvailable } from './utils.js';
import { setupInputPage } from './inputPage.js';
import { setupDataPage } from './dataPage.js';
import { setupGraphsPage } from './graphsPage.js'; // Import the new function

document.addEventListener('DOMContentLoaded', () => {
    if (!isLocalStorageAvailable()) {
        alert('Error: localStorage is not available.');
        return;
    }

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    // Add the new page to the router
    if (page === 'index.html' || page === '') {
        setupInputPage();
    } else if (page === 'data.html') {
        setupDataPage();
    } else if (page === 'graphs.html') {
        setupGraphsPage();
    }
});
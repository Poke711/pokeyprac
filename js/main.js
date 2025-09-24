// js/main.js

// Import the setup functions and utilities
import { isLocalStorageAvailable } from './utils.js';
import { setupInputPage } from './inputPage.js';
import { setupDataPage } from './dataPage.js';

// This is the main entry point for the application's JavaScript
document.addEventListener('DOMContentLoaded', () => {
    if (!isLocalStorageAvailable()) {
        alert('Error: localStorage is not available. Please use a local development server for the application to function correctly.');
        return;
    }

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    // Route to the correct setup function based on the HTML file name
    if (page === 'index.html' || page === '') {
        setupInputPage();
    } else if (page === 'data.html') {
        setupDataPage();
    }
});
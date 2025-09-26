// js/auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBDhhnscXFycAqhEvfcrTQwGWbV69D_ymk",
    authDomain: "pokeyprac.firebaseapp.com",
    projectId: "pokeyprac",
    storageBucket: "pokeyprac.appspot.com",
    messagingSenderId: "571949581475",
    appId: "1:571949581475:web:704ec0c1ac14a140bc2b16",
    measurementId: "G-VTD2NETWR4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/**
 * This is the definitive function to get the user's state on page load.
 * It handles both redirect results and existing sessions correctly, eliminating race conditions.
 */
export async function initializeAuth() {
    // First, try to get the result of a redirect.
    // This will contain the user object if a login just completed.
    const result = await getRedirectResult(auth).catch(error => {
        console.error("Error during getRedirectResult:", error);
        return null; // Don't block the app if there's a minor redirect error
    });

    if (result) {
        // If a redirect just happened, the user is in the result. This is the most reliable source.
        return result.user;
    } else {
        // If there was no redirect, we check for an existing session.
        // We wrap onAuthStateChanged in a promise that resolves on the first check.
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe(); // We only need this for the initial load, so we clean it up.
                resolve(user); // Resolve with the user (or null if they are not logged in).
            });
        });
    }
}

// Reusable function to trigger the login flow
export function triggerLogin() {
    signInWithPopup(auth, provider)
        .then((result) => {
            // A successful login will trigger the main onAuthStateChanged listener in main.js,
            // which will handle the page reload.
            location.reload();
        })
        .catch((error) => {
            // This will catch errors like the user closing the popup.
    
            location.reload();
        });
}

// Reusable function to trigger logout and ensure a clean state
export function triggerLogout() {
    signOut(auth).then(() => {
        // Reloading after sign-out is the most reliable way to reset the app state.
        location.reload();
    });
}

export { auth, db };
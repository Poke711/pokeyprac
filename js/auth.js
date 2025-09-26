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

export async function initializeAuth() {
    const result = await getRedirectResult(auth).catch(error => {
        console.error("Error during getRedirectResult:", error);
        return null;
    });

    if (result) {
        return result.user;
    } else {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }
}

export function triggerLogin() {
    signInWithPopup(auth, provider)
        .then((result) => {
            // A successful login will trigger the main onAuthStateChanged listener,
            // which will handle the page reload.
            console.log("Popup login successful for:", result.user.displayName);
            location.reload();
        })
        .catch((error) => {
            // Check for the specific error when a browser blocks the popup.
            if (error.code === 'auth/popup-blocked-by-browser') {
                alert('Your browser blocked the login popup.\n\nPlease allow popups for this site in your browser settings and try again.');
            } 
            // This error occurs if the user manually closes the popup. We can ignore it silently.
            else if (error.code === 'auth/cancelled-popup-request') {
                console.log("User cancelled the login process.");
            } 
            // For all other errors, show a generic message.
            else {
                console.error("Popup login error:", error.code, error.message);
                alert(`An unexpected error occurred during login. Please try again.\n\nError: ${error.message}`);
            }
        });
}

export function triggerLogout() {
    signOut(auth).then(() => {
        location.reload();
    });
}

export { auth, db };
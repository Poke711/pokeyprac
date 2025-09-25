// js/auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBDhhnscXFycAqhEvfcrTQwGWbV69D_ymk",
    authDomain: "pokeyprac.firebaseapp.com",
    projectId: "pokeyprac",
    storageBucket: "pokeyprac.firebasestorage.app",
    messagingSenderId: "571949581475",
    appId: "1:571949581475:web:704ec0c1ac14a140bc2b16",
    measurementId: "G-VTD2NETWR4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginButton = document.getElementById("login-button");
const userInfo = document.getElementById("user-info");

const authReady = new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if(userInfo) userInfo.textContent = `Welcome, ${user.displayName}`;
            if(loginButton) loginButton.textContent = "Log Out";
        } else {
            if(userInfo) userInfo.textContent = "";
            if(loginButton) loginButton.textContent = "Log In";
        }
        resolve(user);
    }, reject);
});

if (loginButton) {
    loginButton.addEventListener("click", () => {
        if (auth.currentUser) {
            signOut(auth);
        } else {
            signInWithPopup(auth, provider)
                .catch((error) => {
                    console.error("Authentication Error:", error);
                });
        }
    });
}

export { auth, db, authReady };

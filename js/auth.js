// js/auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
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

const loginButton = document.getElementById("login-button");
const userInfo = document.getElementById("user-info");

// THE FIX: A flag to prevent reloading on the initial page load.
let isInitialAuthCheck = true;

// Handle the result of the redirect when the user comes back from Google
getRedirectResult(auth)
  .catch((error) => {
    console.error("Redirect Result Error:", error);
  });

export const authReady = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
        // This part updates the UI on every auth state change
        if (user) {
            if(userInfo) userInfo.textContent = `Welcome, ${user.displayName}`;
            if(loginButton) loginButton.textContent = "Log Out";
        } else {
            if(userInfo) userInfo.textContent = "";
            if(loginButton) loginButton.textContent = "Log In";
        }

        if (isInitialAuthCheck) {
            // On the first run, we just resolve the promise and flip the flag.
            isInitialAuthCheck = false;
            resolve(user);
        } else {
            // On any subsequent run (a login or logout), we reload the page.
            location.reload();
        }
    });
});

if (loginButton) {
    loginButton.addEventListener("click", () => {
        if (auth.currentUser) {
            signOut(auth); // This will trigger onAuthStateChanged, which will cause the reload.
        } else {
            signInWithRedirect(auth, provider); // This navigates away, so no immediate action is needed.
        }
    });
}

export { auth, db };
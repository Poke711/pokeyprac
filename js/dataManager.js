// js/dataManager.js
import { db } from './auth.js';
import { collection, addDoc, getDocs, getDoc, query, where, orderBy, deleteDoc, doc, updateDoc, writeBatch, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const LOCAL_SUBMISSIONS_KEY = 'pokeyprac_submissions';
const LOCAL_SETTINGS_KEY = 'pokeyprac_settings';

// --- Local Storage Helpers ---
function getLocalSubmissions() {
    return JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY)) || [];
}

function saveLocalSubmissions(submissions) {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
}

// --- Unified Settings ---
export async function saveUserSetting(user, key, value) {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        // Use setDoc with merge to create or update the user document
        await setDoc(userRef, { [key]: value }, { merge: true });
    } else {
        const settings = JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY)) || {};
        settings[key] = value;
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    }
}

export async function loadUserSetting(user, key, defaultValue) {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() && userSnap.data()[key] ? userSnap.data()[key] : defaultValue;
    } else {
        const settings = JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY)) || {};
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }
}

// --- Unified Data Fetching ---
export async function getAllSubmissions(user) {
    if (user) {
        const q = query(collection(db, "submissions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, isLocal: false, ...doc.data() }));
    } else {
        const localData = getLocalSubmissions();
        localData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // sort descending
        return localData.map(item => ({ ...item, isLocal: true }));
    }
}

export async function getSubmission(user, submissionId) {
    // This function is only intended for editing, which is a logged-in feature.
    if (user && !submissionId.startsWith('local_')) {
        const docRef = doc(db, "submissions", submissionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().userId === user.uid) {
            return { id: docSnap.id, ...docSnap.data() };
        }
    }
    return null;
}

// --- Unified Data Modification ---
export async function saveSubmission(user, progressData) {
    const timestamp = new Date().toISOString();
    if (user) {
        await addDoc(collection(db, "submissions"), {
            ...progressData,
            userId: user.uid,
            timestamp: timestamp
        });
    } else {
        const submissions = getLocalSubmissions();
        submissions.push({
            ...progressData,
            id: `local_${Date.now()}`, // Unique ID for local items
            timestamp: timestamp
        });
        saveLocalSubmissions(submissions);
    }
}

export async function updateSubmission(user, submissionId, progressData) {
    // Only allow updating Firestore documents.
    if (user && !submissionId.startsWith('local_')) {
       const docRef = doc(db, "submissions", submissionId);
       await updateDoc(docRef, progressData);
    } else {
        console.warn("Editing local submissions is not supported. Log in to sync and edit.");
    }
}

export async function deleteSubmission(user, submissionId) {
    const isLocal = submissionId.startsWith('local_');
    if (isLocal) {
        let submissions = getLocalSubmissions();
        submissions = submissions.filter(s => s.id !== submissionId);
        saveLocalSubmissions(submissions);
    } else if (user) { // Must be a firestore id and user must be logged in
        await deleteDoc(doc(db, "submissions", submissionId));
    }
}

// --- Sync Logic ---
export async function syncLocalDataToFirestore(user) {
    const localSubmissions = getLocalSubmissions();
    if (!user || localSubmissions.length === 0) {
        return { synced: 0 };
    }

    console.log(`Starting sync of ${localSubmissions.length} local submission(s).`);
    const batch = writeBatch(db);
    localSubmissions.forEach(submission => {
        const docRef = doc(collection(db, "submissions"));
        const { id, ...firestoreData } = submission; // Remove local 'id' field
        batch.set(docRef, { ...firestoreData, userId: user.uid });
    });

    try {
        await batch.commit();
        console.log("Local data successfully synced to Firestore.");
        // UPDATED: Commented out the line below to prevent local data from being cleared after sync.
        // localStorage.removeItem(LOCAL_SUBMISSIONS_KEY);
        return { synced: localSubmissions.length };
    } catch (error) {
        console.error("Error syncing local data: ", error);
        return { synced: 0, error: error };
    }
}
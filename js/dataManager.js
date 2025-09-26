// js/dataManager.js
import { db } from './auth.js';
import { collection, addDoc, getDocs, getDoc, query, where, orderBy, deleteDoc, doc, updateDoc, writeBatch, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const LOCAL_SUBMISSIONS_KEY = 'pokeyprac_submissions';
const LOCAL_SETTINGS_KEY = 'pokeyprac_settings';

// --- Local Storage Helpers (No changes) ---
function getLocalSubmissions() {
    return JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY)) || [];
}

function saveLocalSubmissions(submissions) {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
}

// --- Unified Settings (No changes) ---
export async function saveUserSetting(user, key, value) {
    if (user) {
        const userRef = doc(db, "users", user.uid);
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

// --- Unified Data Fetching (No changes) ---
export async function getAllSubmissions(user) {
    if (user) {
        const q = query(collection(db, "submissions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, isLocal: false, ...doc.data() }));
    } else {
        const localData = getLocalSubmissions();
        localData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return localData.map(item => ({ ...item, isLocal: true }));
    }
}

export async function getSubmission(user, submissionId) {
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
// UPDATED: The 'synced' flag logic has been completely removed.
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
            id: `local_${Date.now()}`,
            timestamp: timestamp
            // No 'synced' flag is added anymore.
        });
        saveLocalSubmissions(submissions);
    }
}

export async function updateSubmission(user, submissionId, progressData) {
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
    } else if (user) {
        await deleteDoc(doc(db, "submissions", submissionId));
    }
}

// --- Sync Logic ---
// UPDATED: This is the new "smart sync" function.
export async function syncLocalDataToFirestore(user) {
    const localSubmissions = getLocalSubmissions();
    if (!user || localSubmissions.length === 0) {
        return { synced: 0 };
    }

    // 1. Collect all timestamps from local data.
    const localTimestamps = localSubmissions.map(sub => sub.timestamp);
    if (localTimestamps.length === 0) {
        return { synced: 0 };
    }

    // 2. Query Firestore for documents that belong to the current user AND have a matching timestamp.
    // The 'in' operator is efficient for this, checking up to 30 values in one query.
    const submissionsRef = collection(db, "submissions");
    const q = query(submissionsRef, where("userId", "==", user.uid), where("timestamp", "in", localTimestamps));
    const querySnapshot = await getDocs(q);

    // 3. Create a Set of timestamps that already exist in the user's cloud account for fast lookup.
    const existingTimestamps = new Set(querySnapshot.docs.map(doc => doc.data().timestamp));

    // 4. Filter the local submissions to find only the ones that are NOT already in the cloud.
    const submissionsToSync = localSubmissions.filter(sub => !existingTimestamps.has(sub.timestamp));

    if (submissionsToSync.length === 0) {
        console.log("All local data is already synced to this account.");
        return { synced: 0 };
    }

    console.log(`Starting sync of ${submissionsToSync.length} new local submission(s).`);
    const batch = writeBatch(db);

    submissionsToSync.forEach(submission => {
        const docRef = doc(collection(db, "submissions"));
        const { id, ...firestoreData } = submission; // Remove local-only 'id' field
        batch.set(docRef, { ...firestoreData, userId: user.uid });
    });

    try {
        await batch.commit();
        console.log("New local data successfully synced to Firestore.");
        return { synced: submissionsToSync.length };
    } catch (error) {
        console.error("Error syncing local data: ", error);
        return { synced: 0, error: error };
    }
}
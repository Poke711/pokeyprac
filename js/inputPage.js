// js/inputPage.js

import { stages as masterStages } from './stages.js';
import { categories } from './categoryData.js';
import { showSuccessPopup } from './utils.js';
import { db } from './auth.js';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// --- DOM Element References ---
const categorySelect = document.getElementById('category-select');
const stageSelect = document.getElementById('stage-select');
const starSelect = document.getElementById('star-select');
const form = document.getElementById('progress-form');
const linkContainer = document.getElementById('ukikipedia-link-container');

// --- Ukikipedia Link Logic ---
function generateUkikipediaUrl(stage, star) {
    const STAGE_LINK_STARS = ["Stage", "8 Red Coins", "100 Coins", "MIPS, the Rabbit (1st)", "MIPS, the Rabbit (2nd)"];
    const baseUrl = "https://ukikipedia.net/wiki/RTA_Guide/";
    const useStageLink = STAGE_LINK_STARS.some(substring => star.includes(substring));
    const pageName = useStageLink ? stage : star;
    const formattedName = pageName.replace(/ /g, '_');
    return baseUrl + formattedName;
}

function updateUkikipediaLink() {
    const selectedStage = stageSelect.value;
    const selectedStar = starSelect.value;
    if (!selectedStage || !selectedStar) {
        linkContainer.innerHTML = '';
        return;
    }
    const url = generateUkikipediaUrl(selectedStage, selectedStar);
    linkContainer.innerHTML = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="ukikipedia-button">
            View on Ukikipedia
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></svg>
        </a>
    `;
}

// --- Dropdown Population Logic (RESTORED) ---
function populateStars() {
    const selectedCategory = categorySelect.value;
    const selectedStage = stageSelect.value;
    const categoryData = categories[selectedCategory];
    starSelect.innerHTML = '';
    if (!selectedStage || !categoryData) {
        updateUkikipediaLink();
        return;
    }
    const starsForStage = (categoryData === "ALL") ? masterStages[selectedStage] : categoryData[selectedStage] || [];
    starsForStage.forEach(star => {
        const option = document.createElement('option');
        option.value = star;
        option.textContent = star;
        starSelect.appendChild(option);
    });
    updateUkikipediaLink();
}

function populateStages() {
    const selectedCategory = categorySelect.value;
    const categoryData = categories[selectedCategory];
    stageSelect.innerHTML = '';
    if (!categoryData) {
        populateStars();
        return;
    }
    const stagesForCategory = (categoryData === "ALL") ? Object.keys(masterStages) : Object.keys(categoryData);
    stagesForCategory.forEach(stageName => {
        const option = document.createElement('option');
        option.value = stageName;
        option.textContent = stageName;
        stageSelect.appendChild(option);
    });
    populateStars();
}

function populateCategories() {
    Object.keys(categories).forEach(categoryName => {
        const option = document.createElement('option');
        option.value = categoryName;
        option.textContent = categoryName;
        categorySelect.appendChild(option);
    });
}


// --- Main Setup Function ---
export function setupInputPage(user) {
    let recentSubmissionsData = [];
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    async function displayRecentSubmissions() {
        const container = document.getElementById('recent-submissions-container');
        if (!container) return;
        recentSubmissionsData = []; 
        container.innerHTML = '<p style="text-align: center; color: #888;">Log in to see your recent submissions.</p>';
        if (user) {
            const q = query(collection(db, "submissions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"), limit(3));
            const querySnapshot = await getDocs(q);
            recentSubmissionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (recentSubmissionsData.length > 0) {
                container.innerHTML = '';
                recentSubmissionsData.forEach(progress => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'recent-item';
                    itemDiv.innerHTML = `
                        <div class="recent-info">
                            <p class="star-name">${progress.star}</p>
                            <p class="stage-name">${progress.stage}</p>
                            <div class="recent-stats">
                                <p>Streak: <strong>${progress.streak || 'N/A'}</strong></p>
                                <p>Time: <strong>${progress.xcam || 'N/A'}</strong></p>
                            </div>
                        </div>
                        <button class="copy-btn" data-id="${progress.id}">Reuse</button>
                    `;
                    container.appendChild(itemDiv);
                });
            } else {
                container.innerHTML = '<p style="text-align: center; color: #888;">No submissions yet.</p>';
            }
        }
    }
    
    async function loadDataForEditing() {
        if (editId && user) {
            const docRef = doc(db, "submissions", editId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                const data = docSnap.data();
                categorySelect.value = "120 Star"; // Default to all-encompassing category to find the star
                populateStages();
                stageSelect.value = data.stage;
                populateStars();
                starSelect.value = data.star;
                form.streak.value = data.streak;
                form.xcam.value = data.xcam;
                form.querySelector('button').textContent = 'Update Progress';
                updateUkikipediaLink();
            } else {
                alert("Could not load data for editing. It may have been deleted or you don't have permission.");
                window.location.href = 'index.html'; // Go back to a clean page
            }
        }
    }

    categorySelect.addEventListener('change', populateStages);
    stageSelect.addEventListener('change', populateStars);
    starSelect.addEventListener('change', updateUkikipediaLink);

    populateCategories();
    populateStages(); // Initial population
    loadDataForEditing(); // Load data if in edit mode

    if (!user) {
        Array.from(form.elements).forEach(element => element.disabled = true);
        form.querySelector('button').textContent = 'Please Log In to Add Progress';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!user) { alert("You must be logged in."); return; }
        if (!starSelect.value) { alert("No star selected."); return; }

        const progressData = {
            stage: stageSelect.value,
            star: starSelect.value,
            streak: form.streak.value,
            xcam: form.xcam.value,
        };

        try {
            if (editId) {
                const docRef = doc(db, "submissions", editId);
                await updateDoc(docRef, progressData);
                showSuccessPopup('Progress updated!');
                setTimeout(() => window.location.href = 'data.html', 1500);
            } else {
                await addDoc(collection(db, "submissions"), {
                    ...progressData,
                    userId: user.uid,
                    timestamp: new Date().toISOString()
                });
                showSuccessPopup('Progress saved!');
                form.streak.value = '';
                form.xcam.value = '';
                displayRecentSubmissions();
            }
        } catch (error) {
            console.error("Error writing document: ", error);
            alert("Failed to save progress.");
        }
    });

    const recentContainer = document.getElementById('recent-submissions-container');
    recentContainer.addEventListener('click', (e) => {
        const copyButton = e.target.closest('.copy-btn');
        if (copyButton) {
            const id = copyButton.dataset.id;
            const progressToCopy = recentSubmissionsData.find(p => p.id === id);
            if (progressToCopy) {
                const categoryData = categories[categorySelect.value];
                const stageExists = categoryData === "ALL" || categoryData.hasOwnProperty(progressToCopy.stage);
                const starExists = stageExists && (categoryData === "ALL" || (categoryData[progressToCopy.stage] && categoryData[progressToCopy.stage].includes(progressToCopy.star)));

                if (!starExists) {
                    alert(`'${progressToCopy.star}' is not in the currently selected '${categorySelect.value}' category.`);
                    return;
                }
                stageSelect.value = progressToCopy.stage;
                populateStars();
                starSelect.value = progressToCopy.star;
                form.streak.value = progressToCopy.streak;
                form.xcam.value = progressToCopy.xcam;
                updateUkikipediaLink();
                window.scrollTo(0, 0);
            }
        }
    });

    displayRecentSubmissions();
}
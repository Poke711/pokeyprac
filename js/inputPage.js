// js/inputPage.js

import { stages as masterStages } from './stages.js';
import { categories } from './categoryData.js';
import { showSuccessPopup } from './utils.js';

// --- DOM Element References ---
const categorySelect = document.getElementById('category-select');
const stageSelect = document.getElementById('stage-select');
const starSelect = document.getElementById('star-select');
const form = document.getElementById('progress-form');
const linkContainer = document.getElementById('ukikipedia-link-container');

// --- Ukikipedia Link Logic ---
function generateUkikipediaUrl(stage, star) {
    const STAGE_LINK_STARS = ["Stage", "8 Red Coins", "100 Coins"];
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

// --- Dropdown Population Logic ---
function populateStars() {
    const selectedCategory = categorySelect.value;
    const selectedStage = stageSelect.value;
    const categoryData = categories[selectedCategory];

    starSelect.innerHTML = '';

    if (!selectedStage || !categoryData) {
        updateUkikipediaLink();
        return;
    }

    const starsForStage = (categoryData === "ALL") 
        ? masterStages[selectedStage] 
        : categoryData[selectedStage] || [];

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
        populateStars(); // This will clear the star list
        return;
    }

    const stagesForCategory = (categoryData === "ALL")
        ? Object.keys(masterStages)
        : Object.keys(categoryData);

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

// --- Recent Submissions Logic ---
function displayRecentSubmissions() {
    const container = document.getElementById('recent-submissions-container');
    if (!container) return;
    const allProgress = JSON.parse(localStorage.getItem('progress')) || [];
    const recentThree = allProgress.slice(-3).reverse();
    container.innerHTML = '';
    if (recentThree.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No submissions yet.</p>';
        return;
    }
    recentThree.forEach(progress => {
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
            <button class="copy-btn" data-id="${progress.id}">Copy</button>
        `;
        container.appendChild(itemDiv);
    });
}

// --- Main Setup Function ---
export function setupInputPage() {
    // Attach event listeners
    categorySelect.addEventListener('change', populateStages);
    stageSelect.addEventListener('change', populateStars);
    starSelect.addEventListener('change', updateUkikipediaLink);

    // Initial population
    populateCategories();
    categorySelect.value = "120 Star"; // Default to 120 Star
    populateStages();

    // Form submission logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Prevent submission if no star is selected (e.g., in 0 Star)
        if (!starSelect.value) {
            alert("Cannot add progress: no star selected.");
            return;
        }

        const progressData = {
            id: Date.now(),
            stage: stageSelect.value,
            star: starSelect.value,
            streak: form.streak.value,
            xcam: form.xcam.value,
            timestamp: new Date().toISOString(),
        };
        let allProgress = JSON.parse(localStorage.getItem('progress')) || [];
        allProgress.push(progressData);
        localStorage.setItem('progress', JSON.stringify(allProgress));
        showSuccessPopup('Progress saved successfully!');
        form.streak.value = '';
        form.xcam.value = '';
        displayRecentSubmissions();
    });

    // Recent submissions "Copy" logic
    const recentContainer = document.getElementById('recent-submissions-container');
    recentContainer.addEventListener('click', (e) => {
        const copyButton = e.target.closest('.copy-btn');
        if (copyButton) {
            const id = parseInt(copyButton.dataset.id);
            const allProgress = JSON.parse(localStorage.getItem('progress')) || [];
            const progressToCopy = allProgress.find(p => p.id === id);
            if (progressToCopy) {
                // To properly copy, we need to check if the star exists in the current category
                const categoryData = categories[categorySelect.value];
                const stageExists = categoryData === "ALL" || categoryData.hasOwnProperty(progressToCopy.stage);
                const starExists = stageExists && (categoryData === "ALL" || categoryData[progressToCopy.stage].includes(progressToCopy.star));

                if (!starExists) {
                    alert(`'${progressToCopy.star}' is not in the currently selected '${categorySelect.value}' category. Please switch categories to copy this entry.`);
                    return;
                }

                stageSelect.value = progressToCopy.stage;
                populateStars(); // Repopulate stars for the copied stage
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
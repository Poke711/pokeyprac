// js/inputPage.js

import { stages } from './stages.js';
import { showSuccessPopup } from './utils.js';

// A list of star names/substrings that should link to the stage page instead of a dedicated star page.
const STAGE_LINK_STARS = [
    "Stage", "8 Red Coins"
]

/**
 * Generates the appropriate Ukikipedia URL for a given stage and star.
 * @param {string} stage The name of the stage.
 * @param {string} star The name of the star.
 * @returns {string} The formatted URL.
 */
function generateUkikipediaUrl(stage, star) {
    const baseUrl = "https://ukikipedia.net/wiki/RTA_Guide/";
    const useStageLink = STAGE_LINK_STARS.some(substring => star.includes(substring));
    const pageName = useStageLink ? stage : star;
    const formattedName = pageName.replace(/ /g, '_'); // Replace spaces with underscores
    return baseUrl + formattedName;
}

/**
 * Updates the link button on the page based on the current selection.
 */
function updateUkikipediaLink() {
    const stageSelect = document.getElementById('stage-select');
    const starSelect = document.getElementById('star-select');
    const linkContainer = document.getElementById('ukikipedia-link-container');

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
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
            </svg>
        </a>
    `;
}

function displayRecentSubmissions() {
    // This function remains unchanged...
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

export function setupInputPage() {
    const stageSelect = document.getElementById('stage-select');
    const starSelect = document.getElementById('star-select');
    const form = document.getElementById('progress-form');
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    for (const stage in stages) {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        stageSelect.appendChild(option);
    }

    const updateStars = () => {
        const selectedStage = stageSelect.value;
        starSelect.innerHTML = '';
        stages[selectedStage].forEach(star => {
            const option = document.createElement('option');
            option.value = star;
            option.textContent = star;
            starSelect.appendChild(option);
        });
        // NEW: Update the link whenever the star list is repopulated
        updateUkikipediaLink(); 
    };

    stageSelect.addEventListener('change', updateStars);
    // NEW: Add event listener to the star dropdown itself
    starSelect.addEventListener('change', updateUkikipediaLink);

    updateStars(); // Initial population

    // The rest of the function (form submission, edit logic, etc.) remains unchanged...
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const progressData = {
            id: editId ? parseInt(editId) : Date.now(),
            stage: form.stage.value,
            star: form.star.value,
            streak: form.streak.value,
            xcam: form.xcam.value,
            timestamp: new Date().toISOString(),
        };
        let allProgress = JSON.parse(localStorage.getItem('progress')) || [];
        if (editId) {
            allProgress = allProgress.map(p => {
                if (p.id === parseInt(editId)) {
                    progressData.timestamp = p.timestamp;
                    return progressData;
                }
                return p;
            });
            localStorage.setItem('progress', JSON.stringify(allProgress));
            window.location.href = 'data.html';
        } else {
            allProgress.push(progressData);
            localStorage.setItem('progress', JSON.stringify(allProgress));
            showSuccessPopup('Progress saved successfully!');
            form.streak.value = '';
            form.xcam.value = '';
            displayRecentSubmissions();
        }
    });

    if (editId) {
        let allProgress = JSON.parse(localStorage.getItem('progress')) || [];
        const progressToEdit = allProgress.find(p => p.id === parseInt(editId));
        if (progressToEdit) {
            form.stage.value = progressToEdit.stage;
            updateStars();
            form.star.value = progressToEdit.star;
            form.streak.value = progressToEdit.streak;
            form.xcam.value = progressToEdit.xcam;
            form.querySelector('button').textContent = 'Update Progress';
        }
    }

    const recentContainer = document.getElementById('recent-submissions-container');
    recentContainer.addEventListener('click', (e) => {
        const copyButton = e.target.closest('.copy-btn');
        if (copyButton) {
            const id = parseInt(copyButton.dataset.id);
            const allProgress = JSON.parse(localStorage.getItem('progress')) || [];
            const progressToCopy = allProgress.find(p => p.id === id);
            if (progressToCopy) {
                form.stage.value = progressToCopy.stage;
                stageSelect.dispatchEvent(new Event('change'));
                form.star.value = progressToCopy.star;
                form.streak.value = progressToCopy.streak;
                form.xcam.value = progressToCopy.xcam;
                window.scrollTo(0, 0);
            }
        }
    });
    displayRecentSubmissions();
}
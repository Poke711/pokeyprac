// js/inputPage.js

// Import the data and functions we need from other modules
import { stages } from './stages.js';
import { showSuccessPopup } from './utils.js';

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
    };

    stageSelect.addEventListener('change', updateStars);
    updateStars();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const progressData = {
            id: editId ? parseInt(editId) : Date.now(),
            stage: form.stage.value,
            star: form.star.value,
            streak: form.streak.value,
            xcam: form.xcam.value,
            // --- NEW: Add the timestamp in ISO format for easy parsing ---
            timestamp: new Date().toISOString(),
        };

        let allProgress = JSON.parse(localStorage.getItem('progress')) || [];

        // When editing, we should preserve the original timestamp unless you want to update it.
        // For now, let's assume editing an entry doesn't change its original achievement date.
        if (editId) {
            allProgress = allProgress.map(p => {
                if (p.id === parseInt(editId)) {
                    progressData.timestamp = p.timestamp; // Keep original timestamp
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
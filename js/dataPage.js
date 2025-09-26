// js/dataPage.js
// UPDATED: Import syncLocalDataToFirestore
import { getAllSubmissions, deleteSubmission, syncLocalDataToFirestore } from './dataManager.js';
import { triggerLogin } from './auth.js';

export async function setupDataPage(user) {
    const tableBody = document.querySelector('#progress-table tbody');
    // ADDED: Get reference to the new button
    const forceSyncButton = document.getElementById('force-sync-button');

    if (!tableBody) {
        console.error("Data page setup failed: Could not find '#progress-table tbody'.");
        return;
    }

    // ADDED: Function to control the visibility of the sync button
    function checkAndShowSyncButton() {
        const localData = localStorage.getItem('pokeyprac_submissions');
        // Show the button ONLY if the user is logged in AND local data exists
        if (user && forceSyncButton && localData && localData.length > 2) {
            forceSyncButton.style.display = 'inline-block';
        } else if (forceSyncButton) {
            forceSyncButton.style.display = 'none';
        }
    }

    let allProgress = [];

    async function fetchDataAndRender() {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading submissions...</td></tr>`;
        allProgress = await getAllSubmissions(user);
        renderTable();
        // ADDED: Check whether to show the sync button every time data is rendered
        checkAndShowSyncButton();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        if (allProgress.length === 0) {
            const message = user
                ? "No progress data found. Add some on the Home page!"
                : "No local progress data found. Log in to sync your cloud data, or add new progress on the Home page.";
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">${message}</td></tr>`;
            return;
        }

        allProgress.forEach(progress => {
            const row = document.createElement('tr');
            const formattedDate = progress.timestamp
                ? new Date(progress.timestamp).toLocaleString()
                : 'N/A';
            const editButton = `<button class="action-btn edit-btn" data-id="${progress.id}" title="${progress.isLocal ? 'Log in to sync and edit' : 'Edit this entry'}">Edit</button>`;
            row.innerHTML = `
                <td>${progress.stage}</td>
                <td>${progress.star}</td>
                <td>${progress.streak || 'N/A'}</td>
                <td>${progress.xcam || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions-cell">
                    <div class="action-buttons-container">
                        ${editButton}
                        <button class="action-btn delete-btn" data-id="${progress.id}">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // ADDED: Event listener for the new force sync button
    if (forceSyncButton) {
        forceSyncButton.addEventListener('click', async () => {
            if (!confirm("This will upload all locally saved submissions to your account. Are you sure?")) {
                return;
            }
            forceSyncButton.disabled = true;
            forceSyncButton.textContent = 'Syncing...';

            try {
                const result = await syncLocalDataToFirestore(user);
                if (result.synced > 0) {
                    sessionStorage.setItem('syncCompleted', 'true');
                    alert(`${result.synced} submission(s) synced successfully!`);
                    await fetchDataAndRender(); // Refresh the table to show new data
                } else {
                    alert("No new local data was found to sync.");
                }
            } catch (err) {
                console.error("Force sync failed:", err);
                alert("An unexpected error occurred during the sync process.");
            } finally {
                forceSyncButton.disabled = false;
                forceSyncButton.textContent = 'Sync Local Data';
                checkAndShowSyncButton(); // Re-evaluate if the button should be shown
            }
        });
    }

    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.action-btn');
        if (!button || button.disabled) return;
        const id = button.dataset.id;
        if (!id) return;

        if (button.classList.contains('edit-btn')) {
            if (user) {
                window.location.href = `index.html?edit=${id}`;
            } else {
                alert("Please log in to edit and sync your submissions.");
                triggerLogin();
            }
        } else if (button.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this entry?')) {
                try {
                    await deleteSubmission(user, id);
                    await fetchDataAndRender();
                } catch (error) {
                    console.error("Error removing document: ", error);
                    alert("Failed to delete entry.");
                }
            }
        }
    });

    await fetchDataAndRender();
}
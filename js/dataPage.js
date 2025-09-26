// js/dataPage.js
import { getAllSubmissions, deleteSubmission } from './dataManager.js';
import { triggerLogin } from './auth.js'; // <-- ADDED: Import triggerLogin

export async function setupDataPage(user) {
    const tableBody = document.querySelector('#progress-table tbody');
    if (!tableBody) {
        console.error("Data page setup failed: Could not find '#progress-table tbody'.");
        return;
    }
    
    let allProgress = [];

    async function fetchDataAndRender() {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading submissions...</td></tr>`;
        allProgress = await getAllSubmissions(user);
        renderTable();
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
            
            // UPDATED: The button is no longer disabled. We add a title to guide the user.
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

    fetchDataAndRender();

    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.action-btn');
        if (!button || button.disabled) return;

        const id = button.dataset.id;
        if (!id) return;

        // UPDATED: New logic for the edit button
        if (button.classList.contains('edit-btn')) {
            // Check if the user is logged in
            if (user) {
                // If logged in, proceed to the edit page as normal
                window.location.href = `index.html?edit=${id}`;
            } else {
                // If not logged in, alert them and trigger the login flow
                alert("Please log in to edit and sync your submissions.");
                triggerLogin();
            }
        } 
        else if (button.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this entry?')) {
                try {
                    await deleteSubmission(user, id);
                    fetchDataAndRender(); // Refetch and re-render
                } catch (error) {
                    console.error("Error removing document: ", error);
                    alert("Failed to delete entry.");
                }
            }
        }
    });
}
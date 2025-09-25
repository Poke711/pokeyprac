// js/dataPage.js
import { db } from './auth.js';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

export async function setupDataPage(user) {
    const tableBody = document.querySelector('#progress-table tbody');
    let allProgress = [];

    async function fetchData() {
        if (user) {
            // UPDATED: Your collection is named "submissions", not "progress"
            const q = query(collection(db, "submissions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            allProgress = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        if (!user) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Please log in to see your submissions.</td></tr>`;
            return;
        }

        if (allProgress.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No progress data found. Add some on the Home page!</td></tr>`;
        } else {
            allProgress.forEach(progress => {
                const row = document.createElement('tr');
                const formattedDate = progress.timestamp 
                    ? new Date(progress.timestamp).toLocaleString() 
                    : 'N/A';

                // --- UPDATED: Added the Edit button back ---
                row.innerHTML = `
                    <td>${progress.stage}</td>
                    <td>${progress.star}</td>
                    <td>${progress.streak || 'N/A'}</td>
                    <td>${progress.xcam || 'N/A'}</td>
                    <td>${formattedDate}</td>
                    <td class="actions-cell">
                        <div class="action-buttons-container">
                            <button class="action-btn edit-btn" data-id="${progress.id}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${progress.id}">Delete</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    await fetchData();
    renderTable();

    tableBody.addEventListener('click', async (e) => {
        if (!user) return; // Don't allow actions if not logged in

        const id = e.target.dataset.id;
        if (!id) return;

        // --- UPDATED: Added logic for the Edit button ---
        if (e.target.classList.contains('edit-btn')) {
            window.location.href = `index.html?edit=${id}`;
        } 
        else if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this entry?')) {
                try {
                    await deleteDoc(doc(db, "submissions", id));
                    // Refetch and re-render to ensure data is fresh
                    await fetchData();
                    renderTable();
                } catch (error) {
                    console.error("Error removing document: ", error);
                    alert("Failed to delete entry from cloud.");
                }
            }
        }
    });
}
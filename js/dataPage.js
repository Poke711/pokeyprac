// js/dataPage.js
import { db } from './auth.js';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

export async function setupDataPage(user) {
    const tableBody = document.querySelector('#progress-table tbody');
    let allProgress = [];

    async function fetchData() {
        if (user) {
            const q = query(collection(db, "progress"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            allProgress = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            allProgress = JSON.parse(localStorage.getItem('progress')) || [];
            allProgress.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        if (allProgress.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = user ? 'No progress data found. Add some on the Home page!' : 'No local data. Log in to see cloud saves or add data on the Home page.';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
        } else {
            allProgress.forEach(progress => {
                const row = document.createElement('tr');
                const formattedDate = progress.timestamp 
                    ? new Date(progress.timestamp).toLocaleString() 
                    : 'N/A';
                row.innerHTML = `
                    <td>${progress.stage}</td>
                    <td>${progress.star}</td>
                    <td>${progress.streak || 'N/A'}</td>
                    <td>${progress.xcam || 'N/A'}</td>
                    <td>${formattedDate}</td>
                    <td class="actions-cell">
                        <div class="action-buttons-container">
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
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this entry?')) {
                if (user) {
                    try {
                        await deleteDoc(doc(db, "progress", id));
                        allProgress = allProgress.filter(p => p.id !== id);
                    } catch (error) {
                        console.error("Error removing document: ", error);
                        alert("Failed to delete entry from cloud.");
                        return;
                    }
                } else {
                    allProgress = allProgress.filter(p => p.id.toString() !== id);
                    localStorage.setItem('progress', JSON.stringify(allProgress));
                }
                renderTable();
            }
        }
    });
}
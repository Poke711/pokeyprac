// js/dataPage.js

// Export this function so main.js can call it
export function setupDataPage() {
    const tableBody = document.querySelector('#progress-table tbody');
    let allProgress = JSON.parse(localStorage.getItem('progress')) || [];

    function renderTable() {
        tableBody.innerHTML = '';
        if (allProgress.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'No progress data found. Add some on the Input page!';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
        } else {
            allProgress.sort((a, b) => b.id - a.id);
            allProgress.forEach(progress => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${progress.stage}</td>
                    <td>${progress.star}</td>
                    <td>${progress.streak || 'N/A'}</td>
                    <td>${progress.xcam || 'N/A'}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${progress.id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${progress.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    renderTable();

    tableBody.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this entry?')) {
                allProgress = allProgress.filter(p => p.id != id);
                localStorage.setItem('progress', JSON.stringify(allProgress));
                renderTable();
            }
        } else if (e.target.classList.contains('edit-btn')) {
            window.location.href = `index.html?edit=${id}`;
        }
    });
}
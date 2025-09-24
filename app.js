document.addEventListener('DOMContentLoaded', () => {
    // Check if localStorage is available and accessible
    if (!isLocalStorageAvailable()) {
        alert('Error: localStorage is not available.\n\nThis can happen if you open the file directly in your browser (especially Firefox) due to security restrictions.\n\nPlease use a local development server (like the "Live Server" extension in VS Code) for the application to function correctly.');
        return; // Stop the script if storage isn't working
    }

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    // Route to the correct setup function based on the HTML file
    if (page === 'index.html' || page === '') {
        setupInputPage();
    } else if (page === 'data.html') {
        setupDataPage();
    }
});

function isLocalStorageAvailable() {
    let storage;
    try {
        storage = window.localStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

const stages = {
    "Bob-omb Battlefield": ["Big Bob-omb on the Summit", "Footrace with Koopa the Quick", "Shoot to the Island in the Sky", "Find the 8 Red Coins", "Mario Wings to the Sky", "Behind Chain Chomp's Gate"],
    "Whomp's Fortress": ["Chip Off Whomp's Block", "To the Top of the Fortress", "Shoot into the Wild Blue", "Red Coins on the Floating Isle", "Fall onto the Caged Island", "Blast Away the Wall"],
    "Jolly Roger Bay": ["Plunder in the Sunken Ship", "Can the Eel Come Out to Play?", "Treasure of the Ocean Cave", "Red Coins on the Ship Afloat", "Blast to the Stone Pillar", "Through the Jet Stream"],
    "Cool, Cool Mountain": ["Slip Slidin' Away", "Li'l Penguin Lost", "Big Penguin Race", "Frosty Slide for 8 Red Coins", "Snowman's Lost His Head", "Wall Kicks Will Work"],
    "Big Boo's Haunt": ["Go on a Ghost Hunt", "Ride Big Boo's Merry-Go-Round", "Secret of the Haunted Books", "Seek the 8 Red Coins", "Big Boo's Balcony", "Eye to Eye in the Secret Room"],
    "Hazy Maze Cave": ["Swimming Beast in the Cavern", "Elevate for 8 Red Coins", "Metal-Head Mario Can Move!", "Navigating the Toxic Maze", "A-Maze-Ing Emergency Exit", "Watch for Rolling Rocks"],
    "Lethal Lava Land": ["Boil the Big Bully", "Bully the Bullies", "8-Coin Puzzle with 15 Pieces", "Red-Hot Log Rolling", "Hot-Foot-It into the Volcano", "Elevator Tour in the Volcano"],
    "Shifting Sand Land": ["In the Talons of the Big Bird", "Shining Atop the Pyramid", "Inside the Ancient Pyramid", "Stand Tall on the Four Pillars", "Free Flying for 8 Red Coins", "Pyramid Puzzle"],
    "Dire, Dire Docks": ["Board Bowser's Sub", "Chests in the Current", "Pole-Jumping for Red Coins", "Through the Jet Stream", "The Manta Ray's Reward", "Collect the Caps..."],
    "Snowman's Land": ["Snowman's Big Head", "Chill with the Bully", "In the Deep Freeze", "Whirl from the Freezing Pond", "Shell Shreddin' for Red Coins", "Into the Igloo"],
    "Wet-Dry World": ["Shocking Arrow Lifts!", "Top o' the Town", "Secrets in the Shallows & Sky", "Express Elevators--Hurry Up!", "Go to Town for Red Coins", "Quick Race Through Downtown!"],
    "Tall, Tall Mountain": ["Scale the Mountain", "Mystery of the Monkey Cage", "Scary 'Shrooms, Red Coins", "Mysterious Mountainside", "Breathtaking View from Bridge", "Blast to the Lonely Mushroom"],
    "Tiny-Huge Island": ["Pluck the Piranha Flower", "The Tip Top of the Huge Island", "Rematch with Koopa the Quick", "Five Itty Bitty Secrets", "Wiggler's Red Coins", "Make Wiggler Squirm"],
    "Tick Tock Clock": ["Roll into the Cage", "The Pit and the Pendulums", "Get a Hand", "Stomp on the Thwomp", "Timed Jumps on Moving Bars", "Stop Time for Red Coins"],
    "Rainbow Ride": ["Cruiser Crossing the Rainbow", "The Big House in the Sky", "Coins Amassed in a Maze", "Swingin' in the Breeze", "Tricky Triangles!", "Somewhere Over the Rainbow"]
};

// Function to show a success popup
function showSuccessPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;
    document.body.appendChild(popup);

    // Trigger fade in
    setTimeout(() => popup.classList.add('show'), 10);

    // Hide and remove the popup after 3 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        popup.addEventListener('transitionend', () => popup.remove());
    }, 3000);
}


function setupInputPage() {
    const stageSelect = document.getElementById('stage-select');
    const starSelect = document.getElementById('star-select');
    const form = document.getElementById('progress-form');
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    // Populate stages dropdown
    for (const stage in stages) {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        stageSelect.appendChild(option);
    }

    // Function to update stars based on selected stage
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

    // Populate stars when stage changes
    stageSelect.addEventListener('change', updateStars);

    // Initial population of stars
    updateStars();

    // Handle form submission for adding or editing progress
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const progressData = {
            id: editId ? parseInt(editId) : Date.now(), // Use existing ID if editing, otherwise create a new one
            stage: form.stage.value,
            star: form.star.value,
            streak: form.streak.value,
            xcam: form.xcam.value,
        };

        let allProgress = JSON.parse(localStorage.getItem('progress')) || [];

        if (editId) {
            // If editing, find and replace the existing entry
            allProgress = allProgress.map(p => p.id === parseInt(editId) ? progressData : p);
            localStorage.setItem('progress', JSON.stringify(allProgress));
            // Redirect to data page after edit is complete
            window.location.href = 'data.html';
        } else {
            // If adding a new entry
            allProgress.push(progressData);
            localStorage.setItem('progress', JSON.stringify(allProgress));
            
            // Show success message
            showSuccessPopup('Progress saved successfully!');

            // Clear input fields for next entry
            form.streak.value = '';
            form.xcam.value = '';
        }
    });

    // If we are in "edit" mode, pre-fill the form with existing data
    if (editId) {
        let allProgress = JSON.parse(localStorage.getItem('progress')) || [];
        const progressToEdit = allProgress.find(p => p.id === parseInt(editId));
        if (progressToEdit) {
            form.stage.value = progressToEdit.stage;
            updateStars(); // Update the star list for the correct stage
            form.star.value = progressToEdit.star;
            form.streak.value = progressToEdit.streak;
            form.xcam.value = progressToEdit.xcam;
            form.querySelector('button').textContent = 'Update Progress'; // Change button text
        }
    }
}

function setupDataPage() {
    const tableBody = document.querySelector('#progress-table tbody');
    let allProgress = JSON.parse(localStorage.getItem('progress')) || [];

    // Function to render the progress data into the table
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

    // Event listener for delete and edit buttons
    tableBody.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return; // Exit if the click wasn't on a button with a data-id

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this entry?')) {
                allProgress = allProgress.filter(p => p.id != id);
                localStorage.setItem('progress', JSON.stringify(allProgress));
                renderTable(); // Re-render the table with the item removed
            }
        } else if (e.target.classList.contains('edit-btn')) {
            // Redirect to the input page with the ID of the item to edit
            window.location.href = `index.html?edit=${id}`;
        }
    });
}
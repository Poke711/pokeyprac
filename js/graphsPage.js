// js/graphsPage.js

// --- Chart Instances (to destroy them before redrawing) ---
let streakChart;
let xcamChart;

/**
 * Updates the charts based on the selected stage and star.
 */
function updateGraphs() {
    const stageSelect = document.getElementById('graph-stage-select');
    const starSelect = document.getElementById('graph-star-select');
    const streakCanvas = document.getElementById('streak-chart').getContext('2d');
    const xcamCanvas = document.getElementById('xcam-chart').getContext('2d');

    const selectedStage = stageSelect.value;
    const selectedStar = starSelect.value;
    const allProgress = JSON.parse(localStorage.getItem('progress')) || [];

    // Filter data for the selected star
    const filteredData = allProgress
        .filter(p => p.stage === selectedStage && p.star === selectedStar)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // --- FIX: Prepare labels with date only ---
    const labels = filteredData.map(p => new Date(p.timestamp).toLocaleDateString());
    const xcamData = filteredData.map(p => p.xcam ? parseFloat(p.xcam) : null).filter(val => val !== null);

    // Destroy old charts before drawing new ones
    if (streakChart) streakChart.destroy();
    if (xcamChart) xcamChart.destroy();
    
    // --- Base Chart.js Configuration ---
    const baseChartOptions = {
        scales: {
            x: {
                ticks: { color: '#e0e0e0' },
                grid: { color: '#444' }
            }
        },
        plugins: {
            legend: { labels: { color: '#e0e0e0' } },
            title: { display: true, color: '#e0e0e0', font: { size: 16 } }
        },
        maintainAspectRatio: false
    };

    // --- Specific options for the Streak Chart ---
    const streakChartOptions = {
        ...baseChartOptions,
        scales: {
            ...baseChartOptions.scales,
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#e0e0e0',
                    stepSize: 1, // Only show whole number steps
                    precision: 0 // Ensures no decimals on the tick labels
                },
                grid: { color: '#444' }
            }
        },
        plugins: { ...baseChartOptions.plugins, title: { ...baseChartOptions.plugins.title, text: 'Streaks Over Time' } }
    };

    // --- Specific options for the X-Cam Chart ---
    const xcamChartOptions = {
        ...baseChartOptions,
        scales: {
            ...baseChartOptions.scales,
            y: {
                ticks: {
                    color: '#e0e0e0',
                    // --- FIX: Format Y-axis ticks to 2 decimal places ---
                    callback: function(value) {
                        return value.toFixed(2); 
                    }
                },
                grid: { color: '#444' }
            }
        },
        plugins: { ...baseChartOptions.plugins, title: { ...baseChartOptions.plugins.title, text: 'X-Cam Time Over Time' } }
    };
    
    // Calculate dynamic min/max for the Y-axis "zoom"
    if (xcamData.length > 0) {
        let minTime = Math.min(...xcamData);
        let maxTime = Math.max(...xcamData);

        if (minTime === maxTime) {
            minTime -= 0.1;
            maxTime += 0.1;
        }

        const padding = (maxTime - minTime) * 0.1;
        xcamChartOptions.scales.y.min = Math.max(0, minTime - padding);
        xcamChartOptions.scales.y.max = maxTime + padding;
    }

    // --- Create Charts ---

    // Create Streak Chart
    streakChart = new Chart(streakCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Streak Progress',
                data: filteredData.map(p => p.streak ? parseInt(p.streak) : null),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.1,
                spanGaps: true
            }]
        },
        options: streakChartOptions
    });

    // Create X-Cam Chart
    xcamChart = new Chart(xcamCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'X-Cam Time Progress',
                data: filteredData.map(p => p.xcam ? parseFloat(p.xcam) : null),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                tension: 0.1,
                spanGaps: true
            }]
        },
        options: xcamChartOptions
    });
}

/**
 * Populates the star dropdown based on the selected stage.
 */
function populateStarSelect() {
    const stageSelect = document.getElementById('graph-stage-select');
    const starSelect = document.getElementById('graph-star-select');
    const selectedStage = stageSelect.value;
    const allProgress = JSON.parse(localStorage.getItem('progress')) || [];
    
    const stars = [...new Set(allProgress.filter(p => p.stage === selectedStage).map(p => p.star))];

    starSelect.innerHTML = '';
    if (stars.length === 0) {
        updateGraphs();
        return;
    }

    stars.forEach(star => {
        const option = document.createElement('option');
        option.value = star;
        option.textContent = star;
        starSelect.appendChild(option);
    });

    updateGraphs();
}

/**
 * Populates the stage dropdown with stages that have progress data.
 */
function populateStageSelect() {
    const stageSelect = document.getElementById('graph-stage-select');
    const allProgress = JSON.parse(localStorage.getItem('progress')) || [];
    
    const stagesWithData = [...new Set(allProgress.map(p => p.stage))];
    
    stageSelect.innerHTML = '';
    if (stagesWithData.length === 0) {
        const option = document.createElement('option');
        option.textContent = "No data available to graph";
        stageSelect.appendChild(option);
        populateStarSelect();
        return;
    }

    stagesWithData.forEach(stage => {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        stageSelect.appendChild(option);
    });

    populateStarSelect();
}


export function setupGraphsPage() {
    const stageSelect = document.getElementById('graph-stage-select');
    const starSelect = document.getElementById('graph-star-select');

    stageSelect.addEventListener('change', populateStarSelect);
    starSelect.addEventListener('change', updateGraphs);

    populateStageSelect();
}
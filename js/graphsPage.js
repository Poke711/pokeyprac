// js/graphsPage.js
import { getAllSubmissions } from './dataManager.js';

let streakChart;
let xcamChart;
let allProgress = [];

function updateGraphs() {
    const stageSelect = document.getElementById('graph-stage-select');
    const starSelect = document.getElementById('graph-star-select');
    const streakCanvas = document.getElementById('streak-chart').getContext('2d');
    const xcamCanvas = document.getElementById('xcam-chart').getContext('2d');

    const selectedStage = stageSelect.value;
    const selectedStar = starSelect.value;

    const filteredData = allProgress
        .filter(p => p.stage === selectedStage && p.star === selectedStar)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = filteredData.map(p => new Date(p.timestamp).toLocaleDateString());
    const xcamData = filteredData.map(p => p.xcam ? parseFloat(p.xcam) : null).filter(val => val !== null);

    if (streakChart) streakChart.destroy();
    if (xcamChart) xcamChart.destroy();
    
    const baseChartOptions = {
        scales: {
            x: { ticks: { color: '#e0e0e0' }, grid: { color: '#444' } }
        },
        plugins: {
            legend: { labels: { color: '#e0e0e0' } },
            title: { display: true, color: '#e0e0e0', font: { size: 16 } }
        },
        maintainAspectRatio: false
    };

    const streakChartOptions = {
        ...baseChartOptions,
        scales: { ...baseChartOptions.scales, y: { beginAtZero: true, ticks: { color: '#e0e0e0', stepSize: 1, precision: 0 }, grid: { color: '#444' } } },
        plugins: { ...baseChartOptions.plugins, title: { ...baseChartOptions.plugins.title, text: 'Streaks Over Time' } }
    };

    const xcamChartOptions = {
        ...baseChartOptions,
        scales: { ...baseChartOptions.scales, y: { ticks: { color: '#e0e0e0', callback: value => value.toFixed(2) }, grid: { color: '#444' } } },
        plugins: { ...baseChartOptions.plugins, title: { ...baseChartOptions.plugins.title, text: 'X-Cam Time Over Time' } }
    };
    
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

    streakChart = new Chart(streakCanvas, {
        type: 'line',
        data: {
            labels,
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

    xcamChart = new Chart(xcamCanvas, {
        type: 'line',
        data: {
            labels,
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

function populateStarSelect() {
    const stageSelect = document.getElementById('graph-stage-select');
    const starSelect = document.getElementById('graph-star-select');
    const selectedStage = stageSelect.value;
    
    const stars = [...new Set(allProgress.filter(p => p.stage === selectedStage).map(p => p.star))];

    starSelect.innerHTML = '';
    stars.forEach(star => {
        const option = document.createElement('option');
        option.value = star;
        option.textContent = star;
        starSelect.appendChild(option);
    });
    updateGraphs();
}

function populateStageSelect() {
    const stageSelect = document.getElementById('graph-stage-select');
    const stagesWithData = [...new Set(allProgress.map(p => p.stage))];
    
    stageSelect.innerHTML = '';
    if (stagesWithData.length === 0) {
        const option = document.createElement('option');
        option.textContent = "No data available to graph";
        stageSelect.appendChild(option);
        if (streakChart) streakChart.destroy();
        if (xcamChart) xcamChart.destroy();
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

export async function setupGraphsPage(user) {
    allProgress = await getAllSubmissions(user);

    const stageSelect = document.getElementById('graph-stage-select');
    const starSelect = document.getElementById('graph-star-select');

    stageSelect.addEventListener('change', populateStarSelect);
    starSelect.addEventListener('change', updateGraphs);

    populateStageSelect();
}
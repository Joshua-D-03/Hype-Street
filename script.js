// Hype Street Point System Logic
const SCORING = {
    MOVIE: 1.0, GAME: 1.0, TV_SHOW: 1.0,
    ANIMATED: 0.75, COMIC: 0.5, NOVEL: 0.5, MOBILE: 0.5,
    OTHER: 0.25, CONTROVERSY: -0.5, INACTIVITY: -2.0
};

// Mock Database for Search Prediction
const ipDatabase = ["Spider-Man", "Marvel Cinematic Universe", "Star Wars", "Mickey Mouse & Friends", "The Last of Us", "Batman", "Harry Potter"];

// Chart Data Structure
let chartData = {
    labels: [], // Dates from 1980
    datasets: [{
        label: 'Hype Index',
        data: [],
        borderColor: '#00ff88',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 8,
        fill: false,
        segment: {
            borderColor: ctx => (ctx.p0.parsed.y <= ctx.p1.parsed.y ? '#00ff88' : '#ff4444')
        }
    }]
};

// Simulation of History Data from 1980 to Today
function generateHistoricalData() {
    let currentScore = 10.000;
    const startDate = new Date(1980, 0, 1);
    const today = new Date();
    
    // Generating monthly data points
    for (let d = startDate; d <= today; d.setMonth(d.getMonth() + 1)) {
        chartData.labels.push(new Date(d).toLocaleDateString());
        
        // Random "News Events" logic based on your rules
        let change = (Math.random() - 0.45) * 5; // Simplified drift
        currentScore = Math.max(-100, Math.min(100, currentScore + change));
        
        chartData.datasets[0].data.push({
            x: new Date(d).toLocaleDateString(),
            y: currentScore,
            news: currentScore > 15 ? "• Official Movie Release (+1.0)\n• High Rotten Tomatoes Score (+1.0)" : "• No Content Released (-2.0)"
        });
    }
}

// Initialize Chart
const ctx = document.getElementById('hypeChart').getContext('2d');
let hypeChart;

function initChart() {
    generateHistoricalData();
    hypeChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: -100, max: 100, grid: { color: '#1f2226' } },
                x: { grid: { display: false } }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.news || "Steady State";
                        }
                    }
                }
            }
        }
    });
    updateRealtimeDisplay();
}

// Update the 0.000 display in the corner
function updateRealtimeDisplay() {
    const lastVal = chartData.datasets[0].data[chartData.datasets[0].data.length - 1].y;
    const display = document.getElementById('graph-value-display');
    const livePrice = document.getElementById('live-price');
    
    const formatted = lastVal.toFixed(3);
    display.innerText = formatted;
    livePrice.innerText = formatted;
    
    // Set colors
    const colorClass = lastVal >= 0 ? 'up' : 'down';
    display.className = colorClass;
    livePrice.className = `price-highlight ${colorClass}`;
}

// Search Logic
const searchIcon = document.getElementById('search-icon');
const overlay = document.getElementById('search-overlay');
const closeSearch = document.getElementById('close-search');
const searchInput = document.getElementById('ip-search-input');
const predictions = document.getElementById('predictions');

searchIcon.onclick = () => overlay.style.display = 'flex';
closeSearch.onclick = () => overlay.style.display = 'none';

searchInput.oninput = (e) => {
    const val = e.target.value.toLowerCase();
    predictions.innerHTML = '';
    if(val.length > 0) {
        const matches = ipDatabase.filter(ip => ip.toLowerCase().includes(val));
        matches.forEach(match => {
            const div = document.createElement('div');
            div.innerText = match;
            div.onclick = () => {
                document.getElementById('current-ip-title').innerText = match.toUpperCase();
                overlay.style.display = 'none';
            };
            predictions.appendChild(div);
        });
    }
};

window.onload = initChart;

const START_YEAR = 1980;
const CURRENT_DATE = new Date('2026-03-04');

const POINTS = {
    movie: 1.0, game: 1.0, tv: 1.0,
    animated_movie: 0.75, animated_tv: 0.75,
    comic: 0.5, novel: 0.5, mobile: 0.5,
    other: 0.25
};

const IPS = {
    "Spider-Man": {
        events: [
            { date: '2023-10-20', type: 'game', status: 'released', reviews: 'positive', desc: "Spider-Man 2 PS5 Launch" },
            { date: '2025-07-31', type: 'movie', status: 'announced', desc: "Brand New Day Announcement" },
            { date: '2026-01-15', type: 'other', status: 'rerelease', desc: "Retro Action Figure Rerelease (0.25/4)" }
        ]
    },
    "Mickey Mouse": {
        events: [
            { date: '2024-01-01', type: 'other', status: 'released', desc: "Steamboat Willie Public Domain" },
            { date: '2026-03-29', type: 'other', status: 'announced', desc: "Adventure World New Look" }
        ]
    }
};

let chart;

function processHype(ipName) {
    const data = IPS[ipName];
    let score = 0.000;
    let history = [{ x: new Date('1980-01-01'), y: 0.000, desc: "Market Open" }];
    let activityMap = new Set();

    data.events.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(ev => {
        let base = POINTS[ev.type] || POINTS.other;
        let eventDate = new Date(ev.date);
        activityMap.add(eventDate.getFullYear());

        // Logic Rules
        if (ev.status === 'announced') base /= 2;
        if (ev.status === 'rerelease') base /= 4; // If "other" + "rerelease", it becomes 0.0625
        if (ev.status === 'cancelled') base *= -1;

        if (ev.profit === true) base += (POINTS[ev.type] || 0.25);
        if (ev.profit === false) base -= (POINTS[ev.type] || 0.25);
        if (ev.reviews === 'positive') base += (POINTS[ev.type] || 0.25);
        if (ev.reviews === 'negative') base -= (POINTS[ev.type] || 0.25);
        if (ev.controversy) base -= 0.5;

        score = Math.max(-100, Math.min(100, score + base));
        history.push({ x: eventDate, y: score, desc: ev.desc });
    });

    // Inactivity Penalty
    for (let y = START_YEAR; y <= CURRENT_DATE.getFullYear(); y++) {
        if (!activityMap.has(y)) {
            score -= 2;
            history.push({ x: new Date(`${y}-12-31`), y: score, desc: "Inactivity Penalty (-2.000)" });
        }
    }

    return history.sort((a,b) => a.x - b.x);
}

function initChart(name) {
    const history = processHype(name);
    const last = history[history.length - 1];
    const isUp = last.y >= (history[history.length-2]?.y || 0);

    const ctx = document.getElementById('hypeChart').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                data: history,
                borderColor: isUp ? '#00ffa3' : '#ff3c5f',
                borderWidth: 2,
                pointRadius: 3,
                segment: { borderColor: c => c.p0.parsed.y <= c.p1.parsed.y ? '#00ffa3' : '#ff3c5f' }
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'time', time: { unit: 'year' }, grid: { color: '#242731' } },
                y: { min: -100, max: 100, grid: { color: '#242731' }, ticks: { callback: v => v.toFixed(3) } }
            },
            plugins: { tooltip: { callbacks: { label: c => `${c.raw.y.toFixed(3)}: ${c.raw.desc}` } } }
        }
    });
    updateUI(name, last.y, isUp);
}

function updateUI(name, score, isUp) {
    const color = isUp ? 'var(--bull)' : 'var(--bear)';
    document.getElementById('active-ip').innerText = name.toUpperCase();
    document.getElementById('live-price').innerText = score.toFixed(3);
    document.getElementById('live-price').style.color = color;
    document.getElementById('corner-price').innerText = score.toFixed(3);
    document.getElementById('corner-price').style.color = color;
    document.getElementById('trend-icon').innerHTML = isUp ? '▲' : '▼';
    document.getElementById('trend-icon').style.color = color;
}

// Search and UI Triggers
document.getElementById('open-search').onclick = () => {
    document.getElementById('search-overlay').style.display = 'flex';
    document.getElementById('ip-search-input').focus();
};

document.getElementById('ip-search-input').oninput = (e) => {
    const val = e.target.value.toLowerCase();
    const preds = document.getElementById('predictions');
    preds.innerHTML = '';
    Object.keys(IPS).filter(k => k.toLowerCase().includes(val)).forEach(k => {
        const item = document.createElement('div');
        item.className = 'prediction-item';
        item.innerText = k;
        item.onclick = () => {
            initChart(k);
            document.getElementById('search-overlay').style.display = 'none';
        };
        preds.appendChild(item);
    });
};

window.onload = () => initChart("Spider-Man");

// Global population estimate
const GLOBAL_POPULATION = 8_000_000_000;
// Average farts per person per day (5-15)
const AVG_FARTS_PER_DAY = 10;
// Calculate base rate per second
const BASE_RATE_PER_SECOND = (GLOBAL_POPULATION * AVG_FARTS_PER_DAY) / (24 * 60 * 60);

let startTime = Date.now();
let totalFarts = 0;

function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
}

function updateFartStats() {
    // Calculate time-based total with slight randomization
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const baseTotal = BASE_RATE_PER_SECOND * elapsedSeconds;
    const randomFactor = 0.95 + (Math.random() * 0.1); // ±5% variation
    totalFarts = Math.floor(baseTotal * randomFactor);

    // Current rate with natural variation
    const currentRate = Math.floor(BASE_RATE_PER_SECOND * (0.9 + (Math.random() * 0.2)));
    
    // CO2 equivalent (estimated 0.2g per fart)
    const co2Tons = (totalFarts * 0.0000002);

    // Update display
    document.getElementById('totalFarts').textContent = formatNumber(totalFarts);
    document.getElementById('fartsPerSecond').textContent = formatNumber(currentRate);
    document.getElementById('co2Count').textContent = formatNumber(co2Tons);
}

// Update every 100ms
setInterval(updateFartStats, 100);

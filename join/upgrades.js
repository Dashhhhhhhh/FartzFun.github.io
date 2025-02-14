let poopCurrency = 0;
let spawnRate = 3000; // ms between spawns
let pointsPerPoop = 1;

function buyUpgrade(type) {
    // ...existing upgrade logic...
    switch (type) {
        case 'fasterSpawn':
            if (poopCurrency >= 10) {
                poopCurrency -= 10;
                spawnRate = Math.max(spawnRate - 500, 500);
            }
            break;
        case 'poopCannon':
            if (poopCurrency >= 20) {
                poopCurrency -= 20;
                spawnRate = 500; // immediate effect
            }
            break;
        case 'extraPoints':
            if (poopCurrency >= 5) {
                poopCurrency -= 5;
                pointsPerPoop++;
            }
            break;
        default:
            break;
    }
}

export { poopCurrency, spawnRate, pointsPerPoop, buyUpgrade };

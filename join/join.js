const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

const engine = Engine.create();
const world = engine.world;

// Create walls (invisible)
const walls = [
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true }),
    Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true }),
    Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true })
];
World.add(world, walls);

// Create mouse interaction
const mouse = Mouse.create(document.body);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: { visible: false }
    }
});
World.add(world, mouseConstraint);

const clearButton = document.getElementById('clear-button');

// Update progression variables
const progressionConfig = {
    baseSpawnRate: 1500,  // Changed from 3000 to 1500 (faster initial spawn)
    minSpawnRate: 200,    // Changed from 300 to 200 (faster maximum speed)
    baseSize: 35,         // Changed from 25 to 35
    maxSize: 50,
    sizeGrowth: 0.15,    // Increased from 0.1 to 0.15 (faster size growth)
    spawnRateReduction: 30, // Increased from 20 to 30 (faster spawn rate progression)
    randomVariance: 0.3
};

let currentSpawnRate = progressionConfig.baseSpawnRate;
let currentBaseSize = progressionConfig.baseSize;
let spawnInterval;

// Add toilet collector variables
const toiletElement = document.querySelector('.toilet');
const counterElement = document.querySelector('.counter');
let collectedCount = 0;

// Update toilet collision sensor
const toiletBounds = {
    x: window.innerWidth - 220,
    y: window.innerHeight - 150, // Adjusted to match new position
    width: 200,
    height: 60, // Reduced height to only detect top collisions
    topOnly: true
};

function getRandomVariance() {
    return 1 + (Math.random() * progressionConfig.randomVariance * 2 - progressionConfig.randomVariance);
}

// Remove the velocity multiplier function and modification of physics properties
function createEmoji() {
    const emoji = '💩';  // Only use poop emoji
    
    // Calculate size with random variance
    const size = currentBaseSize * getRandomVariance();

    // Calculate spawn position
    const centerX = window.innerWidth / 2;
    const spawnWidth = window.innerWidth / 4; // Use 1/4 of screen width for spawn area
    const randomOffset = (Math.random() - 0.5) * spawnWidth;
    const spawnX = centerX + randomOffset;

    // Create DOM element
    const element = document.createElement('div');
    element.className = 'emoji';
    element.style.fontSize = `${size}px`;
    element.textContent = emoji;
    document.body.appendChild(element);

    // Create physics body
    const body = Bodies.circle(
        spawnX,
        -50,
        size / 2,
        {
            restitution: 0.6,
            friction: 0.2,
            density: 0.001,
            frictionAir: 0.001,
            angularVelocity: (Math.random() - 0.5) * 0.1, // Add initial rotation
            angle: Math.random() * Math.PI * 2 // Random starting angle
        }
    );

    // Store element reference
    body.element = element;
    World.add(world, body);
}

// Update DOM elements with rotation
function updateElements() {
    world.bodies.forEach(body => {
        if (body.element) {
            const pos = {
                x: body.position.x,
                y: body.position.y
            };

            // Check for toilet collision from top only
            if (pos.x > toiletBounds.x && 
                pos.x < toiletBounds.x + toiletBounds.width &&
                pos.y > toiletBounds.y && 
                pos.y < toiletBounds.y + toiletBounds.height &&
                body.velocity.y > 0) { // Only collect when falling down
                
                // Remove emoji and update counter
                body.element.remove();
                World.remove(world, body);
                collectedCount++;
                counterElement.textContent = collectedCount;
                
                // Progress difficulty
                currentSpawnRate = Math.max(
                    progressionConfig.minSpawnRate,
                    currentSpawnRate - progressionConfig.spawnRateReduction
                );
                currentBaseSize = Math.min(
                    progressionConfig.maxSize,
                    currentBaseSize + progressionConfig.sizeGrowth
                );
                
                updateSpawnRate();
                
                // Change animation target from toilet to counter
                counterElement.style.transform = 'scale(1.2) translateY(-10px)';
                setTimeout(() => {
                    counterElement.style.transform = 'none';
                }, 200);
            } else {
                const angle = body.angle * (180 / Math.PI);
                body.element.style.transform = `translate(${pos.x - body.element.offsetWidth/2}px, ${pos.y - body.element.offsetHeight/2}px) rotate(${angle}deg)`;
            }
        }
    });
    requestAnimationFrame(updateElements);
}

// Dynamic spawn interval
function updateSpawnRate() {
    if (spawnInterval) clearInterval(spawnInterval);
    const actualSpawnRate = Math.max(
        progressionConfig.minSpawnRate,
        currentSpawnRate * getRandomVariance()
    );
    spawnInterval = setInterval(createEmoji, actualSpawnRate);
}

// Initial spawn rate and update on slider change
updateSpawnRate();

// Start the engine and updates
Engine.run(engine);
updateElements();

// Handle window resize
window.addEventListener('resize', () => {
    // Update wall positions
    World.remove(world, walls);
    walls[0].position.x = window.innerWidth / 2;
    walls[1].position.x = -50;
    walls[2].position.x = window.innerWidth + 50;
    World.add(world, walls);

    // Recalculate toilet bounds
    toiletBounds.x = window.innerWidth - 220;
    toiletBounds.y = window.innerHeight - 150; // Adjusted to match new position
});

// Add clear functionality
clearButton.addEventListener('click', () => {
    const bodies = world.bodies.filter(body => body.element);
    bodies.forEach(body => {
        if (body.element) {
            body.element.remove();
        }
        World.remove(world, body);
    });
    collectedCount = 0;
    counterElement.textContent = '0';
    currentSpawnRate = progressionConfig.baseSpawnRate;
    currentBaseSize = progressionConfig.baseSize;
    updateSpawnRate();
});

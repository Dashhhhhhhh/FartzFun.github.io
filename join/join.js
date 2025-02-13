// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Runner = Matter.Runner,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

// create an engine
var engine = Engine.create();

// create a renderer with proper scaling
var render = Render.create({
    element: document.body,
    canvas: document.getElementById('poopCanvas'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'rgb(0, 0, 0)',
        pixelRatio: window.devicePixelRatio // Add pixel ratio support
    }
});

// ensure canvas has correct dimensions
render.canvas.width = window.innerWidth * window.devicePixelRatio;
render.canvas.height = window.innerHeight * window.devicePixelRatio;
render.canvas.style.width = window.innerWidth + 'px';
render.canvas.style.height = window.innerHeight + 'px';

// ensure canvas receives mouse events for dragging
render.canvas.style.pointerEvents = 'auto';

// function to create ground and walls
function createBounds() {
    var ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 2, { 
        isStatic: true,
        friction: 1,
        restitution: 0.2,
        render: { visible: false },
        slop: 0
    });
    var leftWall = Bodies.rectangle(0, window.innerHeight / 2, 2, window.innerHeight, { 
        isStatic: true,
        friction: 1,
        render: { visible: false },
        slop: 0
    });
    var rightWall = Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 2, window.innerHeight, { 
        isStatic: true,
        friction: 1,
        render: { visible: false },
        slop: 0
    });
    return [ground, leftWall, rightWall];
}

// add all of the bodies to the world
World.add(engine.world, createBounds());

// add mouse control with proper scaling
var mouse = Mouse.create(render.canvas);
mouse.pixelRatio = window.devicePixelRatio; // Set correct pixel ratio for mouse
var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.3,
        damping: 0.1,
        angularStiffness: 0.1,
        render: { visible: false }
    }
});
World.add(engine.world, mouseConstraint);

// Track last few mouse positions for better velocity calculation
let mousePositions = [];
const MAX_POSITIONS = 5;

render.canvas.addEventListener('mousemove', (e) => {
    mousePositions.push({
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
    });
    if (mousePositions.length > MAX_POSITIONS) {
        mousePositions.shift();
    }
});

// Add throw velocity on release with improved calculation
Matter.Events.on(mouseConstraint, 'enddrag', function(event) {
    if (event.body && mousePositions.length >= 2) {
        const lastPos = mousePositions[mousePositions.length - 1];
        const prevPos = mousePositions[0];
        const timeDiff = lastPos.time - prevPos.time;
        
        if (timeDiff < 100) { // Only apply velocity for quick movements
            const velocityMultiplier = 1; // Increased multiplier for more noticeable throws
            const velocity = {
                x: ((lastPos.x - prevPos.x) / timeDiff) * velocityMultiplier,
                y: ((lastPos.y - prevPos.y) / timeDiff) * velocityMultiplier
            };
            Matter.Body.setVelocity(event.body, velocity);
        }
    }
    mousePositions = []; // Clear positions array after throw
});

// keep the mouse in sync with rendering
render.mouse = mouse;

// update bounds on window resize with proper scaling
window.addEventListener('resize', function() {
    // Store existing bodies except boundaries
    const bodies = Matter.Composite.allBodies(engine.world).filter(body => !body.isStatic);
    
    // Update canvas dimensions
    render.canvas.width = window.innerWidth * window.devicePixelRatio;
    render.canvas.height = window.innerHeight * window.devicePixelRatio;
    render.canvas.style.width = window.innerWidth + 'px';
    render.canvas.style.height = window.innerHeight + 'px';
    
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    
    // Update mouse scaling
    mouse.pixelRatio = window.devicePixelRatio;
    
    // Remove old boundaries only
    const boundaries = Matter.Composite.allBodies(engine.world).filter(body => body.isStatic);
    boundaries.forEach(boundary => World.remove(engine.world, boundary));
    
    // Add new boundaries
    World.add(engine.world, createBounds());

    // Remove old toilet sensor and add new one
    const oldToilet = Matter.Composite.allBodies(engine.world)
        .find(body => body.label === 'toilet');
    if (oldToilet) {
        World.remove(engine.world, oldToilet);
    }
    World.add(engine.world, createToiletSensor());
});

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// function to spawn objects
function spawnObject() {
    var x = Math.random() * (window.innerWidth - 40) + 20; // Keep away from edges
    var y = 0;
    var size = Math.random() * 20 + 10;
    var object = Bodies.circle(x, y, size, {
        restitution: 0.3,
        friction: 0.5,
        frictionAir: 0.002,  // Add air friction
        density: 0.001,
        slop: 0,
        inertia: Infinity,  // Prevent rotation-induced sliding
        render: {
            fillStyle: '#8B4513'  // Brown color
        }
    });
    World.add(engine.world, object);
}

// spawn objects at intervals
setInterval(spawnObject, 3000);  // Changed from 1000 to 3000ms

// modify engine settings for better physics
engine.world.gravity.y = 0.3;
engine.world.gravity.x = 0;  // Ensure no horizontal gravity
engine.world.gravity.scale = 0.001;
engine.constraintIterations = 10;
engine.positionIterations = 12;
engine.velocityIterations = 12;

// Set global air friction
engine.world.airFriction = 1;

// Add toilet sensor
function createToiletSensor() {
    const toiletSize = 200;
    // Create the top sensor only
    const topSensor = Bodies.rectangle(
        window.innerWidth - (toiletSize / 1.5),
        window.innerHeight - (toiletSize * 0.65),  // Changed from toiletSize to toiletSize * 0.85
        toiletSize * 0.6,
        20,
        {
            isSensor: true,
            isStatic: true,
            render: { visible: false },
            label: 'toilet-sensor'
        }
    );
    return topSensor;
}

// Add toilet sensor to world
World.add(engine.world, createToiletSensor());

// Counter variable
let toiletCounter = 0;

// Update counter with animation
function updateCounter() {
    const counter = document.getElementById('toilet-counter');
    counter.textContent = toiletCounter;
    counter.classList.remove('counter-bump');
    void counter.offsetWidth; // Trigger reflow
    counter.classList.add('counter-bump');
}

// Collision detection for toilet
Matter.Events.on(engine, 'collisionStart', function(event) {
    event.pairs.forEach((pair) => {
        if (pair.bodyA.label === 'toilet-sensor' || pair.bodyB.label === 'toilet-sensor') {
            const ball = pair.bodyA.label === 'toilet-sensor' ? pair.bodyB : pair.bodyA;
            const sensor = pair.bodyA.label === 'toilet-sensor' ? pair.bodyA : pair.bodyB;
            
            // Check if ball is above sensor when collision occurs
            if (ball.position.y < sensor.position.y) {
                World.remove(engine.world, ball);
                toiletCounter++;
                updateCounter();
            }
        }
    });
});

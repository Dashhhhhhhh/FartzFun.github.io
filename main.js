document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.text-container');
    const spinningText = document.querySelector('.spinning-text');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function setTranslate(xPos, yPos) {
        xOffset = xPos;
        yOffset = yPos;
        container.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        const clickTarget = e.target;
        // Allow dragging when clicking the container or any child element
        if (container.contains(clickTarget) || container === clickTarget) {
            isDragging = true;
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            setTranslate(currentX, currentY);
        }
    }

    // Mouse events - attach to both container and spinning text
    container.addEventListener('mousedown', dragStart);
    spinningText.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Touch events - attach to both container and spinning text
    container.addEventListener('touchstart', dragStart);
    spinningText.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    // NEW CODE: Add Fart Counter System

    // Initialize counters
    let fartCount = 0;
    let recentFarts = [];
    let gasVolume = 0;
    let carbonFootprint = 0;
    let soundLevel = 0;

    // Get elements
    const fartCountEl = document.getElementById('fartCount');
    const fartRateEl = document.getElementById('fartRate');
    const gasVolumeEl = document.getElementById('gasVolume');
    const carbonFootprintEl = document.getElementById('carbonFootprint');
    const soundLevelEl = document.getElementById('soundLevel');
    const fartButton = document.getElementById('fartButton');

    // Fart sound effects array
    const fartSounds = [
        'media/fart1.mp3',
        'media/fart2.mp3',
        'media/fart3.mp3',
        'media/fart4.mp3',
        'media/fart5.mp3'
    ];

    // Create audio objects 
    const audioPool = fartSounds.map(sound => {
        try {
            const audio = new Audio(sound);
            return audio;
        } catch (e) {
            console.log("Failed to load sound:", sound);
            // Return a placeholder audio object that won't break things
            return { play: () => Promise.resolve() };
        }
    });

    // Random number helper
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Play random fart sound
    function playRandomFartSound() {
        const randomIndex = Math.floor(Math.random() * audioPool.length);

        // Try to play the sound
        try {
            const sound = audioPool[randomIndex];
            sound.currentTime = 0;
            sound.volume = randomInRange(0.5, 1.0);
            sound.playbackRate = randomInRange(0.8, 1.2);
            sound.play().catch(e => console.log("Error playing sound:", e));
        } catch (e) {
            console.log("Failed to play sound");
        }
    }

    // Update fart rate
    function updateFartRate() {
        const now = Date.now();
        // Filter farts from last minute
        recentFarts = recentFarts.filter(timestamp => now - timestamp < 60000);
        // Update rate display
        const rate = recentFarts.length;
        fartRateEl.textContent = `${rate} FPM (Farts Per Minute)`;
    }

    // Generate realistic-looking statistics
    function generateFartStats() {
        // Gas volume: 17-100 cubic cm per fart
        const newGas = Math.floor(randomInRange(17, 100));
        gasVolume += newGas;

        // Carbon: 0.2-1.5g CO2 equivalent per fart, convert to kg
        const newCarbon = randomInRange(0.0002, 0.0015);
        carbonFootprint += newCarbon;

        // Sound level: 20-80 dB randomly
        soundLevel = Math.floor(randomInRange(20, 80));

        // Update displays
        gasVolumeEl.textContent = gasVolume.toLocaleString();
        carbonFootprintEl.textContent = carbonFootprint.toFixed(4);
        soundLevelEl.textContent = soundLevel;
    }

    // Create particle explosion effect
    function createFartParticles(x, y) {
        const colors = ['#8B4513', '#A52A2A', '#5F4B32', '#654321', '#7B3F00'];
        const particleCount = 20 + Math.floor(Math.random() * 30); // 20-50 particles

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'fart-particle';

            // Random size
            const size = 3 + Math.random() * 7;

            // Random color
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Set styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            document.body.appendChild(particle);

            // Animate the particle
            let posX = x;
            let posY = y;
            let opacity = 1;
            let lifespan = 50 + Math.random() * 100; // frames

            function animateParticle() {
                lifespan--;
                if (lifespan <= 0) {
                    particle.remove();
                    return;
                }

                // Move
                posX += vx;
                posY += vy;

                // Fade
                opacity -= 0.01;

                // Apply
                particle.style.left = `${posX}px`;
                particle.style.top = `${posY}px`;
                particle.style.opacity = Math.max(0, opacity);

                requestAnimationFrame(animateParticle);
            }

            requestAnimationFrame(animateParticle);
        }
    }

    // Fart action
    function fart(clientX, clientY) {
        // Update counter
        fartCount++;
        fartCountEl.textContent = fartCount.toLocaleString();

        // Track timestamp for rate calculation
        recentFarts.push(Date.now());
        updateFartRate();

        // Generate stats
        generateFartStats();

        // Play sound
        playRandomFartSound();

        // Visual effect - particle explosion
        createFartParticles(clientX, clientY);

        // Shake the screen a bit
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 500);
    }

    // Add event listener to fart button
    if (fartButton) {
        fartButton.addEventListener('click', (e) => {
            const rect = fartButton.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            fart(x, y);
        });
    }

    // Click anywhere to fart
    document.addEventListener('click', (e) => {
        // Don't trigger on button or dragging
        if (e.target !== fartButton && !isDragging) {
            fart(e.clientX, e.clientY);
        }
    });

    // Add chat toggle functionality
    const chatToggle = document.querySelector('.toggle-chat-btn');
    const chatContainer = document.querySelector('.chat-container');

    if (chatToggle && chatContainer) {
        chatToggle.addEventListener('click', () => {
            chatContainer.classList.toggle('chat-minimized');
        });
    }

    // Update rate display every few seconds
    setInterval(updateFartRate, 5000);
});

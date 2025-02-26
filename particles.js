// Interactive particle system
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 50;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Initialize particles
        this.init();
        
        // Start animation loop
        this.animate();
    }
    
    init() {
        // Create particle container
        this.container = document.createElement('div');
        this.container.className = 'particle-container';
        document.body.appendChild(this.container);
        
        // Create initial particles
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        // Create DOM element
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 5px and 15px
        const size = 5 + Math.random() * 10;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        // Random speed
        const speedX = (Math.random() - 0.5) * 2;
        const speedY = (Math.random() - 0.5) * 2;
        
        // Random opacity
        const opacity = 0.3 + Math.random() * 0.5;
        
        // Random hue for color
        const hue = Math.floor(Math.random() * 360);
        
        // Apply styles
        particle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        particle.style.opacity = opacity;
        particle.style.backgroundColor = `hsla(${hue}, 100%, 70%, 0.8)`;
        
        // Add to container
        this.container.appendChild(particle);
        
        // Store particle data
        this.particles.push({
            element: particle,
            x,
            y,
            speedX,
            speedY,
            size,
            hue
        });
    }
    
    update() {
        const mouseInfluenceRadius = 150;
        
        this.particles.forEach(particle => {
            // Calculate distance to mouse
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Update position based on speed
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Mouse influence - particles move away from cursor
            if (distance < mouseInfluenceRadius) {
                const force = (1 - distance / mouseInfluenceRadius) * 5;
                particle.x -= (dx / distance) * force;
                particle.y -= (dy / distance) * force;
            }
            
            // Boundaries check
            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.speedX = -particle.speedX;
            }
            
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.speedY = -particle.speedY;
            }
            
            // Apply updated position
            particle.element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
            
            // Slowly change color
            particle.hue = (particle.hue + 0.2) % 360;
            particle.element.style.backgroundColor = `hsla(${particle.hue}, 100%, 70%, 0.8)`;
        });
    }
    
    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
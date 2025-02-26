// Enhanced 3D scene with more visual effects
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
    alpha: true
});

// Setup renderer with improved quality
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
camera.position.setZ(30);

// Add OrbitControls from a CDN
const controlsScript = document.createElement('script');
controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
document.head.appendChild(controlsScript);

let controls;
controlsScript.onload = () => {
    // Create OrbitControls once script is loaded
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
};

// Update size calculation function
function calculateTextSize() {
    // Base size on viewport width, with a minimum size, and reduce by 20%
    return Math.max(window.innerWidth / 100, 5) * 0.8;
}

// Store font for reuse
let loadedFont = null;

// Materials with improved visuals
const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0x222222,
    envMapIntensity: 1
});

// Load environment map for reflections
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('https://threejs.org/examples/textures/cube/SwedishRoyalCastle/');
const textureCube = cubeTextureLoader.load([
    'px.jpg', 'nx.jpg',
    'py.jpg', 'ny.jpg',
    'pz.jpg', 'nz.jpg'
]);
scene.environment = textureCube;
textMaterial.envMap = textureCube;

const text = "WELCOME TO FARTZ.FUN";

let angle = 0;
let hue = 0;
const radius = 10; // Distance from center

// Load font with error handling
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', 
    function (font) {
        loadedFont = font; // Store font for reuse
        createText(font);
    },
    // onProgress callback
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // onError callback
    function (err) {
        console.error('Font loading error:', err);
    }
);

// Create text mesh with improved geometry
function createText(font) {
    const textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: calculateTextSize(),
        height: 2, // Increased depth
        curveSegments: 12, // Higher quality
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 8
    });

    textGeometry.center();
    
    // Remove existing text mesh if it exists
    const oldMesh = scene.children.find(child => child.type === 'Mesh');
    if (oldMesh) {
        scene.remove(oldMesh);
        oldMesh.geometry.dispose();
    }
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.castShadow = true;
    textMesh.receiveShadow = true;
    scene.add(textMesh);

    // Adjust camera
    camera.position.z = calculateTextSize() * 8; // Adjust camera based on text size
    camera.lookAt(textMesh.position);
    
    // Add floating particles around the text
    addParticles(textMesh);
}

// Create floating particles around the text
function addParticles(textMesh) {
    if (!textMesh) return;
    
    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    
    // Create positions array for particles
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const textBox = new THREE.Box3().setFromObject(textMesh);
    const textSize = new THREE.Vector3();
    textBox.getSize(textSize);
    
    // Create particles in a volume around the text
    for (let i = 0; i < particleCount; i++) {
        // Position: random sphere around the text
        const radius = 10 + Math.random() * 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Color: random color with bias towards hues that complement the scene
        const hue = Math.random() * 0.2 + 0.6; // Blue-purple range
        const saturation = 0.5 + Math.random() * 0.5;
        const lightness = 0.5 + Math.random() * 0.5;
        
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Size: random within range
        sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom shader material for particles
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pixelRatio: { value: window.devicePixelRatio }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vColor = color;
                
                // Add subtle animation based on time and position
                vec3 pos = position;
                float freq = position.x * 0.02 + position.y * 0.01 + position.z * 0.03;
                pos.x += sin(time * 0.5 + freq) * 1.0;
                pos.y += cos(time * 0.4 + freq) * 1.0;
                pos.z += sin(time * 0.3 + freq) * 1.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                // Create a circular particle
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                if (dist > 0.5) discard;
                
                // Soft edge glow
                float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });
    
    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);
    
    // Store reference to time uniform and particles for animation
    particles.material.uniforms.time.value = 0;
    scene.userData.particles = particles;
}

// Add lights with improved settings
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(20, 20, 20);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 512;
pointLight.shadow.mapSize.height = 512;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(pointLight, ambientLight);

// Add subtle colored lights for atmosphere
const purpleLight = new THREE.PointLight(0x9933ff, 1, 50);
purpleLight.position.set(-15, 10, 10);
const blueLight = new THREE.PointLight(0x3366ff, 1, 50);
blueLight.position.set(15, -10, -10);
scene.add(purpleLight, blueLight);

// Animation loop
let time = 0;
function animate() {
    time += 0.01;
    requestAnimationFrame(animate);
    
    // Update orbit controls if available
    if (controls) {
        controls.update();
    }
    
    const textMesh = scene.children.find(child => child.type === 'Mesh');
    if (textMesh) {
        // Subtle floating animation
        textMesh.position.y = Math.sin(time * 0.5) * 0.5;
        
        // Rainbow color effect
        hue += 0.002;
        if (hue > 1) hue = 0;
        textMaterial.color.setHSL(hue, 0.8, 0.5);
        textMaterial.emissive.setHSL(hue, 0.9, 0.2);
    }
    
    // Animate particles
    if (scene.userData.particles) {
        scene.userData.particles.material.uniforms.time.value = time;
    }
    
    // Move lights in circular pattern
    purpleLight.position.x = Math.sin(time * 0.3) * 20;
    purpleLight.position.z = Math.cos(time * 0.3) * 20;
    blueLight.position.x = Math.sin(time * 0.4 + Math.PI) * 20;
    blueLight.position.z = Math.cos(time * 0.4 + Math.PI) * 20;
    
    renderer.render(scene, camera);
}

// Update resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Recreate text with new size if font is loaded
    if (loadedFont) {
        createText(loadedFont);
    }
    
    // Update particle shader uniform
    if (scene.userData.particles) {
        scene.userData.particles.material.uniforms.pixelRatio.value = window.devicePixelRatio;
    }
});

animate();

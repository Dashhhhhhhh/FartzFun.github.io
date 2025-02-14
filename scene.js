const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
    alpha: true
});

// Setup renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Add OrbitControls from a CDN
const controlsScript = document.createElement('script');
controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
document.head.appendChild(controlsScript);

controlsScript.onload = () => {
    // Create OrbitControls once script is loaded
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
};

// Update size calculation function
function calculateTextSize() {
    // Base size on viewport width, with a minimum size, and reduce by 20%
    return Math.max(window.innerWidth / 100, 5) * 0.8;
}

// Store font for reuse
let loadedFont = null;

const loader = new THREE.FontLoader();
const textMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x000000,
    specular: 0xffffff,
    shininess: 100
});
const text = "WELCOME TO FARTZ.FUN";

let angle = 0;
let hue = 0;
const radius = 10; // Distance from center

loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font) {
    loadedFont = font; // Store font for reuse
    createText(font);
});

function createText(font) {
    const textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: calculateTextSize(),
        height: 0.5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 0.05
    });

    textGeometry.center();
    
    // Remove existing text mesh if it exists
    const oldMesh = scene.children.find(child => child.type === 'Mesh');
    if (oldMesh) {
        scene.remove(oldMesh);
        oldMesh.geometry.dispose();
    }
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(textMesh);

    // Adjust camera
    camera.position.z = calculateTextSize() * 8; // Adjust camera based on text size
    camera.lookAt(textMesh.position);
}

// Add lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const textMesh = scene.children.find(child => child.type === 'Mesh');
    if (textMesh) {
        // Simple rotation
        textMesh.rotation.y += 0.01;
        
        // Rainbow color effect
        hue += 0.005;
        if (hue > 1) hue = 0;
        textMaterial.color.setHSL(hue, 1, 0.5);
    }
    
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
});

animate();

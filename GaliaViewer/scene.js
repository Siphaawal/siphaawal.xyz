// Scene Management - 3D scene setup, rendering, and animation
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import { GlobalState } from './state.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.systemContainers = [];
        this.systemMeshes = [];
        this.planetMeshes = [];
        this.allClickableObjects = []; // All objects that can be clicked
        this.raycaster = new THREE.Raycaster();

        this.MAX_DISTANCE = 1000; // Increased to match original far plane
        this.MIN_DISTANCE = 10;

        // Performance optimization variables
        this.lastFrameTime = 0;
        this.targetFPS = 30; // Limit to 30 FPS for better performance
        this.frameInterval = 1000 / this.targetFPS;

        // Navigation controls
        this.moveSpeed = 5;
        this.minMoveSpeed = 2;
        this.maxMoveSpeed = 50;
        this.speedMultiplier = 1;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.createStarfield();
        this.createSystems();
        this.setupEventListeners();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            5000
        );
        // Position camera like the original working code
        this.camera.position.set(0, 0, 300);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 5000; // Increased max zoom out
        this.controls.minDistance = 0.5;  // Decreased min zoom in
        this.controls.maxPolarAngle = Math.PI;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        this.controls.enableZoom = true;
        this.controls.zoomSpeed = 1.5;  // Increased zoom speed
        this.controls.enablePan = true;
        this.controls.panSpeed = 1.0;
        this.controls.screenSpacePanning = true;
        this.updateControlSensitivity();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
    }

    updateControlSensitivity() {
        const dist = this.camera.position.length();
        const baseSensitivity = Math.max(0.5, Math.min(3.0, dist / 100));
        
        // Dynamic sensitivity based on distance
        this.controls.rotateSpeed = baseSensitivity;
        this.controls.panSpeed = baseSensitivity * 0.8;
        
        // Enhanced zoom sensitivity that scales with distance
        const zoomFactor = Math.max(1.0, Math.log10(dist));
        this.controls.zoomSpeed = baseSensitivity * zoomFactor;
        
        // Update frustum to handle extreme zoom levels
        this.camera.near = Math.min(0.1, dist * 0.001);
        this.camera.far = Math.max(5000, dist * 10);
        this.camera.updateProjectionMatrix();
    }

    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 800; // Reduced from 2000 for better performance
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // Random position in a large sphere
            const radius = 800 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = radius * Math.cos(phi);

            // Random star colors (slight variations of white/blue/yellow)
            const colorVar = Math.random();
            if (colorVar < 0.7) {
                // White stars
                starColors[i * 3] = 0.8 + Math.random() * 0.2;
                starColors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
                starColors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else if (colorVar < 0.85) {
                // Blue stars
                starColors[i * 3] = 0.6 + Math.random() * 0.2;
                starColors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
                starColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
            } else {
                // Yellow/orange stars
                starColors[i * 3] = 0.9 + Math.random() * 0.1;
                starColors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
                starColors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
            }

            starSizes[i] = Math.random() * 2 + 0.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);
    }

    createSystems() {
        const systems = GlobalState.systems;

        // Calculate coordinate bounds like the original code
        const coords = systems.map(s => s.coordinates || [0,0]);
        let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
        coords.forEach(([x,y]) => {
            if(x < minX) minX = x;
            if(x > maxX) maxX = x;
            if(y < minY) minY = y;
            if(y > maxY) maxY = y;
        });

        if (minX === Infinity) {
            minX = -50; maxX = 50; minY = -50; maxY = 50;
        }

        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;
        const SPREAD = 2.5; // Match original spread
        const scale = (80 * SPREAD) / Math.max(rangeX, rangeY);

        console.log(`Coordinate bounds: X[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
        console.log(`Scale factor: ${scale.toFixed(2)}`);

        systems.forEach((system, index) => {
            const sysObj = this.createSystemObject(system, index, {
                minX, maxX, minY, maxY, scale
            });
            this.systemContainers.push(sysObj);
            this.scene.add(sysObj.containerGroup);
        });

        console.log(`Created ${this.systemContainers.length} system objects with proper coordinate scaling`);
    }

    createSystemObject(system, index, coordParams) {
        const containerGroup = new THREE.Group();

        // Use the original coordinate calculation method
        const [xRaw, yRaw] = system.coordinates || [0, 0];
        const { minX, maxX, minY, maxY, scale } = coordParams;

        const x = (xRaw - (minX + maxX)/2) * scale;
        const y = (yRaw - (minY + maxY)/2) * scale;
        const z = (Math.sin(index * 3.14/10) * 6); // slight z variation like original

        containerGroup.position.set(x, y, z);

        // Debug logging for first few systems
        if (index < 5) {
            console.log(`System ${system.name}: raw[${xRaw.toFixed(2)}, ${yRaw.toFixed(2)}] -> pos[${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`);
        }

        // Create smaller, glowier star with lower geometry detail for performance
        const starGeometry = new THREE.SphereGeometry(0.3, 6, 4); // Much smaller star, lower poly

        // Use original faction colors
        const factionColors = {
            'MUD': 0xff4d4d,   // red
            'ONI': 0x4d6bff,   // blue
            'UST': 0xffd24d    // yellow
        };
        const defaultColor = 0x88c0ff;

        // Choose color by faction like original
        const faction = (system.faction || system.closestFaction || system.controllingFaction || '').toString().toUpperCase();
        const color = factionColors[faction] || defaultColor;

        // Create glowing material with higher emissive intensity
        const emissiveColor = new THREE.Color(color).multiplyScalar(0.8);
        const starMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: emissiveColor,
            metalness: 0.0,
            roughness: 0.0,
            transparent: true,
            opacity: 1.0
        });

        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        // Ensure star mesh has complete metadata and is registered for raycasting
        starMesh.userData = { 
            system: system, 
            type: 'star',
            name: system.name || system.key || 'Unknown System'
        };
        // Register for raycasting and click handling
        this.systemMeshes.push(starMesh);
        this.allClickableObjects.push(starMesh);
        containerGroup.add(starMesh);

        // Create planets
        const planets = system.planets || [];
        const planetMeshes = [];

        planets.forEach((planet, planetIndex) => {
            const planetObj = this.createPlanetObject(planet, planetIndex);
            planetMeshes.push(planetObj);

            // Add planet to clickable objects and mesh arrays
            this.planetMeshes.push(planetObj.mesh);
            this.allClickableObjects.push(planetObj.mesh);

            // Store reference to parent system in planet
            planetObj.mesh.userData.parentSystem = system;

            containerGroup.add(planetObj.group);

            // Create orbit line for each planet - matching smaller orbits
            const orbitRadius = 0.4 + planetIndex * 0.15;
            this.createOrbitLine(containerGroup, orbitRadius);
        });

        return {
            containerGroup,
            starMesh,
            planetMeshes,
            system
        };
    }

    createPlanetObject(planet, index) {
        const group = new THREE.Group();

        // Even smaller orbits and more compact spacing
        const orbitRadius = 0.3 + index * 0.12;
        const angle = (index / 8) * Math.PI * 2;

        // Create much smaller planets with better detail
        const baseSize = 0.03;  // Base size reduced by half
        const planetGeometry = new THREE.SphereGeometry(baseSize + Math.random() * 0.02, 8, 6);
        
        // Enhanced material with emissive glow based on type
        const planetColor = this.getPlanetColor(planet);
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: planetColor,
            emissive: planetColor,
            emissiveIntensity: 0.2,
            shininess: 30,
            specular: 0x444444
        });

        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        planetMesh.userData = {
            planet: planet,
            type: 'planet',
            orbitRadius,
            orbitSpeed: 0.003 + (index * 0.001), // Speed based on distance from star
            rotationSpeed: 0.002 + Math.random() * 0.002 // Slower rotation
        };

        // Slightly tighter vertical distribution
        planetMesh.position.set(
            Math.cos(angle) * orbitRadius,
            (Math.random() - 0.5) * 0.2, // Reduced vertical spread
            Math.sin(angle) * orbitRadius
        );

        group.add(planetMesh);

        return { group, mesh: planetMesh };
    }


    getPlanetColor(planet) {
        if (!planet || !planet.type) {
            console.log('Planet missing type:', planet);
            return 0x888888;
        }

        // Normalize the type to string and lowercase
        const type = String(planet.type).toLowerCase().trim();
        console.log('Normalized planet type:', type);

        const typeColors = {
            // Rocky/Terrestrial types - browns and greys
            'terrestrial': 0xA0522D,   // Sienna
            'rocky': 0x8B4513,         // Saddle Brown
            'barren': 0x808080,        // Gray
            'rock': 0x8B4513,          // Saddle Brown
            'terra': 0xA0522D,         // Sienna
            '0': 0xA0522D,             // Terrestrial type

            // Hot/Volcanic types - reds and oranges
            'volcanic': 0xFF4500,       // Orange Red
            'molten': 0xFF6347,        // Tomato
            'lava': 0xFF4500,          // Orange Red
            'fire': 0xFF6347,          // Tomato
            '3': 0xFF4500,             // Volcanic type

            // Desert types - yellows and tans
            'desert': 0xFFD700,        // Gold
            'arid': 0xDAA520,          // Goldenrod
            'sand': 0xF4A460,          // Sandy Brown
            '5': 0xFFD700,             // Desert type

            // Ice types - whites and light blues
            'ice': 0xE0FFFF,           // Light Cyan
            'frozen': 0xAFEEEE,        // Pale Turquoise
            'tundra': 0xB0E0E6,        // Powder Blue
            'frost': 0xE0FFFF,         // Light Cyan
            '2': 0xE0FFFF,             // Ice type

            // Gas types - blues and purples
            'gas': 0x4169E1,           // Royal Blue
            'gas giant': 0x4169E1,     // Royal Blue
            'gaseous': 0x6495ED,       // Cornflower Blue
            '1': 0x4169E1,             // Gas type

            // Ocean/Water types - blues and greens
            'ocean': 0x00CED1,         // Dark Turquoise
            'aquatic': 0x20B2AA,       // Light Sea Green
            'water': 0x48D1CC,         // Medium Turquoise
            'sea': 0x00CED1,           // Dark Turquoise
            '4': 0x00CED1,             // Ocean type

            // Default color for unknown types
            'unknown': 0x888888        // Gray
        };

        // Try exact match first
        if (typeColors[type]) {
            console.log('Exact type match found:', type, '-> color:', typeColors[type].toString(16));
            return typeColors[type];
        }

        // Try numeric match
        if (!isNaN(type) && typeColors[type]) {
            console.log('Numeric type match found:', type, '-> color:', typeColors[type].toString(16));
            return typeColors[type];
        }

        // Try partial match
        const partialMatch = Object.entries(typeColors).find(([key]) => 
            type.includes(key) || key.includes(type)
        );
        
        if (partialMatch) {
            console.log('Partial type match found:', type, '->', partialMatch[0], '-> color:', partialMatch[1].toString(16));
            return partialMatch[1];
        }

        console.log('No match found for type:', type, 'using default gray');
        return typeColors.unknown;
    }

    createOrbitLine(containerGroup, radius) {
        // Create circular orbit line with fewer segments for performance
        const orbitPoints = [];
        const segments = 24; // Reduced from 64 for better performance

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }

        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x555555,
            transparent: true,
            opacity: 0.25 // Made more subtle
        });

        const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
        containerGroup.add(orbitLine);
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    handleKeyDown(event) {
        // Don't handle keys if user is typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();
        const moveSpeed = 5; // Base movement speed
        const moveVector = new THREE.Vector3();
        
        // Get camera's forward and right vectors for movement relative to camera orientation
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        
        switch (key) {
            case 'w':
                // Move forward in camera's direction
                moveVector.add(forward.multiplyScalar(moveSpeed));
                break;
            case 's':
                // Move backward in camera's direction
                moveVector.add(forward.multiplyScalar(-moveSpeed));
                break;
            case 'a':
                // Move left relative to camera
                moveVector.add(right.multiplyScalar(-moveSpeed));
                break;
            case 'd':
                // Move right relative to camera
                moveVector.add(right.multiplyScalar(moveSpeed));
                break;
            case ' ': // Space bar
                // Move up
                moveVector.y += moveSpeed;
                break;
            case 'shift':
                // Move down
                moveVector.y -= moveSpeed;
                break;
        }

        // Scale movement based on camera distance from origin
        const distanceScale = Math.max(1, this.camera.position.length() / 100);
        moveVector.multiplyScalar(distanceScale);

        // Apply movement to both camera and controls target
        this.camera.position.add(moveVector);
        this.controls.target.add(moveVector);
        this.controls.update();
    }

    handleKeyUp(event) {
        // Handle any key release actions if needed
    }

    startAnimation() {
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();

        // Frame rate limiting for better performance
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            return;
        }
        this.lastFrameTime = currentTime;

        const t = currentTime * 0.001;

        // Update controls
        this.controls.update();
        this.updateControlSensitivity();

        // Animate starfield less frequently for performance
        if (this.starfield && currentTime % 200 < this.frameInterval) {
            const sizes = this.starfield.geometry.attributes.size.array;
            // Only animate every 10th star for performance
            for (let i = 0; i < sizes.length; i += 10) {
                sizes[i] = 0.3 + Math.sin(t * 0.5 + i * 0.05) * 0.2;
            }
            this.starfield.geometry.attributes.size.needsUpdate = true;
        }

        // Animate all connections wormholes
        if (GlobalState.showAllConnectionsMode && GlobalState.allSystemConnections.length > 0) {
            GlobalState.allSystemConnections.forEach(line => {
                if (line.userData.isAllConnectionsWormhole) {
                    const isDirect = line.userData.isDirect;
                    const baseSpeed = isDirect ? 1.0 : 0.5;
                    const phase = t * baseSpeed + line.userData.animationPhase;
                    const pulseIntensity = isDirect ? 0.3 : 0.15;
                    const pulse = Math.sin(phase) * pulseIntensity + (isDirect ? 0.7 : 0.4);
                    line.material.opacity = line.userData.originalOpacity * pulse;

                    if (isDirect) {
                        const hue = (t * 0.3 + line.userData.animationPhase) % 1;
                        const saturation = 0.7 + Math.sin(phase) * 0.2;
                        line.material.color.setHSL(0.6 + hue * 0.2, saturation, 0.5);
                    }
                } else if (line.userData.isAllConnectionsParticles) {
                    const isDirect = line.userData.isDirect;
                    const baseSpeed = isDirect ? 1.5 : 0.8;
                    const phase = t * baseSpeed + line.userData.animationPhase;
                    const pulseIntensity = isDirect ? 0.4 : 0.2;
                    const pulse = Math.sin(phase) * pulseIntensity + (isDirect ? 0.6 : 0.4);
                    line.material.opacity = (isDirect ? 0.8 : 0.6) * pulse;

                    const positions = line.geometry.attributes.position.array;
                    const originalPositions = line.userData.originalPositions || positions.slice();
                    if (!line.userData.originalPositions) {
                        line.userData.originalPositions = positions.slice();
                    }

                    for (let i = 0; i < positions.length; i += 3) {
                        const flowOffset = Math.sin(phase + i * 0.15) * 0.02;
                        positions[i] = originalPositions[i] + flowOffset;
                        positions[i + 1] = originalPositions[i + 1] + Math.cos(phase + i * 0.15) * 0.015;
                        positions[i + 2] = originalPositions[i + 2] + flowOffset;
                    }
                    line.geometry.attributes.position.needsUpdate = true;
                }
            });
        }

        // Animate planets orbiting their stars, rotating, and star pulsing
        this.systemContainers.forEach(sysObj => {
            // Animate planet orbits and rotation
            sysObj.planetMeshes.forEach(planetObj => {
                const planetMesh = planetObj.mesh;
                const userData = planetMesh.userData;

                // Orbit around star
                const orbitAngle = t * userData.orbitSpeed;
                planetMesh.position.x = Math.cos(orbitAngle) * userData.orbitRadius;
                planetMesh.position.z = Math.sin(orbitAngle) * userData.orbitRadius;

                // Rotate planet
                planetMesh.rotation.y += userData.rotationSpeed;
            });

            // Animate star pulsing
            const starMesh = sysObj.starMesh;
            if (starMesh && starMesh.material) {
                const baseIntensity = 0.3;
                const pulseIntensity = Math.sin(t * 2 + sysObj.containerGroup.position.x) * 0.1;
                starMesh.material.emissiveIntensity = baseIntensity + pulseIntensity;
            }
        });

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}
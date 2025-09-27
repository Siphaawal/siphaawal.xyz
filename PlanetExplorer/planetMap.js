// Enhanced 3D star map - fixed CSS selector production bug - v2025-09-26e
// Loads data from window.planetData or JSON/planets.json and renders systems as spheres.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

// Global variables for system isolation
let originalSystemVisibility = [];
let selectedSystemData = null;

// Global function to initialize the 3D map
window.initPlanetMap = async function(){
    // Utility to fetch planet data
    async function loadPlanetData() {
        if (typeof window.planetData !== 'undefined' && window.planetData.mapData) {
            return window.planetData;
        }
        try {
            const res = await fetch('JSON/planets.json');
            if (!res.ok) throw new Error('Failed to fetch planets.json: ' + res.status);
            return await res.json();
        } catch (err) {
            console.error('planetMap: could not load planet data', err);
            return { mapData: [] };
        }
    }

    const data = await loadPlanetData();
    const systems = data.mapData || [];
    console.log('planetMap: loaded systems count =', systems.length);
    // Basic three.js setup
    const container = document.getElementById('planetMap');
    if (!container) return;

    // Add an unobtrusive overlay showing loaded systems count
    const countEl = document.createElement('div');
    countEl.id = 'mapCount';
    countEl.style.position = 'absolute';
    countEl.style.right = '12px';
    countEl.style.top = '12px';
    countEl.style.padding = '6px 10px';
    countEl.style.background = 'rgba(0,0,0,0.6)';
    countEl.style.color = '#c7f9e6';
    countEl.style.borderRadius = '6px';
    countEl.style.fontSize = '12px';
    countEl.style.zIndex = '2000';
    countEl.textContent = `Systems: ${systems.length}`;
    container.style.position = 'relative';
    container.appendChild(countEl);

    // Maximize toggle button
    const maxBtn = document.createElement('button');
    maxBtn.id = 'mapMaxBtn';
    maxBtn.textContent = '⤢';
    maxBtn.title = 'Maximize map';
    maxBtn.style.position = 'absolute';
    maxBtn.style.right = '12px';
    maxBtn.style.top = '44px';
    maxBtn.style.padding = '6px 8px';
    maxBtn.style.background = 'rgba(0,0,0,0.6)';
    maxBtn.style.color = '#fff';
    maxBtn.style.border = 'none';
    maxBtn.style.borderRadius = '6px';
    maxBtn.style.cursor = 'pointer';
    maxBtn.style.zIndex = '2001';
    container.appendChild(maxBtn);

    let isMax = false;
    const originalStyle = { width: container.style.width || '', height: container.style.height || '' };
    function toggleMaximize() {
        if (!isMax) {
            container.style.position = 'fixed';
            container.style.left = '0';
            container.style.top = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.zIndex = '99999';
            maxBtn.textContent = '⤡';
            isMax = true;
        } else {
            container.style.position = 'relative';
            container.style.width = originalStyle.width;
            container.style.height = originalStyle.height;
            container.style.zIndex = '';
            maxBtn.textContent = '⤢';
            isMax = false;
        }
        // trigger resize so renderer updates
        onWindowResize();
    }
    maxBtn.addEventListener('click', toggleMaximize);

    // Labels overlay (for star/planet names when focused)
    const labelsDiv = document.createElement('div');
    labelsDiv.id = 'mapLabels';
    labelsDiv.style.position = 'absolute';
    labelsDiv.style.left = '0';
    labelsDiv.style.top = '0';
    labelsDiv.style.width = '100%';
    labelsDiv.style.height = '100%';
    labelsDiv.style.pointerEvents = 'none';
    labelsDiv.style.zIndex = '2002';
    container.appendChild(labelsDiv);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.05, 1000);
    camera.position.set(0, 0, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    // Force a conservative pixel ratio for performance on high-DPI displays
    renderer.setPixelRatio(1);
    // Add grab cursor for better UX
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Allow zooming in extremely close to inspect a system
    controls.minDistance = 0.001;
    controls.maxDistance = 500;
    // Improve responsiveness
    controls.enablePan = true;
    controls.panSpeed = 1.0;
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;

    // Create animated starfield background
    function createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // Random positions in a large sphere
            const radius = 400 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Random star colors (white, blue, yellow, red)
            const starColors = [
                [1, 1, 1],     // White
                [0.8, 0.9, 1], // Blue-white
                [1, 1, 0.8],   // Yellow
                [1, 0.7, 0.7]  // Red
            ];
            const colorChoice = starColors[Math.floor(Math.random() * starColors.length)];
            colors[i * 3] = colorChoice[0];
            colors[i * 3 + 1] = colorChoice[1];
            colors[i * 3 + 2] = colorChoice[2];

            // Random sizes for twinkling effect
            sizes[i] = Math.random() * 2 + 1;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: false,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Store original sizes for twinkling animation
        const originalSizes = new Float32Array(sizes);

        return { stars, geometry: starGeometry, material: starMaterial, sizes, originalSizes };
    }

    const starfield = createStarfield();

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(1,1,1);
    scene.add(dir);

    // Helpers
    const systemGroup = new THREE.Group();
    scene.add(systemGroup);

    // If there's no data, show an empty state message
    if (!systems.length) {
        container.innerHTML = '<div style="padding:28px;color:#c7f9e6;text-align:center">No star systems available to render.</div>';
        console.warn('planetMap: no systems found in planets.json');
        return;
    }

    // Map coordinate scaling - JSON coords can be large or small; normalize to fit view
    const coords = systems.map(s => s.coordinates || [0,0]);
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    coords.forEach(([x,y])=>{ if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; });
    if (minX===Infinity) { minX=-50; maxX=50; minY=-50; maxY=50; }
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    // SPREAD lets us expand the layout when systems are clustered. Increase to spread systems farther apart.
    const SPREAD = 2.5;
    // Performance and motion tuning (very slow, small visuals)
    const PLANET_SPEED_BASE = 0.0001; // base orbit speed (much smaller = much slower)
    const SYSTEM_ROTATION_FACTOR = 0.001; // very slow whole-map rotation

    // Performance optimization flags
    let isAnimationPaused = false;
    let lastFrameTime = 0;
    const TARGET_FPS = 30; // Target 30 FPS instead of 60 for better performance
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    const scale = (80 * SPREAD) / Math.max(rangeX, rangeY); // fit into ~160 units scaled by SPREAD

    // Increase camera far plane and move camera back to accommodate larger spread
    camera.far = 5000;
    camera.near = 0.005; // allow very close-up viewing
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, Math.max(120 * SPREAD, 200));
    // Allow controls to zoom out further with the increased spread
    controls.maxDistance = 500 * SPREAD;

    // Create spheres for systems (smaller base size) and set up faction colors
    const systemMeshes = [];
    // Lower-poly sphere for performance; fewer segments to keep stars small
    const sphereGeo = new THREE.SphereGeometry(1.0, 6, 4);
    const factionColors = {
        'MUD': 0xff4d4d,   // red
        'ONI': 0x4d6bff,   // blue
        'UST': 0xffd24d    // yellow
    };
    const defaultColor = 0x88c0ff;

    // We'll create a container group per system so planets can orbit locally
    const systemContainers = [];
    systems.forEach((sys, idx) => {
        const [xRaw,yRaw] = sys.coordinates || [0,0];
        const x = (xRaw - (minX + maxX)/2) * scale;
        const y = (yRaw - (minY + maxY)/2) * scale;
        const z = (Math.sin(idx*3.14/10) * 6); // slight z variation

        // choose color by faction (fall back to default)
        const faction = (sys.faction || sys.closestFaction || sys.controllingFaction || '').toString().toUpperCase();
        const color = factionColors[faction] || defaultColor;

        // create a container for this system
        const containerGroup = new THREE.Group();
        containerGroup.position.set(x, y, z);

        // star mesh at container origin with glowing effect
        const emissiveColor = new THREE.Color(color).multiplyScalar(0.3);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: emissiveColor,
            metalness: 0.1,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const starMesh = new THREE.Mesh(sphereGeo, mat);
        starMesh.userData = {
            system: sys,
            originalColor: color,
            emissiveColor: emissiveColor,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.5 + Math.random() * 1.0
        };
        const sScale = (sys.isKing ? 2.0 : (sys.star?.scale || 0.8));
        // Make stars slightly larger for better glow effect
        starMesh.scale.setScalar(0.22 * sScale);

        // Create glow effect using a larger transparent sphere
        const glowGeo = new THREE.SphereGeometry(1.0, 8, 6);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.scale.setScalar(0.35 * sScale);
        glowMesh.userData = {
            isGlow: true,
            pulsePhase: starMesh.userData.pulsePhase,
            pulseSpeed: starMesh.userData.pulseSpeed
        };

        // add to raycastable list so hover & clicks work (only the main star, not glow)
        systemMeshes.push(starMesh);
        containerGroup.add(starMesh);
        containerGroup.add(glowMesh);

        // (Removed faction-colored orbit rings per user request)

        // planets: create small spheres placed on their orbit with initial angle
        const planetMeshes = [];
        if (sys.planets && sys.planets.length) {
            sys.planets.forEach((p, pIdx) => {
                const orbit = p.orbit || (1 + pIdx * 0.6);
                const angleDeg = (typeof p.angle === 'number') ? p.angle : (pIdx * 45);
                const angle = (angleDeg % 360) * Math.PI / 180;
                const orbitRadius = Math.max(orbit * 0.45, 0.08); // much closer orbits (but keep a minimum)

                // Make planets very small and lower-poly for performance
                const planetGeo = new THREE.SphereGeometry(0.035, 8, 6);

                // Create varied planet colors and materials based on type
                const planetTypes = [
                    { color: 0x4169E1, emissive: 0x001133, name: 'Ocean' },    // Blue ocean world
                    { color: 0xDEB887, emissive: 0x332211, name: 'Desert' },   // Sandy desert world
                    { color: 0x228B22, emissive: 0x003300, name: 'Forest' },   // Green forest world
                    { color: 0x8B0000, emissive: 0x330000, name: 'Volcanic' }, // Red volcanic world
                    { color: 0xF0F8FF, emissive: 0x111133, name: 'Ice' },      // White ice world
                    { color: 0x696969, emissive: 0x111111, name: 'Rocky' }     // Gray rocky world
                ];

                const planetType = planetTypes[pIdx % planetTypes.length];
                const planetMat = new THREE.MeshStandardMaterial({
                    color: planetType.color,
                    emissive: planetType.emissive,
                    roughness: 0.7,
                    metalness: 0.1
                });
                const planetMesh = new THREE.Mesh(planetGeo, planetMat);

                // Create atmospheric glow for planets
                const atmosphereGeo = new THREE.SphereGeometry(0.045, 8, 6);
                const atmosphereMat = new THREE.MeshBasicMaterial({
                    color: planetType.color,
                    transparent: true,
                    opacity: 0.2,
                    side: THREE.BackSide
                });
                const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
                atmosphereMesh.position.copy(planetMesh.position);

                // initial position relative to system origin
                planetMesh.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius);
                atmosphereMesh.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius);

                // much slower orbit speeds for performance and calmer visuals
                planetMesh.userData = {
                    parentSystemIndex: idx,
                    orbitRadius,
                    orbitSpeed: PLANET_SPEED_BASE / Math.max(orbit, 0.5),
                    angle,
                    name: p.name || (`Planet ${pIdx+1}`),
                    rotationSpeed: 0.01 + Math.random() * 0.02, // Individual rotation speed
                    planetType: planetType.name,
                    atmosphere: atmosphereMesh
                };

                containerGroup.add(planetMesh);
                containerGroup.add(atmosphereMesh);
                planetMeshes.push(planetMesh);

                // add a visible orbit line for this planet - reduced segments for performance
                const orbitSegments = 32; // Reduced from 128 to 32 for better performance
                const orbitPts = [];
                for (let i=0;i<=orbitSegments;i++){
                    const a = (i / orbitSegments) * Math.PI * 2;
                    orbitPts.push(new THREE.Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius));
                }
                const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
                const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 });
                const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
                containerGroup.add(orbitLine);
                // store reference
                planetMesh.userData.orbitLine = orbitLine;
            });
        }

        systemGroup.add(containerGroup);
        systemContainers.push({ containerGroup, starMesh, planetMeshes, glowMesh });
    });

    // Raycaster for hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('planetTooltip');

    // Throttle pointer move for better performance
    let pointerMoveThrottle = null;
    function onPointerMove(event){
        if (pointerMoveThrottle) return;

        pointerMoveThrottle = setTimeout(() => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(systemMeshes);
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                const sys = obj.userData.system;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX + 12) + 'px';
                tooltip.style.top = (event.clientY + 12) + 'px';
                tooltip.innerHTML = `<strong>${sys.name}</strong><br/>Faction: ${sys.faction || sys.closestFaction || 'N/A'}<br/>Planets: ${sys.planets?.length||0}`;
                // Enhanced hover effect with brighter glow
            const originalEmissive = obj.userData.emissiveColor;
            obj.material.emissive.copy(originalEmissive).multiplyScalar(2.0);
            } else {
                tooltip.style.display = 'none';
                // reset emissive to original pulsing state
                systemMeshes.forEach(m => {
                    if (m.material.emissive && m.userData.emissiveColor) {
                        m.material.emissive.copy(m.userData.emissiveColor);
                    }
                });
            }
            pointerMoveThrottle = null;
        }, 16); // ~60fps for smooth tooltip updates
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Add cursor feedback for dragging
    renderer.domElement.addEventListener('pointerdown', () => {
        renderer.domElement.style.cursor = 'grabbing';
    });

    renderer.domElement.addEventListener('pointerup', () => {
        renderer.domElement.style.cursor = 'grab';
    });

    renderer.domElement.addEventListener('pointerleave', () => {
        renderer.domElement.style.cursor = 'grab';
    });

    // Double-click only handling - no single click camera movement
    function handleDoubleClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersects = raycaster.intersectObjects(systemMeshes);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            const sysObj = systemContainers.find(sc => sc.starMesh === obj);
            if (sysObj) {
                console.log('Double-clicked system:', sysObj.starMesh.userData.system.name);
                console.log('System has', sysObj.planetMeshes.length, 'planets');

                // Hide all other systems and center this one
                isolateSystem(sysObj);

                // Show system information widget
                showSystemInformation(sysObj.starMesh.userData.system);
            }
        }
    }

    // Only listen for double-click events - no single click camera movement
    renderer.domElement.addEventListener('dblclick', handleDoubleClick);

    // Smooth top-down zoom: move camera above the system and look straight down
    function smoothZoomToTopDown(targetPos, sysObj, duration) {
        console.log('Starting top-down zoom to system:', sysObj.starMesh.userData.system.name);
        console.log('System position:', targetPos);
        console.log('Number of planets:', sysObj.planetMeshes.length);

        // Clear any existing labels first
        clearLabels();

        // Disable controls during animation to prevent conflicts
        controls.enabled = false;

        const startPos = camera.position.clone();
        const startTarget = controls.target.clone();
        const startUp = camera.up.clone();

        // Calculate appropriate height to see the entire system including planet orbits
        let maxOrbitRadius = 1.0; // increased default minimum
        if (sysObj && sysObj.planetMeshes.length > 0) {
            const orbitRadii = sysObj.planetMeshes.map(pm => pm.userData.orbitRadius);
            maxOrbitRadius = Math.max(...orbitRadii);
            console.log('Orbit radii:', orbitRadii);
            console.log('Max orbit radius found:', maxOrbitRadius);
        }

        // Set height to show entire system with generous padding - much higher for better view
        const height = Math.max(8.0, maxOrbitRadius * 8.0);
        const endPos = targetPos.clone().add(new THREE.Vector3(0, height, 0));
        const endTarget = targetPos.clone();
        const endUp = new THREE.Vector3(0, 0, -1); // Look straight down

        console.log('Camera will move to height:', height);
        console.log('End position:', endPos);
        console.log('End target:', endTarget);

        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            const ease = t * (2 - t); // Ease in-out

            camera.position.lerpVectors(startPos, endPos, ease);
            controls.target.lerpVectors(startTarget, endTarget, ease);
            camera.up.lerpVectors(startUp, endUp, ease);
            camera.up.normalize();

            // Make sure camera looks at the target
            camera.lookAt(controls.target);

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                // Ensure final state is set correctly
                camera.position.copy(endPos);
                controls.target.copy(endTarget);
                camera.up.copy(endUp);
                camera.lookAt(controls.target);
                camera.updateProjectionMatrix();

                // Re-enable controls after animation
                controls.enabled = true;
                controls.update();

                console.log('Top-down zoom animation complete');
                console.log('Final camera position:', camera.position);
                console.log('Final target:', controls.target);

                // Show labels after animation completes
                setTimeout(() => {
                    showLabelsForSystem(sysObj);
                }, 100);
            }
        }
        requestAnimationFrame(step);
    }

    // Label management
    let currentLabelElements = [];
    function clearLabels(){
        currentLabelElements.forEach(item => {
            try {
                const node = item && item.el;
                if (node && node.parentNode) node.parentNode.removeChild(node);
                const line = item && item.line;
                if (line && line.parentElement) line.parentElement.removeChild(line);
            } catch (e) {
                // ignore removal errors
            }
        });
        currentLabelElements = [];
    }
    function showLabelsForSystem(sysObj){
        console.log('Showing labels for system:', sysObj.starMesh.userData.system.name);
        clearLabels();

        // star label - make it more prominent
        const starName = sysObj.starMesh.userData.system?.name || 'Star';
        const starLabel = createLabel(starName, true); // true for star styling
        const starLine = createLabelLine();
        labelsDiv.appendChild(starLabel);
        labelsDiv.appendChild(starLine);
        currentLabelElements.push({ el: starLabel, line: starLine, obj: sysObj.starMesh, isStar: true });
        console.log('Added star label:', starName);

        // planet labels
        sysObj.planetMeshes.forEach((pm, index) => {
            const name = pm.userData.name || `Planet ${index + 1}`;
            const pl = createLabel(name, false); // false for planet styling
            const line = createLabelLine();
            labelsDiv.appendChild(pl);
            labelsDiv.appendChild(line);
            currentLabelElements.push({ el: pl, line: line, obj: pm, isStar: false });
            console.log('Added planet label:', name, 'at orbit radius:', pm.userData.orbitRadius);
        });

        console.log('Total labels created:', currentLabelElements.length);
    }
    function createLabel(text, isStar = false){
        const d = document.createElement('div');
        d.className = isStar ? 'map-label star-label' : 'map-label planet-label';
        d.style.position = 'absolute';
        d.style.padding = isStar ? '4px 8px' : '2px 6px';
        d.style.background = isStar ? 'rgba(255,215,0,0.9)' : 'rgba(0,100,200,0.8)';
        d.style.color = isStar ? '#000' : '#fff';
        d.style.fontSize = isStar ? '14px' : '12px';
        d.style.fontWeight = isStar ? 'bold' : 'normal';
        d.style.borderRadius = '4px';
        d.style.pointerEvents = 'none';
        d.style.border = isStar ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.3)';
        d.style.zIndex = isStar ? '2010' : '2005';
        d.style.whiteSpace = 'nowrap';
        d.textContent = text;
        return d;
    }

    function createLabelLine(){
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.borderLeft = '1px solid rgba(255,255,255,0.6)';
        line.style.pointerEvents = 'none';
        line.style.zIndex = '2003';
        line.style.transformOrigin = '0 0';
        return line;
    }

    // Smoothly lerp camera position and controls.target to targetPos over duration (ms)
    function smoothZoomTo(targetPos, duration) {
        const startPos = camera.position.clone();
        const startTarget = controls.target.clone();
        // place camera slightly offset along Z so we can 'look into' the system
        const offset = new THREE.Vector3(0, 0, Math.max(0.25, 0.25 * SPREAD));
        const endPos = targetPos.clone().add(offset);
        const endTarget = targetPos.clone();
        const startTime = performance.now();

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = t * (2 - t);
            camera.position.lerpVectors(startPos, endPos, ease);
            controls.target.lerpVectors(startTarget, endTarget, ease);
            controls.update();
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Resize handling
    function onWindowResize(){
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onWindowResize);

    // Animation loop with performance optimization
    function animate(currentTime){
        requestAnimationFrame(animate);

        // Throttle to target FPS for better performance
        if (currentTime - lastFrameTime < FRAME_INTERVAL) {
            return;
        }
        lastFrameTime = currentTime;

        if (isAnimationPaused) return;

        const t = Date.now() * 0.0002;

        // very slow rotation for the whole map (use SYSTEM_ROTATION_FACTOR)
        systemGroup.rotation.y = t * SYSTEM_ROTATION_FACTOR;

        // Animate starfield twinkling
        if (starfield && starfield.geometry) {
            const sizes = starfield.geometry.attributes.size.array;
            for (let i = 0; i < sizes.length; i++) {
                const originalSize = starfield.originalSizes[i];
                const twinkle = Math.sin(t * 2 + i * 0.1) * 0.3 + 0.7; // Gentle twinkling
                sizes[i] = originalSize * twinkle;
            }
            starfield.geometry.attributes.size.needsUpdate = true;
        }

        // animate planets orbiting their stars, rotating, and star pulsing
        systemContainers.forEach(sysObj => {
            // Animate planet orbits and rotation
            sysObj.planetMeshes.forEach(pm => {
                // Orbital motion
                pm.userData.angle += pm.userData.orbitSpeed;
                const a = pm.userData.angle;
                const r = pm.userData.orbitRadius;
                const newX = Math.cos(a) * r;
                const newZ = Math.sin(a) * r;

                pm.position.x = newX;
                pm.position.z = newZ;

                // Planet rotation on its axis
                pm.rotation.y += pm.userData.rotationSpeed;

                // Update atmosphere position to match planet
                if (pm.userData.atmosphere) {
                    pm.userData.atmosphere.position.x = newX;
                    pm.userData.atmosphere.position.z = newZ;
                    // Subtle atmosphere rotation (opposite direction for effect)
                    pm.userData.atmosphere.rotation.y -= pm.userData.rotationSpeed * 0.3;
                }
            });

            // Animate star pulsing and glowing
            const starMesh = sysObj.starMesh;
            const glowMesh = sysObj.glowMesh;

            if (starMesh && starMesh.userData) {
                const phase = t * starMesh.userData.pulseSpeed + starMesh.userData.pulsePhase;
                const pulse = Math.sin(phase) * 0.15 + 1.0; // Pulse between 0.85 and 1.15

                // Pulse the emissive color
                const baseEmissive = starMesh.userData.emissiveColor;
                starMesh.material.emissive.copy(baseEmissive).multiplyScalar(pulse);

                // Slight scale pulsing
                const basePulse = 1.0 + Math.sin(phase * 0.7) * 0.05; // Very subtle scale pulse
                const currentScale = starMesh.scale.x;
                starMesh.scale.setScalar(currentScale * basePulse / (starMesh.userData.lastPulse || 1.0));
                starMesh.userData.lastPulse = basePulse;

                // Animate glow
                if (glowMesh) {
                    const glowPulse = Math.sin(phase * 0.8) * 0.3 + 0.7; // Pulse between 0.4 and 1.0
                    glowMesh.material.opacity = 0.15 * glowPulse;

                    // Slowly rotate the glow for more dynamic effect
                    glowMesh.rotation.y += 0.002;
                    glowMesh.rotation.x += 0.001;
                }
            }
        });

        // update labels positions if any - update more frequently when labels are active
        if (currentLabelElements && currentLabelElements.length) {
            currentLabelElements.forEach(item => {
                const obj = item.obj;
                const el = item.el;
                const line = item.line;
                const isStar = item.isStar;

                // get world position
                const worldPos = new THREE.Vector3();
                obj.getWorldPosition(worldPos);
                // project to screen
                worldPos.project(camera);
                const rect = renderer.domElement.getBoundingClientRect();
                const objX = (worldPos.x * 0.5 + 0.5) * rect.width;
                const objY = (-worldPos.y * 0.5 + 0.5) * rect.height;

                // hide if behind camera or too far to edges
                if (worldPos.z > 1 || objX < -100 || objX > rect.width + 100 || objY < -100 || objY > rect.height + 100) {
                    el.style.display = 'none';
                    line.style.display = 'none';
                } else {
                    // Calculate label offset position
                    const offsetDistance = isStar ? 60 : 40; // Stars get more offset
                    const angle = Math.atan2(objY - rect.height/2, objX - rect.width/2);
                    const labelX = objX + Math.cos(angle) * offsetDistance;
                    const labelY = objY + Math.sin(angle) * offsetDistance;

                    // Position label
                    el.style.display = 'block';
                    el.style.left = `${Math.round(labelX)}px`;
                    el.style.top = `${Math.round(labelY)}px`;
                    el.style.transform = 'translate(-50%, -50%)';

                    // Position and draw connecting line
                    line.style.display = 'block';
                    const lineLength = Math.sqrt((labelX - objX) ** 2 + (labelY - objY) ** 2);
                    const lineAngle = Math.atan2(labelY - objY, labelX - objX) * 180 / Math.PI;

                    line.style.left = `${Math.round(objX)}px`;
                    line.style.top = `${Math.round(objY)}px`;
                    line.style.width = `${Math.round(lineLength)}px`;
                    line.style.height = '0px';
                    line.style.transform = `rotate(${lineAngle}deg)`;
                }
            });
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate(0);

    // Pause animation when tab is not visible for performance
    document.addEventListener('visibilitychange', () => {
        isAnimationPaused = document.hidden;
    });

    // Function to isolate a specific system
    function isolateSystem(targetSysObj) {
        console.log('Isolating system:', targetSysObj.starMesh.userData.system.name);

        // Store original visibility if not already stored
        if (originalSystemVisibility.length === 0) {
            systemContainers.forEach(sysObj => {
                originalSystemVisibility.push({
                    sysObj: sysObj,
                    visible: sysObj.containerGroup.visible,
                    originalPosition: sysObj.containerGroup.position.clone()
                });
            });
        }

        // Hide all systems
        systemContainers.forEach(sysObj => {
            sysObj.containerGroup.visible = false;
        });

        // Show only the target system and center it
        targetSysObj.containerGroup.visible = true;
        targetSysObj.containerGroup.position.set(0, 0, 0);

        // Calculate appropriate camera position
        let maxOrbitRadius = 1.0;
        if (targetSysObj.planetMeshes.length > 0) {
            maxOrbitRadius = Math.max(...targetSysObj.planetMeshes.map(pm => pm.userData.orbitRadius));
        }

        // Position camera for optimal view
        const height = Math.max(5.0, maxOrbitRadius * 6.0);
        camera.position.set(0, height, 0);
        controls.target.set(0, 0, 0);
        camera.up.set(0, 0, -1);
        camera.lookAt(0, 0, 0);
        controls.update();

        // Show labels immediately
        showLabelsForSystem(targetSysObj);

        // Store current system data
        selectedSystemData = targetSysObj.starMesh.userData.system;
    }

    // Function to restore all systems
    function restoreAllSystems() {
        console.log('Restoring all systems');

        if (originalSystemVisibility.length > 0) {
            originalSystemVisibility.forEach(item => {
                item.sysObj.containerGroup.visible = item.visible;
                item.sysObj.containerGroup.position.copy(item.originalPosition);
            });
            originalSystemVisibility = [];
        }

        // Clear labels
        clearLabels();

        // Reset camera to overview
        camera.position.set(0, 0, Math.max(120 * SPREAD, 200));
        controls.target.set(0, 0, 0);
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
        controls.update();

        // Hide system information
        const infoWidget = document.getElementById('systemInfoWidget');
        if (infoWidget) {
            infoWidget.style.display = 'none';
        }

        selectedSystemData = null;
    }

    // Function to show system information
    function showSystemInformation(system) {
        console.log('Showing information for system:', system.name);

        const infoWidget = document.getElementById('systemInfoWidget');
        const infoTitle = document.getElementById('systemInfoTitle');
        const infoContent = document.getElementById('systemInfoContent');

        if (!infoWidget || !infoTitle || !infoContent) {
            console.error('System info widget elements not found');
            return;
        }

        infoTitle.textContent = `🌟 ${system.name} System Details`;

        // Analyze system data
        const planetCount = system.planets ? system.planets.length : 0;
        const totalResources = system.planets ?
            system.planets.reduce((sum, planet) => sum + (planet.resources ? planet.resources.length : 0), 0) : 0;

        // Get unique resources in the system
        const uniqueResources = new Set();
        const planetDetails = [];

        if (system.planets) {
            system.planets.forEach((planet, index) => {
                const planetType = getPlanetTypeName(planet.type);
                const resources = planet.resources || [];
                resources.forEach(res => uniqueResources.add(res.name));

                planetDetails.push({
                    name: planet.name || `Planet ${index + 1}`,
                    type: planetType,
                    orbit: planet.orbit,
                    resources: resources
                });
            });
        }

        // Get suitable buildings for this system
        const suitableBuildings = getSuitableBuildingsForSystem(system);

        // Generate HTML content
        let content = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div>
                    <h4 style="color:#4CAF50;margin-bottom:10px;">📊 System Overview</h4>
                    <div style="background:#2a2a3e;padding:15px;border-radius:6px;">
                        <p><strong>Faction:</strong> ${system.closestFaction || 'Unknown'}</p>
                        <p><strong>Strategic Score:</strong> ${system.strategicScore || 'N/A'}</p>
                        <p><strong>Planets:</strong> ${planetCount}</p>
                        <p><strong>Total Resources:</strong> ${totalResources}</p>
                        <p><strong>Unique Resources:</strong> ${uniqueResources.size}</p>
                        <p><strong>Connected Systems:</strong> ${system.links ? system.links.length : 0}</p>
                    </div>

                    <h4 style="color:#4CAF50;margin:15px 0 10px 0;">💎 Available Resources</h4>
                    <div style="background:#2a2a3e;padding:15px;border-radius:6px;max-height:200px;overflow-y:auto;">
                        ${Array.from(uniqueResources).map(resource => {
                            const resourceData = getResourceData(resource);
                            return `<div style="margin:5px 0;padding:5px;background:#3a3a4e;border-radius:3px;">
                                <strong>${resource}</strong>
                                ${resourceData ? `(Tier ${resourceData.tier}, ${resourceData.category})` : ''}
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <div>
                    <h4 style="color:#4CAF50;margin-bottom:10px;">🪐 Planet Details</h4>
                    <div style="background:#2a2a3e;padding:15px;border-radius:6px;max-height:300px;overflow-y:auto;">
                        ${planetDetails.map(planet => `
                            <div style="margin-bottom:15px;padding:10px;background:#3a3a4e;border-radius:6px;">
                                <h5 style="margin:0 0 8px 0;color:#fff;">${planet.name}</h5>
                                <p style="margin:5px 0;"><strong>Type:</strong> ${planet.type}</p>
                                <p style="margin:5px 0;"><strong>Orbit:</strong> ${planet.orbit ? planet.orbit.toFixed(2) : 'N/A'}</p>
                                <div style="margin-top:8px;">
                                    <strong>Resources (${planet.resources.length}):</strong>
                                    ${planet.resources.map(res =>
                                        `<span style="display:inline-block;margin:2px;padding:2px 6px;background:#4a4a6e;border-radius:3px;font-size:11px;">
                                            ${res.name} ⭐${res.richness}
                                        </span>`
                                    ).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <h4 style="color:#4CAF50;margin:15px 0 10px 0;">🏗️ Suitable Buildings</h4>
                    <div style="background:#2a2a3e;padding:15px;border-radius:6px;max-height:200px;overflow-y:auto;">
                        ${suitableBuildings.length > 0 ?
                            suitableBuildings.map(building => `
                                <div style="margin:5px 0;padding:8px;background:#3a3a4e;border-radius:3px;">
                                    <strong>${building.name}</strong> (Tier ${building.tier})
                                    <br><small style="color:#ccc;">${building.description}</small>
                                </div>
                            `).join('') :
                            '<p style="color:#ccc;">No specific building requirements found for this system type.</p>'
                        }
                    </div>
                </div>
            </div>

            <div style="margin-top:20px;padding:10px;background:#2a2a3e;border-radius:6px;text-align:center;">
                <p style="color:#ccc;margin:0;">💡 <strong>Tip:</strong> Press <kbd style="background:#4a4a6e;padding:2px 6px;border-radius:3px;">ESC</kbd> to return to galaxy view</p>
            </div>
        `;

        infoContent.innerHTML = content;
        infoWidget.style.display = 'block';
    }

    // Helper function to get planet type name
    function getPlanetTypeName(type) {
        const planetTypes = {
            1: 'Rocky', 2: 'Desert', 3: 'Ice', 4: 'Gas Giant', 5: 'Volcanic',
            6: 'Ocean', 7: 'Forest', 8: 'Toxic', 9: 'Barren', 10: 'Tropical', 11: 'Arctic'
        };
        return planetTypes[type] || `Type ${type}`;
    }

    // Helper function to get resource data
    function getResourceData(resourceName) {
        if (typeof resourcesData !== 'undefined' && resourcesData.resources) {
            return resourcesData.resources.find(r => r.name === resourceName);
        }
        return null;
    }

    // Helper function to get suitable buildings for a system
    function getSuitableBuildingsForSystem(system) {
        if (typeof rawBuildingData === 'undefined' || !rawBuildingData.buildings) {
            return [];
        }

        const suitableBuildings = [];
        const planetTypes = system.planets ? system.planets.map(p => getPlanetTypeName(p.type).toLowerCase()) : [];

        rawBuildingData.buildings.forEach(building => {
            if (building.requiredTags) {
                // Check if any required tags match planet types in this system
                const hasMatchingTag = building.requiredTags.some(tag => {
                    const tagLower = tag.toLowerCase();
                    return planetTypes.some(planetType =>
                        tagLower.includes(planetType) ||
                        tagLower.includes('planet') ||
                        tagLower.includes('universal')
                    );
                });

                if (hasMatchingTag) {
                    suitableBuildings.push(building);
                }
            }
        });

        return suitableBuildings.slice(0, 10); // Limit to first 10 for display
    }

    // Add keyboard shortcut to restore view (ESC key)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && selectedSystemData) {
            restoreAllSystems();
        }
    });

    // Make restoreAllSystems available globally
    window.restoreAllSystems = restoreAllSystems;

    // Basic instructions overlay
    const note = document.querySelector('#planetMapSection .map-note');
    if (note) note.style.marginBottom = '8px';
};

// Auto-initialize if we're on the main page and container exists
(async function(){
    const container = document.getElementById('planetMap');
    if (container && !container.closest('[id="3dviewerTab"]')) {
        // Only auto-initialize if not in a tab
        await window.initPlanetMap();
    }
})();

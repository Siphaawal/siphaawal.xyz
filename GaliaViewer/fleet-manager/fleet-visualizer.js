// Fleet Visualizer - Render and animate fleets in 3D space (v3.6 - Texture/Error Fix)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/FBXLoader.js';
import { GlobalState } from '../state.js';

export class FleetVisualizer {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.fleetMeshes = new Map(); // Map of fleetId -> mesh
        this.fleetAnimations = new Map(); // Map of fleetId -> animation data
        this.fleetAssignments = new Map(); // Map of fleetId -> { currentSystem, targetSystem }

        // Fleet appearance settings
        this.fleetColor = 0x00ff00; // Green for player fleets
        this.fleetSize = 0.0006; // Double the previous size
        this.travelSpeed = 0.002; // Much slower - about 5x slower than before

        // FBX Loaders - create separate loaders for each manufacturer to avoid texture path conflicts
        this.fbxLoaders = new Map();

        // Suppress FBX polygon warnings in console
        const originalWarn = console.warn;
        console.warn = (...args) => {
            const message = args[0];
            if (typeof message === 'string' && message.includes('Polygons with more than four sides')) {
                // Suppress polygon warning - models work fine despite this
                return;
            }
            originalWarn.apply(console, args);
        };

        this.spaceshipModels = new Map(); // Cache loaded models by type
        this.modelLoading = new Map(); // Track loading state per model
        this.modelLoadPromises = new Map(); // Track promises per model

        // Available ship models organized by manufacturer (randomly selected per fleet)
        this.manufacturers = {
            'Armstrong': {
                path: 'models/Armstrong/Imp/CAP_ARM_Imp_LowRes.fbx',
                textures: 'models/Armstrong/_Textures/',
                scaleMultiplier: 1.0 // Base scale
            },
            'BYOS': {
                path: 'models/BYOS/Packlite/MED_FBL_Packlite_LowRes.fbx',
                textures: 'models/BYOS/_Textures/',
                scaleMultiplier: 1.2 // Slightly larger for visibility
            },
            'Ogrika': {
                path: 'models/Ogrika/Jod Asteris/CAP_OKA_JodAsteris_LowRes.fbx',
                textures: 'models/Ogrika/_Textures/',
                scaleMultiplier: 1.0
            },
            'Tufa': {
                path: 'models/Tufa/Spirit/CDR_TFA_Spirit_LowRes.fbx',
                textures: 'models/Tufa/_Textures/',
                scaleMultiplier: 0.05 // Tufa Spirit is MUCH larger (1MB model), scale down significantly
            }
        };

        // Build available models list from manufacturers
        this.availableModels = Object.keys(this.manufacturers).map(mfr => ({
            manufacturer: mfr,
            path: this.manufacturers[mfr].path,
            textures: this.manufacturers[mfr].textures,
            scaleMultiplier: this.manufacturers[mfr].scaleMultiplier || 1.0
        }));

        // Object pooling
        this.tempVector = new THREE.Vector3();
        this.tempVector2 = new THREE.Vector3();
    }

    // Add fleets to the scene
    async visualizeFleets(fleets) {
        try {
            console.log(`🚀 Visualizing ${fleets.length} fleet(s)`);

            // Clear existing fleet visualizations
            this.clearAllFleets();

            // Assign each fleet to a random system and neighboring system
            // Create fleet meshes asynchronously
            const meshPromises = fleets.map(async (fleet) => {
                this.assignFleetToSystems(fleet);
                await this.createFleetMesh(fleet);
            });

            // Wait for all fleet meshes to be created
            await Promise.all(meshPromises);

            // Start animations
            this.startFleetAnimations();

            console.log('✅ Fleet visualization complete');
            return true;

        } catch (error) {
            console.error('❌ Error visualizing fleets:', error);
            throw error;
        }
    }

    // Assign fleet to a random system and its neighbor
    assignFleetToSystems(fleet) {
        const systems = GlobalState.systems;
        if (!systems || systems.length === 0) {
            console.error('No systems available for fleet assignment');
            return;
        }

        // Pick a random system that has connections
        const systemsWithLinks = systems.filter(s => s.links && s.links.length > 0);
        if (systemsWithLinks.length === 0) {
            console.warn('No systems with links found, using any random system');
            const randomSystem = systems[Math.floor(Math.random() * systems.length)];
            this.fleetAssignments.set(fleet.id, {
                currentSystem: randomSystem,
                targetSystem: randomSystem,
                currentSystemName: randomSystem.name || randomSystem.key
            });
            return;
        }

        const currentSystem = systemsWithLinks[Math.floor(Math.random() * systemsWithLinks.length)];

        // Pick a random connected system
        const linkedSystemName = currentSystem.links[Math.floor(Math.random() * currentSystem.links.length)];
        const targetSystem = systems.find(s =>
            s.name === linkedSystemName || s.key === linkedSystemName || s.id === linkedSystemName
        );

        this.fleetAssignments.set(fleet.id, {
            currentSystem: currentSystem,
            targetSystem: targetSystem || currentSystem,
            currentSystemName: currentSystem.name || currentSystem.key,
            targetSystemName: targetSystem ? (targetSystem.name || targetSystem.key) : (currentSystem.name || currentSystem.key)
        });

        console.log(`📍 Fleet ${fleet.name} assigned: ${currentSystem.name} ↔ ${targetSystem?.name || currentSystem.name}`);
    }

    // Load FBX spaceship model (with random selection or specific path)
    async loadSpaceshipModel(modelData = null) {
        // If no specific model requested, pick a random one
        if (!modelData) {
            modelData = this.availableModels[Math.floor(Math.random() * this.availableModels.length)];
        }

        // Support legacy string paths or new object format
        const modelPath = typeof modelData === 'string' ? modelData : modelData.path;
        const manufacturer = typeof modelData === 'string' ? 'Unknown' : modelData.manufacturer;
        const scaleMultiplier = typeof modelData === 'string' ? 1.0 : (modelData.scaleMultiplier || 1.0);

        // Return cached model if already loaded
        if (this.spaceshipModels.has(modelPath)) {
            console.log(`✅ Using cached ${manufacturer} model: ${modelPath}`);
            return {
                model: this.spaceshipModels.get(modelPath).clone(),
                scaleMultiplier: scaleMultiplier
            };
        }

        // If already loading this model, return the existing promise
        if (this.modelLoading.get(modelPath) && this.modelLoadPromises.has(modelPath)) {
            return this.modelLoadPromises.get(modelPath);
        }

        console.log(`📦 Loading ${manufacturer} spaceship model: ${modelPath}`);
        this.modelLoading.set(modelPath, true);

        // Get or create a dedicated FBX loader for this manufacturer
        const texturePath = typeof modelData === 'string' ? null : modelData.textures;
        let fbxLoader;

        if (manufacturer !== 'Unknown' && !this.fbxLoaders.has(manufacturer)) {
            // Create a new loader with custom loading manager for this manufacturer
            const manager = new THREE.LoadingManager();

            if (texturePath) {
                manager.setURLModifier((url) => {
                    // Only redirect image files (textures), not FBX files
                    const isTexture = /\.(png|jpg|jpeg|bmp|tga|tiff|gif)$/i.test(url);

                    if (!isTexture) {
                        return url; // Don't modify non-texture URLs
                    }

                    // Extract just the filename from the URL
                    const filename = url.split('/').pop().split('\\').pop();

                    // Redirect to manufacturer's _Textures folder
                    const newUrl = texturePath + filename;
                    console.log(`🖼️ ${manufacturer} texture: ${filename} → ${newUrl}`);
                    return newUrl;
                });
            }

            fbxLoader = new FBXLoader(manager);
            this.fbxLoaders.set(manufacturer, fbxLoader);
        } else {
            fbxLoader = this.fbxLoaders.get(manufacturer) || new FBXLoader();
        }

        const loadPromise = new Promise((resolve, reject) => {
            fbxLoader.load(
                modelPath,
                (fbx) => {
                    console.log(`✅ ${manufacturer} FBX model loaded successfully: ${modelPath}`);

                    // Log model details for debugging
                    const bbox = new THREE.Box3().setFromObject(fbx);
                    const size = bbox.getSize(new THREE.Vector3());
                    console.log(`📐 Model size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);

                    // Store the model in cache
                    this.spaceshipModels.set(modelPath, fbx);

                    // Process materials and handle missing textures
                    let meshCount = 0;
                    fbx.traverse((child) => {
                        if (child.isMesh) {
                            meshCount++;

                            if (child.material) {
                                // Handle both single materials and material arrays
                                const materials = Array.isArray(child.material) ? child.material : [child.material];

                                materials.forEach(mat => {
                                    // Apply manufacturer-specific colors
                                    if (manufacturer === 'Tufa') {
                                        // Dark brown texture for Tufa Spirit
                                        mat.color = new THREE.Color(0x4a2f1a); // Dark brown
                                        mat.emissive = new THREE.Color(0x2a1810); // Darker brown emissive
                                        mat.emissiveIntensity = 0.3;
                                        mat.roughness = 0.8; // Matte finish
                                        mat.metalness = 0.2; // Slightly metallic
                                        console.log('🟤 Applied dark brown texture to Tufa Spirit');
                                    } else {
                                    // If texture failed to load (404), provide fallback
                                    if (mat.map && !mat.map.image) {
                                        console.warn(`⚠️ Texture failed to load for ${child.name}, using fallback color`);
                                        mat.map = null;
                                        mat.color = new THREE.Color(0x808080); // Gray fallback
                                    }

                                    // Ensure materials are visible even without textures
                                    if (!mat.map && !mat.color) {
                                        mat.color = new THREE.Color(0x808080);
                                    }

                                    // Add slight emissive for visibility in space
                                    if (!mat.emissive) {
                                        mat.emissive = new THREE.Color(0x00ff00);
                                        mat.emissiveIntensity = 0.2;
                                    }

                                    // Ensure material is double-sided for visibility
                                    }
                                    mat.side = THREE.DoubleSide;
                                    mat.needsUpdate = true;
                                });
                            }
                        }
                    });

                    console.log(`🔍 ${manufacturer} model has ${meshCount} meshes`);

                    this.modelLoading.set(modelPath, false);
                    resolve({
                        model: fbx.clone(),
                        scaleMultiplier: scaleMultiplier
                    });
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(0);
                    console.log(`Loading ${modelPath}: ${percent}%`);
                },
                (error) => {
                    console.error(`❌ Error loading FBX model: ${modelPath}`, error);
                    console.log('⚠️ Falling back to procedural geometry');
                    this.modelLoading.set(modelPath, false);
                    // Fallback to procedural model
                    resolve({
                        model: this.createProceduralSpaceship(),
                        scaleMultiplier: 1.0
                    });
                }
            );
        });

        this.modelLoadPromises.set(modelPath, loadPromise);
        return loadPromise;
    }

    // Create a detailed spaceship geometry (fallback)
    createProceduralSpaceship() {
        console.log('🚀 Creating procedural spaceship geometry (fallback)');
        const group = new THREE.Group();

        // Main body (fuselage)
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.25, 1.2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            emissive: 0x404040,
            emissiveIntensity: 0.3,
            shininess: 80,
            flatShading: false
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2; // Point forward
        group.add(body);

        // Cockpit (front dome)
        const cockpitGeometry = new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpitMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x00ccff,
            emissiveIntensity: 0.6,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.z = 0.6;
        cockpit.rotation.x = Math.PI;
        group.add(cockpit);

        // Wings (left and right)
        const wingGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.4);
        const wingMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x00aa00,
            emissiveIntensity: 0.4,
            shininess: 60
        });

        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.4, 0, 0);
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.4, 0, 0);
        group.add(rightWing);

        // Engine glow (rear)
        const engineGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
        const engineMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6600,
            emissive: 0xff3300,
            emissiveIntensity: 1.0,
            shininess: 100
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.rotation.x = Math.PI / 2;
        engine.position.z = -0.65;
        group.add(engine);

        // Engine lights (particles effect)
        const particleCount = 10;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 2] = -0.8 - Math.random() * 0.3;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        group.add(particles);

        return group;
    }

    // Create 3D mesh for a fleet (now async)
    async createFleetMesh(fleet) {
        // Load the FBX spaceship model
        const modelResult = await this.loadSpaceshipModel();
        const mesh = modelResult.model || modelResult; // Handle both object and direct mesh return
        const scaleMultiplier = modelResult.scaleMultiplier || 1.0;

        // Scale to appropriate size with manufacturer-specific adjustment
        const finalScale = this.fleetSize * scaleMultiplier;
        mesh.scale.set(finalScale, finalScale, finalScale);

        mesh.userData = {
            fleet: fleet,
            type: 'fleet',
            isFleet: true
        };

        // Get initial position from assigned system
        const assignment = this.fleetAssignments.get(fleet.id);
        if (assignment && assignment.currentSystem) {
            const sysObj = this.sceneManager.systemContainers.find(sc =>
                sc.starMesh.userData.system === assignment.currentSystem
            );

            if (sysObj) {
                sysObj.starMesh.getWorldPosition(this.tempVector);
                mesh.position.copy(this.tempVector);
                // Offset slightly from star
                mesh.position.y += 2;
            }
        }

        this.sceneManager.scene.add(mesh);
        this.fleetMeshes.set(fleet.id, mesh);

        // Add fleet label
        this.createFleetLabel(fleet, mesh);
    }

    // Create label for fleet with connecting line
    createFleetLabel(fleet, mesh) {
        // Create label sprite
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 20;

        context.font = `${fontSize}px Arial`;
        const textWidth = context.measureText(fleet.name).width;

        canvas.width = textWidth + 20;
        canvas.height = fontSize + 10;

        context.font = `${fontSize}px Arial`;
        context.fillStyle = '#00ff00';
        context.textAlign = 'center';
        context.fillText(fleet.name, canvas.width / 2, fontSize);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(canvas.width / 100, canvas.height / 100, 1);
        sprite.position.y = 2; // Position label above ship

        mesh.add(sprite);

        // Create line connecting ship to label
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0), // Start at ship position
            new THREE.Vector3(0, 2, 0)  // End at label position
        ]);

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.6,
            linewidth: 1
        });

        const line = new THREE.Line(lineGeometry, lineMaterial);
        mesh.add(line);
    }

    // Start animations for all fleets
    startFleetAnimations() {
        this.fleetMeshes.forEach((mesh, fleetId) => {
            const assignment = this.fleetAssignments.get(fleetId);
            if (!assignment) return;

            // Initialize animation state
            this.fleetAnimations.set(fleetId, {
                isMoving: false,
                direction: 1, // 1 = toward target, -1 = toward current
                progress: 0,
                startPos: null,
                endPos: null
            });

            // Start the first movement
            this.startFleetMovement(fleetId);
        });
    }

    // Start movement for a specific fleet
    startFleetMovement(fleetId) {
        const mesh = this.fleetMeshes.get(fleetId);
        const assignment = this.fleetAssignments.get(fleetId);
        const animation = this.fleetAnimations.get(fleetId);

        if (!mesh || !assignment || !animation) return;

        // Determine start and end positions
        const direction = animation.direction;
        const startSystem = direction === 1 ? assignment.currentSystem : assignment.targetSystem;
        const endSystem = direction === 1 ? assignment.targetSystem : assignment.currentSystem;

        // Get system container objects
        const startSysObj = this.sceneManager.systemContainers.find(sc =>
            sc.starMesh.userData.system === startSystem
        );
        const endSysObj = this.sceneManager.systemContainers.find(sc =>
            sc.starMesh.userData.system === endSystem
        );

        if (!startSysObj || !endSysObj) {
            console.warn(`Could not find system containers for fleet ${fleetId}`);
            return;
        }

        // Get positions
        startSysObj.starMesh.getWorldPosition(this.tempVector);
        const startPos = this.tempVector.clone();
        startPos.y += 2; // Offset from star

        endSysObj.starMesh.getWorldPosition(this.tempVector2);
        const endPos = this.tempVector2.clone();
        endPos.y += 2;

        // Update animation state
        animation.isMoving = true;
        animation.progress = 0;
        animation.startPos = startPos;
        animation.endPos = endPos;

        console.log(`🚀 Fleet ${fleetId} starting journey: ${startSystem.name} → ${endSystem.name}`);
    }

    // Update fleet animations (called every frame)
    updateFleetAnimations() {
        this.fleetAnimations.forEach((animation, fleetId) => {
            if (!animation.isMoving) return;

            const mesh = this.fleetMeshes.get(fleetId);
            if (!mesh || !animation.startPos || !animation.endPos) return;

            // Update progress
            animation.progress += this.travelSpeed;

            if (animation.progress >= 1.0) {
                // Reached destination
                animation.isMoving = false;
                animation.direction *= -1; // Reverse direction
                mesh.position.copy(animation.endPos);

                // Wait a bit before starting return journey
                setTimeout(() => {
                    this.startFleetMovement(fleetId);
                }, 2000); // 2 second pause

            } else {
                // Interpolate position
                this.tempVector.lerpVectors(animation.startPos, animation.endPos, animation.progress);
                mesh.position.copy(this.tempVector);

                // Rotate spaceship to point in direction of travel
                const direction = this.tempVector2.subVectors(animation.endPos, animation.startPos).normalize();
                mesh.lookAt(this.tempVector.copy(mesh.position).add(direction));

                // Add slight roll animation for more dynamic movement
                mesh.rotation.z = Math.sin(animation.progress * Math.PI * 4) * 0.1;
            }
        });
    }

    // Clear all fleet visualizations
    clearAllFleets() {
        this.fleetMeshes.forEach((group, fleetId) => {
            this.sceneManager.scene.remove(group);

            // Dispose of all meshes in the spaceship group
            group.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
                if (child.material?.map) child.material.map.dispose();
            });
        });

        this.fleetMeshes.clear();
        this.fleetAnimations.clear();
        this.fleetAssignments.clear();

        console.log('🗑️ All fleets cleared');
    }

    // Get fleet info for UI display
    getFleetInfo(fleetId) {
        const mesh = this.fleetMeshes.get(fleetId);
        const assignment = this.fleetAssignments.get(fleetId);
        const animation = this.fleetAnimations.get(fleetId);

        if (!mesh || !assignment) return null;

        return {
            fleet: mesh.userData.fleet,
            currentSystem: assignment.currentSystemName,
            targetSystem: assignment.targetSystemName,
            isMoving: animation?.isMoving || false,
            progress: animation?.progress || 0
        };
    }

    // Get all fleet info
    getAllFleetInfo() {
        const info = [];
        this.fleetMeshes.forEach((mesh, fleetId) => {
            const fleetInfo = this.getFleetInfo(fleetId);
            if (fleetInfo) {
                info.push(fleetInfo);
            }
        });
        return info;
    }
}

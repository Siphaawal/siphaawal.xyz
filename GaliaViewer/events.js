// Event Handling - Mouse/keyboard interactions and click handlers
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GlobalState } from './state.js';

export class EventHandlers {
    constructor(sceneManager, connectionManager, uiManager, audioManager) {
        this.sceneManager = sceneManager;
        this.connectionManager = connectionManager;
        this.uiManager = uiManager;
        this.audioManager = audioManager;

        // Initialize any needed properties
        this.lastClickTime = 0;
        this.clickTimer = null;

        // Object pooling for performance
        this.tempVector = new THREE.Vector3();
        this.tempVector2 = new THREE.Vector3();
        this.mouseVector = new THREE.Vector2();

        this.setupEventListeners();
    }

    setupEventListeners() {
        const canvas = this.sceneManager.renderer.domElement;

        // Mouse/pointer events
        canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
        canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // Mouse cursor changes
        canvas.addEventListener('pointerenter', () => {
            canvas.style.cursor = 'grab';
        });
        canvas.addEventListener('pointerleave', () => {
            canvas.style.cursor = 'grab';
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onPointerMove(event) {
        if (event.buttons > 0) return; // Skip if dragging

        const rect = this.sceneManager.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.mouseVector.set(x, y);
        this.sceneManager.raycaster.setFromCamera(this.mouseVector, this.sceneManager.camera);

        // Use InstancedMesh raycasting for stars and custom logic for planets
        const starIntersects = this.sceneManager.raycaster.intersectObject(this.sceneManager.starInstancedMesh);
        const planetIntersects = this.sceneManager.raycaster.intersectObject(this.sceneManager.planetInstancedMesh);

        let intersects = [];

        // Process star intersects
        if (starIntersects.length > 0) {
            const instanceId = starIntersects[0].instanceId;
            const starMesh = this.sceneManager.systemMeshes[instanceId];
            if (starMesh) {
                intersects.push({ object: starMesh });
            }
        }

        // Process planet intersects
        if (planetIntersects.length > 0) {
            const instanceId = planetIntersects[0].instanceId;
            const planetMesh = this.sceneManager.planetMeshes.find(p => p.userData.instanceIndex === instanceId);
            if (planetMesh) {
                intersects.push({ object: planetMesh });
            }
        }

        if (intersects.length > 0) {
            this.sceneManager.renderer.domElement.style.cursor = 'pointer';

            // Show tooltip
            const obj = intersects[0].object;
            const system = obj.userData.system || obj.userData.parentSystem;
            const objectType = obj.userData.type;
            this.showTooltip(event, system, objectType, obj.userData.planet);
        } else {
            this.sceneManager.renderer.domElement.style.cursor = 'grab';
            this.hideTooltip();
        }
    }

    onPointerDown(event) {
        // Prevent default to avoid context menu on right click
        if (event.button === 2) {
            event.preventDefault();
        }

        // Only handle left clicks
        if (event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        // Handle click with proper double-click detection
        this.lastClickTime = this.lastClickTime || 0;
        const clickTime = performance.now();
        const timeBetweenClicks = clickTime - this.lastClickTime;

        if (timeBetweenClicks < 300) {  // Double click threshold
            // Clear any pending single click timer
            if (this.clickTimer) {
                clearTimeout(this.clickTimer);
                this.clickTimer = null;
            }
            this.handleDoubleClick(event);
            this.lastClickTime = 0;  // Reset click timer
        } else {
            // Delay single click to allow for potential double click
            this.clickTimer = setTimeout(() => {
                this.handleSingleClick(event);
                this.clickTimer = null;
            }, 300);
            this.lastClickTime = clickTime;
        }
    }

    handleSingleClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const rect = this.sceneManager.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.mouseVector.set(x, y);
        this.sceneManager.raycaster.setFromCamera(this.mouseVector, this.sceneManager.camera);

        // Use optimized raycasting with InstancedMesh
        const starIntersects = this.sceneManager.raycaster.intersectObject(this.sceneManager.starInstancedMesh);
        const planetIntersects = this.sceneManager.raycaster.intersectObject(this.sceneManager.planetInstancedMesh);

        let intersects = [];

        // Process star intersects
        if (starIntersects.length > 0) {
            const instanceId = starIntersects[0].instanceId;
            const starMesh = this.sceneManager.systemMeshes[instanceId];
            if (starMesh) {
                intersects.push({ object: starMesh });
            }
        }

        // Process planet intersects
        if (planetIntersects.length > 0) {
            const instanceId = planetIntersects[0].instanceId;
            const planetMesh = this.sceneManager.planetMeshes.find(p => p.userData.instanceIndex === instanceId);
            if (planetMesh) {
                intersects.push({ object: planetMesh });
            }
        }

        if (intersects.length > 0) {
            // Play click sound only when actually clicking on an object
            if (this.audioManager) {
                this.audioManager.handleClick();
            }
            const obj = intersects[0].object;
            const objectType = obj.userData.type;

            if (objectType === 'star') {
                const sysObj = this.sceneManager.systemContainers.find(sc => sc.starMesh === obj);
                if (sysObj) {
                    const systemName = sysObj.starMesh.userData.system.name || sysObj.starMesh.userData.system.key;
                    console.log('Single-clicked system:', systemName);

                    // Store last clicked system data for centering
                    GlobalState.lastClickedSystemData = {
                        sysObj: sysObj,
                        system: sysObj.starMesh.userData.system
                    };

                    // Show the center button
                    this.uiManager.showCenterButton();

                    // Show detailed popup for star
                    this.uiManager.showObjectDetails('star', { system: sysObj.starMesh.userData.system });

                    // Show connected systems
                    this.connectionManager.showConnectedSystems(sysObj);
                }
            } else if (objectType === 'planet') {
                const planet = obj.userData.planet;
                const parentSystem = obj.userData.parentSystem;
                console.log('Single-clicked planet:', planet.name, 'in system:', parentSystem.name);

                // Find the system container for the parent system
                const sysObj = this.sceneManager.systemContainers.find(sc => sc.system === parentSystem);
                if (sysObj) {
                    // Store as last clicked for centering purposes
                    GlobalState.lastClickedSystemData = {
                        sysObj: sysObj,
                        system: sysObj.system
                    };

                    // Show system connections when clicking planets
                    this.uiManager.showCenterButton();

                    // Show detailed popup for planet
                    this.uiManager.showObjectDetails('planet', { planet: planet, parentSystem: parentSystem });

                    this.connectionManager.showConnectedSystems(sysObj);
                }
            }
        }
    }

    handleDoubleClick(event) {
        event.preventDefault();
        event.stopPropagation();

        // First, clear all wormholes on any double-click
        console.log('Double-click detected - clearing all wormholes');
        this.connectionManager.resetConnectionView();
        this.connectionManager.clearAllSystemConnections();

        const rect = this.sceneManager.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.mouseVector.set(x, y);
        this.sceneManager.raycaster.setFromCamera(this.mouseVector, this.sceneManager.camera);

        // Use optimized raycasting with InstancedMesh
        const starIntersects = this.sceneManager.raycaster.intersectObject(this.sceneManager.starInstancedMesh);
        const planetIntersects = this.sceneManager.raycaster.intersectObject(this.sceneManager.planetInstancedMesh);

        let intersects = [];

        // Process star intersects
        if (starIntersects.length > 0) {
            const instanceId = starIntersects[0].instanceId;
            const starMesh = this.sceneManager.systemMeshes[instanceId];
            if (starMesh) {
                intersects.push({ object: starMesh });
            }
        }

        // Process planet intersects
        if (planetIntersects.length > 0) {
            const instanceId = planetIntersects[0].instanceId;
            const planetMesh = this.sceneManager.planetMeshes.find(p => p.userData.instanceIndex === instanceId);
            if (planetMesh) {
                intersects.push({ object: planetMesh });
            }
        }

        if (intersects.length > 0) {
            // Play click sound only when actually double-clicking on an object
            if (this.audioManager) {
                this.audioManager.handleClick();
            }
            const obj = intersects[0].object;
            const objectType = obj.userData.type;
            let sysObj;

            if (objectType === 'star') {
                // If star was clicked, find its system container
                sysObj = this.sceneManager.systemContainers.find(sc => sc.starMesh === obj);
            } else if (objectType === 'planet') {
                // If planet was clicked, get the parent system from userData and find its container
                const parentSystem = obj.userData.parentSystem;
                sysObj = this.sceneManager.systemContainers.find(sc => sc.system === parentSystem);
            }

            if (sysObj) {
                console.log('Double-clicked object in system:', sysObj.starMesh.userData.system.name);

                if (objectType === 'planet') {
                    // Show planet details and building interface for direct planet clicks
                    const planet = obj.userData.planet;
                    const parentSystem = obj.userData.parentSystem;
                    const planetIndex = parentSystem.planets ? parentSystem.planets.indexOf(planet) : 0;

                    console.log('Opening building interface for planet:', planet.name);
                    this.uiManager.openBuildingInterface(parentSystem.name, planetIndex);
                } else if (objectType === 'star') {
                    // Show system overview with planet selection for star clicks
                    this.showSystemOverview(sysObj);
                }
            }
        }
    }

    showSystemOverview(sysObj) {
        const system = sysObj.starMesh.userData.system;
        console.log('Showing system overview for:', system.name);

        // Show system overview with planet selection
        this.uiManager.showSystemOverviewModal(system);
    }

    onKeyDown(event) {
        if (event.key === 'Escape') {
            // Always restore all systems and reset everything
            this.restoreAllSystems();
        }
    }

    isolateSystem(targetSysObj) {
        console.log('Isolating system:', targetSysObj.starMesh.userData.system.name);

        // Store original state including all children's visibility and positions
        GlobalState.originalSystemVisibility = [];
        this.sceneManager.systemContainers.forEach(sysObj => {
            const stateObject = {
                sysObj: sysObj,
                visible: sysObj.containerGroup.visible,
                originalPosition: sysObj.containerGroup.position.clone(),
                childStates: []
            };

            // Store state for all child objects
            sysObj.containerGroup.traverse(child => {
                if (child.visible !== undefined) {
                    stateObject.childStates.push({
                        id: child.id,
                        visible: child.visible
                    });
                }
            });

            GlobalState.originalSystemVisibility.push(stateObject);
        });

        // Hide all systems except the target
        this.sceneManager.systemContainers.forEach(sysObj => {
            if (sysObj !== targetSysObj) {
                sysObj.containerGroup.visible = false;
                sysObj.containerGroup.traverse(child => {
                    child.visible = false;
                });
            }
        });

        // Move target system to center and zoom in
        const targetPos = new THREE.Vector3(0, 0, 0);
        targetSysObj.containerGroup.position.copy(targetPos);

        // Smooth zoom to top-down view
        this.smoothZoomToTopDown(targetPos, targetSysObj, 1500);

        // Show labels for this system
        this.showLabelsForSystem(targetSysObj);

        // Show system information
        this.uiManager.showSystemInformation(targetSysObj.starMesh.userData.system);

        // Store current system data
        GlobalState.selectedSystemData = targetSysObj.starMesh.userData.system;
    }

    smoothZoomToTopDown(targetPos, sysObj, duration) {
        const startPos = this.sceneManager.camera.position.clone();
        const startTarget = this.sceneManager.controls.target.clone();
        const startUp = this.sceneManager.camera.up.clone();

        // Calculate appropriate distance based on number of planets
        const planetCount = sysObj.planetMeshes.length;
        const baseDistance = Math.max(8, planetCount * 2);

        this.tempVector.set(targetPos.x, targetPos.y + baseDistance, targetPos.z);
        const endPos = this.tempVector.clone();
        const endTarget = targetPos.clone();
        this.tempVector2.set(0, 0, -1);
        const endUp = this.tempVector2.clone(); // Top-down view

        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth transition
            const ease = 1 - Math.pow(1 - progress, 3);

            // Interpolate position using object pooling
            this.tempVector.lerpVectors(startPos, endPos, ease);
            this.sceneManager.camera.position.copy(this.tempVector);

            this.tempVector2.lerpVectors(startTarget, endTarget, ease);
            this.sceneManager.controls.target.copy(this.tempVector2);

            this.tempVector.lerpVectors(startUp, endUp, ease);
            this.sceneManager.camera.up.copy(this.tempVector);

            this.sceneManager.camera.lookAt(this.sceneManager.controls.target);
            this.sceneManager.controls.update();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                console.log('Camera centering complete');
            }
        };

        requestAnimationFrame(step);
    }

    showLabelsForSystem(sysObj) {
        this.clearLabels();

        const system = sysObj.starMesh.userData.system;

        // Create star label
        const starLabel = this.createLabel(system.name || system.key || 'Unknown System', true);
        starLabel.position.copy(sysObj.starMesh.position);
        starLabel.position.y += 1;
        sysObj.containerGroup.add(starLabel);

        // Create planet labels
        sysObj.planetMeshes.forEach((planetObj, index) => {
            const planet = planetObj.mesh.userData.planet;
            const planetName = planet.name || `Planet ${index + 1}`;

            const planetLabel = this.createLabel(planetName, false);
            planetLabel.position.copy(planetObj.mesh.position);
            planetLabel.position.y += 0.5;
            sysObj.containerGroup.add(planetLabel);

            // Create line from planet to label
            const line = this.createLabelLine();
            line.geometry.setFromPoints([
                planetObj.mesh.position,
                new THREE.Vector3(planetLabel.position.x, planetLabel.position.y - 0.3, planetLabel.position.z)
            ]);
            sysObj.containerGroup.add(line);
        });
    }

    createLabel(text, isStar = false) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = isStar ? 24 : 16;

        context.font = `${fontSize}px Arial`;
        const textWidth = context.measureText(text).width;

        canvas.width = textWidth + 20;
        canvas.height = fontSize + 10;

        context.font = `${fontSize}px Arial`;
        context.fillStyle = isStar ? '#ffff00' : '#ffffff';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, fontSize);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });

        const sprite = new THREE.Sprite(material);
        const scale = isStar ? 0.8 : 0.5;
        sprite.scale.set(scale * canvas.width / 100, scale * canvas.height / 100, 1);

        return sprite;
    }

    createLabelLine() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.5
        });
        return new THREE.Line(geometry, material);
    }

    clearLabels() {
        this.sceneManager.systemContainers.forEach(sysObj => {
            const toRemove = [];
            sysObj.containerGroup.traverse(child => {
                if (child instanceof THREE.Sprite ||
                    (child instanceof THREE.Line && child.material.color.getHex() === 0x888888)) {
                    toRemove.push(child);
                }
            });
            toRemove.forEach(child => {
                sysObj.containerGroup.remove(child);
                if (child.material && child.material.map) {
                    child.material.map.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
                if (child.geometry) {
                    child.geometry.dispose();
                }
            });
        });
    }

    restoreAllSystems() {
        console.log('Restoring all systems');

        // Reset connection view completely (removes wormholes)
        this.connectionManager.resetConnectionView();

        // Clear all system connections
        this.connectionManager.clearAllSystemConnections();

        // Reset UI controls
        this.uiManager.resetUIControls();

        // Force all systems to be visible regardless of previous state
        this.sceneManager.systemContainers.forEach(sysObj => {
            if (sysObj.containerGroup) {
                // Make the container and all its children visible
                sysObj.containerGroup.visible = true;
                sysObj.containerGroup.traverse(child => {
                    child.visible = true;
                });
                
                // Make sure star is visible
                if (sysObj.starMesh) {
                    sysObj.starMesh.visible = true;
                }
                
                // Make all planets visible
                if (sysObj.planetMeshes) {
                    sysObj.planetMeshes.forEach(planetObj => {
                        if (planetObj.mesh) planetObj.mesh.visible = true;
                        if (planetObj.group) planetObj.group.visible = true;
                    });
                }

                // Restore original position if it exists
                if (GlobalState.originalSystemVisibility) {
                    const originalData = GlobalState.originalSystemVisibility.find(
                        item => item.sysObj === sysObj
                    );
                    if (originalData && originalData.originalPosition) {
                        sysObj.containerGroup.position.copy(originalData.originalPosition);
                    }
                }
            }
        });

        // Clear stored visibility state
        GlobalState.originalSystemVisibility = [];

        // Clear labels
        this.clearLabels();

        // Reset camera to a better overview position
        const defaultDistance = Math.max(120 * (this.sceneManager.SPREAD || 2.5), 200);
        this.sceneManager.camera.position.set(0, defaultDistance * 0.5, defaultDistance);
        this.sceneManager.controls.target.set(0, 0, 0);
        this.sceneManager.camera.up.set(0, 1, 0);
        this.sceneManager.camera.lookAt(0, 0, 0);
        this.sceneManager.controls.update();

        // Hide system information
        this.uiManager.hideSystemInformation();
        
        // Reset global state
        GlobalState.selectedSystemData = null;
        GlobalState.lastClickedSystemData = null;
        GlobalState.centerButtonConnectionsVisible = false;
    }

    showTooltip(event, system) {
        const tooltip = document.getElementById('planetTooltip');
        if (!tooltip) return;

        const systemName = system.name || system.key || 'Unknown System';
        const planetCount = system.planets ? system.planets.length : 0;
        const links = system.links ? system.links.length : 0;

        tooltip.innerHTML = `
            <strong>${systemName}</strong><br>
            🪐 ${planetCount} planets<br>
            🔗 ${links} connections
        `;

        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top = (event.clientY - 10) + 'px';
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        const tooltip = document.getElementById('planetTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
}
// Connection Management - Handle wormhole connections and visualization
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GlobalState } from './state.js';

export class ConnectionManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
    }

    // Show connected systems for a specific system
    showConnectedSystems(centerSysObj) {
        console.log('Showing connected systems for:', centerSysObj.starMesh.userData.system.name);

        // Clear any existing connection lines first to prevent overlapping
        GlobalState.connectionLines.forEach(line => {
            this.sceneManager.scene.remove(line);
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
        });
        GlobalState.connectionLines = [];

        // Reset materials first
        GlobalState.originalMaterials.forEach((originalMaterial, mesh) => {
            mesh.material = originalMaterial;
        });
        GlobalState.originalMaterials.clear();

        const centerSystem = centerSysObj.starMesh.userData.system;
        const centerPos = new THREE.Vector3();
        centerSysObj.starMesh.getWorldPosition(centerPos);

        if (!centerSystem.links || centerSystem.links.length === 0) {
            console.log('No connected systems found');
            return;
        }

        GlobalState.isConnectionView = true;
        const connectedSysObjs = [];

        // Find connected system objects
        centerSystem.links.forEach(linkName => {
            const connectedSysObj = this.sceneManager.systemContainers.find(sc => {
                const sys = sc.starMesh.userData.system;
                return sys.name === linkName || sys.key === linkName || sys.id === linkName;
            });

            if (connectedSysObj) {
                connectedSysObjs.push(connectedSysObj);
            }
        });

        console.log('Found', connectedSysObjs.length, 'connected system objects');

        // Keep all systems visible but highlight connected ones
        this.sceneManager.systemContainers.forEach(sysObj => {
            const isConnected = sysObj === centerSysObj || connectedSysObjs.includes(sysObj);

            // Always keep systems visible
            sysObj.containerGroup.visible = true;

            if (isConnected) {
                // Store original material and apply glow effect
                const starMesh = sysObj.starMesh;
                if (!GlobalState.originalMaterials.has(starMesh)) {
                    GlobalState.originalMaterials.set(starMesh, starMesh.material.clone());
                }

                // Create glowing material
                const glowMaterial = starMesh.material.clone();
                glowMaterial.emissive.multiplyScalar(3.0);
                starMesh.material = glowMaterial;
            } else {
                // Dim non-connected systems but keep them visible
                const starMesh = sysObj.starMesh;
                if (!GlobalState.originalMaterials.has(starMesh)) {
                    GlobalState.originalMaterials.set(starMesh, starMesh.material.clone());
                }

                // Create dimmed material
                const dimmedMaterial = starMesh.material.clone();
                dimmedMaterial.opacity = 0.3;
                dimmedMaterial.transparent = true;
                starMesh.material = dimmedMaterial;
            }
        });

        // Create connection lines
        connectedSysObjs.forEach(connectedSysObj => {
            const connectedPos = new THREE.Vector3();
            connectedSysObj.starMesh.getWorldPosition(connectedPos);
            this.createWormholeConnection(centerPos, connectedPos);
        });

        GlobalState.connectedSystemMeshes = connectedSysObjs.map(sysObj => sysObj.starMesh);
    }

    createWormholeConnection(pos1, pos2) {
        const points = [];
        const segments = 25;

        // Create curved path with some randomness
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const curve = Math.sin(t * Math.PI) * 0.7; // Arch effect

            const midPoint = new THREE.Vector3().lerpVectors(pos1, pos2, t);
            midPoint.y += curve;

            // Add some random variation for organic feel
            const randomOffset = new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.4
            );
            midPoint.add(randomOffset.multiplyScalar(curve));

            points.push(midPoint);
        }

        // Create the line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create wormhole material with shifting colors
        const material = new THREE.LineBasicMaterial({
            color: 0x00ccff,
            transparent: true,
            opacity: 0.7,
            linewidth: 3
        });

        const line = new THREE.Line(geometry, material);
        line.userData = {
            isWormhole: true,
            animationPhase: Math.random() * Math.PI * 2,
            originalOpacity: 0.7
        };

        this.sceneManager.scene.add(line);
        GlobalState.connectionLines.push(line);

        // Create particle effects
        this.createWormholeParticles(points);
    }

    createWormholeParticles(points) {
        const particleCount = 30;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Distribute particles along the path
            const pathIndex = Math.floor((i / (particleCount - 1)) * (points.length - 1));
            const point = points[pathIndex];

            positions[i * 3] = point.x + (Math.random() - 0.5) * 0.2;
            positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.2;
            positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.2;

            // Bright cyan/blue colors
            colors[i * 3] = 0.2 + Math.random() * 0.3;     // R
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
            colors[i * 3 + 2] = 1.0;                       // B

            sizes[i] = Math.random() * 0.05 + 0.02;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.userData = {
            isWormholeParticles: true,
            animationPhase: Math.random() * Math.PI * 2
        };

        this.sceneManager.scene.add(particles);
        GlobalState.connectionLines.push(particles);
    }

    // Clear connection view (but keep wormholes visible)
    clearConnectionView() {
        console.log('Clearing connection view');

        if (!GlobalState.isConnectionView) return;

        GlobalState.isConnectionView = false;

        // Restore original materials
        GlobalState.originalMaterials.forEach((originalMaterial, mesh) => {
            mesh.material = originalMaterial;
        });
        GlobalState.originalMaterials.clear();

        // Keep all systems visible
        this.sceneManager.systemContainers.forEach(sysObj => {
            sysObj.containerGroup.visible = true;
        });

        GlobalState.connectedSystemMeshes = [];
    }

    // Reset connection view completely (removes wormholes)
    resetConnectionView() {
        console.log('Resetting connection view - removing wormholes');

        GlobalState.isConnectionView = false;

        // Remove all connection lines and particles
        GlobalState.connectionLines.forEach(line => {
            this.sceneManager.scene.remove(line);
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
        });
        GlobalState.connectionLines = [];

        // Restore original materials
        GlobalState.originalMaterials.forEach((originalMaterial, mesh) => {
            mesh.material = originalMaterial;
        });
        GlobalState.originalMaterials.clear();

        // Show all systems
        this.sceneManager.systemContainers.forEach(sysObj => {
            sysObj.containerGroup.visible = true;
        });

        GlobalState.connectedSystemMeshes = [];
    }

    // Show all system connections (direct wormholes only)
    showAllSystemConnections() {
        console.log('Showing all direct wormhole connections');

        // Clear existing connections first
        this.clearAllSystemConnections();

        // Show only direct wormhole connections
        const processedConnections = new Set();

        GlobalState.systems.forEach(system => {
            if (system.links && system.links.length > 0) {
                const systemName = system.name || system.key || system.id;
                const sysObj = this.sceneManager.systemContainers.find(sc => {
                    const sys = sc.starMesh.userData.system;
                    return sys.name === systemName || sys.key === systemName || sys.id === systemName;
                });

                if (sysObj) {
                    const centerPos = new THREE.Vector3();
                    sysObj.starMesh.getWorldPosition(centerPos);

                    system.links.forEach(linkName => {
                        // Create unique connection identifier to avoid duplicates
                        const connectionId = [systemName, linkName].sort().join('|');

                        if (!processedConnections.has(connectionId)) {
                            processedConnections.add(connectionId);

                            const connectedSysObj = this.sceneManager.systemContainers.find(sc => {
                                const sys = sc.starMesh.userData.system;
                                return sys.name === linkName || sys.key === linkName || sys.id === linkName;
                            });

                            if (connectedSysObj) {
                                const connectedPos = new THREE.Vector3();
                                connectedSysObj.starMesh.getWorldPosition(connectedPos);
                                this.createAllConnectionsWormhole(centerPos, connectedPos, true);
                            }
                        }
                    });
                }
            }
        });

        console.log(`Created ${GlobalState.allSystemConnections.length} direct wormhole connections`);
    }

    createAllConnectionsWormhole(pos1, pos2, isDirect = true) {
        const points = [];
        const segments = isDirect ? 20 : 15;

        // Create curved path
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const curve = Math.sin(t * Math.PI) * (isDirect ? 0.4 : 0.2);

            const midPoint = new THREE.Vector3().lerpVectors(pos1, pos2, t);
            midPoint.y += curve;

            // Add random variation
            const randomIntensity = isDirect ? 0.3 : 0.15;
            const randomOffset = new THREE.Vector3(
                (Math.random() - 0.5) * randomIntensity,
                (Math.random() - 0.5) * randomIntensity * 0.5,
                (Math.random() - 0.5) * randomIntensity
            );
            midPoint.add(randomOffset.multiplyScalar(curve));

            points.push(midPoint);
        }

        // Create the line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Direct connections - more visible, blue-purple
        const material = new THREE.LineBasicMaterial({
            color: 0x6666ff,
            transparent: true,
            opacity: 0.6,
            linewidth: 3
        });

        const line = new THREE.Line(geometry, material);
        line.userData = {
            isAllConnectionsWormhole: true,
            isDirect: isDirect,
            animationPhase: Math.random() * Math.PI * 2,
            originalOpacity: 0.6
        };

        this.sceneManager.scene.add(line);
        GlobalState.allSystemConnections.push(line);

        // Add particle effects for direct connections to make them more visible
        if (isDirect) {
            this.createConnectionParticles(points, isDirect);
        }
    }

    createConnectionParticles(points, isDirect) {
        const particleCount = isDirect ? 20 : 10;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Distribute particles along the path
            const pathIndex = Math.floor((i / (particleCount - 1)) * (points.length - 1));
            const point = points[pathIndex] || points[points.length - 1];

            positions[i * 3] = point.x + (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.1;

            // Blue-white particles for direct connections
            colors[i * 3] = 0.4 + Math.random() * 0.6;     // R
            colors[i * 3 + 1] = 0.4 + Math.random() * 0.6; // G
            colors[i * 3 + 2] = 1.0;                       // B

            sizes[i] = Math.random() * 0.03 + 0.01;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.03,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.userData = {
            isAllConnectionsParticles: true,
            isDirect: isDirect,
            animationPhase: Math.random() * Math.PI * 2
        };

        this.sceneManager.scene.add(particles);
        GlobalState.allSystemConnections.push(particles);
    }

    clearAllSystemConnections() {
        GlobalState.allSystemConnections.forEach(line => {
            this.sceneManager.scene.remove(line);
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
        });
        GlobalState.allSystemConnections = [];
    }
}
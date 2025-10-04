// WebGL Effects Manager - Orchestrates all advanced WebGL visual effects
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GlobalState } from './state.js';

export class WebGLEffectsManager {
    constructor(sceneManager, webglIntegration) {
        this.sceneManager = sceneManager;
        this.webgl = webglIntegration;

        // Effect objects storage
        this.holographicFleets = new Map();
        this.energyShields = new Map();
        this.wormholes = [];
        this.particleSystems = [];

        // Clock for animations
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        console.log('🎨 Initializing WebGL Effects Manager...');

        // Create pre-built shaders
        this.holographicShader = this.webgl.createHolographicShader();
        this.shieldShader = this.webgl.createEnergyShieldShader();
        this.wormholeShader = this.webgl.createWormholeShader();

        // Don't apply effects automatically - let user activate them via UI
        console.log('✅ WebGL Effects ready (use control panel to activate)');
    }

    applyEffectsToScene() {
        console.log('🌟 Applying WebGL effects to scene...');

        // Add space dust particle system
        this.createSpaceDust();

        // Add nebula effects
        this.createNebulaClouds();

        // Initialize demo mode
        this.setupDemoMode();
    }

    // ==========================================
    // HOLOGRAPHIC FLEETS
    // ==========================================

    /**
     * Replace fleet cone with holographic effect
     * @param {string} fleetId - Fleet identifier
     * @param {THREE.Vector3} position - Fleet position
     * @param {number} color - Fleet color
     */
    createHolographicFleet(fleetId, position, color = 0x00ffff) {
        // Create ship geometry (more interesting than cone)
        const shipGeometry = new THREE.ConeGeometry(0.3, 1, 4);
        shipGeometry.rotateX(Math.PI / 2);

        // Clone holographic shader with custom color
        const material = this.holographicShader.clone();
        material.uniforms.color.value = new THREE.Color(color);

        // Create mesh
        const ship = new THREE.Mesh(shipGeometry, material);
        ship.position.copy(position);
        ship.userData.isHolographicFleet = true;
        ship.userData.fleetId = fleetId;

        this.sceneManager.scene.add(ship);
        this.holographicFleets.set(fleetId, ship);

        console.log(`✨ Created holographic fleet: ${fleetId}`);
        return ship;
    }

    /**
     * Update holographic fleet position
     */
    updateHolographicFleet(fleetId, newPosition) {
        const fleet = this.holographicFleets.get(fleetId);
        if (fleet) {
            fleet.position.lerp(newPosition, 0.1); // Smooth movement
        }
    }

    /**
     * Remove holographic fleet
     */
    removeHolographicFleet(fleetId) {
        const fleet = this.holographicFleets.get(fleetId);
        if (fleet) {
            this.sceneManager.scene.remove(fleet);
            fleet.geometry.dispose();
            fleet.material.dispose();
            this.holographicFleets.delete(fleetId);
        }
    }

    // ==========================================
    // ENERGY SHIELDS
    // ==========================================

    /**
     * Add energy shield around a system
     * @param {string} systemId - System identifier
     * @param {THREE.Vector3} position - Shield position
     * @param {number} radius - Shield radius
     * @param {number} color - Shield color
     */
    createEnergyShield(systemId, position, radius = 5, color = 0x00ff88) {
        // Create shield geometry
        const geometry = new THREE.SphereGeometry(radius, 32, 32);

        // Clone shield shader with custom color
        const material = this.shieldShader.clone();
        material.uniforms.color.value = new THREE.Color(color);

        // Create shield mesh
        const shield = new THREE.Mesh(geometry, material);
        shield.position.copy(position);
        shield.userData.isEnergyShield = true;
        shield.userData.systemId = systemId;

        this.sceneManager.scene.add(shield);
        this.energyShields.set(systemId, shield);

        console.log(`🛡️ Created energy shield for system: ${systemId}`);
        return shield;
    }

    /**
     * Trigger shield hit effect at specific point
     */
    triggerShieldHit(systemId, hitPoint) {
        const shield = this.energyShields.get(systemId);
        if (shield && shield.material.uniforms) {
            shield.material.uniforms.hitPoint.value.copy(hitPoint);
            shield.material.uniforms.hitTime.value = this.clock.getElapsedTime();
            console.log(`💥 Shield hit on system: ${systemId}`);
        }
    }

    /**
     * Remove energy shield
     */
    removeEnergyShield(systemId) {
        const shield = this.energyShields.get(systemId);
        if (shield) {
            this.sceneManager.scene.remove(shield);
            shield.geometry.dispose();
            shield.material.dispose();
            this.energyShields.delete(systemId);
        }
    }

    /**
     * Toggle shield for a system
     */
    toggleEnergyShield(systemId, position, radius) {
        if (this.energyShields.has(systemId)) {
            this.removeEnergyShield(systemId);
        } else {
            this.createEnergyShield(systemId, position, radius);
        }
    }

    // ==========================================
    // WORMHOLE PORTALS
    // ==========================================

    /**
     * Create wormhole portal between two points
     * @param {THREE.Vector3} start - Start position
     * @param {THREE.Vector3} end - End position
     */
    createWormhole(start, end) {
        // Create wormhole at midpoint
        const midpoint = new THREE.Vector3().lerpVectors(start, end, 0.5);

        // Create torus geometry for portal
        const geometry = new THREE.TorusGeometry(2, 0.8, 16, 32);

        // Clone wormhole shader
        const material = this.wormholeShader.clone();

        // Create portal mesh
        const portal = new THREE.Mesh(geometry, material);
        portal.position.copy(midpoint);

        // Orient portal to face the connection direction
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        portal.lookAt(portal.position.clone().add(direction));

        portal.userData.isWormhole = true;

        this.sceneManager.scene.add(portal);
        this.wormholes.push(portal);

        // Add swirling particles around the portal
        this.addWormholeParticles(portal);

        console.log(`🌀 Created wormhole portal`);
        return portal;
    }

    /**
     * Add particle effect around wormhole
     */
    addWormholeParticles(portal) {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 2 + Math.random() * 1;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(angle) * radius;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xff00ff,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        portal.add(particles);
        particles.userData.isWormholeParticles = true;
    }

    /**
     * Clear all wormholes
     */
    clearWormholes() {
        this.wormholes.forEach(wormhole => {
            this.sceneManager.scene.remove(wormhole);
            wormhole.geometry.dispose();
            wormhole.material.dispose();
        });
        this.wormholes = [];
    }

    // ==========================================
    // SPACE DUST PARTICLE SYSTEM
    // ==========================================

    /**
     * Create ambient space dust particles
     */
    createSpaceDust() {
        const dustSystem = this.webgl.createParticleSystem({
            count: 20000,
            size: 0.08,
            color: 0x888888,
            spread: 500,
            transparent: true,
            blending: THREE.NormalBlending
        });

        dustSystem.userData.isDust = true;
        this.particleSystems.push(dustSystem);

        console.log('✨ Created space dust particle system');
        return dustSystem;
    }

    /**
     * Create nebula cloud effects
     */
    createNebulaClouds() {
        // Create multiple colored nebula clouds
        const nebulaColors = [
            0x4400ff, // Purple
            0xff0088, // Pink
            0x00ffff, // Cyan
            0xff8800  // Orange
        ];

        nebulaColors.forEach((color, index) => {
            const cloud = this.webgl.createParticleSystem({
                count: 5000,
                size: 1.5,
                color: color,
                spread: 300,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            // Position clouds in different areas
            const angle = (index / nebulaColors.length) * Math.PI * 2;
            cloud.position.set(
                Math.cos(angle) * 200,
                (Math.random() - 0.5) * 100,
                Math.sin(angle) * 200
            );

            cloud.userData.isNebula = true;
            cloud.userData.rotationSpeed = 0.0001 + Math.random() * 0.0002;
            this.particleSystems.push(cloud);
        });

        console.log('🌌 Created nebula cloud systems');
    }

    // ==========================================
    // DEMO MODE
    // ==========================================

    /**
     * Setup demo mode with example effects
     */
    setupDemoMode() {
        // Create a few demo holographic ships
        const demoPositions = [
            new THREE.Vector3(50, 20, 30),
            new THREE.Vector3(-40, 15, -50),
            new THREE.Vector3(30, -25, 60)
        ];

        demoPositions.forEach((pos, index) => {
            this.createHolographicFleet(`demo_fleet_${index}`, pos, 0x00ffff + index * 0x110011);
        });

        console.log('🎮 Demo mode initialized with sample effects');
    }

    /**
     * Create wormholes for active connections
     */
    createWormholesForConnections(connections) {
        this.clearWormholes();

        connections.forEach(connection => {
            if (connection.start && connection.end) {
                this.createWormhole(connection.start, connection.end);
            }
        });
    }

    // ==========================================
    // ANIMATION UPDATE
    // ==========================================

    /**
     * Update all effects (call this in animation loop)
     */
    update() {
        const deltaTime = this.clock.getDelta();

        // Update shader uniforms
        this.webgl.updateShaders(deltaTime);

        // Rotate holographic fleets
        this.holographicFleets.forEach(fleet => {
            fleet.rotation.y += 0.02;
        });

        // Rotate wormholes
        this.wormholes.forEach(wormhole => {
            wormhole.rotation.z += 0.01;

            // Rotate particles around wormhole
            const particles = wormhole.children.find(child => child.userData.isWormholeParticles);
            if (particles) {
                particles.rotation.z -= 0.03;
            }
        });

        // Rotate particle systems
        this.particleSystems.forEach(system => {
            if (system.userData.isDust) {
                system.rotation.y += 0.0001;
            }
            if (system.userData.isNebula) {
                system.rotation.y += system.userData.rotationSpeed;
                system.rotation.x += system.userData.rotationSpeed * 0.5;
            }
        });
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Get all active effects count
     */
    getEffectsStats() {
        return {
            holographicFleets: this.holographicFleets.size,
            energyShields: this.energyShields.size,
            wormholes: this.wormholes.length,
            particleSystems: this.particleSystems.length
        };
    }

    /**
     * Clear all effects
     */
    clearAllEffects() {
        // Remove holographic fleets
        this.holographicFleets.forEach((fleet, id) => {
            this.removeHolographicFleet(id);
        });

        // Remove energy shields
        this.energyShields.forEach((shield, id) => {
            this.removeEnergyShield(id);
        });

        // Clear wormholes
        this.clearWormholes();

        console.log('🧹 Cleared all WebGL effects');
    }
}

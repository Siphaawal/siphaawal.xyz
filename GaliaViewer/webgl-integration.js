// WebGL Integration - Advanced WebGL features and custom shaders
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export class WebGLIntegration {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.customShaders = new Map();
        this.webglTextures = new Map();
        this.shaderMaterials = new Map();
    }

    // ==========================================
    // CUSTOM WEBGL SHADERS
    // ==========================================

    /**
     * Create a custom shader material with vertex and fragment shaders
     * @param {string} name - Shader name for reference
     * @param {object} shaderConfig - Vertex shader, fragment shader, uniforms
     * @returns {THREE.ShaderMaterial}
     */
    createCustomShader(name, shaderConfig) {
        const {
            vertexShader,
            fragmentShader,
            uniforms = {},
            transparent = false,
            side = THREE.FrontSide
        } = shaderConfig;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent,
            side
        });

        this.shaderMaterials.set(name, material);
        console.log(`✅ Custom shader created: ${name}`);
        return material;
    }

    /**
     * Pre-built shader: Holographic effect
     */
    createHolographicShader() {
        const vertexShader = `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform float time;
            uniform vec3 color;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Fresnel effect
                vec3 viewDirection = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);

                // Scan lines
                float scanline = sin(vPosition.y * 20.0 + time * 2.0) * 0.5 + 0.5;

                // Combine effects
                vec3 finalColor = color * fresnel * scanline;
                float alpha = fresnel * 0.8;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        return this.createCustomShader('holographic', {
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0.0 },
                color: { value: new THREE.Color(0x00ffff) }
            },
            transparent: true
        });
    }

    /**
     * Pre-built shader: Energy shield effect
     */
    createEnergyShieldShader() {
        const vertexShader = `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform float time;
            uniform vec3 color;
            uniform vec3 hitPoint;
            uniform float hitTime;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Fresnel for shield edge glow
                vec3 viewDirection = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);

                // Hexagonal pattern
                vec2 uv = vPosition.xy * 5.0;
                float hex = sin(uv.x) * sin(uv.y + time);

                // Impact ripple effect
                float dist = length(vPosition - hitPoint);
                float ripple = sin(dist * 10.0 - (time - hitTime) * 5.0);
                ripple = max(0.0, ripple) * exp(-(time - hitTime) * 2.0);

                // Combine effects
                vec3 finalColor = color * (fresnel * 0.5 + hex * 0.3 + ripple);
                float alpha = fresnel * 0.7 + ripple * 0.5;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        return this.createCustomShader('energyShield', {
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0.0 },
                color: { value: new THREE.Color(0x00ff88) },
                hitPoint: { value: new THREE.Vector3(0, 0, 0) },
                hitTime: { value: 0.0 }
            },
            transparent: true
        });
    }

    /**
     * Pre-built shader: Wormhole/Portal effect
     */
    createWormholeShader() {
        const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                // Spiral pattern
                vec2 center = vUv - 0.5;
                float angle = atan(center.y, center.x);
                float radius = length(center);

                float spiral = sin(angle * 5.0 + radius * 10.0 - time * 2.0);
                float pulse = sin(time * 3.0) * 0.5 + 0.5;

                // Color gradient
                vec3 color = mix(color1, color2, spiral * 0.5 + 0.5);

                // Vortex distortion
                float distortion = (1.0 - radius) * pulse;
                color *= distortion;

                float alpha = (1.0 - radius) * 0.8;

                gl_FragColor = vec4(color, alpha);
            }
        `;

        return this.createCustomShader('wormhole', {
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0.0 },
                color1: { value: new THREE.Color(0x4400ff) },
                color2: { value: new THREE.Color(0xff00ff) }
            },
            transparent: true
        });
    }

    /**
     * Update shader uniforms (call this in animation loop)
     */
    updateShaders(deltaTime) {
        this.shaderMaterials.forEach((material, name) => {
            if (material.uniforms.time) {
                material.uniforms.time.value += deltaTime;
            }
        });
    }

    // ==========================================
    // WEBGL TEXTURES & MATERIALS
    // ==========================================

    /**
     * Load WebGL texture with advanced options
     * @param {string} url - Path to texture image
     * @param {object} options - Texture configuration
     * @returns {Promise<THREE.Texture>}
     */
    async loadWebGLTexture(url, options = {}) {
        try {
            const {
                wrapS = THREE.RepeatWrapping,
                wrapT = THREE.RepeatWrapping,
                minFilter = THREE.LinearMipmapLinearFilter,
                magFilter = THREE.LinearFilter,
                anisotropy = 16
            } = options;

            const texture = await new Promise((resolve, reject) => {
                const loader = new THREE.TextureLoader();
                loader.load(
                    url,
                    (texture) => resolve(texture),
                    undefined,
                    (error) => reject(error)
                );
            });

            texture.wrapS = wrapS;
            texture.wrapT = wrapT;
            texture.minFilter = minFilter;
            texture.magFilter = magFilter;
            texture.anisotropy = Math.min(anisotropy, this.sceneManager.renderer.capabilities.getMaxAnisotropy());

            this.webglTextures.set(url, texture);
            console.log(`✅ WebGL texture loaded: ${url}`);
            return texture;

        } catch (error) {
            console.error(`❌ Error loading texture: ${url}`, error);
            throw error;
        }
    }

    /**
     * Create material with normal map, displacement, etc.
     * @param {object} config - Material configuration
     * @returns {THREE.Material}
     */
    async createAdvancedMaterial(config) {
        const {
            type = 'standard', // 'standard', 'phong', 'physical'
            color = 0xffffff,
            map = null,
            normalMap = null,
            roughnessMap = null,
            metalnessMap = null,
            emissiveMap = null,
            displacementMap = null,
            roughness = 0.5,
            metalness = 0.5,
            emissive = 0x000000,
            emissiveIntensity = 1.0,
            displacementScale = 1.0
        } = config;

        // Load textures if URLs provided
        const textures = {};
        if (map) textures.map = await this.loadWebGLTexture(map);
        if (normalMap) textures.normalMap = await this.loadWebGLTexture(normalMap);
        if (roughnessMap) textures.roughnessMap = await this.loadWebGLTexture(roughnessMap);
        if (metalnessMap) textures.metalnessMap = await this.loadWebGLTexture(metalnessMap);
        if (emissiveMap) textures.emissiveMap = await this.loadWebGLTexture(emissiveMap);
        if (displacementMap) textures.displacementMap = await this.loadWebGLTexture(displacementMap);

        // Create material based on type
        let material;
        switch (type) {
            case 'physical':
                material = new THREE.MeshPhysicalMaterial({
                    color,
                    roughness,
                    metalness,
                    emissive,
                    emissiveIntensity,
                    ...textures
                });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({
                    color,
                    emissive,
                    emissiveIntensity,
                    ...textures
                });
                break;
            default: // standard
                material = new THREE.MeshStandardMaterial({
                    color,
                    roughness,
                    metalness,
                    emissive,
                    emissiveIntensity,
                    displacementScale,
                    ...textures
                });
        }

        console.log(`✅ Advanced material created (${type})`);
        return material;
    }


    // ==========================================
    // PARTICLE SYSTEMS (WebGL-accelerated)
    // ==========================================

    /**
     * Create WebGL-accelerated particle system
     * @param {object} config - Particle system configuration
     * @returns {THREE.Points}
     */
    createParticleSystem(config) {
        const {
            count = 10000,
            size = 0.1,
            color = 0xffffff,
            spread = 100,
            texture = null,
            transparent = true,
            blending = THREE.AdditiveBlending
        } = config;

        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * spread;
            positions[i3 + 1] = (Math.random() - 0.5) * spread;
            positions[i3 + 2] = (Math.random() - 0.5) * spread;

            const c = new THREE.Color(color);
            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;

            sizes[i] = size * (Math.random() * 0.5 + 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Create material
        const material = new THREE.PointsMaterial({
            size,
            vertexColors: true,
            transparent,
            blending,
            depthWrite: false,
            map: texture
        });

        // Create particle system
        const particles = new THREE.Points(geometry, material);
        this.sceneManager.scene.add(particles);

        console.log(`✅ Particle system created with ${count} particles`);
        return particles;
    }

    // ==========================================
    // POST-PROCESSING EFFECTS (WebGL)
    // ==========================================

    /**
     * Enable bloom effect (requires EffectComposer)
     */
    getBloomSettings() {
        return {
            exposure: 1,
            bloomStrength: 1.5,
            bloomThreshold: 0.4,
            bloomRadius: 0.8
        };
    }
}

/**
 * ============================================
 * USAGE EXAMPLES
 * ============================================
 */

/*

// Initialize
const webglIntegration = new WebGLIntegration(sceneManager);

// 1. Create custom holographic material
const holoMaterial = webglIntegration.createHolographicShader();
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    holoMaterial
);
scene.add(sphere);

// Update shaders in animation loop
function animate() {
    webglIntegration.updateShaders(clock.getDelta());
}

// 2. Create energy shield around object
const shieldMaterial = webglIntegration.createEnergyShieldShader();
const shield = new THREE.Mesh(
    new THREE.SphereGeometry(6, 32, 32),
    shieldMaterial
);
shield.userData.material = shieldMaterial;

// Trigger shield hit effect
shieldMaterial.uniforms.hitPoint.value.set(x, y, z);
shieldMaterial.uniforms.hitTime.value = performance.now() / 1000;

// 3. Load advanced textured material
const material = await webglIntegration.createAdvancedMaterial({
    type: 'physical',
    color: 0x888888,
    map: 'textures/ship_diffuse.jpg',
    normalMap: 'textures/ship_normal.jpg',
    roughnessMap: 'textures/ship_roughness.jpg',
    metalnessMap: 'textures/ship_metalness.jpg',
    roughness: 0.6,
    metalness: 0.8
});

// 4. Create particle field
const particles = webglIntegration.createParticleSystem({
    count: 50000,
    size: 0.05,
    color: 0x00ffff,
    spread: 200,
    blending: THREE.AdditiveBlending
});

// Animate particles in loop
particles.rotation.y += 0.001;

*/

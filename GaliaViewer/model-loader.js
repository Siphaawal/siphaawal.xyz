// Model Loader - Load 3D models (GLTF, FBX, OBJ) into the scene
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/OBJLoader.js';

export class ModelLoader {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;

        // Initialize loaders
        this.gltfLoader = new GLTFLoader();
        this.fbxLoader = new FBXLoader();
        this.objLoader = new OBJLoader();

        // Store loaded models
        this.loadedModels = new Map();
        this.modelCache = new Map();
    }

    /**
     * Load a GLTF/GLB model
     * @param {string} url - Path to the GLTF/GLB file
     * @param {object} options - Position, scale, rotation options
     * @returns {Promise<THREE.Object3D>}
     */
    async loadGLTF(url, options = {}) {
        try {
            console.log(`📦 Loading GLTF model: ${url}`);

            // Check cache
            if (this.modelCache.has(url)) {
                console.log('✅ Using cached model');
                return this.cloneModel(this.modelCache.get(url), options);
            }

            // Load model
            const gltf = await new Promise((resolve, reject) => {
                this.gltfLoader.load(
                    url,
                    (gltf) => resolve(gltf),
                    (progress) => {
                        const percent = (progress.loaded / progress.total * 100).toFixed(0);
                        console.log(`Loading: ${percent}%`);
                    },
                    (error) => reject(error)
                );
            });

            const model = gltf.scene;

            // Cache the original
            this.modelCache.set(url, model.clone());

            // Apply transformations
            this.applyTransforms(model, options);

            // Add to scene
            this.sceneManager.scene.add(model);

            // Store reference
            const modelId = `gltf_${Date.now()}_${Math.random()}`;
            this.loadedModels.set(modelId, {
                model,
                url,
                type: 'gltf',
                animations: gltf.animations
            });

            console.log(`✅ GLTF model loaded: ${url}`);
            return { model, animations: gltf.animations, id: modelId };

        } catch (error) {
            console.error(`❌ Error loading GLTF: ${url}`, error);
            throw error;
        }
    }

    /**
     * Load an FBX model
     * @param {string} url - Path to the FBX file
     * @param {object} options - Position, scale, rotation options
     * @returns {Promise<THREE.Object3D>}
     */
    async loadFBX(url, options = {}) {
        try {
            console.log(`📦 Loading FBX model: ${url}`);

            // Check cache
            if (this.modelCache.has(url)) {
                console.log('✅ Using cached model');
                return this.cloneModel(this.modelCache.get(url), options);
            }

            // Load model
            const model = await new Promise((resolve, reject) => {
                this.fbxLoader.load(
                    url,
                    (object) => resolve(object),
                    (progress) => {
                        const percent = (progress.loaded / progress.total * 100).toFixed(0);
                        console.log(`Loading: ${percent}%`);
                    },
                    (error) => reject(error)
                );
            });

            // Cache the original
            this.modelCache.set(url, model.clone());

            // Apply transformations
            this.applyTransforms(model, options);

            // Add to scene
            this.sceneManager.scene.add(model);

            // Store reference
            const modelId = `fbx_${Date.now()}_${Math.random()}`;
            this.loadedModels.set(modelId, {
                model,
                url,
                type: 'fbx'
            });

            console.log(`✅ FBX model loaded: ${url}`);
            return { model, id: modelId };

        } catch (error) {
            console.error(`❌ Error loading FBX: ${url}`, error);
            throw error;
        }
    }

    /**
     * Load an OBJ model (Simple geometry)
     * @param {string} url - Path to the OBJ file
     * @param {object} options - Position, scale, rotation options
     * @returns {Promise<THREE.Object3D>}
     */
    async loadOBJ(url, options = {}) {
        try {
            console.log(`📦 Loading OBJ model: ${url}`);

            // Check cache
            if (this.modelCache.has(url)) {
                console.log('✅ Using cached model');
                return this.cloneModel(this.modelCache.get(url), options);
            }

            // Load model
            const model = await new Promise((resolve, reject) => {
                this.objLoader.load(
                    url,
                    (object) => resolve(object),
                    (progress) => {
                        const percent = (progress.loaded / progress.total * 100).toFixed(0);
                        console.log(`Loading: ${percent}%`);
                    },
                    (error) => reject(error)
                );
            });

            // Cache the original
            this.modelCache.set(url, model.clone());

            // Apply transformations
            this.applyTransforms(model, options);

            // Add to scene
            this.sceneManager.scene.add(model);

            // Store reference
            const modelId = `obj_${Date.now()}_${Math.random()}`;
            this.loadedModels.set(modelId, {
                model,
                url,
                type: 'obj'
            });

            console.log(`✅ OBJ model loaded: ${url}`);
            return { model, id: modelId };

        } catch (error) {
            console.error(`❌ Error loading OBJ: ${url}`, error);
            throw error;
        }
    }

    /**
     * Apply position, rotation, and scale to a model
     */
    applyTransforms(model, options) {
        const {
            position = { x: 0, y: 0, z: 0 },
            rotation = { x: 0, y: 0, z: 0 },
            scale = { x: 1, y: 1, z: 1 }
        } = options;

        model.position.set(position.x, position.y, position.z);
        model.rotation.set(rotation.x, rotation.y, rotation.z);
        model.scale.set(scale.x, scale.y, scale.z);
    }

    /**
     * Clone a cached model with new transforms
     */
    cloneModel(cachedModel, options) {
        const clone = cachedModel.clone();
        this.applyTransforms(clone, options);
        this.sceneManager.scene.add(clone);

        const modelId = `clone_${Date.now()}_${Math.random()}`;
        this.loadedModels.set(modelId, {
            model: clone,
            type: 'clone'
        });

        return { model: clone, id: modelId };
    }

    /**
     * Remove a model from the scene
     */
    removeModel(modelId) {
        const modelData = this.loadedModels.get(modelId);
        if (!modelData) {
            console.warn(`Model not found: ${modelId}`);
            return;
        }

        // Remove from scene
        this.sceneManager.scene.remove(modelData.model);

        // Dispose geometry and materials
        modelData.model.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.loadedModels.delete(modelId);
        console.log(`🗑️ Model removed: ${modelId}`);
    }

    /**
     * Clear all loaded models
     */
    clearAllModels() {
        this.loadedModels.forEach((modelData, modelId) => {
            this.removeModel(modelId);
        });
        console.log('🗑️ All models cleared');
    }

    /**
     * Get model by ID
     */
    getModel(modelId) {
        return this.loadedModels.get(modelId);
    }

    /**
     * Get all loaded models
     */
    getAllModels() {
        return Array.from(this.loadedModels.values());
    }
}

/**
 * USAGE EXAMPLES:
 *
 * 1. Load a GLTF model:
 *
 *    const { model, animations, id } = await modelLoader.loadGLTF('/models/spaceship.gltf', {
 *        position: { x: 10, y: 5, z: 0 },
 *        scale: { x: 2, y: 2, z: 2 },
 *        rotation: { x: 0, y: Math.PI / 2, z: 0 }
 *    });
 *
 * 2. Load an FBX model:
 *
 *    const { model, id } = await modelLoader.loadFBX('/models/station.fbx', {
 *        position: { x: 0, y: 0, z: 0 }
 *    });
 *
 * 3. Load an OBJ model:
 *
 *    const { model, id } = await modelLoader.loadOBJ('/models/asteroid.obj', {
 *        scale: { x: 0.5, y: 0.5, z: 0.5 }
 *    });
 *
 * 4. Remove a model:
 *
 *    modelLoader.removeModel(id);
 *
 * 5. Animate a loaded model:
 *
 *    if (animations && animations.length > 0) {
 *        const mixer = new THREE.AnimationMixer(model);
 *        const action = mixer.clipAction(animations[0]);
 *        action.play();
 *
 *        // In animation loop:
 *        mixer.update(deltaTime);
 *    }
 */

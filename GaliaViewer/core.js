// Core 3D Galia Viewer - Main initialization and scene setup
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

// Import modules
import { Config } from './config.js';
import { GlobalState } from './state.js';
import { SceneManager } from './scene.js';
import { EventHandlers } from './events.js';
import { ConnectionManager } from './connections.js';
import { UIManager } from './ui.js';
import { AudioManager } from './audio.js';
import { FleetDataManager } from './fleet-manager/fleet-data.js';
import { FleetVisualizer } from './fleet-manager/fleet-visualizer.js?v=3.6';
import { FleetUIManager } from './fleet-manager/fleet-ui.js';
import { WebGLIntegration } from './webgl-integration.js';
import { WebGLEffectsManager } from './webgl-effects.js';

// Global function to initialize the 3D map
window.initPlanetMap = async function(){
    console.log('🚀 Galia Viewer v4.0 - Initializing with config system');

    try {
        // Use planet data from Data folder (already loaded by planet-data.js)
        function loadPlanetData() {
            if (typeof window.planetData === 'undefined') {
                throw new Error('Planet data module not loaded. Ensure planet-data.js is included before core.js');
            }

            if (!window.planetData.mapData) {
                throw new Error('Planet data structure is invalid. Expected mapData property.');
            }

            if (!Array.isArray(window.planetData.mapData)) {
                throw new Error('Planet mapData is not an array.');
            }

            if (window.planetData.mapData.length === 0) {
                throw new Error('Planet mapData is empty. No systems to display.');
            }

            console.log('✅ Using planet data from Data folder');
            return window.planetData;
        }

        const data = loadPlanetData();
        const systems = data.mapData || [];
        console.log('planetMap: loaded systems count =', systems.length);

    // Initialize global state
    GlobalState.init(systems);

        // Get container
        const container = document.getElementById('planetMap');
        if (!container) {
            throw new Error('Could not find #planetMap container element. Check HTML structure.');
        }

        // Initialize scene manager
        console.log('Initializing scene manager...');
        const sceneManager = new SceneManager(container);

        // Initialize connection manager
        console.log('Initializing connection manager...');
        const connectionManager = new ConnectionManager(sceneManager);

        // Initialize UI manager
        console.log('Initializing UI manager...');
        const uiManager = new UIManager(container, connectionManager);

        // Initialize audio manager
        console.log('Initializing audio manager...');
        const audioManager = new AudioManager();

        // Initialize event handlers
        console.log('Initializing event handlers...');
        const eventHandlers = new EventHandlers(sceneManager, connectionManager, uiManager, audioManager);

        // Initialize fleet management system
        console.log('Initializing fleet management...');
        const fleetDataManager = new FleetDataManager();
        const fleetVisualizer = new FleetVisualizer(sceneManager);
        const fleetUIManager = new FleetUIManager(fleetDataManager, fleetVisualizer, sceneManager);

        // Initialize WebGL effects (controlled by config)
        let webglIntegration = null;
        let webglEffects = null;

        if (Config.webglEffects.enabled) {
            console.log('Initializing WebGL integration...');
            webglIntegration = new WebGLIntegration(sceneManager);
            webglEffects = new WebGLEffectsManager(sceneManager, webglIntegration);
            console.log('✅ WebGL effects enabled');
        } else {
            console.log('ℹ️ WebGL effects disabled (enable in config.js)');
        }

        // Store managers globally for access
        GlobalState.sceneManager = sceneManager;
        GlobalState.connectionManager = connectionManager;
        GlobalState.uiManager = uiManager;
        GlobalState.eventHandlers = eventHandlers;
        GlobalState.audioManager = audioManager;
        GlobalState.fleetDataManager = fleetDataManager;
        GlobalState.fleetVisualizer = fleetVisualizer;
        GlobalState.fleetUIManager = fleetUIManager;
        GlobalState.webglIntegration = webglIntegration;
        GlobalState.webglEffects = webglEffects;

        // Expose globally for HTML event handlers
        window.galiaViewer = {
            sceneManager,
            connectionManager,
            uiManager,
            eventHandlers,
            audioManager,
            fleetDataManager,
            fleetVisualizer,
            fleetUIManager,
            webglIntegration,
            webglEffects
        };

        // Start the application
        console.log('Starting animation loop...');
        sceneManager.startAnimation();

        console.log('✅ 3D Galia Viewer initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize Galia Viewer:', error);

        // Show user-friendly error message
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.innerHTML = `
                <h2 style="color: #f44336;">⚠️ Initialization Error</h2>
                <p style="margin: 15px 0; max-width: 500px;">${error.message}</p>
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: left; max-width: 500px;">
                    <strong>Troubleshooting Steps:</strong>
                    <ul style="margin-top: 10px; text-align: left;">
                        <li>Ensure all data files are loaded (check browser console)</li>
                        <li>Clear browser cache and reload the page</li>
                        <li>Check network tab for failed resource loads</li>
                        <li>Verify planet-data.js is loaded before core.js</li>
                    </ul>
                </div>
                <button onclick="location.reload()"
                        style="margin-top: 20px; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    🔄 Retry
                </button>
                <button onclick="window.location.href='../index.html'"
                        style="margin-left: 10px; padding: 10px 20px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    ← Back to Hub
                </button>
            `;
            loadingIndicator.style.display = 'block';
        }

        // Re-throw to allow outer error handlers to catch
        throw error;
    }
};
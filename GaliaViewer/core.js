// Core 3D Galia Viewer - Main initialization and scene setup
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

// Import modules
import { GlobalState } from './state.js';
import { SceneManager } from './scene.js';
import { EventHandlers } from './events.js';
import { ConnectionManager } from './connections.js';
import { UIManager } from './ui.js';

// Global function to initialize the 3D map
window.initPlanetMap = async function(){
    console.log('🚀 CORE v3.0 LOADING - CACHE BUST TEST');
    // Use planet data from Data folder (already loaded by planet-data.js)
    function loadPlanetData() {
        if (typeof window.planetData !== 'undefined' && window.planetData.mapData) {
            console.log('✅ Using planet data from Data folder');
            return window.planetData;
        }
        console.error('❌ Planet data not loaded from Data folder. Check that planet-data.js is loaded first.');
        return { mapData: [] };
    }

    const data = loadPlanetData();
    const systems = data.mapData || [];
    console.log('planetMap: loaded systems count =', systems.length);

    // Initialize global state
    GlobalState.init(systems);

    // Get container
    const container = document.getElementById('planetMap');
    if (!container) {
        console.error('planetMap: could not find #planetMap container');
        return;
    }

    // Initialize scene manager
    const sceneManager = new SceneManager(container);

    // Initialize connection manager
    const connectionManager = new ConnectionManager(sceneManager);

    // Initialize UI manager
    const uiManager = new UIManager(container, connectionManager);

    // Initialize event handlers
    const eventHandlers = new EventHandlers(sceneManager, connectionManager, uiManager);

    // Store managers globally for access
    GlobalState.sceneManager = sceneManager;
    GlobalState.connectionManager = connectionManager;
    GlobalState.uiManager = uiManager;
    GlobalState.eventHandlers = eventHandlers;

    // Expose globally for HTML onclick handlers
    window.galiaViewer = {
        sceneManager,
        connectionManager,
        uiManager,
        eventHandlers
    };

    // Start the application
    sceneManager.startAnimation();

    console.log('3D Galia Viewer initialized successfully');
};
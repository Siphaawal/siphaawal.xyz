// Fleet UI Manager - Handle user interface for fleet management
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GlobalState } from '../state.js';

export class FleetUIManager {
    constructor(fleetDataManager, fleetVisualizer, sceneManager) {
        this.fleetDataManager = fleetDataManager;
        this.fleetVisualizer = fleetVisualizer;
        this.sceneManager = sceneManager;
        this.currentWallet = null;
        this.updateInterval = null;

        this.createUI();
    }

    // Create the fleet management UI
    createUI() {
        // Check if UI already exists
        if (document.getElementById('fleetManagementPanel')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'fleetManagementPanel';
        panel.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #00ff00;
            min-width: 350px;
            max-width: 450px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #00ff00; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #00ff00; font-size: 14px;">🚀 Fleet Viewer</h3>
                <button id="toggleFleetPanel" style="background: transparent; border: none; color: #00ff00; font-size: 18px; cursor: pointer; padding: 0 5px;">−</button>
            </div>

            <div id="fleetPanelContent">
                <!-- Wallet Input Section -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc; font-size: 11px;">Solana Wallet Address:</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="walletAddressInput"
                               placeholder="Enter your Solana address..."
                               style="flex: 1; padding: 8px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; color: white; font-size: 11px;">
                        <button id="loadFleetsBtn"
                                style="background: #00ff00; color: black; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px;">
                            Load
                        </button>
                    </div>
                    <div style="margin-top: 5px; font-size: 10px; color: #888;">
                        Example: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    </div>
                </div>

                <!-- Network Selection -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc; font-size: 11px;">Network:</label>
                    <select id="networkSelect"
                            style="width: 100%; padding: 6px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; color: white; font-size: 11px;">
                        <option value="mainnet">Mainnet Beta</option>
                        <option value="devnet">Devnet</option>
                    </select>
                </div>

                <!-- Status Display -->
                <div id="fleetStatus" style="margin-bottom: 15px; padding: 10px; background: #1a1a1a; border-radius: 4px; border-left: 3px solid #666;">
                    <div style="color: #888; font-size: 11px;">💤 No wallet loaded</div>
                </div>

                <!-- Fleet List -->
                <div id="fleetList" style="max-height: 300px; overflow-y: auto; margin-top: 15px;">
                    <!-- Fleet cards will be inserted here -->
                </div>

                <!-- Actions -->
                <div style="margin-top: 15px; display: flex; gap: 8px;">
                    <button id="refreshFleetsBtn"
                            style="flex: 1; background: #333; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 11px;"
                            disabled>
                        🔄 Refresh
                    </button>
                    <button id="clearFleetsBtn"
                            style="flex: 1; background: #ff4444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 11px;"
                            disabled>
                        🗑️ Clear
                    </button>
                </div>
            </div>
        `;

        // Find the bottom left container and append to it
        const container = document.querySelector('div[style*="bottom: 20px"][style*="left: 20px"]');
        if (container) {
            container.appendChild(panel);
        } else {
            // Fallback: append to body with old positioning if container not found
            panel.style.position = 'fixed';
            panel.style.bottom = '20px';
            panel.style.left = '20px';
            panel.style.zIndex = '1000';
            document.body.appendChild(panel);
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Toggle panel
        document.getElementById('toggleFleetPanel')?.addEventListener('click', () => {
            this.togglePanel();
        });

        // Load fleets button
        document.getElementById('loadFleetsBtn')?.addEventListener('click', () => {
            this.loadFleets();
        });

        // Refresh button
        document.getElementById('refreshFleetsBtn')?.addEventListener('click', () => {
            this.refreshFleets();
        });

        // Clear button
        document.getElementById('clearFleetsBtn')?.addEventListener('click', () => {
            this.clearFleets();
        });

        // Enter key on input
        document.getElementById('walletAddressInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadFleets();
            }
        });
    }

    // Toggle panel visibility
    togglePanel() {
        const content = document.getElementById('fleetPanelContent');
        const toggleBtn = document.getElementById('toggleFleetPanel');

        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.textContent = '−';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '+';
        }
    }

    // Load fleets for wallet address
    async loadFleets() {
        const input = document.getElementById('walletAddressInput');
        const networkSelect = document.getElementById('networkSelect');
        const statusDiv = document.getElementById('fleetStatus');

        const walletAddress = input.value.trim();
        if (!walletAddress) {
            this.showStatus('⚠️ Please enter a wallet address', 'warning');
            return;
        }

        try {
            // Show loading status
            this.showStatus('🔄 Loading fleets...', 'loading');

            // Initialize connection
            const network = networkSelect.value;
            await this.fleetDataManager.initialize(network);

            // Fetch fleet data
            const fleets = await this.fleetDataManager.fetchFleetData(walletAddress);

            if (fleets.length === 0) {
                this.showStatus('❌ No fleets found for this wallet', 'error');
                return;
            }

            // Visualize fleets
            await this.fleetVisualizer.visualizeFleets(fleets);

            // Update UI
            this.currentWallet = walletAddress;
            this.displayFleets(fleets);
            this.showStatus(`✅ Loaded ${fleets.length} fleet(s)`, 'success');

            // Enable buttons
            document.getElementById('refreshFleetsBtn').disabled = false;
            document.getElementById('clearFleetsBtn').disabled = false;

            // Start auto-update
            this.startAutoUpdate();

        } catch (error) {
            console.error('Error loading fleets:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Display fleet list
    displayFleets(fleets) {
        const fleetList = document.getElementById('fleetList');
        if (!fleetList) return;

        fleetList.innerHTML = '';

        fleets.forEach((fleet, index) => {
            const fleetInfo = this.fleetVisualizer.getFleetInfo(fleet.id);
            const card = document.createElement('div');
            card.style.cssText = `
                background: #1a1a1a;
                border: 1px solid #333;
                border-left: 3px solid #00ff00;
                border-radius: 4px;
                padding: 10px;
                margin-bottom: 10px;
            `;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #00ff00; font-size: 13px;">${fleet.name}</strong>
                    <span style="background: ${fleetInfo?.isMoving ? '#ff9800' : '#4CAF50'}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px;">
                        ${fleetInfo?.isMoving ? '🚀 Traveling' : '⚓ Docked'}
                    </span>
                </div>
                <div style="font-size: 11px; color: #ccc; line-height: 1.6;">
                    <div>📦 Ships: ${fleet.ships}</div>
                    <div>📍 System: ${fleetInfo?.currentSystem || 'Unknown'}</div>
                    ${fleetInfo?.isMoving ? `<div>🎯 Target: ${fleetInfo.targetSystem}</div>` : ''}
                    ${fleetInfo?.isMoving ? `<div style="margin-top: 5px;">
                        <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="background: #00ff00; height: 100%; width: ${(fleetInfo.progress * 100).toFixed(0)}%; transition: width 0.3s;"></div>
                        </div>
                    </div>` : ''}
                </div>
            `;

            // Add click handler to center camera on fleet
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                this.centerOnFleet(fleet.id);
            });

            fleetList.appendChild(card);
        });
    }

    // Show status message
    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('fleetStatus');
        if (!statusDiv) return;

        const colors = {
            info: '#666',
            success: '#4CAF50',
            warning: '#ff9800',
            error: '#f44336',
            loading: '#2196F3'
        };

        statusDiv.innerHTML = `<div style="color: ${colors[type]}; font-size: 11px;">${message}</div>`;
        statusDiv.style.borderLeftColor = colors[type];
    }

    // Refresh fleet data
    async refreshFleets() {
        if (!this.currentWallet) return;

        // Clear cache and reload
        this.fleetDataManager.clearCache();
        await this.loadFleets();
    }

    // Clear all fleets
    clearFleets() {
        this.fleetVisualizer.clearAllFleets();
        this.currentWallet = null;

        document.getElementById('fleetList').innerHTML = '';
        document.getElementById('walletAddressInput').value = '';
        this.showStatus('💤 No wallet loaded', 'info');

        document.getElementById('refreshFleetsBtn').disabled = true;
        document.getElementById('clearFleetsBtn').disabled = true;

        this.stopAutoUpdate();
    }

    // Start auto-update of fleet positions
    startAutoUpdate() {
        this.stopAutoUpdate();

        this.updateInterval = setInterval(() => {
            const fleets = this.fleetVisualizer.getAllFleetInfo();
            if (fleets.length > 0) {
                // Update fleet cards with current positions
                this.updateFleetCards(fleets);
            }
        }, 1000); // Update every second
    }

    // Stop auto-update
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Update fleet cards with current animation state
    updateFleetCards(fleetInfos) {
        const fleetList = document.getElementById('fleetList');
        if (!fleetList) return;

        // Simple re-render for now (could be optimized)
        const mockFleets = fleetInfos.map(info => info.fleet);
        this.displayFleets(mockFleets);
    }

    // Center camera on fleet
    centerOnFleet(fleetId) {
        const mesh = this.fleetVisualizer.fleetMeshes.get(fleetId);
        if (!mesh) {
            console.warn(`Fleet ${fleetId} not found`);
            return;
        }

        // Get fleet position
        const fleetPosition = mesh.position.clone();

        // Smoothly animate camera to look at the fleet
        const camera = this.sceneManager.camera;
        const controls = this.sceneManager.controls;

        // Calculate a good camera position (offset from fleet)
        const offset = new THREE.Vector3(5, 3, 5); // Offset distance
        const targetCameraPos = fleetPosition.clone().add(offset);

        // Animate camera position and target
        this.animateCameraTo(targetCameraPos, fleetPosition);

        console.log(`🎯 Centered camera on fleet ${fleetId}`);
    }

    // Smooth camera animation
    animateCameraTo(targetPosition, lookAtPosition) {
        const camera = this.sceneManager.camera;
        const controls = this.sceneManager.controls;

        // Disable controls during animation
        controls.enabled = false;

        const startPosition = camera.position.clone();
        const startTarget = controls.target.clone();

        const duration = 1000; // 1 second animation
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-in-out function
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;

            // Interpolate camera position
            camera.position.lerpVectors(startPosition, targetPosition, easeProgress);

            // Interpolate look-at target
            controls.target.lerpVectors(startTarget, lookAtPosition, easeProgress);
            controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Re-enable controls when done
                controls.enabled = true;
            }
        };

        animate();
    }

    // Remove UI
    destroy() {
        this.stopAutoUpdate();
        const panel = document.getElementById('fleetManagementPanel');
        if (panel) {
            panel.remove();
        }
    }
}

// Global State Management - Centralized state for the 3D viewer
export class GlobalState {
    // System data
    static systems = [];

    // Scene management
    static sceneManager = null;
    static connectionManager = null;
    static uiManager = null;
    static eventHandlers = null;

    // System isolation
    static originalSystemVisibility = [];
    static selectedSystemData = null;

    // Connection view
    static isConnectionView = false;
    static connectionLines = [];
    static connectedSystemMeshes = [];
    static originalMaterials = new Map();
    static currentConnectionSystem = null; // Track which system currently has connections displayed

    // Camera centering
    static lastClickedSystemData = null;

    // UI controls
    static showAllConnectionsMode = false;
    static centerButtonConnectionsVisible = false;
    static allSystemConnections = [];

    static init(systems) {
        this.systems = systems;
        this.reset();
    }

    static reset() {
        this.originalSystemVisibility = [];
        this.selectedSystemData = null;
        this.isConnectionView = false;
        this.connectionLines = [];
        this.connectedSystemMeshes = [];
        this.originalMaterials.clear();
        this.currentConnectionSystem = null;
        this.lastClickedSystemData = null;
        this.showAllConnectionsMode = false;
        this.centerButtonConnectionsVisible = false;
        this.allSystemConnections = [];
    }

    // Helper methods
    static findSystem(systemName) {
        return this.systems.find(sys => {
            const sysName = sys.name || sys.key || sys.id;
            return sysName === systemName;
        });
    }

    static findSystemContainer(systemName) {
        if (!this.sceneManager) return null;
        return this.sceneManager.systemContainers.find(sc => {
            const sys = sc.starMesh.userData.system;
            return sys.name === systemName || sys.key === systemName || sys.id === systemName;
        });
    }
}
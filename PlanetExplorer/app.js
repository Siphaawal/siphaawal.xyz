class PlanetApp extends BaseApp {
    constructor() {
        super();
        this.init();
    }

    async loadData() {
        try {
            const planetDataResult = await DataLoader.loadExplorerData('planet');
            this.data = planetDataResult.mapData;
            console.log(`✅ Loaded ${this.data.length} star systems using DataLoader`);
        } catch (error) {
            console.error('💥 Error loading planet data:', error);
            this.data = [];
        }
    }

    initializeModules() {
        if (this.data && this.data.length > 0) {
            this.modules.explorer = new PlanetExplorer(this.data);
            this.modules.analytics = new ResourceAnalytics(this.data);

            // Keep backward compatibility
            this.planetExplorer = this.modules.explorer;
            this.resourceAnalytics = this.modules.analytics;

            // Make available globally for modal interactions
            window.planetExplorer = this.modules.explorer;

            console.log(`📈 Modules initialized with ${this.data.length} star systems`);
            console.log(`🔬 Found ${this.modules.explorer.allResources.size} unique resources`);
        } else {
            console.error('❌ Cannot initialize modules - no data available');
        }
    }

    getModalId() {
        return 'planetModal';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM Content Loaded - Starting Planet App');
    try {
        window.planetApp = new PlanetApp();
        console.log('✅ Planet App instance created successfully');
    } catch (error) {
        console.error('💥 Failed to create Planet App:', error);
    }
});
class ResourcesApp extends BaseApp {
    constructor() {
        super();
        this.init();
    }

    async loadData() {
        try {
            console.log('📦 Loading Resources Explorer data...');
            const resourcesData = await DataLoader.loadExplorerData('resources');
            this.data = resourcesData.resources || [];
            console.log(`✅ Loaded ${this.data.length} resources using DataLoader`);
        } catch (error) {
            console.error('💥 Error loading resources data:', error);
            console.error('Detailed error:', error.message);
            this.data = [];
        }
    }

    initializeModules() {
        if (this.data && this.data.length > 0) {
            this.modules.explorer = new ResourcesExplorer(this.data);
            this.modules.analytics = new ResourceAnalytics(this.data);

            // Keep backward compatibility
            this.resourcesExplorer = this.modules.explorer;
            this.resourceAnalytics = this.modules.analytics;

            // Make available globally for modal interactions
            window.resourcesExplorer = this.modules.explorer;

            console.log(`📈 Modules initialized with ${this.data.length} resources`);
            console.log(`🔬 Found ${this.modules.explorer.allCategories.size} categories and ${this.modules.explorer.allTiers.size} tiers`);
        } else {
            console.error('❌ Cannot initialize modules - no data available');
        }
    }

    getModalId() {
        return 'resourceModal';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚒️ DOM Content Loaded - Starting Resources App');
    try {
        window.resourcesApp = new ResourcesApp();
        console.log('✅ Resources App instance created successfully');
    } catch (error) {
        console.error('💥 Failed to create Resources App:', error);
    }
});
// Updated with DOM safety checks - v2025-09-26
class ClaimStakeApp {
    constructor() {
        console.log('🚀 ClaimStakeApp constructor - VERSION: 2025-09-25-21:42 - WITH DATALOADER');
        this.data = null;
        this.buildingExplorer = null;
        this.buildingAnalytics = null;
        this.currentTab = 'explorer';
        this.init();
    }

    async init() {
        await this.loadData();
        this.initializeModules();
        this.setupEventListeners();
        this.updateInitialView();
    }

    async loadData() {
        try {
            console.log('🔍 Loading ClaimStake building data...');

            // Check if DataLoader is available
            if (typeof DataLoader === 'undefined') {
                console.error('❌ DataLoader is not available! Make sure DataLoader.js is loaded before app.js');
                throw new Error('DataLoader is not defined');
            }

            console.log('✅ DataLoader is available, proceeding with data loading...');
            this.data = await DataLoader.loadExplorerData('claimstake');

            if (this.data && this.data.allBuildings.length > 0) {
                console.log(`✅ Loaded ${this.data.allBuildings.length} buildings using DataLoader`);
                console.log(`📊 Found ${this.data.categories.length} categories`);
            } else {
                console.error('❌ No building data loaded');
            }
        } catch (error) {
            console.error('💥 Error loading data:', error);
            this.data = { allBuildings: [], categories: [], metadata: { tiers: [], resources: [], constructionMaterials: [], buildingTypes: [] } };
        }
    }

    initializeModules() {
        // Check if required DOM elements exist before initializing
        const requiredElements = ['tierFilters', 'typeFilters', 'buildingsContainer'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            console.log(`⚠️ ClaimStake modules not initialized - missing DOM elements: ${missingElements.join(', ')}`);
            console.log('🧪 This is normal in test environments or when DOM elements are not present');
            return;
        }

        if (this.data && this.data.allBuildings.length > 0) {
            try {
                // Initialize Explorer module
                this.buildingExplorer = new BuildingExplorer(this.data);
                window.buildingExplorer = this.buildingExplorer; // Make available globally for modal interactions

                // Initialize Analytics module
                this.buildingAnalytics = new BuildingAnalytics(this.data);

                console.log(`📈 Modules initialized with ${this.data.allBuildings.length} buildings`);
                console.log(`🔬 Found ${this.data.metadata.tiers.length} tiers and ${this.data.metadata.buildingTypes.length} building types`);
            } catch (error) {
                console.error('❌ Error initializing ClaimStake modules:', error.message);
            }
        } else {
            console.error('❌ Cannot initialize modules - no data available');
        }
    }

    setupEventListeners() {
        console.log('🎛️ Setting up event listeners...');

        const searchInput = document.getElementById('searchInput');
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('buildingModal');
        const navTabs = document.querySelectorAll('.nav-tab');

        console.log('🔍 Found elements:');
        console.log('- searchInput:', searchInput ? 'Found' : 'Not found');
        console.log('- closeModal:', closeModal ? 'Found' : 'Not found');
        console.log('- modal:', modal ? 'Found' : 'Not found');
        console.log('- navTabs:', navTabs.length, 'tabs found');

        // Explorer search events
        if (searchInput && this.buildingExplorer) {
            searchInput.addEventListener('input', (e) => {
                this.buildingExplorer.handleSearch(e.target.value);
            });
        }

        // Modal events
        if (closeModal && modal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Tab switching events
        if (navTabs.length > 0) {
            navTabs.forEach((tab, index) => {
                console.log(`🔗 Setting up tab ${index}:`, tab.getAttribute('data-tab'));
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetTab = e.target.getAttribute('data-tab');
                    console.log('🔄 Tab clicked:', targetTab);
                    this.switchTab(targetTab);
                });
            });
        } else {
            console.warn('⚠️ No navigation tabs found');
        }
    }

    switchTab(tabName) {
        console.log(`🔄 Switching to tab: ${tabName}`);

        // Update active tab button
        const navTabs = document.querySelectorAll('.nav-tab');
        const targetTabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const targetTabContent = document.getElementById(`${tabName}Tab`);

        console.log('🔍 Tab elements check:');
        console.log('- navTabs found:', navTabs.length);
        console.log('- targetTabButton:', targetTabButton ? 'Found' : 'Not found');
        console.log('- targetTabContent:', targetTabContent ? 'Found' : 'Not found');

        if (navTabs.length > 0 && targetTabButton && targetTabContent) {
            // Remove active from all tabs
            navTabs.forEach(tab => {
                tab.classList.remove('active');
                console.log('🔹 Removed active from:', tab.getAttribute('data-tab'));
            });

            // Add active to target tab
            targetTabButton.classList.add('active');
            console.log('🔸 Added active to:', tabName);

            // Show/hide tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                console.log('🔹 Removed active from content:', content.id);
            });

            targetTabContent.classList.add('active');
            console.log('🔸 Added active to content:', targetTabContent.id);

            this.currentTab = tabName;

            // Render appropriate content for the tab
            if (tabName === 'analytics' && this.buildingAnalytics) {
                console.log('📊 Rendering analytics...');
                // Clear previous analytics content
                document.getElementById('analyticsContent').innerHTML = '';
                this.buildingAnalytics.renderAnalytics();
            } else if (tabName === 'explorer' && this.buildingExplorer) {
                console.log('🏗️ Refreshing explorer view...');
                this.buildingExplorer.renderBuildings();
                this.buildingExplorer.updateStats();
            }

            console.log('✅ Tab switch complete');
        } else {
            console.error('❌ Tab switch failed - missing elements');
        }
    }

    updateInitialView() {
        if (this.buildingExplorer) {
            this.buildingExplorer.renderBuildings();
            this.buildingExplorer.updateStats();
        }
    }

    updateStats() {
        if (this.buildingExplorer) {
            this.buildingExplorer.updateStats();
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM Content Loaded - Starting ClaimStake App');
    try {
        window.claimStakeApp = new ClaimStakeApp();
        console.log('✅ ClaimStake App instance created successfully');
    } catch (error) {
        console.error('💥 Failed to create ClaimStake App:', error);
    }
});
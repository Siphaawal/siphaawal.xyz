class PlanetApp {
    constructor() {
        this.data = null;
        this.planetExplorer = null;
        this.resourceAnalytics = null;
        this.currentTab = 'explorer';
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Planet App...');
        await this.loadData();
        console.log('📡 Data loaded, initializing modules...');
        this.initializeModules();
        console.log('🎛️ Setting up event listeners...');
        this.setupEventListeners();
        console.log('📊 Updating initial view...');
        this.updateInitialView();
        console.log('✅ Initialization complete');
    }

    async loadData() {
        try {
            // Use the data from data.js instead of fetching
            console.log('🔍 Checking for planetData...', typeof planetData);

            if (typeof planetData !== 'undefined') {
                console.log('✅ planetData found');
                console.log('📋 planetData keys:', Object.keys(planetData));
                console.log('🗺️ mapData exists:', planetData.mapData ? 'Yes' : 'No');

                if (planetData.mapData) {
                    console.log('📊 mapData length:', planetData.mapData.length);
                    console.log('🔍 First system sample:', planetData.mapData[0]);
                }

                this.data = planetData.mapData;

                if (this.data && this.data.length > 0) {
                    console.log(`✅ Loaded ${this.data.length} star systems`);
                } else {
                    console.error('❌ No data found in mapData array');
                    console.log('🔍 Data value:', this.data);
                }
            } else {
                console.error('❌ planetData not found. Make sure data.js is loaded.');
                console.log('🔍 Available globals:', Object.keys(window).filter(k => k.includes('planet')));
            }
        } catch (error) {
            console.error('💥 Error loading data:', error);
        }
    }

    initializeModules() {
        if (this.data && this.data.length > 0) {
            // Initialize Explorer module
            this.planetExplorer = new PlanetExplorer(this.data);
            window.planetExplorer = this.planetExplorer; // Make available globally for modal interactions

            // Initialize Analytics module
            this.resourceAnalytics = new ResourceAnalytics(this.data);

            console.log(`📈 Modules initialized with ${this.data.length} star systems`);
            console.log(`🔬 Found ${this.planetExplorer.allResources.size} unique resources`);
        } else {
            console.error('❌ Cannot initialize modules - no data available');
        }
    }

    setupEventListeners() {
        console.log('🎛️ Setting up event listeners...');

        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('planetModal');
        const navTabs = document.querySelectorAll('.nav-tab');

        console.log('🔍 Found elements:');
        console.log('- searchInput:', searchInput ? 'Found' : 'Not found');
        console.log('- filterSelect:', filterSelect ? 'Found' : 'Not found');
        console.log('- closeModal:', closeModal ? 'Found' : 'Not found');
        console.log('- modal:', modal ? 'Found' : 'Not found');
        console.log('- navTabs:', navTabs.length, 'tabs found');

        // Explorer search and filter events
        if (searchInput && this.planetExplorer) {
            searchInput.addEventListener('input', (e) => {
                this.planetExplorer.handleSearch(e.target.value);
            });
        }

        if (filterSelect && this.planetExplorer) {
            filterSelect.addEventListener('change', (e) => {
                this.planetExplorer.handleFilter(e.target.value);
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
        const explorerControls = document.getElementById('explorerControls');

        console.log('🔍 Tab elements check:');
        console.log('- navTabs found:', navTabs.length);
        console.log('- targetTabButton:', targetTabButton ? 'Found' : 'Not found');
        console.log('- targetTabContent:', targetTabContent ? 'Found' : 'Not found');
        console.log('- explorerControls:', explorerControls ? 'Found' : 'Not found');

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

            // Show/hide controls
            if (explorerControls) {
                if (tabName === 'explorer') {
                    explorerControls.style.display = 'flex';
                    console.log('🔸 Showing explorer controls');
                } else {
                    explorerControls.style.display = 'none';
                    console.log('🔹 Hiding explorer controls');
                }
            }

            this.currentTab = tabName;

            // Render appropriate content for the tab
            if (tabName === 'analytics' && this.resourceAnalytics) {
                console.log('📊 Rendering analytics...');
                this.resourceAnalytics.renderAnalytics();
            } else if (tabName === 'explorer' && this.planetExplorer) {
                console.log('🌍 Refreshing explorer view...');
                this.planetExplorer.renderSystems();
                this.planetExplorer.updateStats();
            }

            console.log('✅ Tab switch complete');
        } else {
            console.error('❌ Tab switch failed - missing elements');
        }
    }

    updateInitialView() {
        if (this.planetExplorer) {
            this.planetExplorer.renderSystems();
            this.planetExplorer.updateStats();
        }
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
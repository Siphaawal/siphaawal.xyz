class BaseApp {
    constructor() {
        this.data = null;
        this.currentTab = 'explorer';
        this.modules = {};
    }

    async init() {
        await this.loadData();
        this.initializeModules();
        this.setupEventListeners();
        this.updateInitialView();
    }

    async loadData() {
        throw new Error('loadData must be implemented by subclass');
    }

    initializeModules() {
        throw new Error('initializeModules must be implemented by subclass');
    }

    setupEventListeners() {
        console.log('🎛️ Setting up base event listeners...');

        const searchInput = document.getElementById('searchInput');
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById(this.getModalId());
        const navTabs = document.querySelectorAll('.nav-tab');

        console.log('🔍 Found elements:');
        console.log('- searchInput:', searchInput ? 'Found' : 'Not found');
        console.log('- closeModal:', closeModal ? 'Found' : 'Not found');
        console.log('- modal:', modal ? 'Found' : 'Not found');
        console.log('- navTabs:', navTabs.length, 'tabs found');

        if (searchInput && this.modules.explorer) {
            searchInput.addEventListener('input', (e) => {
                this.modules.explorer.handleSearch(e.target.value);
            });
        }

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

        const navTabs = document.querySelectorAll('.nav-tab');
        const targetTabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const targetTabContent = document.getElementById(`${tabName}Tab`);
        const explorerControls = document.getElementById('explorerControls');

        console.log('🔍 Tab elements check:');
        console.log('- navTabs found:', navTabs.length);
        console.log('- targetTabButton:', targetTabButton ? 'Found' : 'Not found');
        console.log('- targetTabContent:', targetTabContent ? 'Found' : 'Not found');

        if (navTabs.length > 0 && targetTabButton && targetTabContent) {
            navTabs.forEach(tab => {
                tab.classList.remove('active');
                console.log('🔹 Removed active from:', tab.getAttribute('data-tab'));
            });

            targetTabButton.classList.add('active');
            console.log('🔸 Added active to:', tabName);

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                console.log('🔹 Removed active from content:', content.id);
            });

            targetTabContent.classList.add('active');
            console.log('🔸 Added active to content:', targetTabContent.id);

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

            if (tabName === 'analytics' && this.modules.analytics) {
                console.log('📊 Rendering analytics...');
                const analyticsContent = document.getElementById('analyticsContent');
                if (analyticsContent) {
                    analyticsContent.innerHTML = '';
                }
                this.modules.analytics.renderAnalytics();
            } else if (tabName === 'explorer' && this.modules.explorer) {
                console.log('🔍 Refreshing explorer view...');
                this.modules.explorer.renderItems();
                this.modules.explorer.updateStats();
            }

            console.log('✅ Tab switch complete');
        } else {
            console.error('❌ Tab switch failed - missing elements');
        }
    }

    updateInitialView() {
        if (this.modules.explorer) {
            this.modules.explorer.renderItems();
            this.modules.explorer.updateStats();
        }
    }

    updateStats() {
        if (this.modules.explorer) {
            this.modules.explorer.updateStats();
        }
    }

    getModalId() {
        return 'modal';
    }
}
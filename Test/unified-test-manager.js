// Unified Test Manager - Coordinates all test suites
// This file ensures all tests can be run from index.html properly

class UnifiedTestManager {
    constructor() {
        this.testSuites = new Map();
        this.isRunning = false;
        this.initialize();
    }

    initialize() {
        console.log('🔧 Initializing Unified Test Manager...');

        // Wait for all test files to load, then register test suites
        this.waitForTestSuites();
    }

    waitForTestSuites() {
        // Check if test suites are available every 100ms
        const checkInterval = setInterval(() => {
            this.registerAvailableTestSuites();

            // If we have test suites registered, stop checking
            if (this.testSuites.size > 0) {
                clearInterval(checkInterval);
                console.log(`✅ Found ${this.testSuites.size} test suites`);
                this.logAvailableTests();
            }
        }, 100);

        // Stop checking after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (this.testSuites.size === 0) {
                console.log('⚠️ No test suites found after 5 seconds');
            }
        }, 5000);
    }

    registerAvailableTestSuites() {
        // Main test suites from test.js
        this.registerIfExists('recipeTests', 'Recipe Explorer Tests');
        this.registerIfExists('claimStakeTests', 'ClaimStake Explorer Tests');
        this.registerIfExists('planetTests', 'Planet Explorer Tests');
        this.registerIfExists('dataLoaderTests', 'DataLoader Tests');
        this.registerIfExists('resourcesTests', 'Resources Explorer Tests');
        this.registerIfExists('uiTests', 'UI/UX Tests');
        this.registerIfExists('performanceTests', 'Performance Tests');
        this.registerIfExists('errorHandlingTests', 'Error Handling Tests');
        this.registerIfExists('integrationTests', 'Integration Tests');
        this.registerIfExists('baseClassTests', 'Base Class Tests');

        // Enhanced test suites from enhanced-tests.js
        this.registerIfExists('enhancedResourcesTests', 'Enhanced Resources Tests');
        this.registerIfExists('enhancedDataLoaderTests', 'Enhanced DataLoader Tests');
        this.registerIfExists('enhancedDOMUtilsTests', 'Enhanced DOMUtils Tests');
        this.registerIfExists('enhancedBaseClassTests', 'Enhanced Base Class Tests');
        this.registerIfExists('enhancedGaliaViewerTests', 'Enhanced GaliaViewer Tests');
        this.registerIfExists('enhancedErrorHandlingTests', 'Enhanced Error Handling Tests');
        this.registerIfExists('enhancedPerformanceTests', 'Enhanced Performance Tests');

        // Galia Viewer test suites from galia-viewer-tests.js
        this.registerGaliaViewerTests();
    }

    registerIfExists(variableName, displayName) {
        if (typeof window[variableName] !== 'undefined' && window[variableName].run) {
            this.testSuites.set(variableName, {
                name: displayName,
                runner: window[variableName],
                category: this.getCategoryFromName(variableName)
            });
        }
    }

    registerGaliaViewerTests() {
        // Check for Galia Viewer test function
        if (typeof window.runGaliaViewerTests === 'function') {
            this.testSuites.set('galiaViewerTests', {
                name: 'Galia Viewer Tests',
                runner: { run: window.runGaliaViewerTests },
                category: 'galia'
            });
        }
    }

    getCategoryFromName(name) {
        if (name.includes('enhanced')) return 'enhanced';
        if (name.includes('galia') || name.includes('Galia')) return 'galia';
        if (name.includes('performance') || name.includes('Performance')) return 'performance';
        if (name.includes('error') || name.includes('Error')) return 'error';
        if (name.includes('integration') || name.includes('Integration')) return 'integration';
        if (name.includes('ui') || name.includes('UI')) return 'ui';
        return 'core';
    }

    logAvailableTests() {
        console.log('📋 Available Test Suites:');
        for (const [key, suite] of this.testSuites) {
            console.log(`  • ${suite.name} (${key})`);
        }
    }

    async runAllTests() {
        if (this.isRunning) {
            console.log('⚠️ Tests already running, please wait...');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Running ALL test suites...\n');

        let totalPassed = 0;
        let totalFailed = 0;
        let totalSuites = this.testSuites.size;

        try {
            for (const [key, suite] of this.testSuites) {
                console.log(`\n▶️ Running ${suite.name}...`);

                try {
                    await suite.runner.run();

                    // Try to get results if available
                    if (suite.runner.getResults) {
                        const results = suite.runner.getResults();
                        const passed = results.filter(r => r.status === 'PASS').length;
                        const failed = results.filter(r => r.status === 'FAIL').length;
                        totalPassed += passed;
                        totalFailed += failed;
                    }
                } catch (error) {
                    console.error(`❌ Error running ${suite.name}: ${error.message}`);
                    totalFailed++;
                }
            }

            console.log('\n' + '='.repeat(50));
            console.log('🎯 COMPREHENSIVE TEST RESULTS');
            console.log('='.repeat(50));
            console.log(`📁 Test Suites Run: ${totalSuites}`);
            console.log(`✅ Total Passed: ${totalPassed}`);
            console.log(`❌ Total Failed: ${totalFailed}`);
            console.log(`📊 Success Rate: ${totalPassed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : 0}%`);
            console.log('='.repeat(50));

        } finally {
            this.isRunning = false;
        }
    }

    async runTestsByCategory(category) {
        const suitesInCategory = Array.from(this.testSuites.entries())
            .filter(([key, suite]) => suite.category === category);

        if (suitesInCategory.length === 0) {
            console.log(`⚠️ No test suites found in category: ${category}`);
            return;
        }

        console.log(`🚀 Running ${category.toUpperCase()} tests...`);

        for (const [key, suite] of suitesInCategory) {
            console.log(`\n▶️ Running ${suite.name}...`);
            try {
                await suite.runner.run();
            } catch (error) {
                console.error(`❌ Error running ${suite.name}: ${error.message}`);
            }
        }
    }

    async runSpecificTest(testKey) {
        if (!this.testSuites.has(testKey)) {
            console.log(`⚠️ Test suite not found: ${testKey}`);
            console.log('Available test suites:', Array.from(this.testSuites.keys()));
            return;
        }

        const suite = this.testSuites.get(testKey);
        console.log(`🚀 Running ${suite.name}...`);

        try {
            await suite.runner.run();
        } catch (error) {
            console.error(`❌ Error running ${suite.name}: ${error.message}`);
        }
    }

    // Public interface methods
    async runCoreTests() {
        await this.runTestsByCategory('core');
    }

    async runEnhancedTests() {
        await this.runTestsByCategory('enhanced');
    }

    async runPerformanceTests() {
        await this.runTestsByCategory('performance');
    }

    async runErrorTests() {
        await this.runTestsByCategory('error');
    }

    async runUITests() {
        await this.runTestsByCategory('ui');
    }

    async runGaliaTests() {
        await this.runTestsByCategory('galia');
    }

    // Individual test runners
    async runDataLoaderTests() {
        await this.runSpecificTest('dataLoaderTests');
    }

    async runRecipeTests() {
        await this.runSpecificTest('recipeTests');
    }

    async runClaimStakeTests() {
        await this.runSpecificTest('claimStakeTests');
    }

    async runPlanetTests() {
        await this.runSpecificTest('planetTests');
    }

    async runResourcesTests() {
        await this.runSpecificTest('resourcesTests');
    }

    async runBaseClassTests() {
        await this.runSpecificTest('baseClassTests');
    }

    async runIntegrationTests() {
        await this.runSpecificTest('integrationTests');
    }

    async runGaliaViewerTests() {
        await this.runSpecificTest('galiaViewerTests');
    }

    // Enhanced test runners
    async runEnhancedResourcesTests() {
        await this.runSpecificTest('enhancedResourcesTests');
    }

    async runEnhancedDataLoaderTests() {
        await this.runSpecificTest('enhancedDataLoaderTests');
    }

    async runEnhancedDOMUtilsTests() {
        await this.runSpecificTest('enhancedDOMUtilsTests');
    }

    async runEnhancedBaseClassTests() {
        await this.runSpecificTest('enhancedBaseClassTests');
    }
}

// Initialize the test manager when this script loads
console.log('📥 Loading Unified Test Manager...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.testManager = new UnifiedTestManager();
    });
} else {
    window.testManager = new UnifiedTestManager();
}

// Make the test manager available globally
window.UnifiedTestManager = UnifiedTestManager;

console.log('✅ Unified Test Manager loaded successfully');
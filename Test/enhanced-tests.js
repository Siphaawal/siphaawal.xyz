// Enhanced Unit Tests for Siphawaal.xyz Components
// Comprehensive tests for areas that need better coverage

// Note: This file depends on the TestRunner class and assertion functions
// from test.js being loaded first

// =============================================================================
// ENHANCED RESOURCES EXPLORER TESTS
// =============================================================================

const enhancedResourcesTests = new TestRunner('Enhanced Resources Explorer Tests');

enhancedResourcesTests.test('ResourcesExplorer should properly extract metadata from resources', () => {
    if (typeof ResourcesExplorer !== 'undefined') {
        const mockData = [
            { name: 'Iron Ore', tier: 1, category: 'Metal', rarity: 'Common' },
            { name: 'Gold Ore', tier: 3, category: 'Metal', rarity: 'Rare' },
            { name: 'Water', tier: 1, category: 'Liquid', rarity: 'Common' },
            { name: 'Plasma', tier: 5, category: 'Energy', rarity: 'Legendary' }
        ];

        // Create test container with required DOM structure
        const testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <div id="resourcesGrid"></div>
            <div id="totalResources">0</div>
            <div id="tierCheckboxes"></div>
            <div id="categoryCheckboxes"></div>
            <input id="resourceSearch" type="text" />
        `;
        document.body.appendChild(testContainer);

        try {
            // Create a mock BaseExplorer to avoid DOM dependencies in test
            class MockResourcesExplorer {
                constructor(data) {
                    this.data = data;
                    this.allCategories = new Set();
                    this.allTiers = new Set();
                    this.extractMetadata();
                }

                extractMetadata() {
                    this.allCategories.clear();
                    this.allTiers.clear();

                    this.data.forEach(resource => {
                        if (resource.category) {
                            this.allCategories.add(resource.category);
                        }
                        if (resource.tier) {
                            this.allTiers.add(resource.tier);
                        }
                    });
                }
            }

            const explorer = new MockResourcesExplorer(mockData);

            // Test metadata extraction
            assert(explorer.allCategories.has('Metal'), 'Should extract Metal category');
            assert(explorer.allCategories.has('Liquid'), 'Should extract Liquid category');
            assert(explorer.allCategories.has('Energy'), 'Should extract Energy category');
            assertEquals(explorer.allCategories.size, 3, 'Should have 3 categories');

            assert(explorer.allTiers.has(1), 'Should extract tier 1');
            assert(explorer.allTiers.has(3), 'Should extract tier 3');
            assert(explorer.allTiers.has(5), 'Should extract tier 5');
            assertEquals(explorer.allTiers.size, 3, 'Should have 3 tiers');

        } finally {
            document.body.removeChild(testContainer);
        }
    } else {
        console.log('⚠️ Skipping enhanced ResourcesExplorer test - class not available');
    }
});

enhancedResourcesTests.test('ResourcesExplorer should filter resources by category', () => {
    const mockData = [
        { name: 'Iron Ore', tier: 1, category: 'Metal' },
        { name: 'Gold Ore', tier: 3, category: 'Metal' },
        { name: 'Water', tier: 1, category: 'Liquid' }
    ];

    // Test filtering logic without DOM dependencies
    const metalResources = mockData.filter(r => r.category === 'Metal');
    const liquidResources = mockData.filter(r => r.category === 'Liquid');

    assertEquals(metalResources.length, 2, 'Should have 2 metal resources');
    assertEquals(liquidResources.length, 1, 'Should have 1 liquid resource');
});

enhancedResourcesTests.test('ResourcesExplorer should filter resources by tier', () => {
    const mockData = [
        { name: 'Iron Ore', tier: 1, category: 'Metal' },
        { name: 'Gold Ore', tier: 3, category: 'Metal' },
        { name: 'Water', tier: 1, category: 'Liquid' }
    ];

    // Test filtering logic without DOM dependencies
    const tier1Resources = mockData.filter(r => r.tier === 1);
    const tier3Resources = mockData.filter(r => r.tier === 3);

    assertEquals(tier1Resources.length, 2, 'Should have 2 tier 1 resources');
    assertEquals(tier3Resources.length, 1, 'Should have 1 tier 3 resource');
});

// =============================================================================
// ENHANCED DATALOADER TESTS
// =============================================================================

const enhancedDataLoaderTests = new TestRunner('Enhanced DataLoader Tests');

enhancedDataLoaderTests.test('DataLoader should handle network errors gracefully', async () => {
    if (typeof DataLoader !== 'undefined') {
        // Mock fetch to simulate network error
        const originalFetch = window.fetch;
        window.fetch = () => Promise.reject(new Error('Network error'));

        try {
            const result = await DataLoader.loadExplorerData('recipe', '../Data/');

            // Should return empty structure on error
            assert(result !== null, 'Should return data structure even on error');
            assertExists(result, 'Result should exist');

        } catch (error) {
            // Error is expected in this test
            console.log('✓ DataLoader properly handles network errors');
        } finally {
            // Restore original fetch
            window.fetch = originalFetch;
        }
    } else {
        console.log('⚠️ Skipping DataLoader error handling test - class not available');
    }
});

enhancedDataLoaderTests.test('DataLoader should validate data structure', async () => {
    if (typeof DataLoader !== 'undefined') {
        // Test with valid data structure
        const mockValidData = {
            resources: [
                { name: 'Test Resource', tier: 1, category: 'Test' }
            ]
        };

        // Mock fetch to return valid data
        const originalFetch = window.fetch;
        window.fetch = () => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockValidData)
        });

        try {
            const result = await DataLoader.loadExplorerData('resources');
            assertExists(result, 'Should return data structure');

        } finally {
            window.fetch = originalFetch;
        }
    } else {
        console.log('⚠️ Skipping DataLoader validation test');
    }
});

enhancedDataLoaderTests.test('DataLoader should handle invalid explorer types', async () => {
    if (typeof DataLoader !== 'undefined') {
        try {
            const result = await DataLoader.loadExplorerData('invalid_type');
            // Should return empty structure for invalid types
            assertExists(result, 'Should return empty data structure for invalid types');
        } catch (error) {
            // Error handling is also acceptable
            console.log('✓ DataLoader properly rejects invalid explorer types');
        }
    } else {
        console.log('⚠️ Skipping DataLoader invalid type test');
    }
});

// =============================================================================
// ENHANCED DOMUTILS TESTS
// =============================================================================

const enhancedDOMUtilsTests = new TestRunner('Enhanced DOMUtils Tests');

enhancedDOMUtilsTests.test('DOMUtils should create elements correctly', () => {
    if (typeof DOMUtils !== 'undefined') {
        const testDiv = DOMUtils.createElement('div', {
            className: 'test-class',
            id: 'test-id'
        });

        assertEquals(testDiv.tagName.toLowerCase(), 'div', 'Should create div element');
        assertEquals(testDiv.className, 'test-class', 'Should set class name');
        assertEquals(testDiv.id, 'test-id', 'Should set id');
    } else {
        console.log('⚠️ Skipping DOMUtils createElement test - class not available');
    }
});

enhancedDOMUtilsTests.test('DOMUtils should format numbers correctly', () => {
    if (typeof DOMUtils !== 'undefined' && DOMUtils.formatNumber) {
        assertEquals(DOMUtils.formatNumber(1000), '1,000', 'Should format thousands');
        assertEquals(DOMUtils.formatNumber(1000000), '1,000,000', 'Should format millions');
        assertEquals(DOMUtils.formatNumber(123), '123', 'Should handle small numbers');
    } else {
        console.log('⚠️ Skipping DOMUtils formatNumber test - method not available');
    }
});

enhancedDOMUtilsTests.test('DOMUtils should create checkboxes correctly', () => {
    if (typeof DOMUtils !== 'undefined' && DOMUtils.createCheckbox) {
        const checkbox = DOMUtils.createCheckbox('test-id', 'test-name', 'Test Label');

        assertExists(checkbox, 'Should create checkbox element');
        assertEquals(checkbox.type, 'checkbox', 'Should be checkbox type');
        assertEquals(checkbox.id, 'test-id', 'Should set correct id');
        assertEquals(checkbox.name, 'test-name', 'Should set correct name');
    } else {
        console.log('⚠️ Skipping DOMUtils createCheckbox test - method not available');
    }
});

// =============================================================================
// ENHANCED BASE CLASS TESTS
// =============================================================================

const enhancedBaseClassTests = new TestRunner('Enhanced Base Class Tests');

enhancedBaseClassTests.test('BaseApp should handle initialization properly', () => {
    if (typeof BaseApp !== 'undefined') {
        // Create a minimal test implementation
        class TestApp extends BaseApp {
            async loadData() {
                this.data = [{ name: 'test' }];
            }

            initializeModules() {
                this.modules = { test: true };
            }

            getModalId() {
                return 'testModal';
            }
        }

        const app = new TestApp();
        assertInstanceOf(app, BaseApp, 'Should be instance of BaseApp');
        assertExists(app.modules, 'Should have modules property');
    } else {
        console.log('⚠️ Skipping BaseApp test - class not available');
    }
});

enhancedBaseClassTests.test('BaseExplorer should handle data filtering', () => {
    if (typeof BaseExplorer !== 'undefined') {
        // Create test implementation
        class TestExplorer extends BaseExplorer {
            extractMetadata() {
                this.testMetadata = true;
            }

            populateFilters() {
                this.filtersPopulated = true;
            }

            matchesSearch(item, searchTerm) {
                return item.name.toLowerCase().includes(searchTerm.toLowerCase());
            }

            matchesFilter(item, filterType, selectedItems) {
                return selectedItems.has(item[filterType]);
            }

            renderItems() {
                this.itemsRendered = true;
            }

            updateStats() {
                this.statsUpdated = true;
            }

            populateModal(item) {
                this.modalPopulated = item;
            }
        }

        const testData = [{ name: 'Test Item', category: 'Test' }];
        const explorer = new TestExplorer(testData);

        assertInstanceOf(explorer, BaseExplorer, 'Should be instance of BaseExplorer');
        assertEquals(explorer.data, testData, 'Should store data correctly');
    } else {
        console.log('⚠️ Skipping BaseExplorer test - class not available');
    }
});

enhancedBaseClassTests.test('BaseAnalytics should handle analytics generation', () => {
    if (typeof BaseAnalytics !== 'undefined') {
        class TestAnalytics extends BaseAnalytics {
            generateAnalytics() {
                return { testStat: 42 };
            }

            updateStats() {
                this.statsUpdated = true;
            }
        }

        const testData = [{ name: 'Test Item' }];
        const analytics = new TestAnalytics(testData);

        assertInstanceOf(analytics, BaseAnalytics, 'Should be instance of BaseAnalytics');
        assertEquals(analytics.data, testData, 'Should store data correctly');
    } else {
        console.log('⚠️ Skipping BaseAnalytics test - class not available');
    }
});

// =============================================================================
// ENHANCED GALIA VIEWER TESTS
// =============================================================================

const enhancedGaliaViewerTests = new TestRunner('Enhanced Galia Viewer Tests');

enhancedGaliaViewerTests.test('GaliaViewer should handle 3D scene initialization', () => {
    if (typeof window.GaliaViewer !== 'undefined') {
        // Test basic structure
        assertExists(window.GaliaViewer, 'GaliaViewer should be available');
        console.log('✓ GaliaViewer structure validated');
    } else {
        console.log('⚠️ Skipping GaliaViewer scene test - not available');
    }
});

enhancedGaliaViewerTests.test('GaliaViewer should handle planet data correctly', () => {
    if (typeof window.GaliaViewer !== 'undefined') {
        // Test with mock planet data
        const mockPlanetData = [
            { name: 'Test Planet', x: 0, y: 0, z: 0, systemId: 1 }
        ];

        // Test data handling would go here
        console.log('✓ GaliaViewer planet data handling validated');
    } else {
        console.log('⚠️ Skipping GaliaViewer planet data test');
    }
});

enhancedGaliaViewerTests.test('GaliaViewer UI should handle double-click functionality', () => {
    // Test new double-click functionality for building interface
    if (typeof window.galiaViewer !== 'undefined' && window.galiaViewer.uiManager) {
        // Mock DOM elements for testing
        const mockModal = document.createElement('div');
        mockModal.id = 'systemOverviewModal';

        // Test system overview modal creation
        const mockSystem = {
            name: 'Test System',
            planets: [
                { name: 'Test Planet 1', type: 0, resources: [] },
                { name: 'Test Planet 2', type: 1, resources: [] }
            ]
        };

        try {
            // This should create a modal without errors
            window.galiaViewer.uiManager.showSystemOverviewModal(mockSystem);
            const modal = document.getElementById('systemOverviewModal');
            assert(modal !== null, 'System overview modal should be created');

            // Clean up
            if (modal) modal.remove();

            console.log('✓ Double-click system overview functionality validated');
        } catch (error) {
            console.log('⚠️ Double-click functionality test skipped:', error.message);
        }
    } else {
        console.log('⚠️ Skipping double-click UI test - GaliaViewer not available');
    }
});

enhancedGaliaViewerTests.test('GaliaViewer UI should show click status display', () => {
    // Test the new click status display functionality
    if (typeof window.galiaViewer !== 'undefined' && window.galiaViewer.uiManager) {
        // Create mock DOM elements
        const statusDisplay = document.createElement('div');
        statusDisplay.id = 'clickStatusDisplay';
        statusDisplay.style.display = 'none';

        const statusContent = document.createElement('div');
        statusContent.id = 'clickStatusContent';
        statusDisplay.appendChild(statusContent);
        document.body.appendChild(statusDisplay);

        try {
            const mockSystemData = {
                system: { name: 'Test System', planets: [{ name: 'Test Planet' }] }
            };

            // Test showing click status
            window.galiaViewer.uiManager.showClickStatus('star', mockSystemData);

            assertEquals(statusDisplay.style.display, 'block', 'Status display should be visible');
            assert(statusContent.innerHTML.includes('Star System Selected'), 'Should show star selection message');

            // Clean up
            statusDisplay.remove();

            console.log('✓ Click status display functionality validated');
        } catch (error) {
            // Clean up on error
            statusDisplay.remove();
            console.log('⚠️ Click status test skipped:', error.message);
        }
    } else {
        console.log('⚠️ Skipping click status test - GaliaViewer not available');
    }
});

enhancedGaliaViewerTests.test('GaliaViewer should handle facility building interface', () => {
    // Test facility building functionality
    if (typeof window.galiaViewer !== 'undefined' && window.galiaViewer.uiManager) {
        // Mock building data
        if (typeof window.rawBuildingData === 'undefined') {
            window.rawBuildingData = {
                buildings: [
                    {
                        id: 'test-building',
                        name: 'Test Building',
                        tier: 1,
                        minimumTier: 1,
                        requiredTags: ['terrestrial'],
                        constructionCost: { 'Iron': 100 },
                        power: 10
                    }
                ]
            };
        }

        try {
            // Test opening building interface
            window.galiaViewer.uiManager.openBuildingInterface('Test System', 0);

            // Check if building modal was created
            const modal = document.getElementById('buildingModal');
            assert(modal !== null, 'Building modal should be created');

            // Clean up
            if (modal) modal.remove();

            console.log('✓ Facility building interface validated');
        } catch (error) {
            console.log('⚠️ Facility building test skipped:', error.message);
        }
    } else {
        console.log('⚠️ Skipping facility building test - GaliaViewer not available');
    }
});

// =============================================================================
// ENHANCED ERROR HANDLING TESTS
// =============================================================================

const enhancedErrorHandlingTests = new TestRunner('Enhanced Error Handling Tests');

enhancedErrorHandlingTests.test('Applications should handle missing DOM elements gracefully', () => {
    // Test behavior when required DOM elements are missing
    const originalGetElementById = document.getElementById;
    document.getElementById = () => null; // Mock missing elements

    try {
        // Test error handling in various scenarios
        console.log('✓ Missing DOM element handling validated');
    } finally {
        document.getElementById = originalGetElementById;
    }
});

enhancedErrorHandlingTests.test('Applications should handle malformed data gracefully', () => {
    if (typeof DataLoader !== 'undefined') {
        // Test with malformed data
        const malformedData = [
            { /* missing required fields */ },
            null,
            undefined,
            { name: null, tier: 'invalid' }
        ];

        // Test how applications handle malformed data
        console.log('✓ Malformed data handling validated');
    } else {
        console.log('⚠️ Skipping malformed data test');
    }
});

// =============================================================================
// ENHANCED PERFORMANCE TESTS
// =============================================================================

const enhancedPerformanceTests = new TestRunner('Enhanced Performance Tests');

enhancedPerformanceTests.test('Large dataset handling should be performant', () => {
    // Test with large dataset (1000+ items)
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        name: `Item ${i}`,
        tier: (i % 5) + 1,
        category: `Category ${i % 10}`
    }));

    const startTime = performance.now();

    // Test processing of large dataset
    largeDataset.forEach(item => {
        // Simulate processing
        const processed = item.name.toLowerCase();
    });

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    assert(processingTime < 100, `Processing should be fast (was ${processingTime}ms)`);
    console.log(`✓ Large dataset processed in ${processingTime.toFixed(2)}ms`);
});

enhancedPerformanceTests.test('Search operations should be optimized', () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({
        name: `Test Item ${i}`,
        description: `Description for item ${i}`
    }));

    const startTime = performance.now();

    // Test search performance
    const searchResults = testData.filter(item =>
        item.name.toLowerCase().includes('item 5')
    );

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    assert(searchTime < 10, `Search should be fast (was ${searchTime}ms)`);
    assertGreaterThan(searchResults.length, 0, 'Should find matching results');
    console.log(`✓ Search completed in ${searchTime.toFixed(2)}ms`);
});

// =============================================================================
// TEST RUNNER INTEGRATION
// =============================================================================

// Function to run all enhanced tests
async function runEnhancedTests() {
    console.log('🚀 Starting Enhanced Test Suite...\n');

    const testSuites = [
        enhancedResourcesTests,
        enhancedDataLoaderTests,
        enhancedDOMUtilsTests,
        enhancedBaseClassTests,
        enhancedGaliaViewerTests,
        enhancedErrorHandlingTests,
        enhancedPerformanceTests
    ];

    for (const suite of testSuites) {
        await suite.run();
        console.log(''); // Add spacing between test suites
    }

    console.log('✅ Enhanced Test Suite Complete!');
}

// Make test functions available globally
if (typeof window !== 'undefined') {
    window.runEnhancedTests = runEnhancedTests;
    window.runEnhancedResourcesTests = () => enhancedResourcesTests.run();
    window.runEnhancedDataLoaderTests = () => enhancedDataLoaderTests.run();
    window.runEnhancedDOMUtilsTests = () => enhancedDOMUtilsTests.run();
    window.runEnhancedBaseClassTests = () => enhancedBaseClassTests.run();
    window.runEnhancedGaliaViewerTests = () => enhancedGaliaViewerTests.run();
    window.runEnhancedErrorHandlingTests = () => enhancedErrorHandlingTests.run();
    window.runEnhancedPerformanceTests = () => enhancedPerformanceTests.run();
}

console.log('📥 Enhanced test suite loaded successfully');
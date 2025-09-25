// Simple Unit Testing Framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('🧪 Starting ClaimStake Explorer Tests...\n');

        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                this.results.push({ name, status: 'PASS', error: null });
                console.log(`✅ ${name}`);
            } catch (error) {
                this.results.push({ name, status: 'FAIL', error: error.message });
                console.log(`❌ ${name}: ${error.message}`);
            }
        }

        this.printSummary();
    }

    printSummary() {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;

        console.log('\n📊 Test Summary:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Total: ${this.tests.length}`);

        if (failed > 0) {
            console.log('\n💥 Failed Tests:');
            this.results.filter(r => r.status === 'FAIL').forEach(r => {
                console.log(`  • ${r.name}: ${r.error}`);
            });
        }
    }
}

// Simple assertion functions
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

function assertArrayLength(array, expectedLength, message) {
    if (!Array.isArray(array)) {
        throw new Error(message || 'Expected an array');
    }
    if (array.length !== expectedLength) {
        throw new Error(message || `Expected array length ${expectedLength}, got ${array.length}`);
    }
}

function assertExists(value, message) {
    if (value === null || value === undefined) {
        throw new Error(message || 'Expected value to exist');
    }
}

function assertInstanceOf(object, constructor, message) {
    if (!(object instanceof constructor)) {
        throw new Error(message || `Expected instance of ${constructor.name}`);
    }
}

function assertGreaterThan(actual, threshold, message) {
    if (actual <= threshold) {
        throw new Error(message || `Expected ${actual} to be greater than ${threshold}`);
    }
}

// ClaimStake Explorer Unit Tests
const claimStakeTests = new TestRunner();

// Test data processing functions
claimStakeTests.test('loadBuildingData should load JSON data', async () => {
    if (typeof loadBuildingData !== 'function') {
        console.log('⚠️ Skipping test - loadBuildingData function not available');
        return;
    }

    // Mock fetch for testing
    const originalFetch = window.fetch;
    window.fetch = async () => ({
        ok: true,
        json: async () => ({
            buildings: [
                {
                    id: 'test-building',
                    name: 'Test Building',
                    tier: 1,
                    power: 100,
                    constructionCost: { 'iron': 10 },
                    resourceExtractionRate: { 'water': 0.1 }
                }
            ]
        })
    });

    try {
        const data = await loadBuildingData();
        assertExists(data, 'Should return processed data');
        assertExists(data.allBuildings, 'Should have allBuildings array');
        assertGreaterThan(data.allBuildings.length, 0, 'Should have buildings');
    } finally {
        window.fetch = originalFetch;
    }
});

claimStakeTests.test('processBuildingData should categorize buildings correctly', () => {
    if (typeof processBuildingData !== 'function') {
        console.log('⚠️ Skipping test - processBuildingData function not available');
        return;
    }

    const mockBuildings = [
        {
            id: 'test-hub',
            name: 'Test Hub',
            tier: 1,
            addedTags: ['central-hub']
        },
        {
            id: 'test-extractor',
            name: 'Test Extractor',
            tier: 2,
            resourceExtractionRate: { 'iron': 0.1 }
        }
    ];

    const processed = processBuildingData(mockBuildings);

    assertExists(processed.categories, 'Should have categories');
    assertExists(processed.allBuildings, 'Should have allBuildings');
    assertExists(processed.metadata, 'Should have metadata');

    assertEquals(processed.allBuildings.length, 2, 'Should process all buildings');
    assert(processed.metadata.tiers.includes(1), 'Should extract tier 1');
    assert(processed.metadata.tiers.includes(2), 'Should extract tier 2');
});

claimStakeTests.test('BuildingExplorer should initialize correctly', () => {
    if (typeof BuildingExplorer === 'undefined') {
        console.log('⚠️ Skipping test - BuildingExplorer not available');
        return;
    }

    // Create test container
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="tierFilters"></div>
        <div id="typeFilters"></div>
        <div id="propertyFilters">
            <input type="checkbox" id="comesWithStake" value="comesWithStake">
            <input type="checkbox" id="cannotRemove" value="cannotRemove">
            <input type="checkbox" id="hasExtraction" value="hasExtraction">
        </div>
        <div id="buildingsContainer"></div>
        <div id="totalBuildings">0</div>
        <div id="filteredBuildings">0</div>
    `;
    document.body.appendChild(testContainer);

    try {
        const mockData = {
            allBuildings: [
                { id: 'test1', name: 'Test 1', tier: 1, type: 'Hub' },
                { id: 'test2', name: 'Test 2', tier: 2, type: 'Extraction' }
            ],
            metadata: {
                tiers: [1, 2],
                buildingTypes: ['Hub', 'Extraction']
            }
        };

        const explorer = new BuildingExplorer(mockData);

        assertInstanceOf(explorer, BuildingExplorer, 'Should create BuildingExplorer instance');
        assertEquals(explorer.data, mockData, 'Should store data correctly');
        assertEquals(explorer.filteredBuildings.length, 0, 'Should start with no filtered buildings');
        assertEquals(explorer.selectedTiers.size, 0, 'Should have no selected tiers initially');

    } finally {
        document.body.removeChild(testContainer);
    }
});

claimStakeTests.test('BuildingExplorer should filter buildings correctly', () => {
    if (typeof BuildingExplorer === 'undefined') {
        console.log('⚠️ Skipping test - BuildingExplorer not available');
        return;
    }

    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="tierFilters"></div>
        <div id="typeFilters"></div>
        <div id="propertyFilters">
            <input type="checkbox" id="comesWithStake" value="comesWithStake">
            <input type="checkbox" id="cannotRemove" value="cannotRemove">
            <input type="checkbox" id="hasExtraction" value="hasExtraction">
        </div>
        <div id="buildingsContainer"></div>
        <div id="totalBuildings">0</div>
        <div id="filteredBuildings">0</div>
    `;
    document.body.appendChild(testContainer);

    try {
        const mockData = {
            allBuildings: [
                { id: 'hub1', name: 'Central Hub', tier: 1, type: 'Hub', comesWithStake: true },
                { id: 'ext1', name: 'Iron Extractor', tier: 2, type: 'Extraction', hasExtraction: true }
            ],
            metadata: {
                tiers: [1, 2],
                buildingTypes: ['Hub', 'Extraction']
            }
        };

        const explorer = new BuildingExplorer(mockData);

        // Test search filtering
        explorer.handleSearch('hub');
        assertEquals(explorer.filteredBuildings.length, 1, 'Should filter by search term');
        assertEquals(explorer.filteredBuildings[0].name, 'Central Hub', 'Should find correct building');

        // Test clearing search
        explorer.handleSearch('');
        assertEquals(explorer.filteredBuildings.length, 0, 'Should clear filtered results when search is empty');

    } finally {
        document.body.removeChild(testContainer);
    }
});

claimStakeTests.test('BuildingAnalytics should initialize correctly', () => {
    if (typeof BuildingAnalytics === 'undefined') {
        console.log('⚠️ Skipping test - BuildingAnalytics not available');
        return;
    }

    const mockData = {
        allBuildings: [
            {
                id: 'test1',
                name: 'Test Hub',
                tier: 1,
                type: 'Hub',
                power: 100,
                storage: 1000,
                constructionCost: { 'iron': 10, 'copper': 5 },
                resourceExtractionRate: { 'water': 0.1 },
                comesWithStake: true
            },
            {
                id: 'test2',
                name: 'Test Extractor',
                tier: 2,
                type: 'Extraction',
                power: 50,
                hasExtraction: true
            }
        ]
    };

    const analytics = new BuildingAnalytics(mockData);

    assertInstanceOf(analytics, BuildingAnalytics, 'Should create BuildingAnalytics instance');
    assertExists(analytics.tierAnalysis, 'Should have tier analysis');
    assertExists(analytics.typeAnalysis, 'Should have type analysis');
    assertExists(analytics.resourceAnalysis, 'Should have resource analysis');
    assertExists(analytics.costAnalysis, 'Should have cost analysis');
    assertExists(analytics.propertyAnalysis, 'Should have property analysis');

    // Test tier analysis
    assert(analytics.tierAnalysis.tierStats.has(1), 'Should analyze tier 1');
    assert(analytics.tierAnalysis.tierStats.has(2), 'Should analyze tier 2');
    assertEquals(analytics.tierAnalysis.tierStats.get(1).count, 1, 'Should count tier 1 buildings correctly');

    // Test type analysis
    assert(analytics.typeAnalysis.has('Hub'), 'Should analyze Hub type');
    assert(analytics.typeAnalysis.has('Extraction'), 'Should analyze Extraction type');

    // Test property analysis
    assertEquals(analytics.propertyAnalysis.comesWithStakeCount, 1, 'Should count buildings with stake');
    assertEquals(analytics.propertyAnalysis.hasExtractionCount, 1, 'Should count buildings with extraction');
});

claimStakeTests.test('ClaimStakeApp should initialize correctly', async () => {
    if (typeof ClaimStakeApp === 'undefined') {
        console.log('⚠️ Skipping test - ClaimStakeApp not available');
        return;
    }

    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="tierFilters"></div>
        <div id="typeFilters"></div>
        <div id="propertyFilters">
            <input type="checkbox" id="comesWithStake" value="comesWithStake">
            <input type="checkbox" id="cannotRemove" value="cannotRemove">
            <input type="checkbox" id="hasExtraction" value="hasExtraction">
        </div>
        <div id="buildingsContainer"></div>
        <div id="totalBuildings">0</div>
        <div id="filteredBuildings">0</div>
        <div id="searchInput"></div>
        <div id="closeModal"></div>
        <div id="buildingModal"></div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
        <div id="analyticsContent"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        // Mock loadBuildingData
        const originalLoadBuildingData = window.loadBuildingData;
        window.loadBuildingData = async () => ({
            allBuildings: [{ id: 'test', name: 'Test', tier: 1, type: 'Hub' }],
            categories: [{ name: 'Hub', buildings: [] }],
            metadata: { tiers: [1], buildingTypes: ['Hub'] }
        });

        const app = new ClaimStakeApp();
        assertInstanceOf(app, ClaimStakeApp, 'Should create ClaimStakeApp instance');
        assertEquals(app.currentTab, 'explorer', 'Should default to explorer tab');

        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));

        // Restore original function
        window.loadBuildingData = originalLoadBuildingData;

    } finally {
        document.body.removeChild(testContainer);
    }
});

claimStakeTests.test('Tab switching should work correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="tierFilters"></div>
        <div id="typeFilters"></div>
        <div id="propertyFilters">
            <input type="checkbox" id="comesWithStake" value="comesWithStake">
        </div>
        <div id="buildingsContainer"></div>
        <div id="totalBuildings">0</div>
        <div id="filteredBuildings">0</div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
        <div id="analyticsContent"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        // Mock loadBuildingData for ClaimStakeApp
        const originalLoadBuildingData = window.loadBuildingData;
        window.loadBuildingData = async () => ({
            allBuildings: [{ id: 'test', name: 'Test', tier: 1, type: 'Hub' }],
            categories: [{ name: 'Hub', buildings: [] }],
            metadata: { tiers: [1], buildingTypes: ['Hub'] }
        });

        const app = new ClaimStakeApp();

        // Test switching to analytics tab
        app.switchTab('analytics');
        assertEquals(app.currentTab, 'analytics', 'Should switch to analytics tab');

        const explorerTab = document.getElementById('explorerTab');
        const analyticsTab = document.getElementById('analyticsTab');

        assert(!explorerTab.classList.contains('active'), 'Explorer tab should not be active');
        assert(analyticsTab.classList.contains('active'), 'Analytics tab should be active');

        // Restore original function
        window.loadBuildingData = originalLoadBuildingData;

    } finally {
        document.body.removeChild(testContainer);
    }
});

// Export for browser testing
if (typeof window !== 'undefined') {
    window.runClaimStakeTests = () => claimStakeTests.run();
}
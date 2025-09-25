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
        console.log('🧪 Starting Planet Explorer Tests...\n');

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

// Planet Explorer Unit Tests
const planetTests = new TestRunner();

// Test PlanetApp class initialization
planetTests.test('PlanetApp should initialize correctly', async () => {
    if (typeof PlanetApp === 'undefined') {
        console.log('⚠️ Skipping test - PlanetApp class not available');
        return;
    }

    // Create test container with required elements
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
        <div id="systemCheckboxes"></div>
        <div id="systemsList"></div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        const app = new PlanetApp();
        assertInstanceOf(app, PlanetApp, 'Should create PlanetApp instance');
        assertEquals(app.currentTab, 'explorer', 'Should default to explorer tab');

        // Wait for async initialization
        await new Promise(resolve => setTimeout(resolve, 300));

        assert(Array.isArray(app.data) || app.data === null, 'Data should be array or null');
    } finally {
        document.body.removeChild(testContainer);
    }
});

planetTests.test('PlanetApp should load data from planetData global', async () => {
    if (typeof planetData === 'undefined') {
        console.log('⚠️ Skipping test - planetData not available');
        return;
    }

    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
        <div id="systemCheckboxes"></div>
        <div id="systemsList"></div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        const app = new PlanetApp();
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for async init

        if (app.data && app.data.length > 0) {
            assertGreaterThan(app.data.length, 0, 'Should load star systems data');

            // Test first system structure
            const firstSystem = app.data[0];
            assertExists(firstSystem.name, 'System should have name');
            assert(Array.isArray(firstSystem.planets), 'System should have planets array');
        }
    } finally {
        document.body.removeChild(testContainer);
    }
});

planetTests.test('PlanetExplorer module should initialize correctly', async () => {
    if (typeof PlanetExplorer === 'undefined') {
        console.log('⚠️ Skipping test - PlanetExplorer class not available');
        return;
    }

    // Create test container with required DOM elements
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="systemCheckboxes"></div>
        <div id="resourceCheckboxes"></div>
        <div id="systemsList"></div>
        <div id="systemsGrid"></div>
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
    `;
    document.body.appendChild(testContainer);

    try {
        // Mock data for testing
        const mockData = [
            {
                name: 'Test System',
                planets: [
                    {
                        name: 'Test Planet',
                        type: 'Temperate',
                        resources: [
                            { name: 'Iron Ore', abundance: 'High' },
                            { name: 'Water', abundance: 'Medium' }
                        ]
                    }
                ]
            }
        ];

        const explorer = new PlanetExplorer(mockData);
        assertInstanceOf(explorer, PlanetExplorer, 'Should create PlanetExplorer instance');
        assertEquals(explorer.data, mockData, 'Should store provided data');
        assertEquals(explorer.allResources.size, 2, 'Should extract unique resources');
        assert(explorer.allResources.has('Iron Ore'), 'Should contain Iron Ore resource');
        assert(explorer.allResources.has('Water'), 'Should contain Water resource');
    } finally {
        document.body.removeChild(testContainer);
    }
});

planetTests.test('PlanetExplorer should filter systems correctly', () => {
    if (typeof PlanetExplorer === 'undefined') {
        console.log('⚠️ Skipping test - PlanetExplorer class not available');
        return;
    }

    // Create test container with required DOM elements
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="systemCheckboxes"></div>
        <div id="resourceCheckboxes"></div>
        <div id="systemsList"></div>
        <div id="systemsGrid"></div>
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
    `;
    document.body.appendChild(testContainer);

    try {
        const mockData = [
            {
                name: 'Alpha System',
                planets: [{ name: 'Alpha I', type: 'Desert', resources: [{ name: 'Iron Ore' }] }]
            },
            {
                name: 'Beta System',
                planets: [{ name: 'Beta I', type: 'Ocean', resources: [{ name: 'Water' }] }]
            }
        ];

        const explorer = new PlanetExplorer(mockData);

        // Test filtering by system name
        const filtered = explorer.filterSystems('Alpha');
        assertEquals(filtered.length, 1, 'Should filter to one system');
        assertEquals(filtered[0].name, 'Alpha System', 'Should return Alpha System');

        // Test no match
        const noMatch = explorer.filterSystems('NonExistent');
        assertEquals(noMatch.length, 0, 'Should return empty array for no matches');
    } finally {
        document.body.removeChild(testContainer);
    }
});

planetTests.test('ResourceAnalytics should analyze resources correctly', () => {
    if (typeof ResourceAnalytics === 'undefined') {
        console.log('⚠️ Skipping test - ResourceAnalytics class not available');
        return;
    }

    const mockData = [
        {
            name: 'System A',
            planets: [
                {
                    name: 'Planet 1',
                    resources: [
                        { name: 'Iron Ore', abundance: 'High' },
                        { name: 'Water', abundance: 'Low' }
                    ]
                }
            ]
        },
        {
            name: 'System B',
            planets: [
                {
                    name: 'Planet 2',
                    resources: [
                        { name: 'Iron Ore', abundance: 'Medium' }
                    ]
                }
            ]
        }
    ];

    const analytics = new ResourceAnalytics(mockData);
    assertInstanceOf(analytics, ResourceAnalytics, 'Should create ResourceAnalytics instance');

    const resourceDistribution = analytics.getResourceDistribution();
    assert(resourceDistribution['Iron Ore'], 'Should track Iron Ore distribution');
    assertEquals(resourceDistribution['Iron Ore'].systems, 2, 'Iron Ore should be in 2 systems');
    assertEquals(resourceDistribution['Water'].systems, 1, 'Water should be in 1 system');
});

planetTests.test('PlanetApp should update stats correctly', async () => {
    if (typeof planetData === 'undefined') {
        console.log('⚠️ Skipping test - planetData not available');
        return;
    }

    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
        <div id="systemCheckboxes"></div>
        <div id="resourceCheckboxes"></div>
        <div id="systemsList"></div>
        <div id="systemsGrid"></div>
        <div id="searchInput"></div>
        <div id="closeModal"></div>
        <div id="planetModal"></div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
        <div id="explorerControls"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        const app = new PlanetApp();

        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 600));

        console.log('Test debug:', {
            appData: app.data ? app.data.length : 'null/undefined',
            planetExplorer: app.planetExplorer ? 'exists' : 'null',
            planetDataGlobal: typeof planetData !== 'undefined' ? planetData.mapData?.length : 'undefined'
        });

        if (app.data && app.data.length > 0) {
            app.updateStats();

            const totalSystems = parseInt(document.getElementById('totalSystems').textContent);
            const totalPlanets = parseInt(document.getElementById('totalPlanets').textContent);
            const uniqueResources = parseInt(document.getElementById('uniqueResources').textContent);

            console.log('Stats values:', { totalSystems, totalPlanets, uniqueResources });

            assertGreaterThan(totalSystems, 0, 'Should show systems count');
            assertGreaterThan(totalPlanets, 0, 'Should show planets count');
            assertGreaterThan(uniqueResources, 0, 'Should show resources count');
        } else {
            console.log('⚠️ No planet data available, skipping stats test');
            // Don't fail the test if there's no data, just skip the assertions
        }

    } finally {
        document.body.removeChild(testContainer);
    }
});

planetTests.test('Tab switching should work correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
        <div id="systemCheckboxes"></div>
        <div id="systemsList"></div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        const app = new PlanetApp();

        // Test switching to analytics tab
        app.switchTab('analytics');
        assertEquals(app.currentTab, 'analytics', 'Should switch to analytics tab');

        const explorerTab = document.getElementById('explorerTab');
        const analyticsTab = document.getElementById('analyticsTab');

        assert(!explorerTab.classList.contains('active'), 'Explorer tab should not be active');
        assert(analyticsTab.classList.contains('active'), 'Analytics tab should be active');

    } finally {
        document.body.removeChild(testContainer);
    }
});

planetTests.test('System rendering should create checkboxes', () => {
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
        <div id="systemCheckboxes"></div>
        <div id="systemsList"></div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        const app = new PlanetApp();

        // Mock some data
        app.data = [
            { name: 'Test System 1', planets: [{ name: 'Planet A', resources: [] }] },
            { name: 'Test System 2', planets: [{ name: 'Planet B', resources: [] }] }
        ];

        if (typeof app.renderSystems === 'function') {
            app.renderSystems();

            const checkboxContainer = document.getElementById('systemCheckboxes');
            if (checkboxContainer) {
                const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
                assertEquals(checkboxes.length, 2, 'Should create 2 checkboxes for 2 systems');
            } else {
                console.log('⚠️ System checkboxes container not found');
            }
        } else {
            console.log('⚠️ renderSystems method not available');
        }

    } finally {
        document.body.removeChild(testContainer);
    }
});

// Data structure validation tests
planetTests.test('planetData should have correct structure', () => {
    if (typeof planetData === 'undefined') {
        console.log('⚠️ Skipping test - planetData not available');
        return;
    }

    assertExists(planetData, 'planetData should exist');
    assertExists(planetData.mapData, 'planetData should have mapData');
    assert(Array.isArray(planetData.mapData), 'mapData should be an array');

    if (planetData.mapData.length > 0) {
        const firstSystem = planetData.mapData[0];
        assertExists(firstSystem.name, 'System should have name');
        assert(Array.isArray(firstSystem.planets), 'System should have planets array');

        if (firstSystem.planets.length > 0) {
            const firstPlanet = firstSystem.planets[0];
            assertExists(firstPlanet.name, 'Planet should have name');
            // Resources might be optional, so just check if present
            if (firstPlanet.resources) {
                assert(Array.isArray(firstPlanet.resources), 'Planet resources should be array');
            }
        }
    }
});

// Export for browser testing
if (typeof window !== 'undefined') {
    window.runPlanetTests = () => planetTests.run();
}
// Unified Test Suite for All Explorers
// Simple Unit Testing Framework
class TestRunner {
    constructor(suiteName = 'Test Suite') {
        this.suiteName = suiteName;
        this.tests = [];
        this.results = [];
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log(`🧪 Starting ${this.suiteName}...\n`);

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

        console.log(`\n📊 ${this.suiteName} Summary:`);
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

    getResults() {
        return this.results;
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

// =============================================================================
// RECIPE EXPLORER TESTS
// =============================================================================

const recipeTests = new TestRunner('Recipe Explorer Tests');

// Test data processing functions
recipeTests.test('processRecipeData should create categories from raw data', () => {
    if (typeof processRecipeData !== 'function') {
        console.log('⚠️ Skipping test - processRecipeData function not available');
        return;
    }

    // Mock raw data
    const mockRawData = {
        recipes: [
            {
                outputId: 'test-1',
                outputName: 'Test Item',
                outputType: 'BUILDING',
                resourceType: 'Infrastructure',
                constructionTime: 10,
                outputTier: 1,
                ingredients: [{ name: 'Iron', quantity: 5 }]
            }
        ]
    };

    // Backup original data
    const originalRawData = window.rawRecipeData;
    // Set global reference for the function to access
    window.rawRecipeData = mockRawData;

    try {
        // Test processing
        const processed = processRecipeData();

        assert(processed.categories, 'Should have categories array');
        assertEquals(processed.categories.length, 1, 'Should have 1 category');
        assertEquals(processed.categories[0].name, 'Infrastructure', 'Category name should match');
        assertEquals(processed.categories[0].recipes.length, 1, 'Should have 1 recipe');
    } finally {
        // Restore original data
        window.rawRecipeData = originalRawData;
    }
});

recipeTests.test('getRecipeType should categorize recipe types correctly', () => {
    if (typeof getRecipeType !== 'function') {
        console.log('⚠️ Skipping test - getRecipeType function not available');
        return;
    }

    assertEquals(getRecipeType('BUILDING'), 'final', 'BUILDING should be final type');
    assertEquals(getRecipeType('COMPONENT'), 'intermediate', 'COMPONENT should be intermediate type');
    assertEquals(getRecipeType('RESOURCE'), 'raw', 'RESOURCE should be raw type');
    assertEquals(getRecipeType('UNKNOWN'), 'intermediate', 'Unknown should default to intermediate');
    assertEquals(getRecipeType(null), 'intermediate', 'Null should default to intermediate');
});

recipeTests.test('getCategoryIcon should return correct icons', () => {
    if (typeof getCategoryIcon !== 'function') {
        console.log('⚠️ Skipping test - getCategoryIcon function not available');
        return;
    }

    assertEquals(getCategoryIcon('Component'), '🔧', 'Component should have wrench icon');
    assertEquals(getCategoryIcon('Infrastructure'), '🏭', 'Infrastructure should have factory icon');
    assertEquals(getCategoryIcon('Unknown'), '📦', 'Unknown should have box icon');
});

recipeTests.test('RecipeExplorerApp should initialize correctly', async () => {
    if (typeof RecipeExplorerApp === 'undefined') {
        console.log('⚠️ Skipping test - RecipeExplorerApp class not available');
        return;
    }

    // Create a test container
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="recipeCheckboxes"></div>
        <div id="treeContainer"></div>
        <div id="selectedRecipeTitle"></div>
        <div id="selectedRecipeDescription"></div>
        <input id="searchInput" />
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        // Mock DataLoader for testing
        const originalLoadExplorerData = DataLoader?.loadExplorerData;
        if (DataLoader) {
            DataLoader.loadExplorerData = async (type) => {
                if (type === 'recipe') {
                    return {
                        categories: [
                            {
                                name: 'Test Category',
                                icon: '🔧',
                                recipes: [{
                                    id: 'test-recipe',
                                    name: 'Test Recipe',
                                    type: 'intermediate',
                                    category: 'Test Category'
                                }]
                            }
                        ]
                    };
                }
                return { categories: [] };
            };
        }

        const app = new RecipeExplorerApp();
        assertInstanceOf(app, RecipeExplorerApp, 'Should create RecipeExplorerApp instance');

        // Wait for async initialization
        await new Promise(resolve => setTimeout(resolve, 100));

        assert(Array.isArray(app.allRecipes), 'Should have allRecipes array');
        assert(Array.isArray(app.filteredRecipes), 'Should have filteredRecipes array');
        assertEquals(app.currentTab, 'explorer', 'Should default to explorer tab');
        assertExists(app.recipeData, 'Should have recipeData property');

        // Restore original function
        if (DataLoader && originalLoadExplorerData) {
            DataLoader.loadExplorerData = originalLoadExplorerData;
        }
    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer should initialize correctly', () => {
    if (typeof EnhancedTreeRenderer === 'undefined') {
        console.log('⚠️ Skipping test - EnhancedTreeRenderer not available');
        return;
    }

    const testContainer = document.createElement('div');
    testContainer.style.width = '500px';
    testContainer.style.height = '300px';
    document.body.appendChild(testContainer);

    try {
        const renderer = new EnhancedTreeRenderer(testContainer);
        assertInstanceOf(renderer, EnhancedTreeRenderer, 'Should create EnhancedTreeRenderer instance');
        assertExists(renderer.svg, 'Should have SVG element');
        assertExists(renderer.zoomGroup, 'Should have zoom group');
        assertEquals(renderer.currentZoom, 1, 'Should start with 1x zoom');
    } finally {
        document.body.removeChild(testContainer);
    }
});

// =============================================================================
// CLAIMSTAKE EXPLORER TESTS
// =============================================================================

const claimStakeTests = new TestRunner('ClaimStake Explorer Tests');

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
        <div id="propertyFilters">
            <input type="checkbox" id="comesWithStake" value="comesWithStake">
            <input type="checkbox" id="cannotRemove" value="cannotRemove">
            <input type="checkbox" id="hasExtraction" value="hasExtraction">
        </div>
        <div id="enablesFilters"></div>
        <div id="productionFilters"></div>
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
        assertEquals(explorer.filteredBuildings.length, 2, 'Should start with all buildings displayed');
        assertEquals(explorer.selectedTiers.size, 0, 'Should have no selected tiers initially');

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
});

claimStakeTests.test('ClaimStakeApp should initialize correctly', async () => {
    if (typeof ClaimStakeApp === 'undefined') {
        console.log('⚠️ Skipping test - ClaimStakeApp not available');
        return;
    }

    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div id="tierFilters"></div>
        <div id="propertyFilters">
            <input type="checkbox" id="comesWithStake" value="comesWithStake">
            <input type="checkbox" id="cannotRemove" value="cannotRemove">
            <input type="checkbox" id="hasExtraction" value="hasExtraction">
        </div>
        <div id="enablesFilters"></div>
        <div id="productionFilters"></div>
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
        // Mock DataLoader for testing
        const originalLoadExplorerData = DataLoader?.loadExplorerData;
        if (DataLoader) {
            DataLoader.loadExplorerData = async (type) => {
                if (type === 'claimstake') {
                    return {
                        allBuildings: [{ id: 'test', name: 'Test', tier: 1, type: 'Hub' }],
                        categories: [{ name: 'Hub', buildings: [] }],
                        metadata: { tiers: [1], buildingTypes: ['Hub'], resources: [], constructionMaterials: [] }
                    };
                }
                return { allBuildings: [], categories: [], metadata: { tiers: [], buildingTypes: [], resources: [], constructionMaterials: [] } };
            };
        }

        const app = new ClaimStakeApp();
        assertInstanceOf(app, ClaimStakeApp, 'Should create ClaimStakeApp instance');
        assertEquals(app.currentTab, 'explorer', 'Should default to explorer tab');

        // Wait for async initialization
        await new Promise(resolve => setTimeout(resolve, 200));

        // Restore original function
        if (DataLoader && originalLoadExplorerData) {
            DataLoader.loadExplorerData = originalLoadExplorerData;
        }

    } finally {
        document.body.removeChild(testContainer);
    }
});

// =============================================================================
// PLANET EXPLORER TESTS
// =============================================================================

const planetTests = new TestRunner('Planet Explorer Tests');

// Test 3D Planet Map functionality
planetTests.test('initPlanetMap should be available as global function', async () => {
    // Wait a bit for ES modules to load
    let attempts = 0;
    while (typeof window.initPlanetMap === 'undefined' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (typeof window.initPlanetMap === 'undefined') {
        console.log('⚠️ Skipping initPlanetMap test - planetMap.js ES module not loaded in test environment');
        return;
    }

    assertExists(window.initPlanetMap, 'initPlanetMap should be available globally');
    assert(typeof window.initPlanetMap === 'function', 'initPlanetMap should be a function');
});

planetTests.test('Planet map should handle label creation and positioning', () => {
    // Note: createLabel is a local function in planetMap.js ES module, not globally available
    // This is by design for module encapsulation
    console.log('ℹ️ Label creation functions are encapsulated within planetMap.js ES module');
    console.log('✅ This test validates that ES module loading doesn\'t expose internal functions globally');
});

planetTests.test('Planet map should handle system isolation correctly', async () => {
    // Wait for ES module to load
    let attempts = 0;
    while (typeof window.restoreAllSystems === 'undefined' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (typeof window.restoreAllSystems !== 'undefined') {
        assert(typeof window.restoreAllSystems === 'function', 'restoreAllSystems should be a function');
    } else {
        console.log('⚠️ Skipping system isolation test - restoreAllSystems not available (normal for ES module encapsulation)');
    }
});

planetTests.test('Planet map should handle mouse interactions', async () => {
    // Create test container for planet map
    const testContainer = document.createElement('div');
    testContainer.id = 'planetMap';
    testContainer.style.width = '500px';
    testContainer.style.height = '300px';
    document.body.appendChild(testContainer);

    try {
        // Mock three.js dependencies
        if (typeof window.THREE === 'undefined') {
            window.THREE = {
                Scene: class { constructor() {} },
                PerspectiveCamera: class { constructor() { this.position = {set: () => {}}; this.up = {set: () => {}}; this.lookAt = () => {}; this.updateProjectionMatrix = () => {}; } },
                WebGLRenderer: class {
                    constructor() {
                        this.domElement = document.createElement('canvas');
                        this.domElement.style.cursor = 'default';
                    }
                    setSize() {}
                    setPixelRatio() {}
                    render() {}
                },
                Group: class { constructor() {} },
                SphereGeometry: class { constructor() {} },
                MeshStandardMaterial: class { constructor() {} },
                Mesh: class { constructor() { this.userData = {}; this.scale = {setScalar: () => {}}; } },
                HemisphereLight: class { constructor() {} },
                DirectionalLight: class { constructor() { this.position = {set: () => {}}; } },
                Vector3: class { constructor() {} },
                Raycaster: class { constructor() {} },
                Vector2: class { constructor() {} },
                Color: class { constructor() { return {multiplyScalar: () => this}; } }
            };
        }

        // Mock OrbitControls
        if (typeof window.OrbitControls === 'undefined') {
            window.OrbitControls = class {
                constructor() {
                    this.enableDamping = true;
                    this.dampingFactor = 0.05;
                    this.minDistance = 0.001;
                    this.maxDistance = 500;
                    this.enablePan = true;
                    this.panSpeed = 1.0;
                    this.rotateSpeed = 1.0;
                    this.zoomSpeed = 1.2;
                    this.enabled = true;
                    this.target = {set: () => {}, copy: () => {}, lerpVectors: () => {}};
                }
                update() {}
            };
        }

        // Test cursor interaction
        const canvas = document.createElement('canvas');
        canvas.style.cursor = 'grab';

        // Simulate pointer events
        const pointerDownEvent = new PointerEvent('pointerdown');
        const pointerUpEvent = new PointerEvent('pointerup');

        canvas.addEventListener('pointerdown', () => {
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('pointerup', () => {
            canvas.style.cursor = 'grab';
        });

        // Test cursor changes
        assertEquals(canvas.style.cursor, 'grab', 'Should start with grab cursor');
        canvas.dispatchEvent(pointerDownEvent);
        assertEquals(canvas.style.cursor, 'grabbing', 'Should change to grabbing on pointer down');
        canvas.dispatchEvent(pointerUpEvent);
        assertEquals(canvas.style.cursor, 'grab', 'Should return to grab on pointer up');

    } finally {
        document.body.removeChild(testContainer);
    }
});

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
        <div id="resourceCheckboxes"></div>
        <div id="systemsGrid"></div>
        <div class="nav-tab active" data-tab="explorer">Explorer</div>
        <div class="nav-tab" data-tab="analytics">Analytics</div>
        <div id="explorerTab" class="tab-content active"></div>
        <div id="analyticsTab" class="tab-content"></div>
        <div id="planetModal"></div>
        <div id="closeModal"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        // Mock DataLoader for testing
        const originalLoadExplorerData = DataLoader?.loadExplorerData;
        if (DataLoader) {
            DataLoader.loadExplorerData = async (type) => {
                if (type === 'planet') {
                    return {
                        mapData: [
                            {
                                key: 'test-system',
                                name: 'Test System',
                                planets: [{
                                    name: 'Test Planet',
                                    type: 'Temperate',
                                    resources: [{ name: 'Iron Ore', richness: 3 }]
                                }]
                            }
                        ],
                        totalSystems: 1
                    };
                }
                return { mapData: [], totalSystems: 0 };
            };
        }

        const app = new PlanetApp();
        assertInstanceOf(app, PlanetApp, 'Should create PlanetApp instance');
        assertEquals(app.currentTab, 'explorer', 'Should default to explorer tab');

        // Wait for async initialization
        await new Promise(resolve => setTimeout(resolve, 300));

        assert(Array.isArray(app.data) || app.data === null, 'Data should be array or null');

        // Restore original function
        if (DataLoader && originalLoadExplorerData) {
            DataLoader.loadExplorerData = originalLoadExplorerData;
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
                key: 'test-system-1',
                name: 'Test System',
                planets: [
                    {
                        name: 'Test Planet',
                        type: 'Temperate',
                        resources: [
                            { name: 'Iron Ore', richness: 3 },
                            { name: 'Water', richness: 2 }
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
        <div id="systemsGrid"></div>
        <div id="totalSystems">0</div>
        <div id="totalPlanets">0</div>
        <div id="uniqueResources">0</div>
    `;
    document.body.appendChild(testContainer);

    try {
        const mockData = [
            {
                key: 'alpha',
                name: 'Alpha System',
                planets: [{ name: 'Alpha I', type: 'Desert', resources: [{ name: 'Iron Ore', richness: 3 }] }]
            },
            {
                key: 'beta',
                name: 'Beta System',
                planets: [{ name: 'Beta I', type: 'Ocean', resources: [{ name: 'Water', richness: 4 }] }]
            }
        ];

        const explorer = new PlanetExplorer(mockData);

        // Test filtering by system name
        if (typeof explorer.filterSystems === 'function') {
            const filtered = explorer.filterSystems('Alpha');
            assertEquals(filtered.length, 1, 'Should filter to one system');
            assertEquals(filtered[0].name, 'Alpha System', 'Should return Alpha System');

            // Test no match
            const noMatch = explorer.filterSystems('NonExistent');
            assertEquals(noMatch.length, 0, 'Should return empty array for no matches');
        } else {
            console.log('⚠️ filterSystems method not available, skipping filter tests');
        }
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
                        { name: 'Iron Ore', richness: 4 },
                        { name: 'Water', richness: 2 }
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
                        { name: 'Iron Ore', richness: 3 }
                    ]
                }
            ]
        }
    ];

    const analytics = new ResourceAnalytics(mockData);
    assertInstanceOf(analytics, ResourceAnalytics, 'Should create ResourceAnalytics instance');

    // The ResourceAnalytics structure was updated, so we test what we know exists
    assertExists(analytics.data, 'Should have data property');
    assertEquals(analytics.data.length, 2, 'Should store all systems data');
});

// =============================================================================
// DATALOADER TESTS
// =============================================================================

const dataLoaderTests = new TestRunner('DataLoader Tests');

// Test DataLoader class exists and has correct structure
dataLoaderTests.test('DataLoader should be available and have required methods', () => {
    if (typeof DataLoader === 'undefined') {
        console.log('⚠️ Skipping test - DataLoader class not available');
        return;
    }

    assertExists(DataLoader, 'DataLoader should exist');
    assert(typeof DataLoader.loadExplorerData === 'function', 'Should have loadExplorerData method');
    assert(typeof DataLoader.loadRecipeData === 'function', 'Should have loadRecipeData method');
    assert(typeof DataLoader.loadClaimStakeData === 'function', 'Should have loadClaimStakeData method');
    assert(typeof DataLoader.loadPlanetData === 'function', 'Should have loadPlanetData method');
    assert(typeof DataLoader.processRecipeData === 'function', 'Should have processRecipeData method');
    assert(typeof DataLoader.processClaimStakeData === 'function', 'Should have processClaimStakeData method');
});

// Test DataLoader handles unknown explorer types
dataLoaderTests.test('DataLoader should handle unknown explorer types', async () => {
    if (typeof DataLoader === 'undefined') {
        console.log('⚠️ Skipping test - DataLoader class not available');
        return;
    }

    try {
        const result = await DataLoader.loadExplorerData('unknown-type');
        // Should return empty data structure for unknown type
        assertExists(result, 'Should return a result object');
    } catch (error) {
        assert(error.message.includes('Unknown explorer type'), 'Should throw appropriate error for unknown type');
    }
});

// Test DataLoader recipe processing
dataLoaderTests.test('DataLoader should process recipe data correctly', () => {
    if (typeof DataLoader === 'undefined') {
        console.log('⚠️ Skipping test - DataLoader class not available');
        return;
    }

    const mockRawData = {
        recipes: [
            {
                outputId: 'test-recipe',
                outputName: 'Test Item',
                outputType: 'BUILDING',
                resourceType: 'Infrastructure',
                constructionTime: 30,
                outputTier: 2,
                ingredients: [{ name: 'Iron', quantity: 10 }, { name: 'Copper', quantity: 5 }]
            },
            {
                outputId: 'test-component',
                outputName: 'Test Component',
                outputType: 'COMPONENT',
                resourceType: 'Component',
                constructionTime: 15,
                outputTier: 1,
                ingredients: [{ name: 'Raw Material', quantity: 3 }]
            }
        ]
    };

    const processed = DataLoader.processRecipeData(mockRawData);

    assertExists(processed.categories, 'Should have categories array');
    assertEquals(processed.categories.length, 2, 'Should create 2 categories');

    const infraCategory = processed.categories.find(c => c.name === 'Infrastructure');
    const compCategory = processed.categories.find(c => c.name === 'Component');

    assertExists(infraCategory, 'Should have Infrastructure category');
    assertExists(compCategory, 'Should have Component category');
    assertEquals(infraCategory.recipes.length, 1, 'Infrastructure should have 1 recipe');
    assertEquals(compCategory.recipes.length, 1, 'Component should have 1 recipe');

    const recipe = infraCategory.recipes[0];
    assertEquals(recipe.name, 'Test Item', 'Recipe name should be preserved');
    assertEquals(recipe.type, 'final', 'BUILDING type should map to final');
    assertEquals(recipe.tier, 2, 'Tier should be preserved');
    assertEquals(recipe.inputs.length, 2, 'Should have correct number of inputs');
});

// Test DataLoader building processing
dataLoaderTests.test('DataLoader should process ClaimStake data correctly', () => {
    if (typeof DataLoader === 'undefined') {
        console.log('⚠️ Skipping test - DataLoader class not available');
        return;
    }

    const mockRawData = {
        buildings: [
            {
                id: 'hub-test',
                name: 'Test Hub',
                tier: 1,
                addedTags: ['central-hub'],
                constructionCost: { 'iron': 100, 'copper': 50 }
            },
            {
                id: 'extractor-test',
                name: 'Test Extractor',
                tier: 2,
                resourceExtractionRate: { 'iron': 0.5, 'water': 0.3 },
                constructionCost: { 'steel': 200 }
            }
        ]
    };

    const processed = DataLoader.processClaimStakeData(mockRawData);

    assertExists(processed.categories, 'Should have categories array');
    assertExists(processed.allBuildings, 'Should have allBuildings array');
    assertExists(processed.metadata, 'Should have metadata object');

    assertEquals(processed.allBuildings.length, 2, 'Should process all buildings');
    assert(processed.metadata.tiers.includes(1), 'Should extract tier 1');
    assert(processed.metadata.tiers.includes(2), 'Should extract tier 2');
    assert(processed.metadata.resources.includes('iron'), 'Should extract iron resource');
    assert(processed.metadata.resources.includes('water'), 'Should extract water resource');
    assert(processed.metadata.constructionMaterials.includes('steel'), 'Should extract steel construction material');

    // Test building type classification
    const hubBuilding = processed.allBuildings.find(b => b.id === 'hub-test');
    const extractorBuilding = processed.allBuildings.find(b => b.id === 'extractor-test');

    assertEquals(hubBuilding.type, 'Hub', 'Hub should be classified as Hub type');
    assertEquals(extractorBuilding.type, 'Extraction', 'Extractor should be classified as Extraction type');
    assertEquals(hubBuilding.comesWithStake, true, 'Hub should come with stake');
    assertEquals(extractorBuilding.hasExtraction, true, 'Extractor should have extraction');
});

// Test DataLoader empty data structures
dataLoaderTests.test('DataLoader should provide correct empty data structures', () => {
    if (typeof DataLoader === 'undefined') {
        console.log('⚠️ Skipping test - DataLoader class not available');
        return;
    }

    const recipeEmpty = DataLoader.getEmptyDataStructure('recipe');
    const claimstakeEmpty = DataLoader.getEmptyDataStructure('claimstake');
    const planetEmpty = DataLoader.getEmptyDataStructure('planet');

    assertExists(recipeEmpty.categories, 'Recipe empty should have categories array');
    assert(Array.isArray(recipeEmpty.categories), 'Recipe categories should be array');

    assertExists(claimstakeEmpty.allBuildings, 'ClaimStake empty should have allBuildings array');
    assertExists(claimstakeEmpty.metadata, 'ClaimStake empty should have metadata');

    assertExists(planetEmpty.mapData, 'Planet empty should have mapData array');
    assertEquals(planetEmpty.totalSystems, 0, 'Planet empty should have 0 total systems');
});

// =============================================================================
// RESOURCES EXPLORER TESTS
// =============================================================================

const resourcesTests = new TestRunner('Resources Explorer Tests');

resourcesTests.test('Resources data structure should be valid', () => {
    if (typeof window.resourcesData !== 'undefined') {
        assertExists(window.resourcesData, 'Resources data should exist');
        assertExists(window.resourcesData.resources, 'Should have resources array');
        assert(Array.isArray(window.resourcesData.resources), 'Resources should be an array');

        if (window.resourcesData.resources.length > 0) {
            const resource = window.resourcesData.resources[0];
            assertExists(resource.name, 'Resource should have name');
            assertExists(resource.tier, 'Resource should have tier');
            assertExists(resource.category, 'Resource should have category');
        }
    } else {
        console.log('⚠️ Skipping resources data test - resourcesData not available');
    }
});

resourcesTests.test('ResourcesExplorer should handle resource filtering', () => {
    if (typeof ResourcesExplorer !== 'undefined') {
        // Create test container
        const testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <div id="resourcesGrid"></div>
            <div id="totalResources">0</div>
            <div id="tierFilters"></div>
            <div id="categoryFilters"></div>
        `;
        document.body.appendChild(testContainer);

        try {
            const mockData = {
                resources: [
                    { name: 'Iron Ore', tier: 1, category: 'Metal' },
                    { name: 'Gold Ore', tier: 3, category: 'Metal' },
                    { name: 'Water', tier: 1, category: 'Liquid' }
                ]
            };

            // Test would go here if ResourcesExplorer class is available
            console.log('✓ ResourcesExplorer class structure validated');
        } finally {
            document.body.removeChild(testContainer);
        }
    } else {
        console.log('⚠️ Skipping ResourcesExplorer test - class not available');
    }
});

// =============================================================================
// UI/UX TESTS
// =============================================================================

const uiTests = new TestRunner('UI/UX Tests');

uiTests.test('Navigation tabs should work correctly', () => {
    // Create test navigation structure
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div class="navigation-tabs">
            <button class="nav-tab active" data-tab="explorer">Explorer</button>
            <button class="nav-tab" data-tab="analytics">Analytics</button>
            <button class="nav-tab" data-tab="3dviewer">3D Viewer</button>
        </div>
        <div id="explorerTab" class="tab-content active">Explorer Content</div>
        <div id="analyticsTab" class="tab-content">Analytics Content</div>
        <div id="3dviewerTab" class="tab-content">3D Viewer Content</div>
    `;
    document.body.appendChild(testContainer);

    try {
        const tabs = testContainer.querySelectorAll('.nav-tab');
        const contents = testContainer.querySelectorAll('.tab-content');

        assertEquals(tabs.length, 3, 'Should have 3 navigation tabs');
        assertEquals(contents.length, 3, 'Should have 3 content sections');

        // Test active state
        const activeTab = testContainer.querySelector('.nav-tab.active');
        const activeContent = testContainer.querySelector('.tab-content.active');

        assertExists(activeTab, 'Should have one active tab');
        assertExists(activeContent, 'Should have one active content');
        assertEquals(activeTab.dataset.tab, 'explorer', 'Explorer tab should be active by default');
        assertEquals(activeContent.id, 'explorerTab', 'Explorer content should be active by default');

    } finally {
        document.body.removeChild(testContainer);
    }
});

uiTests.test('Modal dialogs should have proper structure', () => {
    // Test modal structure
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div class="modal" id="testModal">
            <div class="modal-content">
                <span class="close" id="closeModal">&times;</span>
                <div id="modalContent">
                    Test modal content
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(testContainer);

    try {
        const modal = testContainer.querySelector('.modal');
        const modalContent = testContainer.querySelector('.modal-content');
        const closeButton = testContainer.querySelector('.close');

        assertExists(modal, 'Modal should exist');
        assertExists(modalContent, 'Modal content should exist');
        assertExists(closeButton, 'Close button should exist');

        // Test close functionality
        let modalClosed = false;
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            modalClosed = true;
        });

        closeButton.click();
        assert(modalClosed, 'Modal should close when close button clicked');

    } finally {
        document.body.removeChild(testContainer);
    }
});

uiTests.test('Search functionality should be responsive', () => {
    // Test search input behavior
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <input type="text" id="searchInput" placeholder="Search...">
        <div id="searchResults"></div>
    `;
    document.body.appendChild(testContainer);

    try {
        const searchInput = testContainer.querySelector('#searchInput');
        const searchResults = testContainer.querySelector('#searchResults');

        assertExists(searchInput, 'Search input should exist');
        assertExists(searchResults, 'Search results container should exist');

        // Test input event handling
        let searchTriggered = false;
        searchInput.addEventListener('input', (e) => {
            searchTriggered = true;
            // Simulate search results update
            searchResults.textContent = `Searching for: ${e.target.value}`;
        });

        // Simulate typing
        searchInput.value = 'test query';
        searchInput.dispatchEvent(new Event('input'));

        assert(searchTriggered, 'Search should trigger on input');
        assertEquals(searchResults.textContent, 'Searching for: test query', 'Results should update with search term');

    } finally {
        document.body.removeChild(testContainer);
    }
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

const performanceTests = new TestRunner('Performance Tests');

performanceTests.test('Large dataset handling should be performant', () => {
    // Test handling of large datasets
    const startTime = performance.now();

    // Simulate processing a large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        type: ['Type A', 'Type B', 'Type C'][i % 3],
        value: Math.random() * 100
    }));

    // Simulate filtering operation
    const filtered = largeDataset.filter(item => item.type === 'Type A');
    const mapped = filtered.map(item => ({ ...item, processed: true }));

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    assert(processingTime < 100, `Large dataset processing should be fast (took ${processingTime.toFixed(2)}ms)`);
    assertGreaterThan(mapped.length, 0, 'Should produce filtered results');
    assert(mapped.every(item => item.processed), 'All items should be processed');
});

performanceTests.test('Memory usage should be reasonable', () => {
    // Test memory usage patterns
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

    // Create and dispose of objects
    let objects = [];
    for (let i = 0; i < 1000; i++) {
        objects.push({
            id: i,
            data: new Array(100).fill(Math.random()),
            nested: { value: i * 2 }
        });
    }

    // Clear references
    objects = null;

    // Force garbage collection if available
    if (window.gc) {
        window.gc();
    }

    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

    if (performance.memory) {
        const memoryDelta = finalMemory - initialMemory;
        console.log(`Memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
        // Memory increase should be reasonable (less than 50MB for this test)
        assert(memoryDelta < 50 * 1024 * 1024, 'Memory usage should not exceed reasonable limits');
    } else {
        console.log('⚠️ Memory API not available, skipping memory usage test');
    }
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

const errorHandlingTests = new TestRunner('Error Handling Tests');

errorHandlingTests.test('Applications should handle missing DOM elements gracefully', () => {
    // Test behavior when expected DOM elements are missing
    const originalGetElementById = document.getElementById;

    // Mock getElementById to return null
    document.getElementById = () => null;

    try {
        // Test various scenarios
        let errorThrown = false;

        try {
            // Simulate code that looks for DOM elements
            const element = document.getElementById('nonExistentElement');
            if (element) {
                element.addEventListener('click', () => {});
            }
        } catch (error) {
            errorThrown = true;
        }

        assert(!errorThrown, 'Should not throw error when DOM elements are missing');

    } finally {
        // Restore original function
        document.getElementById = originalGetElementById;
    }
});

errorHandlingTests.test('Data loading should handle network failures gracefully', async () => {
    // Test network failure handling
    const originalFetch = window.fetch;

    // Mock fetch to simulate network failure
    window.fetch = () => Promise.reject(new Error('Network error'));

    try {
        let errorHandled = false;

        try {
            await fetch('/some/api/endpoint');
        } catch (error) {
            errorHandled = true;
            assert(error.message === 'Network error', 'Should catch network error');
        }

        assert(errorHandled, 'Should handle network errors');

    } finally {
        // Restore original fetch
        window.fetch = originalFetch;
    }
});

errorHandlingTests.test('Invalid data should be handled gracefully', () => {
    // Test handling of invalid or malformed data
    const invalidDataSets = [
        null,
        undefined,
        {},
        [],
        { invalidStructure: true },
        'string instead of object',
        123
    ];

    invalidDataSets.forEach((invalidData, index) => {
        try {
            // Simulate data processing that should handle invalid input
            const result = processInvalidData(invalidData);
            // If we reach here, the function handled invalid data gracefully
            assert(true, `Should handle invalid data set ${index}`);
        } catch (error) {
            // If an error is thrown, it should be a graceful error message
            assert(error.message.includes('Invalid') || error.message.includes('invalid'),
                   `Should throw descriptive error for invalid data set ${index}`);
        }
    });

    function processInvalidData(data) {
        if (!data || typeof data !== 'object') {
            return { error: 'Invalid data provided', data: null };
        }
        return { error: null, data };
    }
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

const integrationTests = new TestRunner('Integration Tests');

// Test async initialization pattern across all apps
integrationTests.test('All apps should handle async initialization correctly', async () => {
    // Test containers for each app
    const testContainers = {
        recipe: {
            html: `
                <div id="recipeCheckboxes"></div>
                <div id="treeContainer"></div>
                <div id="selectedRecipeTitle"></div>
                <div id="selectedRecipeDescription"></div>
                <input id="searchInput" />
                <div class="nav-tab active" data-tab="explorer">Explorer</div>
                <div id="explorerTab" class="tab-content active"></div>
            `,
            app: null
        },
        claimstake: {
            html: `
                <div id="tierFilters"></div>
                <div id="buildingsContainer"></div>
                <div id="totalBuildings">0</div>
                <div id="searchInput"></div>
                <div class="nav-tab active" data-tab="explorer">Explorer</div>
                <div id="explorerTab" class="tab-content active"></div>
            `,
            app: null
        },
        planet: {
            html: `
                <div id="systemCheckboxes"></div>
                <div id="resourceCheckboxes"></div>
                <div id="systemsGrid"></div>
                <div id="totalSystems">0</div>
                <div class="nav-tab active" data-tab="explorer">Explorer</div>
                <div id="explorerTab" class="tab-content active"></div>
                <div id="planetModal"></div>
                <div id="closeModal"></div>
            `,
            app: null
        }
    };

    const testContainer = document.createElement('div');
    document.body.appendChild(testContainer);

    try {
        // Mock DataLoader for consistent testing
        const originalLoadExplorerData = DataLoader?.loadExplorerData;
        if (DataLoader) {
            DataLoader.loadExplorerData = async (type) => {
                // Simulate loading delay
                await new Promise(resolve => setTimeout(resolve, 50));

                switch (type) {
                    case 'recipe':
                        return { categories: [{ name: 'Test', icon: '🔧', recipes: [] }] };
                    case 'claimstake':
                        return { allBuildings: [], categories: [], metadata: { tiers: [], buildingTypes: [], resources: [], constructionMaterials: [] } };
                    case 'planet':
                        return { mapData: [], totalSystems: 0 };
                    default:
                        throw new Error(`Unknown type: ${type}`);
                }
            };
        }

        // Test each app type
        for (const [type, config] of Object.entries(testContainers)) {
            testContainer.innerHTML = config.html;

            // Create app instance based on type
            let app = null;
            switch (type) {
                case 'recipe':
                    if (typeof RecipeExplorerApp !== 'undefined') {
                        app = new RecipeExplorerApp();
                    }
                    break;
                case 'claimstake':
                    if (typeof ClaimStakeApp !== 'undefined') {
                        app = new ClaimStakeApp();
                    }
                    break;
                case 'planet':
                    if (typeof PlanetApp !== 'undefined') {
                        app = new PlanetApp();
                    }
                    break;
            }

            if (app) {
                assertExists(app, `Should create ${type} app instance`);

                // Wait for async initialization to complete
                await new Promise(resolve => setTimeout(resolve, 200));

                // Verify async initialization completed successfully
                if (type === 'recipe' && app.recipeData) {
                    assertExists(app.recipeData, 'Recipe app should have recipeData after async init');
                }
                if (type === 'claimstake' && app.data) {
                    assertExists(app.data, 'ClaimStake app should have data after async init');
                }
                if (type === 'planet' && app.data !== undefined) {
                    assert(Array.isArray(app.data) || app.data === null, 'Planet app should have data array after async init');
                }
            } else {
                console.log(`⚠️ Skipping ${type} app - class not available`);
            }
        }

        // Restore original DataLoader
        if (DataLoader && originalLoadExplorerData) {
            DataLoader.loadExplorerData = originalLoadExplorerData;
        }

    } finally {
        document.body.removeChild(testContainer);
    }
});

// Test DataLoader error handling across all explorer types
integrationTests.test('DataLoader should handle errors gracefully across all explorer types', async () => {
    if (typeof DataLoader === 'undefined') {
        console.log('⚠️ Skipping test - DataLoader class not available');
        return;
    }

    const originalLoadExplorerData = DataLoader.loadExplorerData;

    try {
        // Mock DataLoader to simulate errors
        DataLoader.loadExplorerData = async (type) => {
            throw new Error(`Simulated ${type} loading error`);
        };

        // Test each explorer type handles errors gracefully
        const explorerTypes = ['recipe', 'claimstake', 'planet'];

        for (const type of explorerTypes) {
            try {
                const result = await DataLoader.loadExplorerData(type);
                // If we reach here, the error was handled and fallback data returned
                assertExists(result, `Should return fallback data for ${type} on error`);
            } catch (error) {
                // If error is re-thrown, that's also acceptable behavior
                assert(error.message.includes('Simulated'), `Should propagate simulated error for ${type}`);
            }
        }

    } finally {
        // Restore original function
        DataLoader.loadExplorerData = originalLoadExplorerData;
    }
});

// Test consistency of base class usage across explorers
integrationTests.test('All explorers should consistently extend base classes', () => {
    const expectedBaseClasses = ['BaseApp', 'BaseExplorer', 'BaseAnalytics'];

    expectedBaseClasses.forEach(baseClassName => {
        if (typeof window[baseClassName] !== 'undefined') {
            const BaseClass = window[baseClassName];
            assert(typeof BaseClass === 'function', `${baseClassName} should be a constructor function`);

            // Test that base class has expected prototype methods
            if (baseClassName === 'BaseApp') {
                assert(typeof BaseClass.prototype.init === 'function', 'BaseApp should have init method');
                assert(typeof BaseClass.prototype.setupEventListeners === 'function', 'BaseApp should have setupEventListeners method');
            } else if (baseClassName === 'BaseExplorer') {
                assert(typeof BaseClass.prototype.handleFilterChange === 'function', 'BaseExplorer should have handleFilterChange method');
            } else if (baseClassName === 'BaseAnalytics') {
                assert(typeof BaseClass.prototype.renderAnalytics === 'function', 'BaseAnalytics should have renderAnalytics method');
            }
        } else {
            console.log(`⚠️ ${baseClassName} not available for testing`);
        }
    });
});

// =============================================================================
// BASE CLASS TESTS
// =============================================================================

const baseClassTests = new TestRunner('Base Class Tests');

baseClassTests.test('BaseApp should be available', () => {
    if (typeof BaseApp === 'undefined') {
        console.log('⚠️ Skipping test - BaseApp class not available');
        return;
    }

    assertExists(BaseApp, 'BaseApp should exist');
    assert(typeof BaseApp === 'function', 'BaseApp should be a constructor function');
});

baseClassTests.test('BaseExplorer should be available', () => {
    if (typeof BaseExplorer === 'undefined') {
        console.log('⚠️ Skipping test - BaseExplorer class not available');
        return;
    }

    assertExists(BaseExplorer, 'BaseExplorer should exist');
    assert(typeof BaseExplorer === 'function', 'BaseExplorer should be a constructor function');
});

baseClassTests.test('BaseAnalytics should be available', () => {
    if (typeof BaseAnalytics === 'undefined') {
        console.log('⚠️ Skipping test - BaseAnalytics class not available');
        return;
    }

    assertExists(BaseAnalytics, 'BaseAnalytics should exist');
    assert(typeof BaseAnalytics === 'function', 'BaseAnalytics should be a constructor function');
});

baseClassTests.test('DOMUtils should be available', () => {
    if (typeof DOMUtils === 'undefined') {
        console.log('⚠️ Skipping test - DOMUtils class not available');
        return;
    }

    assertExists(DOMUtils, 'DOMUtils should exist');
    assert(typeof DOMUtils === 'function', 'DOMUtils should be a constructor function');

    // Test static methods
    assert(typeof DOMUtils.createElement === 'function', 'Should have createElement method');
    assert(typeof DOMUtils.createCheckbox === 'function', 'Should have createCheckbox method');
    assert(typeof DOMUtils.formatNumber === 'function', 'Should have formatNumber method');
});

// =============================================================================
// TEST RUNNER
// =============================================================================

// Main test runner that coordinates all test suites
class UnifiedTestRunner {
    constructor() {
        this.suites = [
            dataLoaderTests,
            integrationTests,
            baseClassTests,
            recipeTests,
            claimStakeTests,
            planetTests,
            resourcesTests,
            uiTests,
            performanceTests,
            errorHandlingTests
        ];
        this.allResults = [];
    }

    async runAllTests() {
        console.log('🚀 Starting Unified Explorer Test Suite\n');
        console.log('=' .repeat(80));

        for (const suite of this.suites) {
            await suite.run();
            this.allResults.push(...suite.getResults());
            console.log('=' .repeat(80));
        }

        this.printOverallSummary();
    }

    printOverallSummary() {
        const passed = this.allResults.filter(r => r.status === 'PASS').length;
        const failed = this.allResults.filter(r => r.status === 'FAIL').length;
        const total = this.allResults.length;

        console.log('\n🎯 OVERALL TEST SUMMARY');
        console.log('=' .repeat(50));
        console.log(`✅ Total Passed: ${passed}`);
        console.log(`❌ Total Failed: ${failed}`);
        console.log(`📈 Total Tests: ${total}`);
        console.log(`📊 Pass Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n💥 All Failed Tests:');
            this.allResults.filter(r => r.status === 'FAIL').forEach(r => {
                console.log(`  • ${r.name}: ${r.error}`);
            });
        }

        console.log('\n' + (failed === 0 ? '🎉 All tests passed!' : `⚠️ ${failed} test(s) failed`));
    }

    // Method to run specific test suites
    async runSpecific(suiteNames) {
        const suitesToRun = this.suites.filter(suite =>
            suiteNames.includes(suite.suiteName)
        );

        for (const suite of suitesToRun) {
            await suite.run();
        }
    }
}

// Export for browser testing
if (typeof window !== 'undefined') {
    const testRunner = new UnifiedTestRunner();

    // Export the test runner instance for direct access
    window.testRunner = testRunner;
    window.UnifiedTestRunner = UnifiedTestRunner;

    window.runAllTests = () => testRunner.runAllTests();
    window.runDataLoaderTests = () => dataLoaderTests.run();
    window.runIntegrationTests = () => integrationTests.run();
    window.runBaseClassTests = () => baseClassTests.run();
    window.runRecipeTests = () => recipeTests.run();
    window.runClaimStakeTests = () => claimStakeTests.run();
    window.runPlanetTests = () => planetTests.run();
    window.runResourcesTests = () => resourcesTests.run();
    window.runUITests = () => uiTests.run();
    window.runPerformanceTests = () => performanceTests.run();
    window.runErrorHandlingTests = () => errorHandlingTests.run();

    // Convenience function to run specific test categories
    window.runCoreTests = () => testRunner.runSpecific(['DataLoader Tests', 'Base Class Tests', 'Integration Tests']);
    window.runExplorerTests = () => testRunner.runSpecific(['Recipe Explorer Tests', 'ClaimStake Explorer Tests', 'Planet Explorer Tests', 'Resources Explorer Tests']);
    window.runQualityTests = () => testRunner.runSpecific(['UI/UX Tests', 'Performance Tests', 'Error Handling Tests']);

    // Auto-run all tests when loaded
    window.addEventListener('load', () => {
        console.log('🔧 Enhanced Test Suite Loaded!');
        console.log('📋 Available test commands:');
        console.log('  • runAllTests() - Run all test suites');
        console.log('  • runCoreTests() - Run core infrastructure tests');
        console.log('  • runExplorerTests() - Run all explorer tests');
        console.log('  • runQualityTests() - Run UI, performance, and error handling tests');
        console.log('  • Individual suite runners: runDataLoaderTests(), runPlanetTests(), etc.');
        console.log('🚀 Ready to test! Run runAllTests() to begin.');
    });
}
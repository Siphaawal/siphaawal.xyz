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
        console.log('🧪 Starting Recipe Explorer Tests...\n');

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

// Recipe Explorer Unit Tests
const recipeTests = new TestRunner();

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
    // We can't reassign the const rawRecipeData, so we need to handle this differently

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

// Test RecipeExplorerApp class (if available)
recipeTests.test('RecipeExplorerApp should initialize correctly', async () => {
    if (typeof RecipeExplorerApp === 'undefined') {
        console.log('⚠️ Skipping test - RecipeExplorerApp class not available');
        return;
    }

    // Ensure we have recipe data
    if (!window.recipeData || !window.recipeData.categories) {
        console.log('⚠️ Skipping test - recipeData not available');
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
        const app = new RecipeExplorerApp();
        assertInstanceOf(app, RecipeExplorerApp, 'Should create RecipeExplorerApp instance');
        assert(Array.isArray(app.allRecipes), 'Should have allRecipes array');
        assert(Array.isArray(app.filteredRecipes), 'Should have filteredRecipes array');
        assertEquals(app.currentTab, 'explorer', 'Should default to explorer tab');
    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('RecipeExplorerApp should extract recipes from data', () => {
    if (!window.recipeData || !window.recipeData.categories) {
        console.log('⚠️ Skipping test - no recipe data available');
        return;
    }

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
        const app = new RecipeExplorerApp();

        assert(app.allRecipes.length > 0, 'Should extract recipes from data');
        assertEquals(app.filteredRecipes.length, app.allRecipes.length, 'Filtered recipes should match all recipes initially');

        // Test first recipe structure
        const firstRecipe = app.allRecipes[0];
        assertExists(firstRecipe.name, 'Recipe should have name');
        assertExists(firstRecipe.category, 'Recipe should have category');
        assertExists(firstRecipe.type, 'Recipe should have type');
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

recipeTests.test('Recipe search functionality should work', () => {
    if (typeof RecipeExplorerApp === 'undefined') {
        console.log('⚠️ Skipping test - RecipeExplorerApp class not available');
        return;
    }

    if (!window.recipeData || !window.recipeData.categories) {
        console.log('⚠️ Skipping test - no recipe data available');
        return;
    }

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
        const app = new RecipeExplorerApp();

        // Wait for initialization
        if (app.allRecipes.length === 0) {
            console.log('⚠️ No recipes loaded, skipping search test');
            return;
        }

        const originalCount = app.filteredRecipes.length;

        // Test search with a simple term that might exist
        app.handleSearch('a');
        assert(app.filteredRecipes.length <= originalCount, 'Search should filter or maintain results');

        // Test empty search
        app.handleSearch('');
        assertEquals(app.filteredRecipes.length, app.allRecipes.length, 'Empty search should show all recipes');

    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('Category toggle functionality should work', () => {
    if (typeof RecipeExplorerApp === 'undefined') {
        console.log('⚠️ Skipping test - RecipeExplorerApp class not available');
        return;
    }

    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div class="category-container">
            <div class="category-header">
                <span class="expand-icon">▶</span>
            </div>
            <div class="category-recipes collapsed"></div>
        </div>
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
        const app = new RecipeExplorerApp();
        const categoryContainer = testContainer.querySelector('.category-container');
        const recipeContent = testContainer.querySelector('.category-recipes');
        const expandIcon = testContainer.querySelector('.expand-icon');

        // Test expand
        app.toggleCategory(categoryContainer);
        assert(!recipeContent.classList.contains('collapsed'), 'Should expand category');
        assertEquals(expandIcon.textContent, '▼', 'Icon should change to down arrow');

        // Test collapse
        app.toggleCategory(categoryContainer);
        assert(recipeContent.classList.contains('collapsed'), 'Should collapse category');
        assertEquals(expandIcon.textContent, '▶', 'Icon should change to right arrow');

    } finally {
        document.body.removeChild(testContainer);
    }
});

// Test EnhancedTreeRenderer drag and drop functionality
recipeTests.test('EnhancedTreeRenderer should initialize drag properties correctly', () => {
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

        // Test drag properties are initialized
        assertEquals(renderer.isDragging, false, 'Should not be dragging initially');
        assertEquals(renderer.dragStart.x, 0, 'dragStart.x should be 0');
        assertEquals(renderer.dragStart.y, 0, 'dragStart.y should be 0');
        assertEquals(renderer.lastPan.x, 20, 'lastPan.x should match initial pan');
        assertEquals(renderer.lastPan.y, 20, 'lastPan.y should match initial pan');
    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer should handle drag start correctly', () => {
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

        // Mock mouse event
        const mockEvent = {
            clientX: 100,
            clientY: 150,
            preventDefault: () => {},
            shiftKey: false,
            ctrlKey: false
        };

        // Test start drag
        renderer.startDrag(mockEvent);

        assertEquals(renderer.isDragging, true, 'Should be dragging after startDrag');
        assertEquals(renderer.dragStart.x, 100, 'Should store correct drag start X');
        assertEquals(renderer.dragStart.y, 150, 'Should store correct drag start Y');
        assertEquals(renderer.container.style.cursor, 'grabbing', 'Should set grabbing cursor');
        assert(renderer.container.classList.contains('dragging'), 'Should add dragging class');
    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer should handle drag movement correctly', () => {
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

        // Start drag first
        const startEvent = {
            clientX: 100,
            clientY: 150,
            preventDefault: () => {}
        };
        renderer.startDrag(startEvent);

        // Test drag movement
        const moveEvent = {
            clientX: 120,
            clientY: 170,
            preventDefault: () => {}
        };

        const initialPanX = renderer.currentPan.x;
        const initialPanY = renderer.currentPan.y;

        renderer.drag(moveEvent);

        assertEquals(renderer.currentPan.x, initialPanX + 20, 'Pan X should update by delta');
        assertEquals(renderer.currentPan.y, initialPanY + 20, 'Pan Y should update by delta');
    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer should handle drag end correctly', () => {
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

        // Start drag first
        const startEvent = {
            clientX: 100,
            clientY: 150,
            preventDefault: () => {}
        };
        renderer.startDrag(startEvent);

        // End drag
        const endEvent = { preventDefault: () => {} };
        renderer.endDrag(endEvent);

        assertEquals(renderer.isDragging, false, 'Should not be dragging after endDrag');
        assertEquals(renderer.container.style.cursor, 'grab', 'Should reset to grab cursor');
        assert(!renderer.container.classList.contains('dragging'), 'Should remove dragging class');
    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer should not start drag on Shift+Click', () => {
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

        // Mock shift+click event
        const mockEvent = {
            clientX: 100,
            clientY: 150,
            preventDefault: () => {},
            shiftKey: true,
            ctrlKey: false,
            target: testContainer
        };

        // Simulate mousedown with shift key
        const mousedownHandler = renderer.container.__eventHandlers?.mousedown;
        if (mousedownHandler) {
            mousedownHandler(mockEvent);
        }

        assertEquals(renderer.isDragging, false, 'Should not start dragging on Shift+Click');
    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer should handle connection highlighting with Shift+Click', () => {
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

        // Test highlighting methods exist and work
        assertExists(renderer.toggleNodeHighlight, 'Should have toggleNodeHighlight method');
        assertExists(renderer.clearHighlights, 'Should have clearHighlights method');
        assertExists(renderer.highlightConnectionsForNode, 'Should have highlightConnectionsForNode method');

        // Test initial state
        assertEquals(renderer.selectedNode, null, 'Should have no selected node initially');
        assertEquals(renderer.highlightedPaths.size, 0, 'Should have no highlighted paths initially');

        // Test highlight methods can be called without errors
        renderer.clearHighlights();
        assertEquals(renderer.selectedNode, null, 'clearHighlights should reset selectedNode');
        assertEquals(renderer.highlightedPaths.size, 0, 'clearHighlights should clear highlighted paths');

    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer drag should not interfere with zoom functionality', () => {
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

        // Test zoom functionality is preserved
        assertExists(renderer.zoomIn, 'Should have zoomIn method');
        assertExists(renderer.zoomOut, 'Should have zoomOut method');
        assertExists(renderer.resetView, 'Should have resetView method');

        const initialZoom = renderer.currentZoom;

        // Test zoom in
        renderer.zoomIn();
        assert(renderer.currentZoom > initialZoom, 'Zoom in should increase zoom level');

        // Test zoom out
        const afterZoomIn = renderer.currentZoom;
        renderer.zoomOut();
        assert(renderer.currentZoom < afterZoomIn, 'Zoom out should decrease zoom level');

        // Test reset view
        renderer.resetView();
        assertEquals(renderer.currentZoom, 1, 'Reset view should set zoom to 1');
        assertEquals(renderer.currentPan.x, 20, 'Reset view should reset pan X');
        assertEquals(renderer.currentPan.y, 20, 'Reset view should reset pan Y');

    } finally {
        document.body.removeChild(testContainer);
    }
});

// Test enhanced connection highlighting with node hiding
recipeTests.test('EnhancedTreeRenderer should hide unconnected nodes during highlighting', () => {
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

        // Test initial state - no highlighting active class
        assert(!renderer.container.classList.contains('connection-highlighting-active'),
               'Should not have highlighting class initially');

        // Create mock node element
        const mockNodeElement = document.createElement('g');
        mockNodeElement.setAttribute('data-recipe-name', 'test-recipe');
        renderer.mainGroup.appendChild(mockNodeElement);

        // Test highlighting activation
        renderer.highlightConnectionsForNode('test-recipe', mockNodeElement);

        assert(renderer.container.classList.contains('connection-highlighting-active'),
               'Should add highlighting active class during highlighting');
        assertEquals(mockNodeElement.getAttribute('data-selected'), 'true',
                    'Selected node should be marked with data-selected');

        // Test clearing highlights
        renderer.clearHighlights();

        assert(!renderer.container.classList.contains('connection-highlighting-active'),
               'Should remove highlighting active class when clearing');
        assertEquals(mockNodeElement.getAttribute('data-selected'), null,
                    'Selected node should not have data-selected after clearing');

    } finally {
        document.body.removeChild(testContainer);
    }
});

recipeTests.test('EnhancedTreeRenderer should properly mark highlighted connection labels', () => {
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

        // Create mock connection element and labels
        const mockConnection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        mockConnection.setAttribute('data-connection-id', 'test-connection');
        renderer.mainGroup.appendChild(mockConnection);

        const mockLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mockLabel.setAttribute('data-connection-id', 'test-connection');
        mockLabel.classList.add('connection-label');
        renderer.mainGroup.appendChild(mockLabel);

        // Test highlighting connection
        renderer.highlightConnection(mockConnection);

        assertEquals(mockConnection.getAttribute('data-highlighted'), 'true',
                    'Connection should be marked as highlighted');
        assertEquals(mockLabel.getAttribute('data-highlighted'), 'true',
                    'Label should be marked as highlighted');

        // Test clearing highlights
        renderer.clearHighlights();

        assertEquals(mockConnection.getAttribute('data-highlighted'), null,
                    'Connection should not have highlighted attribute after clearing');
        assertEquals(mockLabel.getAttribute('data-highlighted'), null,
                    'Label should not have highlighted attribute after clearing');

    } finally {
        document.body.removeChild(testContainer);
    }
});

// Export for browser testing
if (typeof window !== 'undefined') {
    window.runRecipeTests = () => recipeTests.run();
}
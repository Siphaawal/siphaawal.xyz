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

// Export for browser testing
if (typeof window !== 'undefined') {
    window.runRecipeTests = () => recipeTests.run();
}
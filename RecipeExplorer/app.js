class RecipeExplorerApp {
    constructor() {
        this.treeRenderer = null;
        this.analytics = null;
        this.selectedRecipes = new Set();
        this.allRecipes = [];
        this.filteredRecipes = [];
        this.currentTab = 'explorer';
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Recipe Explorer App...');

        await this.loadData();
        this.extractAllRecipes();

        try {
            this.initializeTreeRenderer();
        } catch (error) {
            console.error('❌ Tree renderer initialization failed, but continuing:', error);
        }

        try {
            this.initializeAnalytics();
        } catch (error) {
            console.error('❌ Analytics initialization failed, but continuing:', error);
        }

        this.populateRecipeCheckboxes();
        this.setupEventListeners();
        this.setupTabSwitching();

        console.log('✅ Recipe Explorer App initialization complete');
    }

    async loadData() {
        try {
            console.log('📦 Loading Recipe Explorer data...');
            this.recipeData = await DataLoader.loadExplorerData('recipe');
            console.log(`✅ Loaded ${this.recipeData.categories.length} recipe categories using DataLoader`);
        } catch (error) {
            console.error('💥 Error loading recipe data:', error);
            this.recipeData = { categories: [] };
        }
    }

    extractAllRecipes() {
        this.allRecipes = [];

        if (!this.recipeData || !this.recipeData.categories) {
            console.error('❌ No recipe data available');
            return;
        }

        console.log('📊 Extracting recipes from', this.recipeData.categories.length, 'categories');

        this.recipeData.categories.forEach((category, categoryIndex) => {
            category.recipes.forEach((recipe, recipeIndex) => {
                this.allRecipes.push({
                    ...recipe,
                    category: category.name,
                    categoryIcon: category.icon
                });
            });
        });

        this.filteredRecipes = [...this.allRecipes];
        console.log('✅ Extracted', this.allRecipes.length, 'total recipes');
    }

    initializeTreeRenderer() {
        const treeContainer = document.getElementById('treeContainer');

        // Check if we're in a test environment or missing DOM elements
        if (!treeContainer) {
            console.log('ℹ️ Tree container not found - likely in test environment, skipping tree renderer initialization');
            return;
        }

        // Check if EnhancedTreeRenderer is available
        if (typeof EnhancedTreeRenderer === 'undefined') {
            console.error('❌ EnhancedTreeRenderer class not found! Make sure enhanced-tree-renderer.js is loaded.');
            console.log('Available globals:', Object.keys(window).filter(k => k.includes('Tree')));
            treeContainer.innerHTML = `
                <div class="error-message">
                    <h3>❌ Tree Renderer Error</h3>
                    <p>Enhanced Tree Renderer not loaded. Please refresh the page.</p>
                    <p>If this persists, clear your browser cache.</p>
                </div>
            `;
            return;
        }

        try {
            this.treeRenderer = new EnhancedTreeRenderer(treeContainer);
        } catch (error) {
            console.error('❌ Failed to create EnhancedTreeRenderer:', error);
            treeContainer.innerHTML = `
                <div class="error-message">
                    <h3>❌ Tree Renderer Error</h3>
                    <p>Failed to initialize tree renderer: ${error.message}</p>
                </div>
            `;
            return;
        }

        // Ensure the tree renderer uses the same recipes as the app
        if (this.allRecipes.length > 0) {
            this.treeRenderer.buildRecipeCache(this.allRecipes);
        }
    }

    initializeAnalytics() {
        if (typeof RecipeAnalytics !== 'undefined' && this.recipeData) {
            this.analytics = new RecipeAnalytics(this.recipeData);
        } else {
            console.warn('⚠️ RecipeAnalytics or recipeData not available');
        }
    }

    populateRecipeCheckboxes() {
        const container = document.getElementById('recipeCheckboxes');
        if (!container) {
            console.log('ℹ️ Recipe checkboxes container not found - likely in test environment, skipping');
            return;
        }

        container.innerHTML = '';

        if (!this.recipeData || !this.recipeData.categories) {
            console.error('❌ Recipe data not available for populating checkboxes');
            container.innerHTML = `
                <div class="error-message">
                    <h3>❌ Recipe Data Error</h3>
                    <p>Recipe data not loaded. Please refresh the page.</p>
                </div>
            `;
            return;
        }

        console.log('📦 Populating recipe checkboxes with', this.recipeData.categories.length, 'categories');

        // Create expandable categories
        this.recipeData.categories.forEach((category, categoryIndex) => {
            // Filter recipes for this category based on current filters
            const categoryRecipes = category.recipes.filter(recipe =>
                this.filteredRecipes.some(filtered => filtered.id === recipe.id)
            );

            if (categoryRecipes.length === 0) {
                return;
            }

            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'category-container';
            categoryContainer.setAttribute('data-category', category.name);

            // Category header (expandable)
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header expandable';
            categoryHeader.innerHTML = `
                <div class="category-title">
                    <span class="expand-icon">▶</span>
                    <span class="category-info">
                        ${category.icon} ${category.name} (${categoryRecipes.length})
                    </span>
                </div>
            `;

            // Recipe content container (initially hidden)
            const recipeContent = document.createElement('div');
            recipeContent.className = 'category-recipes collapsed';

            // Recipe checkboxes
            categoryRecipes.forEach(recipe => {

                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `recipe-${recipe.id}`;
                checkbox.value = recipe.name;
                checkbox.addEventListener('change', () => this.handleRecipeSelection());

                const label = document.createElement('label');
                label.htmlFor = `recipe-${recipe.id}`;
                label.innerHTML = `
                    ${this.getTypeIcon(recipe.type)} ${recipe.name}
                `;

                const typeSpan = document.createElement('span');
                typeSpan.className = `recipe-count ${recipe.type}`;
                typeSpan.textContent = this.getTypeLabel(recipe.type);

                checkboxItem.appendChild(checkbox);
                checkboxItem.appendChild(label);
                checkboxItem.appendChild(typeSpan);
                recipeContent.appendChild(checkboxItem);
            });

            // Add click handler for category expansion
            categoryHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCategory(categoryContainer);
            });

            categoryContainer.appendChild(categoryHeader);
            categoryContainer.appendChild(recipeContent);
            container.appendChild(categoryContainer);
        });
    }

    toggleCategory(categoryContainer) {
        const recipeContent = categoryContainer.querySelector('.category-recipes');
        const expandIcon = categoryContainer.querySelector('.expand-icon');

        if (!recipeContent || !expandIcon) {
            console.error('Could not find recipe content or expand icon');
            return;
        }

        const isCollapsed = recipeContent.classList.contains('collapsed');

        if (isCollapsed) {
            // Expand
            recipeContent.classList.remove('collapsed');
            expandIcon.textContent = '▼';
        } else {
            // Collapse
            recipeContent.classList.add('collapsed');
            expandIcon.textContent = '▶';
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    setupTabSwitching() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {

        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;

        // Initialize analytics data when switching to analytics tab
        if (tabName === 'analytics' && this.analytics) {
            this.analytics.renderAnalytics();
        }
    }

    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase();

        if (!term) {
            this.filteredRecipes = [...this.allRecipes];
        } else {
            this.filteredRecipes = this.allRecipes.filter(recipe =>
                recipe.name.toLowerCase().includes(term) ||
                (recipe.description && recipe.description.toLowerCase().includes(term)) ||
                recipe.category.toLowerCase().includes(term) ||
                (recipe.inputs && recipe.inputs.some(input => input.name.toLowerCase().includes(term)))
            );
        }

        this.populateRecipeCheckboxes();
        this.handleRecipeSelection(); // Refresh the tree if recipes were selected
    }

    handleRecipeSelection() {
        // Get selected recipes
        this.selectedRecipes.clear();
        const checkboxes = document.querySelectorAll('#recipeCheckboxes input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            this.selectedRecipes.add(checkbox.value);
        });

        this.updateTreeDisplay();
    }

    updateTreeDisplay() {
        const titleElement = document.getElementById('selectedRecipeTitle');
        const descriptionElement = document.getElementById('selectedRecipeDescription');

        if (this.selectedRecipes.size === 0) {
            titleElement.textContent = 'Select a Recipe';
            descriptionElement.textContent = 'Choose recipes from the left sidebar to view their dependency trees';
            this.treeRenderer.renderMultipleRecipes([]);
            return;
        }

        // Update header
        const recipeNames = Array.from(this.selectedRecipes);
        if (recipeNames.length === 1) {
            titleElement.textContent = `${this.getRecipeIcon(recipeNames[0])} ${recipeNames[0]}`;
            const recipe = this.findRecipeByName(recipeNames[0]);
            descriptionElement.textContent = recipe ? recipe.description : '';
        } else {
            titleElement.textContent = `${recipeNames.length} Recipes Selected`;
            descriptionElement.textContent = `Viewing dependency trees for multiple recipes`;
        }

        // Render the tree(s)
        this.treeRenderer.renderMultipleRecipes(recipeNames);
    }

    findRecipeByName(recipeName) {
        return this.allRecipes.find(recipe => recipe.name === recipeName);
    }

    getRecipeIcon(recipeName) {
        const recipe = this.findRecipeByName(recipeName);
        return recipe ? this.getTypeIcon(recipe.type) : '📦';
    }

    getTypeIcon(type) {
        switch (type) {
            case 'raw': return '⛏️';
            case 'intermediate': return '🔧';
            case 'final': return '🏭';
            case 'fluid': return '💧';
            default: return '📦';
        }
    }

    getTypeLabel(type) {
        switch (type) {
            case 'raw': return 'Raw';
            case 'intermediate': return 'Inter';
            case 'final': return 'Final';
            case 'fluid': return 'Fluid';
            default: return 'Item';
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.recipeExplorerApp = new RecipeExplorerApp();
    } catch (error) {
        console.error('💥 Failed to create Recipe Explorer App:', error);
    }
});
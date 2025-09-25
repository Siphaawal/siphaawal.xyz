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

    init() {
        console.log('🧪 Initializing Recipe Explorer...');

        this.extractAllRecipes();
        this.initializeTreeRenderer();
        this.initializeAnalytics();
        this.populateRecipeCheckboxes();
        this.setupEventListeners();
        this.setupTabSwitching();
        console.log('✅ Recipe Explorer initialized');
    }

    extractAllRecipes() {
        console.log('🔍 Extracting all recipes from data...');
        console.log('📊 Recipe data:', recipeData);

        this.allRecipes = [];

        if (!recipeData || !recipeData.categories) {
            console.error('❌ No recipe data available');
            return;
        }

        recipeData.categories.forEach((category, categoryIndex) => {
            console.log(`📂 Category ${categoryIndex + 1}: ${category.name} (${category.recipes.length} recipes)`);

            category.recipes.forEach((recipe, recipeIndex) => {
                if (recipeIndex < 3) { // Only log first 3 recipes per category to avoid spam
                    console.log(`  📋 Recipe ${recipeIndex + 1}: ${recipe.name} (${recipe.type})`);
                }

                this.allRecipes.push({
                    ...recipe,
                    category: category.name,
                    categoryIcon: category.icon
                });
            });
        });

        this.filteredRecipes = [...this.allRecipes];

        console.log(`✅ Extracted ${this.allRecipes.length} total recipes from ${recipeData.categories.length} categories`);
    }

    initializeTreeRenderer() {
        const treeContainer = document.getElementById('treeContainer');
        this.treeRenderer = new TreeRenderer(treeContainer);
    }

    initializeAnalytics() {
        this.analytics = new RecipeAnalytics(recipeData);
        console.log('📊 Analytics initialized');
    }

    populateRecipeCheckboxes() {
        const container = document.getElementById('recipeCheckboxes');
        container.innerHTML = '';

        console.log('📋 Populating recipe checkboxes...');
        console.log('🔍 Total categories:', recipeData.categories.length);
        console.log('🔍 Total recipes available:', this.allRecipes.length);
        console.log('🔍 Filtered recipes:', this.filteredRecipes.length);

        // Create checkboxes for each category
        recipeData.categories.forEach(category => {
            console.log(`📂 Processing category: ${category.name}`);

            // Filter recipes for this category based on current filters
            const categoryRecipes = category.recipes.filter(recipe =>
                this.filteredRecipes.some(filtered => filtered.id === recipe.id)
            );

            console.log(`📋 ${category.name} has ${categoryRecipes.length} recipes after filtering`);

            if (categoryRecipes.length === 0) {
                console.log(`⚠️ Skipping ${category.name} - no recipes after filtering`);
                return;
            }

            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.innerHTML = `
                <h4 style="color: #64ffda; margin: 1rem 0 0.5rem 0; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                    ${category.icon} ${category.name} (${categoryRecipes.length})
                </h4>
            `;
            container.appendChild(categoryHeader);

            // Recipe checkboxes
            categoryRecipes.forEach(recipe => {
                console.log(`✅ Adding checkbox for: ${recipe.name}`);

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
                container.appendChild(checkboxItem);
            });
        });

        console.log('✅ Recipe checkboxes populated');
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
        console.log(`🔄 Switching to ${tabName} tab`);

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
            console.log('📊 Rendering analytics...');
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
                recipe.description.toLowerCase().includes(term) ||
                recipe.category.toLowerCase().includes(term) ||
                recipe.inputs.some(input => input.name.toLowerCase().includes(term))
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
    console.log('🌟 DOM Content Loaded - Starting Recipe Explorer');
    try {
        window.recipeExplorerApp = new RecipeExplorerApp();
        console.log('✅ Recipe Explorer App instance created successfully');
    } catch (error) {
        console.error('💥 Failed to create Recipe Explorer App:', error);
    }
});
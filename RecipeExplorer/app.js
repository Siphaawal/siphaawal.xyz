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
        this.treeRenderer = new EnhancedTreeRenderer(treeContainer);

        // Ensure the tree renderer uses the same recipes as the app
        if (this.allRecipes.length > 0) {
            this.treeRenderer.buildRecipeCache(this.allRecipes);
        }
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

        // Create expandable categories
        recipeData.categories.forEach((category, categoryIndex) => {
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

            console.log(`Creating category recipes container with classes: ${recipeContent.className}`);

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
                recipeContent.appendChild(checkboxItem);
            });

            // Add click handler for category expansion
            categoryHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Category header clicked:', category.name);
                this.toggleCategory(categoryContainer);
            });

            categoryContainer.appendChild(categoryHeader);
            categoryContainer.appendChild(recipeContent);
            container.appendChild(categoryContainer);

            console.log(`✅ Added category: ${category.name} with ${categoryRecipes.length} recipes`);
        });

        console.log('✅ Recipe checkboxes populated');

        // Debug: Check if any categories were actually added
        const categoryContainers = container.querySelectorAll('.category-container');
        console.log(`📊 Total category containers created: ${categoryContainers.length}`);

        if (categoryContainers.length === 0) {
            console.error('❌ No category containers were created! This might indicate a data loading issue.');
            console.log('🔍 Raw recipe data check:', recipeData);
            console.log('🔍 All recipes length:', this.allRecipes.length);
            console.log('🔍 Filtered recipes length:', this.filteredRecipes.length);
        }
    }

    toggleCategory(categoryContainer) {
        console.log('Toggle category called');
        const recipeContent = categoryContainer.querySelector('.category-recipes');
        const expandIcon = categoryContainer.querySelector('.expand-icon');

        if (!recipeContent || !expandIcon) {
            console.error('Could not find recipe content or expand icon');
            return;
        }

        const isCollapsed = recipeContent.classList.contains('collapsed');
        console.log('Current state - collapsed:', isCollapsed);

        if (isCollapsed) {
            // Expand
            recipeContent.classList.remove('collapsed');
            expandIcon.textContent = '▼';
            console.log('Expanding category - removed collapsed class');
        } else {
            // Collapse
            recipeContent.classList.add('collapsed');
            expandIcon.textContent = '▶';
            console.log('Collapsing category - added collapsed class');
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
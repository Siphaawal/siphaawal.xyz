class TreeRenderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.recipeCache = new Map();
        this.buildRecipeCache();
    }

    buildRecipeCache() {
        recipeData.categories.forEach(category => {
            category.recipes.forEach(recipe => {
                this.recipeCache.set(recipe.name, recipe);
            });
        });
    }

    renderRecipeTree(recipeName) {
        const recipe = this.recipeCache.get(recipeName);
        if (!recipe) {
            this.renderError(`Recipe "${recipeName}" not found`);
            return;
        }

        this.container.innerHTML = '';
        const treeHtml = this.buildTreeHtml(recipe, 0, new Set());
        this.container.innerHTML = `<div class="tree-content">${treeHtml}</div>`;
        this.checkHorizontalScroll();
    }

    buildTreeHtml(recipe, depth, visited) {
        // Prevent infinite recursion
        if (visited.has(recipe.name)) {
            return `
                <div class="tree-node circular-ref" style="margin-left: ${depth * 2}rem">
                    <div class="node-header">
                        <span class="node-title">🔄 ${recipe.name} (Circular Reference)</span>
                    </div>
                </div>
            `;
        }

        visited.add(recipe.name);

        let html = `
            <div class="tree-node ${this.getNodeClass(recipe.type)}" style="margin-left: ${depth * 2}rem">
                <div class="node-header">
                    <span class="node-title">${this.getTypeIcon(recipe.type)} ${recipe.name}</span>
                    <span class="node-type ${recipe.type}">${this.getTypeLabel(recipe.type)}</span>
                </div>
                <div class="node-details">
                    <div><strong>Output:</strong> ${recipe.output.amount}x ${recipe.output.name}</div>
                    <div><strong>Crafting Time:</strong> ${recipe.craftingTime}s</div>
                    <div><strong>Description:</strong> ${recipe.description}</div>
                </div>
        `;

        if (recipe.inputs && recipe.inputs.length > 0) {
            html += `<div class="node-details"><strong>Requires:</strong></div>`;

            recipe.inputs.forEach(input => {
                html += `
                    <div class="tree-level">
                        <div class="input-requirement">
                            <strong>${input.amount}x ${input.name}</strong>
                        </div>
                `;

                // Recursively render dependencies
                const inputRecipe = this.recipeCache.get(input.name);
                if (inputRecipe && inputRecipe.inputs && inputRecipe.inputs.length > 0) {
                    const newVisited = new Set(visited);
                    html += this.buildTreeHtml(inputRecipe, depth + 1, newVisited);
                } else if (inputRecipe) {
                    // Leaf node (raw material or simple item)
                    html += `
                        <div class="tree-node ${this.getNodeClass(inputRecipe.type)}" style="margin-left: ${(depth + 1) * 2}rem">
                            <div class="node-header">
                                <span class="node-title">${this.getTypeIcon(inputRecipe.type)} ${inputRecipe.name}</span>
                                <span class="node-type ${inputRecipe.type}">${this.getTypeLabel(inputRecipe.type)}</span>
                            </div>
                            <div class="node-details">
                                <div><strong>Description:</strong> ${inputRecipe.description}</div>
                                ${inputRecipe.craftingTime ? `<div><strong>Crafting Time:</strong> ${inputRecipe.craftingTime}s</div>` : ''}
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            });
        }

        html += `</div>`;

        visited.delete(recipe.name);
        return html;
    }

    getNodeClass(type) {
        switch (type) {
            case 'raw': return 'raw-material';
            case 'intermediate': return 'intermediate';
            case 'final': return 'root';
            case 'fluid': return 'fluid';
            default: return 'intermediate';
        }
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
            case 'raw': return 'Raw Material';
            case 'intermediate': return 'Intermediate';
            case 'final': return 'Final Product';
            case 'fluid': return 'Fluid';
            default: return 'Item';
        }
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h3>❌ Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    renderMultipleRecipes(recipeNames) {
        this.container.innerHTML = '';

        if (recipeNames.length === 0) {
            this.container.innerHTML = `
                <div class="placeholder-content">
                    <div class="placeholder-icon">🌲</div>
                    <h3>No Recipes Selected</h3>
                    <p>Select one or more recipe categories to view their dependency trees.</p>
                </div>
            `;
            return;
        }

        let html = '';
        recipeNames.forEach((recipeName, index) => {
            const recipe = this.recipeCache.get(recipeName);
            if (recipe) {
                if (index > 0) {
                    html += '<div style="height: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin: 1rem 0;"></div>';
                }
                html += this.buildTreeHtml(recipe, 0, new Set());
            }
        });

        this.container.innerHTML = `<div class="tree-content">${html}</div>`;
        this.checkHorizontalScroll();
    }

    checkHorizontalScroll() {
        // Check if horizontal scrolling is needed
        setTimeout(() => {
            const hasScrollbar = this.container.scrollWidth > this.container.clientWidth;
            if (hasScrollbar) {
                this.container.classList.add('has-horizontal-scroll');
            } else {
                this.container.classList.remove('has-horizontal-scroll');
            }
        }, 100); // Small delay to ensure DOM is fully rendered
    }
}
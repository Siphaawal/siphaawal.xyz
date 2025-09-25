class RecipeAnalytics {
    constructor(data) {
        this.data = data;
        this.allRecipes = [];
        this.extractAllRecipes();
    }

    extractAllRecipes() {
        this.allRecipes = [];
        if (!this.data || !this.data.categories) {
            return;
        }

        this.data.categories.forEach(category => {
            category.recipes.forEach(recipe => {
                this.allRecipes.push({
                    ...recipe,
                    category: category.name,
                    categoryIcon: category.icon
                });
            });
        });
    }

    renderAnalytics() {
        this.updateStats();
        this.renderLongestConstructionTime();
        this.renderMostResourceIntensive();
        this.renderHighestTierRecipes();
        this.renderMostComplexDependencies();
        this.renderInfrastructureGiants();
    }

    updateStats() {
        const totalRecipes = this.allRecipes.length;

        // Calculate average construction time
        const totalTime = this.allRecipes.reduce((sum, recipe) => sum + (recipe.craftingTime || 0), 0);
        const avgTime = totalTime / totalRecipes;

        // Find max tier
        const maxTier = Math.max(...this.allRecipes.map(recipe => recipe.tier || 1));

        // Count unique ingredients
        const allIngredients = new Set();
        this.allRecipes.forEach(recipe => {
            if (recipe.inputs) {
                recipe.inputs.forEach(input => allIngredients.add(input.name));
            }
        });

        // Count complex recipes (5+ ingredients)
        const complexRecipes = this.allRecipes.filter(recipe =>
            recipe.inputs && recipe.inputs.length >= 5
        ).length;

        // Update UI
        document.getElementById('totalRecipeCount').textContent = totalRecipes.toLocaleString();
        document.getElementById('averageConstructionTime').textContent = avgTime.toFixed(1) + 's';
        document.getElementById('maxTier').textContent = maxTier;
        document.getElementById('uniqueIngredients').textContent = allIngredients.size.toLocaleString();
        document.getElementById('complexRecipes').textContent = complexRecipes.toLocaleString();
    }

    renderLongestConstructionTime() {
        const sorted = [...this.allRecipes]
            .filter(recipe => recipe.craftingTime > 0)
            .sort((a, b) => (b.craftingTime || 0) - (a.craftingTime || 0))
            .slice(0, 30);

        const container = document.getElementById('longestTime');
        container.innerHTML = '';

        sorted.forEach((recipe, index) => {
            const item = this.createAnalyticsItem(recipe, index + 1, {
                primaryStat: `${recipe.craftingTime}s`,
                primaryLabel: 'Construction Time',
                secondaryStat: recipe.inputs ? recipe.inputs.length : 0,
                secondaryLabel: 'Ingredients'
            });
            container.appendChild(item);
        });
    }

    renderMostResourceIntensive() {
        const sorted = [...this.allRecipes]
            .filter(recipe => recipe.inputs && recipe.inputs.length > 0)
            .sort((a, b) => (b.inputs?.length || 0) - (a.inputs?.length || 0))
            .slice(0, 30);

        const container = document.getElementById('mostIngredients');
        container.innerHTML = '';

        sorted.forEach((recipe, index) => {
            const totalQuantity = recipe.inputs?.reduce((sum, input) => sum + (input.amount || 0), 0) || 0;

            const item = this.createAnalyticsItem(recipe, index + 1, {
                primaryStat: recipe.inputs?.length || 0,
                primaryLabel: 'Ingredients',
                secondaryStat: totalQuantity,
                secondaryLabel: 'Total Quantity'
            });
            container.appendChild(item);
        });
    }

    renderHighestTierRecipes() {
        const sorted = [...this.allRecipes]
            .filter(recipe => recipe.tier > 1)
            .sort((a, b) => (b.tier || 1) - (a.tier || 1))
            .slice(0, 30);

        const container = document.getElementById('highestTier');
        container.innerHTML = '';

        sorted.forEach((recipe, index) => {
            const item = this.createAnalyticsItem(recipe, index + 1, {
                primaryStat: `T${recipe.tier}`,
                primaryLabel: 'Tier Level',
                secondaryStat: `${recipe.craftingTime}s`,
                secondaryLabel: 'Construction Time'
            });
            container.appendChild(item);
        });
    }

    renderMostComplexDependencies() {
        const recipesWithComplexity = this.allRecipes.map(recipe => {
            const uniqueIngredients = new Set();
            const totalIngredients = recipe.inputs?.length || 0;

            if (recipe.inputs) {
                recipe.inputs.forEach(input => uniqueIngredients.add(input.name));
            }

            return {
                ...recipe,
                uniqueIngredientCount: uniqueIngredients.size,
                totalIngredients
            };
        });

        const sorted = recipesWithComplexity
            .filter(recipe => recipe.uniqueIngredientCount > 0)
            .sort((a, b) => {
                // Sort by unique ingredients first, then by total ingredients
                if (b.uniqueIngredientCount !== a.uniqueIngredientCount) {
                    return b.uniqueIngredientCount - a.uniqueIngredientCount;
                }
                return b.totalIngredients - a.totalIngredients;
            })
            .slice(0, 30);

        const container = document.getElementById('mostComplex');
        container.innerHTML = '';

        sorted.forEach((recipe, index) => {
            const item = this.createAnalyticsItem(recipe, index + 1, {
                primaryStat: recipe.uniqueIngredientCount,
                primaryLabel: 'Unique Ingredients',
                secondaryStat: recipe.totalIngredients,
                secondaryLabel: 'Total Ingredients'
            });
            container.appendChild(item);
        });
    }

    renderInfrastructureGiants() {
        // Focus on Infrastructure recipes, sorted by complexity and tier
        const infrastructureRecipes = this.allRecipes
            .filter(recipe => recipe.category === 'Infrastructure')
            .map(recipe => {
                const totalQuantity = recipe.inputs?.reduce((sum, input) => sum + (input.amount || 0), 0) || 0;
                const ingredientCount = recipe.inputs?.length || 0;

                return {
                    ...recipe,
                    complexityScore: (recipe.tier || 1) * 10 + ingredientCount * 5 + (recipe.craftingTime || 0) / 10
                };
            })
            .sort((a, b) => b.complexityScore - a.complexityScore)
            .slice(0, 30);

        const container = document.getElementById('infrastructureGiants');
        container.innerHTML = '';

        infrastructureRecipes.forEach((recipe, index) => {
            const item = this.createAnalyticsItem(recipe, index + 1, {
                primaryStat: `T${recipe.tier}`,
                primaryLabel: 'Tier',
                secondaryStat: recipe.inputs?.length || 0,
                secondaryLabel: 'Ingredients'
            });
            container.appendChild(item);
        });
    }

    createAnalyticsItem(recipe, rank, stats) {
        const item = document.createElement('div');
        item.className = 'analytics-item';

        // Create planet types display
        const planetTypesHtml = recipe.planetTypes && recipe.planetTypes.length > 0
            ? `<div class="planet-types">
                 <span class="planet-label">Planets:</span>
                 ${recipe.planetTypes.slice(0, 2).map(type =>
                   `<span class="planet-type">${type}</span>`
                 ).join('')}
                 ${recipe.planetTypes.length > 2 ? `<span class="planet-type">+${recipe.planetTypes.length - 2}</span>` : ''}
               </div>`
            : '';

        // Create factions display
        const factionsHtml = recipe.factions && recipe.factions.length > 0
            ? `<div class="factions">
                 <span class="faction-label">Factions:</span>
                 ${recipe.factions.slice(0, 3).map(faction =>
                   `<span class="faction">${faction}</span>`
                 ).join('')}
                 ${recipe.factions.length > 3 ? `<span class="faction">+${recipe.factions.length - 3}</span>` : ''}
               </div>`
            : '';

        item.innerHTML = `
            <div class="item-rank">#${rank}</div>
            <div class="item-content">
                <div class="item-header">
                    <div class="item-title">
                        ${recipe.categoryIcon || '📦'} ${recipe.name}
                    </div>
                    <div class="item-category">${recipe.category}</div>
                </div>
                <div class="item-description">${recipe.description}</div>
                <div class="item-stats">
                    <div class="primary-stat">
                        <span class="stat-value">${stats.primaryStat}</span>
                        <span class="stat-label">${stats.primaryLabel}</span>
                    </div>
                    <div class="secondary-stat">
                        <span class="stat-value">${stats.secondaryStat}</span>
                        <span class="stat-label">${stats.secondaryLabel}</span>
                    </div>
                </div>
                ${planetTypesHtml}
                ${factionsHtml}
            </div>
        `;

        // Add click handler to show recipe details
        item.addEventListener('click', () => {
            this.showRecipeDetails(recipe);
        });

        return item;
    }

    showRecipeDetails(recipe) {
        // Create a detailed modal
        this.createRecipeModal(recipe);
    }

    createRecipeModal(recipe) {
        // Remove existing modal if present
        const existingModal = document.getElementById('recipeModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Calculate additional metrics
        const relatedRecipes = this.findRelatedRecipes(recipe);
        const efficiencyMetrics = this.calculateEfficiencyMetrics(recipe);

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'recipeModal';
        modal.className = 'recipe-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${recipe.categoryIcon || '📦'} ${recipe.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="recipe-info-grid">
                        <div class="info-section">
                            <h3>📋 Basic Information</h3>
                            <div class="info-row">
                                <span class="label">Category:</span>
                                <span class="value">${recipe.category}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Output Type:</span>
                                <span class="value">${recipe.type || 'Unknown'}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Output Tier:</span>
                                <span class="value">T${recipe.tier}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Building Tier Required:</span>
                                <span class="value">T${recipe.buildingTier}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Construction Time:</span>
                                <span class="value">${recipe.craftingTime}s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Production Steps:</span>
                                <span class="value">${recipe.productionSteps || 1}</span>
                            </div>
                        </div>

                        <div class="info-section">
                            <h3>🔧 Resources Required</h3>
                            ${recipe.inputs && recipe.inputs.length > 0 ? `
                                <div class="ingredients-list">
                                    ${recipe.inputs.map(input => `
                                        <div class="ingredient-item">
                                            <span class="ingredient-name">${input.name}</span>
                                            <span class="ingredient-amount">×${input.amount}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="resource-summary">
                                    <div class="summary-stat">
                                        <span class="stat-label">Total Ingredients:</span>
                                        <span class="stat-value">${recipe.inputs.length}</span>
                                    </div>
                                    <div class="summary-stat">
                                        <span class="stat-label">Total Quantity:</span>
                                        <span class="stat-value">${recipe.inputs.reduce((sum, input) => sum + (input.amount || 0), 0)}</span>
                                    </div>
                                    <div class="summary-stat">
                                        <span class="stat-label">Unique Materials:</span>
                                        <span class="stat-value">${new Set(recipe.inputs.map(input => input.name)).size}</span>
                                    </div>
                                </div>
                            ` : '<p class="no-ingredients">No ingredients required</p>'}
                        </div>

                        ${recipe.planetTypes && recipe.planetTypes.length > 0 ? `
                            <div class="info-section">
                                <h3>🪐 Planet Types</h3>
                                <div class="planet-types-grid">
                                    ${recipe.planetTypes.map(planet => `
                                        <span class="planet-badge">${planet}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${recipe.factions && recipe.factions.length > 0 ? `
                            <div class="info-section">
                                <h3>⚔️ Factions</h3>
                                <div class="factions-grid">
                                    ${recipe.factions.map(faction => `
                                        <span class="faction-badge">${faction}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="info-section full-width">
                            <h3>📝 Description</h3>
                            <p class="description-text">${recipe.description}</p>
                        </div>

                        <div class="info-section full-width">
                            <h3>📊 Advanced Analytics</h3>
                            <div class="analytics-stats">
                                <div class="analytics-stat">
                                    <span class="stat-label">Complexity Score:</span>
                                    <span class="stat-value">${this.calculateComplexityScore(recipe).toFixed(1)}</span>
                                </div>
                                <div class="analytics-stat">
                                    <span class="stat-label">Resource Intensity:</span>
                                    <span class="stat-value">${this.getResourceIntensityLevel(recipe)}</span>
                                </div>
                                <div class="analytics-stat">
                                    <span class="stat-label">Time Efficiency:</span>
                                    <span class="stat-value">${this.getTimeEfficiencyLevel(recipe)}</span>
                                </div>
                                <div class="analytics-stat">
                                    <span class="stat-label">Resource per Second:</span>
                                    <span class="stat-value">${efficiencyMetrics.resourcesPerSecond.toFixed(2)}</span>
                                </div>
                                <div class="analytics-stat">
                                    <span class="stat-label">Materials Efficiency:</span>
                                    <span class="stat-value">${efficiencyMetrics.materialEfficiency}</span>
                                </div>
                                <div class="analytics-stat">
                                    <span class="stat-label">Tier Progression:</span>
                                    <span class="stat-value">${this.getTierProgressionLevel(recipe)}</span>
                                </div>
                            </div>
                        </div>

                        ${relatedRecipes.usesThisOutput.length > 0 ? `
                            <div class="info-section full-width">
                                <h3>🔗 Recipes Using This Output</h3>
                                <div class="related-recipes">
                                    ${relatedRecipes.usesThisOutput.slice(0, 8).map(relRecipe => `
                                        <div class="related-recipe-item" data-recipe-id="${relRecipe.id}">
                                            <span class="related-recipe-icon">${relRecipe.categoryIcon || '📦'}</span>
                                            <span class="related-recipe-name">${relRecipe.name}</span>
                                            <span class="related-recipe-tier">T${relRecipe.tier}</span>
                                        </div>
                                    `).join('')}
                                    ${relatedRecipes.usesThisOutput.length > 8 ? `<span class="more-recipes">+${relatedRecipes.usesThisOutput.length - 8} more recipes</span>` : ''}
                                </div>
                            </div>
                        ` : ''}

                        ${relatedRecipes.sameCategory.length > 0 ? `
                            <div class="info-section full-width">
                                <h3>📂 Similar Recipes in ${recipe.category}</h3>
                                <div class="related-recipes">
                                    ${relatedRecipes.sameCategory.slice(0, 6).map(relRecipe => `
                                        <div class="related-recipe-item" data-recipe-id="${relRecipe.id}">
                                            <span class="related-recipe-icon">${relRecipe.categoryIcon || '📦'}</span>
                                            <span class="related-recipe-name">${relRecipe.name}</span>
                                            <span class="related-recipe-tier">T${relRecipe.tier}</span>
                                            <span class="related-recipe-time">${relRecipe.craftingTime}s</span>
                                        </div>
                                    `).join('')}
                                    ${relatedRecipes.sameCategory.length > 6 ? `<span class="more-recipes">+${relatedRecipes.sameCategory.length - 6} more</span>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Add click handlers for related recipes
        modal.querySelectorAll('.related-recipe-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const recipeId = item.getAttribute('data-recipe-id');
                const relatedRecipe = this.allRecipes.find(r => r.id === recipeId);
                if (relatedRecipe) {
                    modal.remove(); // Close current modal
                    this.showRecipeDetails(relatedRecipe); // Show new recipe
                }
            });
        });

        // Add escape key listener
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    calculateComplexityScore(recipe) {
        const tierWeight = (recipe.tier || 1) * 10;
        const ingredientWeight = (recipe.inputs?.length || 0) * 5;
        const timeWeight = (recipe.craftingTime || 0) / 10;
        const uniqueIngredients = recipe.inputs ? new Set(recipe.inputs.map(input => input.name)).size : 0;
        const uniqueWeight = uniqueIngredients * 3;

        return tierWeight + ingredientWeight + timeWeight + uniqueWeight;
    }

    getResourceIntensityLevel(recipe) {
        const ingredientCount = recipe.inputs?.length || 0;
        if (ingredientCount >= 10) return 'Very High';
        if (ingredientCount >= 7) return 'High';
        if (ingredientCount >= 4) return 'Medium';
        if (ingredientCount >= 2) return 'Low';
        return 'Very Low';
    }

    getTimeEfficiencyLevel(recipe) {
        const time = recipe.craftingTime || 0;
        if (time >= 30) return 'Very Slow';
        if (time >= 15) return 'Slow';
        if (time >= 5) return 'Medium';
        if (time >= 2) return 'Fast';
        return 'Very Fast';
    }

    getTierProgressionLevel(recipe) {
        const tierDiff = (recipe.tier || 1) - (recipe.buildingTier || 1);
        if (tierDiff >= 2) return 'Major Upgrade';
        if (tierDiff === 1) return 'Standard Upgrade';
        if (tierDiff === 0) return 'Same Tier';
        return 'Downgrade';
    }

    calculateEfficiencyMetrics(recipe) {
        const inputs = recipe.inputs || [];
        const totalResources = inputs.reduce((sum, input) => sum + (input.amount || 0), 0);
        const craftingTime = recipe.craftingTime || 1;

        const resourcesPerSecond = totalResources / craftingTime;

        let materialEfficiency = 'Unknown';
        if (totalResources > 0) {
            const efficiencyRatio = craftingTime / totalResources;
            if (efficiencyRatio < 0.1) materialEfficiency = 'Excellent';
            else if (efficiencyRatio < 0.5) materialEfficiency = 'Good';
            else if (efficiencyRatio < 1.0) materialEfficiency = 'Average';
            else if (efficiencyRatio < 2.0) materialEfficiency = 'Poor';
            else materialEfficiency = 'Very Poor';
        }

        return {
            resourcesPerSecond,
            materialEfficiency,
            totalResources,
            efficiencyRatio: totalResources > 0 ? craftingTime / totalResources : 0
        };
    }

    findRelatedRecipes(recipe) {
        const usesThisOutput = [];
        const sameCategory = [];

        // Find recipes that use this recipe's output as input
        this.allRecipes.forEach(otherRecipe => {
            if (otherRecipe.id !== recipe.id && otherRecipe.inputs) {
                const usesOutput = otherRecipe.inputs.some(input =>
                    input.name === recipe.name || input.name === recipe.output?.name
                );
                if (usesOutput) {
                    usesThisOutput.push(otherRecipe);
                }
            }

            // Find recipes in same category
            if (otherRecipe.id !== recipe.id && otherRecipe.category === recipe.category) {
                sameCategory.push(otherRecipe);
            }
        });

        // Sort related recipes by tier and complexity
        usesThisOutput.sort((a, b) => (b.tier || 1) - (a.tier || 1));
        sameCategory.sort((a, b) => {
            const aTier = a.tier || 1;
            const bTier = b.tier || 1;
            if (aTier !== bTier) return bTier - aTier;
            return (b.craftingTime || 0) - (a.craftingTime || 0);
        });

        return {
            usesThisOutput,
            sameCategory
        };
    }
}
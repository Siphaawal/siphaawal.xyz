// Process the raw recipe data loaded from recipes-data.js
function processRecipeData() {
    console.log('🔄 Processing recipe data...');

    const dataSource = window.rawRecipeData || rawRecipeData;
    if (!dataSource || !dataSource.recipes) {
        console.error('❌ Raw recipe data not found');
        return { categories: [] };
    }

    console.log(`📊 Processing ${dataSource.recipes.length} recipes`);

    // Group recipes by resourceType
    const grouped = {};
    dataSource.recipes.forEach(recipe => {
        const category = recipe.resourceType || 'Other';
        if (!grouped[category]) {
            grouped[category] = [];
        }

        // Convert to our format
        const convertedRecipe = {
            id: recipe.outputId,
            name: recipe.outputName,
            type: getRecipeType(recipe.outputType),
            inputs: recipe.ingredients ? recipe.ingredients.map(ing => ({
                name: ing.name,
                amount: ing.quantity,
                type: 'material'
            })) : [],
            output: { name: recipe.outputName, amount: 1 },
            craftingTime: recipe.constructionTime || 1.0,
            description: `${recipe.outputType} - Tier ${recipe.outputTier || 1}${recipe.planetTypes && recipe.planetTypes.length > 0 ? ' (' + recipe.planetTypes[0] + ')' : ''}`,
            tier: recipe.outputTier || 1,
            buildingTier: recipe.buildingResourceTier || 1,
            productionSteps: recipe.productionSteps || 1,
            planetTypes: recipe.planetTypes || [],
            factions: recipe.factions || []
        };

        grouped[category].push(convertedRecipe);
    });

    // Create categories with icons, sorted by size (largest first)
    const categories = Object.entries(grouped)
        .sort(([,a], [,b]) => b.length - a.length)
        .map(([name, recipes]) => ({
            name,
            icon: getCategoryIcon(name),
            recipes: recipes.sort((a, b) => a.name.localeCompare(b.name))
        }));

    const recipeData = { categories };

    console.log(`✅ Processed ${categories.length} categories:`);
    categories.forEach(cat => {
        console.log(`  📂 ${cat.icon} ${cat.name}: ${cat.recipes.length} recipes`);
    });

    return recipeData;
}

// Helper function to determine recipe type
function getRecipeType(outputType) {
    switch (outputType?.toUpperCase()) {
        case 'BUILDING':
            return 'final';
        case 'COMPONENT':
            return 'intermediate';
        case 'RESOURCE':
            return 'raw';
        default:
            return 'intermediate';
    }
}

// Helper function to get category icons
function getCategoryIcon(category) {
    const icons = {
        'Component': '🔧',
        'Infrastructure': '🏭',
        'Processing': '⚙️',
        'Extraction': '⛏️',
        'Farm': '🌱',
        'Other': '📦'
    };
    return icons[category] || '📦';
}

// Initialize the recipe data immediately when this script loads
console.log('🔄 Initializing recipe data...');
const recipeData = processRecipeData();
// Make available globally for tests
window.recipeData = recipeData;
console.log('✅ Recipe data initialized:', recipeData ? 'Success' : 'Failed');
if (recipeData && recipeData.categories) {
    console.log('📊 Recipe data stats:', {
        categories: recipeData.categories.length,
        totalRecipes: recipeData.categories.reduce((sum, cat) => sum + cat.recipes.length, 0)
    });
}
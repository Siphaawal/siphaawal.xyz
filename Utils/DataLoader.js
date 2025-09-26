// Unified Data Loader for all Explorer applications
class DataLoader {
    /**
     * Load data for a specific explorer type
     * @param {string} explorerType - 'recipe', 'claimstake', or 'planet'
     * @param {string} basePath - Path to data directory (default: '../Data/')
     * @returns {Object} Processed data for the explorer
     */
    static async loadExplorerData(explorerType, basePath = '../Data/') {
        console.log(`📦 Loading ${explorerType} data...`);

        try {
            switch (explorerType.toLowerCase()) {
                case 'recipe':
                    return await this.loadRecipeData(basePath);
                case 'claimstake':
                    return await this.loadClaimStakeData(basePath);
                case 'planet':
                    return await this.loadPlanetData(basePath);
                default:
                    throw new Error(`Unknown explorer type: ${explorerType}`);
            }
        } catch (error) {
            console.error(`❌ Error loading ${explorerType} data:`, error);
            return this.getEmptyDataStructure(explorerType);
        }
    }

    /**
     * Load recipe data
     */
    static async loadRecipeData(basePath) {
        // Try to get data from global variable first (for backward compatibility)
        if (typeof window.rawRecipeData !== 'undefined' && window.rawRecipeData?.recipes) {
            console.log('✅ Using recipe data from global variable');
            return this.processRecipeData(window.rawRecipeData);
        }

        // Try to load from data directory
        try {
            const response = await fetch(`${basePath}recipes.json`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Loaded recipe data from JSON file');
                return this.processRecipeData(data);
            }
        } catch (error) {
            console.warn('⚠️ Could not load recipes.json, using fallback');
        }

        // Fallback to processing global rawRecipeData if it exists
        if (typeof rawRecipeData !== 'undefined') {
            return this.processRecipeData(rawRecipeData);
        }

        throw new Error('No recipe data source found');
    }

    /**
     * Load ClaimStake building data
     */
    static async loadClaimStakeData(basePath) {
        // Try to get data from global variable first
        if (typeof window.rawBuildingData !== 'undefined' && window.rawBuildingData?.buildings) {
            console.log('✅ Using building data from global variable');
            return this.processClaimStakeData(window.rawBuildingData);
        }

        // Try to load from data directory
        try {
            const response = await fetch(`${basePath}buildings.json`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Loaded building data from JSON file');
                return this.processClaimStakeData(data);
            }
        } catch (error) {
            console.warn('⚠️ Could not load buildings.json, using fallback');
        }

        // Fallback to processing global rawBuildingData if it exists
        if (typeof rawBuildingData !== 'undefined') {
            return this.processClaimStakeData(rawBuildingData);
        }

        throw new Error('No building data source found');
    }

    /**
     * Load Planet data
     */
    static async loadPlanetData(basePath) {
        // Try to get data from global variable first
        if (typeof window.planetData !== 'undefined' && window.planetData?.mapData) {
            console.log('✅ Using planet data from global variable');
            return {
                mapData: window.planetData.mapData,
                totalSystems: window.planetData.mapData.length
            };
        }

        // Try to load from data directory
        try {
            const response = await fetch(`${basePath}planets.json`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Loaded planet data from JSON file');
                return {
                    mapData: data.mapData || data,
                    totalSystems: (data.mapData || data).length
                };
            }
        } catch (error) {
            console.warn('⚠️ Could not load planets.json, using fallback');
        }

        // Fallback to processing global planetData if it exists
        if (typeof planetData !== 'undefined') {
            return {
                mapData: planetData.mapData || planetData,
                totalSystems: (planetData.mapData || planetData).length
            };
        }

        throw new Error('No planet data source found');
    }

    /**
     * Process recipe data into the expected format
     */
    static processRecipeData(rawData) {
        if (!rawData || !rawData.recipes) {
            throw new Error('Invalid recipe data format');
        }

        console.log(`🔄 Processing ${rawData.recipes.length} recipes`);

        // Group recipes by resourceType
        const grouped = {};
        rawData.recipes.forEach(recipe => {
            const category = recipe.resourceType || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }

            // Convert to our format
            const convertedRecipe = {
                id: recipe.outputId,
                name: recipe.outputName,
                type: this.getRecipeType(recipe.outputType),
                inputs: recipe.ingredients ? recipe.ingredients.map(ing => ({
                    name: ing.name,
                    amount: ing.quantity,
                    type: 'material'
                })) : [],
                outputs: [{
                    name: recipe.outputName,
                    amount: recipe.outputQuantity || 1,
                    type: 'product'
                }],
                time: recipe.constructionTime || 0,
                tier: recipe.outputTier || 1,
                category: category,
                description: recipe.description || '',
                rawData: recipe
            };

            grouped[category].push(convertedRecipe);
        });

        // Convert to categories array
        const categories = Object.entries(grouped).map(([name, recipes]) => ({
            name,
            icon: this.getCategoryIcon(name),
            recipes
        }));

        console.log(`✅ Processed into ${categories.length} categories`);

        return { categories };
    }

    /**
     * Process ClaimStake building data
     */
    static processClaimStakeData(rawData) {
        if (!rawData || !rawData.buildings) {
            throw new Error('Invalid building data format');
        }

        console.log(`🔄 Processing ${rawData.buildings.length} buildings`);

        const categories = new Map();
        const tiers = new Set();
        const allResources = new Set();
        const constructionMaterials = new Set();
        const buildingTypes = new Set();

        rawData.buildings.forEach(building => {
            // Extract tier
            if (building.tier) tiers.add(building.tier);

            // Extract building type
            const type = this.getBuildingType(building);
            buildingTypes.add(type);

            // Extract resources and construction materials
            if (building.resourceExtractionRate) {
                Object.keys(building.resourceExtractionRate).forEach(resource =>
                    allResources.add(resource));
            }

            if (building.constructionCost) {
                Object.keys(building.constructionCost).forEach(material =>
                    constructionMaterials.add(material));
            }

            // Group by type for categories
            if (!categories.has(type)) {
                categories.set(type, []);
            }

            // Add processed building properties
            building.type = type;
            building.comesWithStake = building.addedTags?.includes('central-hub') || false;
            building.cannotRemove = building.addedTags?.includes('cannot-remove') || false;
            building.hasExtraction = building.resourceExtractionRate &&
                Object.keys(building.resourceExtractionRate).length > 0;

            categories.get(type).push(building);
        });

        const result = {
            categories: Array.from(categories.entries()).map(([name, buildings]) => ({
                name,
                buildings
            })),
            allBuildings: rawData.buildings,
            metadata: {
                tiers: Array.from(tiers).sort((a, b) => a - b),
                resources: Array.from(allResources),
                constructionMaterials: Array.from(constructionMaterials),
                buildingTypes: Array.from(buildingTypes)
            }
        };

        console.log(`✅ Processed ${result.allBuildings.length} buildings into ${result.categories.length} categories`);

        return result;
    }

    /**
     * Get recipe type classification
     */
    static getRecipeType(outputType) {
        switch (outputType) {
            case 'BUILDING': return 'final';
            case 'COMPONENT': return 'intermediate';
            case 'RESOURCE': return 'raw';
            default: return 'intermediate';
        }
    }

    /**
     * Get category icon
     */
    static getCategoryIcon(category) {
        const iconMap = {
            'Component': '🔧',
            'Infrastructure': '🏭',
            'Defense': '🛡️',
            'Resource': '📦',
            'Other': '📦'
        };
        return iconMap[category] || '📦';
    }

    /**
     * Get building type from building data
     */
    static getBuildingType(building) {
        // Determine building type based on properties
        if (building.addedTags?.includes('central-hub')) {
            return 'Hub';
        } else if (building.resourceExtractionRate && Object.keys(building.resourceExtractionRate).length > 0) {
            return 'Extraction';
        } else if (building.power && building.power > 0) {
            return 'Power';
        } else if (building.storage && building.storage > 0) {
            return 'Storage';
        } else {
            return 'Other';
        }
    }

    /**
     * Get empty data structure for fallback
     */
    static getEmptyDataStructure(explorerType) {
        switch (explorerType.toLowerCase()) {
            case 'recipe':
                return { categories: [] };
            case 'claimstake':
                return {
                    categories: [],
                    allBuildings: [],
                    metadata: { tiers: [], resources: [], constructionMaterials: [], buildingTypes: [] }
                };
            case 'planet':
                return { mapData: [], totalSystems: 0 };
            default:
                return {};
        }
    }
}
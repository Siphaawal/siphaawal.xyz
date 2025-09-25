// ClaimStake Building data processing functions
let buildingData = null;
let processedBuildingData = null;

// Process the raw building data loaded from buildings-data.js
function loadBuildingData() {
    console.log('🔍 Loading ClaimStake building data...');

    const dataSource = window.rawBuildingData || rawBuildingData;
    if (!dataSource || !dataSource.buildings) {
        console.error('❌ Raw building data not found');
        return { categories: [], allBuildings: [], metadata: { tiers: [], resources: [], constructionMaterials: [], buildingTypes: [] } };
    }

    console.log(`📊 Processing ${dataSource.buildings.length} buildings`);

    buildingData = dataSource.buildings;
    processedBuildingData = processBuildingData(buildingData);

    console.log(`✅ Loaded ${buildingData.length} buildings`);
    return processedBuildingData;
}

// Process building data into categories and extract metadata
function processBuildingData(buildings) {
    console.log('🔄 Processing building data...');

    const categories = new Map();
    const tiers = new Set();
    const allResources = new Set();
    const allConstructionMaterials = new Set();
    const buildingTypes = new Set();

    buildings.forEach(building => {
        // Extract tier information
        if (building.tier) {
            tiers.add(building.tier);
        }

        // Extract resource information
        if (building.resourceExtractionRate) {
            Object.keys(building.resourceExtractionRate).forEach(resource => {
                allResources.add(resource);
            });
        }

        if (building.resourceRate) {
            Object.keys(building.resourceRate).forEach(resource => {
                allResources.add(resource);
            });
        }

        // Extract construction materials
        if (building.constructionCost) {
            Object.keys(building.constructionCost).forEach(material => {
                allConstructionMaterials.add(material);
            });
        }

        // Determine building type from name or tags
        const buildingType = getBuildingType(building);
        buildingTypes.add(buildingType);

        // Group by building type
        if (!categories.has(buildingType)) {
            categories.set(buildingType, {
                name: buildingType,
                icon: getBuildingIcon(buildingType),
                buildings: []
            });
        }

        // Enhanced building object with computed properties
        const enhancedBuilding = {
            ...building,
            type: buildingType,
            totalConstructionCost: getTotalConstructionCost(building),
            extractionResourceCount: building.resourceExtractionRate ?
                Object.keys(building.resourceExtractionRate).length : 0,
            consumptionResourceCount: building.resourceRate ?
                Object.keys(building.resourceRate).length : 0,
            hasExtraction: building.resourceExtractionRate &&
                Object.keys(building.resourceExtractionRate).length > 0,
            isHub: building.addedTags && building.addedTags.some(tag => tag.includes('hub')),
            planetType: getPlanetType(building)
        };

        categories.get(buildingType).buildings.push(enhancedBuilding);
    });

    // Sort categories and buildings
    const sortedCategories = Array.from(categories.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(category => ({
            ...category,
            buildings: category.buildings.sort((a, b) => {
                // Sort by tier first, then by name
                if (a.tier !== b.tier) {
                    return (a.tier || 0) - (b.tier || 0);
                }
                return a.name.localeCompare(b.name);
            })
        }));

    console.log(`✅ Processed ${buildings.length} buildings into ${sortedCategories.length} categories`);
    console.log(`📊 Found ${tiers.size} tiers, ${allResources.size} resources, ${allConstructionMaterials.size} materials`);

    return {
        categories: sortedCategories,
        allBuildings: buildings.map(building => ({
            ...building,
            type: getBuildingType(building),
            totalConstructionCost: getTotalConstructionCost(building),
            hasExtraction: building.resourceExtractionRate &&
                Object.keys(building.resourceExtractionRate).length > 0,
            planetType: getPlanetType(building)
        })),
        metadata: {
            tiers: Array.from(tiers).sort((a, b) => a - b),
            resources: Array.from(allResources).sort(),
            constructionMaterials: Array.from(allConstructionMaterials).sort(),
            buildingTypes: Array.from(buildingTypes).sort()
        }
    };
}

// Determine building type based on name and properties
function getBuildingType(building) {
    const name = building.name.toLowerCase();
    const tags = building.addedTags || [];

    // Check for hub buildings
    if (tags.some(tag => tag.includes('hub')) || name.includes('hub')) {
        return 'Hub';
    }

    // Check for specific building types
    if (name.includes('extractor') || name.includes('mining') || name.includes('drill')) {
        return 'Extraction';
    }

    if (name.includes('storage') || name.includes('warehouse')) {
        return 'Storage';
    }

    if (name.includes('processing') || name.includes('refinery') || name.includes('factory')) {
        return 'Processing';
    }

    if (name.includes('power') || name.includes('generator') || name.includes('solar')) {
        return 'Power';
    }

    if (name.includes('farm') || name.includes('hydroponic') || name.includes('greenhouse')) {
        return 'Agricultural';
    }

    if (name.includes('crew') || name.includes('quarters') || name.includes('habitat')) {
        return 'Crew';
    }

    if (name.includes('defense') || name.includes('turret') || name.includes('shield')) {
        return 'Defense';
    }

    // Default category
    return 'Infrastructure';
}

// Get icon for building type
function getBuildingIcon(buildingType) {
    const icons = {
        'Hub': '🏢',
        'Extraction': '⛏️',
        'Storage': '📦',
        'Processing': '🏭',
        'Power': '⚡',
        'Agricultural': '🌱',
        'Crew': '👥',
        'Defense': '🛡️',
        'Infrastructure': '🏗️'
    };

    return icons[buildingType] || '🏢';
}

// Calculate total construction cost value (simplified)
function getTotalConstructionCost(building) {
    if (!building.constructionCost) return 0;

    // Simple sum of all material quantities
    return Object.values(building.constructionCost)
        .reduce((sum, cost) => sum + (cost || 0), 0);
}

// Determine planet type from required tags
function getPlanetType(building) {
    if (!building.requiredTags) return 'Universal';

    const planetTags = building.requiredTags.filter(tag =>
        tag.includes('planet') || tag.includes('world')
    );

    if (planetTags.length > 0) {
        return planetTags[0].replace('-planet', '').replace('-world', '')
            .split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
    }

    return 'Universal';
}

// Export for use by other modules
if (typeof window !== 'undefined') {
    window.buildingData = buildingData;
    window.processedBuildingData = processedBuildingData;
    window.loadBuildingData = loadBuildingData;
    window.processBuildingData = processBuildingData;
}
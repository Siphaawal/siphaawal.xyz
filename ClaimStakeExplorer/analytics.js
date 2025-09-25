class BuildingAnalytics {
    constructor(data) {
        this.data = data;
        this.generateAnalytics();
    }

    generateAnalytics() {
        this.tierAnalysis = this.analyzeTiers();
        this.typeAnalysis = this.analyzeTypes();
        this.resourceAnalysis = this.analyzeResources();
        this.costAnalysis = this.analyzeCosts();
        this.propertyAnalysis = this.analyzeProperties();
    }

    analyzeTiers() {
        const tierStats = new Map();
        let totalPower = 0;
        let totalStorage = 0;

        this.data.allBuildings.forEach(building => {
            const tier = building.tier || 0;
            if (!tierStats.has(tier)) {
                tierStats.set(tier, {
                    count: 0,
                    totalPower: 0,
                    totalStorage: 0,
                    totalCrew: 0,
                    avgConstructionTime: 0,
                    buildings: []
                });
            }

            const stats = tierStats.get(tier);
            stats.count++;
            stats.totalPower += building.power || 0;
            stats.totalStorage += building.storage || 0;
            stats.totalCrew += building.crewSlots || 0;
            stats.avgConstructionTime += building.constructionTime || 0;
            stats.buildings.push(building);

            totalPower += building.power || 0;
            totalStorage += building.storage || 0;
        });

        // Calculate averages
        tierStats.forEach(stats => {
            stats.avgConstructionTime = Math.round(stats.avgConstructionTime / stats.count);
            stats.avgPower = Math.round(stats.totalPower / stats.count);
            stats.avgStorage = Math.round(stats.totalStorage / stats.count);
        });

        return {
            tierStats,
            totalPower,
            totalStorage,
            averagePower: Math.round(totalPower / this.data.allBuildings.length),
            averageStorage: Math.round(totalStorage / this.data.allBuildings.length)
        };
    }

    analyzeTypes() {
        const typeStats = new Map();

        this.data.allBuildings.forEach(building => {
            const type = building.type || 'Unknown';
            if (!typeStats.has(type)) {
                typeStats.set(type, {
                    count: 0,
                    buildings: [],
                    totalPower: 0,
                    totalStorage: 0,
                    hasExtraction: 0
                });
            }

            const stats = typeStats.get(type);
            stats.count++;
            stats.buildings.push(building);
            stats.totalPower += building.power || 0;
            stats.totalStorage += building.storage || 0;
            if (building.hasExtraction) stats.hasExtraction++;
        });

        return typeStats;
    }

    analyzeResources() {
        const extractionResources = new Map();
        const consumptionResources = new Map();

        this.data.allBuildings.forEach(building => {
            // Analyze extraction
            if (building.resourceExtractionRate) {
                Object.entries(building.resourceExtractionRate).forEach(([resource, rate]) => {
                    if (!extractionResources.has(resource)) {
                        extractionResources.set(resource, {
                            totalRate: 0,
                            buildingCount: 0,
                            buildings: []
                        });
                    }
                    const stats = extractionResources.get(resource);
                    stats.totalRate += rate;
                    stats.buildingCount++;
                    stats.buildings.push({
                        name: building.name,
                        rate: rate,
                        tier: building.tier
                    });
                });
            }

            // Analyze consumption
            if (building.resourceRate) {
                Object.entries(building.resourceRate).forEach(([resource, rate]) => {
                    if (!consumptionResources.has(resource)) {
                        consumptionResources.set(resource, {
                            totalRate: 0,
                            buildingCount: 0,
                            buildings: []
                        });
                    }
                    const stats = consumptionResources.get(resource);
                    stats.totalRate += Math.abs(rate); // Make positive for analysis
                    stats.buildingCount++;
                    stats.buildings.push({
                        name: building.name,
                        rate: rate,
                        tier: building.tier
                    });
                });
            }
        });

        return {
            extraction: extractionResources,
            consumption: consumptionResources
        };
    }

    analyzeCosts() {
        const materialCosts = new Map();
        let totalBuildingsWithCost = 0;

        this.data.allBuildings.forEach(building => {
            if (building.constructionCost) {
                totalBuildingsWithCost++;
                Object.entries(building.constructionCost).forEach(([material, amount]) => {
                    if (!materialCosts.has(material)) {
                        materialCosts.set(material, {
                            totalAmount: 0,
                            buildingCount: 0,
                            buildings: []
                        });
                    }
                    const stats = materialCosts.get(material);
                    stats.totalAmount += amount;
                    stats.buildingCount++;
                    stats.buildings.push({
                        name: building.name,
                        amount: amount,
                        tier: building.tier
                    });
                });
            }
        });

        return {
            materialCosts,
            totalBuildingsWithCost,
            averageMaterialsPerBuilding: totalBuildingsWithCost > 0 ?
                Math.round([...materialCosts.values()].reduce((sum, stats) =>
                    sum + stats.buildingCount, 0) / totalBuildingsWithCost) : 0
        };
    }

    analyzeProperties() {
        let comesWithStakeCount = 0;
        let cannotRemoveCount = 0;
        let hasExtractionCount = 0;
        let hubBuildingCount = 0;

        this.data.allBuildings.forEach(building => {
            if (building.comesWithStake) comesWithStakeCount++;
            if (building.cannotRemove) cannotRemoveCount++;
            if (building.hasExtraction) hasExtractionCount++;
            if (building.isHub) hubBuildingCount++;
        });

        return {
            comesWithStakeCount,
            cannotRemoveCount,
            hasExtractionCount,
            hubBuildingCount,
            percentageWithStake: Math.round((comesWithStakeCount / this.data.allBuildings.length) * 100),
            percentageCannotRemove: Math.round((cannotRemoveCount / this.data.allBuildings.length) * 100),
            percentageWithExtraction: Math.round((hasExtractionCount / this.data.allBuildings.length) * 100)
        };
    }

    renderAnalytics() {
        this.updateAnalyticsStats();
        this.renderTierAnalysis();
        this.renderTypeAnalysis();
        this.renderResourceAnalysis();
        this.renderCostAnalysis();
        this.renderPropertyAnalysis();
    }

    updateAnalyticsStats() {
        document.getElementById('analyticsTotal').textContent = this.data.allBuildings.length;
        document.getElementById('analyticsUniqueTiers').textContent = this.tierAnalysis.tierStats.size;
        document.getElementById('analyticsResourceTypes').textContent =
            this.resourceAnalysis.extraction.size + this.resourceAnalysis.consumption.size;
        document.getElementById('analyticsConstructionMaterials').textContent = this.costAnalysis.materialCosts.size;
    }

    renderTierAnalysis() {
        const container = document.getElementById('analyticsContent');

        const tierSection = document.createElement('div');
        tierSection.className = 'analytics-section';
        tierSection.innerHTML = `
            <h3>🏢 Tier Analysis</h3>
            <p class="section-note">Building distribution and capabilities by tier level</p>
            <div class="tier-analysis-grid">
                ${Array.from(this.tierAnalysis.tierStats.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([tier, stats]) => `
                        <div class="analytics-item tier-item">
                            <div class="item-content">
                                <div class="item-header">
                                    <h4>Tier ${tier}</h4>
                                    <div class="tier-badge">T${tier}</div>
                                </div>
                                <div class="item-stats">
                                    <div class="primary-stat">
                                        <div class="stat-value">${stats.count}</div>
                                        <div class="stat-label">Buildings</div>
                                    </div>
                                    <div class="secondary-stat">
                                        <div class="stat-value">${stats.avgPower}</div>
                                        <div class="stat-label">Avg Power</div>
                                    </div>
                                    <div class="secondary-stat">
                                        <div class="stat-value">${stats.avgStorage}</div>
                                        <div class="stat-label">Avg Storage</div>
                                    </div>
                                </div>
                                <div class="tier-details">
                                    <p>Average Construction Time: ${stats.avgConstructionTime}s</p>
                                    <p>Total Crew Capacity: ${stats.totalCrew}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
            </div>
        `;

        container.appendChild(tierSection);
    }

    renderTypeAnalysis() {
        const container = document.getElementById('analyticsContent');

        const typeSection = document.createElement('div');
        typeSection.className = 'analytics-section';
        typeSection.innerHTML = `
            <h3>🏭 Building Type Analysis</h3>
            <p class="section-note">Distribution and characteristics by building category</p>
            <div class="type-analysis-grid">
                ${Array.from(this.typeAnalysis.entries())
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([type, stats]) => `
                        <div class="analytics-item type-item">
                            <div class="item-content">
                                <div class="item-header">
                                    <h4>${type}</h4>
                                    <div class="type-badge">${this.getBuildingIcon(type)}</div>
                                </div>
                                <div class="item-stats">
                                    <div class="primary-stat">
                                        <div class="stat-value">${stats.count}</div>
                                        <div class="stat-label">Buildings</div>
                                    </div>
                                    <div class="secondary-stat">
                                        <div class="stat-value">${Math.round(stats.totalPower / stats.count) || 0}</div>
                                        <div class="stat-label">Avg Power</div>
                                    </div>
                                    <div class="secondary-stat">
                                        <div class="stat-value">${stats.hasExtraction}</div>
                                        <div class="stat-label">With Extraction</div>
                                    </div>
                                </div>
                                <div class="type-percentage">
                                    ${Math.round((stats.count / this.data.allBuildings.length) * 100)}% of all buildings
                                </div>
                            </div>
                        </div>
                    `).join('')}
            </div>
        `;

        container.appendChild(typeSection);
    }

    renderResourceAnalysis() {
        const container = document.getElementById('analyticsContent');

        const resourceSection = document.createElement('div');
        resourceSection.className = 'analytics-section';
        resourceSection.innerHTML = `
            <h3>💎 Resource Analysis</h3>
            <p class="section-note">Most extracted and consumed resources across all buildings</p>

            <div class="resource-analysis-tabs">
                <h4>Top Extracted Resources</h4>
                <div class="resource-grid">
                    ${Array.from(this.resourceAnalysis.extraction.entries())
                        .sort(([, a], [, b]) => b.buildingCount - a.buildingCount)
                        .slice(0, 10)
                        .map(([resource, stats]) => `
                            <div class="resource-analysis-item">
                                <div class="resource-name">${resource}</div>
                                <div class="resource-stats">
                                    <span>${stats.buildingCount} buildings</span>
                                    <span>Total Rate: ${stats.totalRate.toFixed(4)}/s</span>
                                </div>
                            </div>
                        `).join('')}
                </div>

                <h4>Top Consumed Resources</h4>
                <div class="resource-grid">
                    ${Array.from(this.resourceAnalysis.consumption.entries())
                        .sort(([, a], [, b]) => b.buildingCount - a.buildingCount)
                        .slice(0, 10)
                        .map(([resource, stats]) => `
                            <div class="resource-analysis-item">
                                <div class="resource-name">${resource}</div>
                                <div class="resource-stats">
                                    <span>${stats.buildingCount} buildings</span>
                                    <span>Total Rate: ${stats.totalRate.toFixed(4)}/s</span>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;

        container.appendChild(resourceSection);
    }

    renderCostAnalysis() {
        const container = document.getElementById('analyticsContent');

        const costSection = document.createElement('div');
        costSection.className = 'analytics-section';
        costSection.innerHTML = `
            <h3>🔨 Construction Cost Analysis</h3>
            <p class="section-note">Most common construction materials and their usage</p>
            <div class="cost-analysis-grid">
                ${Array.from(this.costAnalysis.materialCosts.entries())
                    .sort(([, a], [, b]) => b.buildingCount - a.buildingCount)
                    .slice(0, 12)
                    .map(([material, stats]) => `
                        <div class="cost-analysis-item">
                            <div class="material-name">${material}</div>
                            <div class="material-stats">
                                <div class="stat-row">
                                    <span class="stat-label">Used in:</span>
                                    <span class="stat-value">${stats.buildingCount} buildings</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Total Amount:</span>
                                    <span class="stat-value">${stats.totalAmount}</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Avg per Building:</span>
                                    <span class="stat-value">${Math.round(stats.totalAmount / stats.buildingCount)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
            </div>
        `;

        container.appendChild(costSection);
    }

    renderPropertyAnalysis() {
        const container = document.getElementById('analyticsContent');

        const propertySection = document.createElement('div');
        propertySection.className = 'analytics-section';
        propertySection.innerHTML = `
            <h3>⚙️ Building Properties</h3>
            <p class="section-note">Special building characteristics and their distribution</p>
            <div class="property-analysis-grid">
                <div class="property-stat-card">
                    <div class="property-icon">🏗️</div>
                    <div class="property-stat">
                        <div class="stat-number">${this.propertyAnalysis.comesWithStakeCount}</div>
                        <div class="stat-label">Comes with Stake</div>
                        <div class="stat-percentage">${this.propertyAnalysis.percentageWithStake}% of all buildings</div>
                    </div>
                </div>
                <div class="property-stat-card">
                    <div class="property-icon">🔒</div>
                    <div class="property-stat">
                        <div class="stat-number">${this.propertyAnalysis.cannotRemoveCount}</div>
                        <div class="stat-label">Cannot Remove</div>
                        <div class="stat-percentage">${this.propertyAnalysis.percentageCannotRemove}% of all buildings</div>
                    </div>
                </div>
                <div class="property-stat-card">
                    <div class="property-icon">⛏️</div>
                    <div class="property-stat">
                        <div class="stat-number">${this.propertyAnalysis.hasExtractionCount}</div>
                        <div class="stat-label">Resource Extraction</div>
                        <div class="stat-percentage">${this.propertyAnalysis.percentageWithExtraction}% of all buildings</div>
                    </div>
                </div>
                <div class="property-stat-card">
                    <div class="property-icon">🏢</div>
                    <div class="property-stat">
                        <div class="stat-number">${this.propertyAnalysis.hubBuildingCount}</div>
                        <div class="stat-label">Hub Buildings</div>
                        <div class="stat-percentage">${Math.round((this.propertyAnalysis.hubBuildingCount / this.data.allBuildings.length) * 100)}% of all buildings</div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(propertySection);
    }

    getBuildingIcon(buildingType) {
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
}
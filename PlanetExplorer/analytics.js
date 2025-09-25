class ResourceAnalytics {
    constructor(data) {
        this.data = data;
        this.resourceAnalytics = null;
        this.generateResourceAnalytics();
    }

    generateResourceAnalytics() {
        const resourceCounts = new Map();
        const resourceRichness = new Map();
        const systemResourceCounts = new Map();
        const locationData = new Map();

        // Analyze all resources
        this.data.forEach(system => {
            if (system.planets) {
                let systemResourceTotal = 0;
                const systemUniqueResources = new Set(); // Track unique resources per system

                system.planets.forEach(planet => {
                    if (planet.resources) {
                        systemResourceTotal += planet.resources.length;
                        planet.resources.forEach(resource => {
                            const resourceName = resource.name;

                            // Add to system's unique resources
                            systemUniqueResources.add(resourceName);

                            // Count occurrences
                            resourceCounts.set(resourceName, (resourceCounts.get(resourceName) || 0) + 1);

                            // Track richness levels
                            if (!resourceRichness.has(resourceName)) {
                                resourceRichness.set(resourceName, []);
                            }
                            resourceRichness.get(resourceName).push(resource.richness);

                            // Track location data
                            if (!locationData.has(resourceName)) {
                                locationData.set(resourceName, []);
                            }
                            locationData.get(resourceName).push({
                                system: system.name,
                                planet: planet.name,
                                richness: resource.richness,
                                systemKey: system.key
                            });
                        });
                    }
                });
                systemResourceCounts.set(system.name, {
                    count: systemResourceTotal,
                    uniqueCount: systemUniqueResources.size, // Store unique resource count
                    system: system
                });
            }
        });

        // Calculate analytics
        const totalResources = Array.from(resourceCounts.values()).reduce((a, b) => a + b, 0);
        const totalRichness = Array.from(resourceRichness.values()).flat().reduce((a, b) => a + b, 0);
        const averageRichness = totalRichness / Array.from(resourceRichness.values()).flat().length;

        // Find scarcest resources (dynamic threshold based on data)
        console.log('📊 Total unique resources found:', resourceCounts.size);
        console.log('📊 Resource counts sample:', Array.from(resourceCounts.entries()).slice(0, 5));

        // Calculate dynamic threshold for scarcest (bottom 20% of resources)
        const sortedResourceCounts = Array.from(resourceCounts.entries()).sort((a, b) => a[1] - b[1]);
        const scarcityThreshold = Math.max(5, Math.ceil(sortedResourceCounts.length * 0.2));

        let scarcestResources = sortedResourceCounts
            .filter(([name, count]) => count <= 10) // More lenient initial filter
            .slice(0, Math.max(30, scarcityThreshold));

        // If still empty, just take the 30 rarest
        if (scarcestResources.length === 0) {
            scarcestResources = sortedResourceCounts.slice(0, 30);
        }

        console.log('🔥 Scarcest resources found:', scarcestResources.length);
        console.log('🔥 Scarcest resources:', scarcestResources);

        // Find highest quality resources (more lenient threshold)
        const qualityResources = Array.from(resourceRichness.entries())
            .map(([name, richnesses]) => ({
                name,
                averageRichness: richnesses.reduce((a, b) => a + b, 0) / richnesses.length,
                maxRichness: Math.max(...richnesses),
                locations: richnesses.length
            }))
            .sort((a, b) => b.averageRichness - a.averageRichness);

        // First try richness >= 4, then >= 3.5, then just top 30
        let highestQualityResources = qualityResources.filter(resource => resource.averageRichness >= 4).slice(0, 30);
        if (highestQualityResources.length === 0) {
            highestQualityResources = qualityResources.filter(resource => resource.averageRichness >= 3.5).slice(0, 30);
        }
        if (highestQualityResources.length === 0) {
            highestQualityResources = qualityResources.slice(0, 30);
        }

        console.log('💎 High quality resources found:', highestQualityResources.length);
        console.log('💎 High quality resources:', highestQualityResources);

        // Find top resource locations (systems with most unique resources)
        const topLocations = Array.from(systemResourceCounts.entries())
            .sort((a, b) => b[1].uniqueCount - a[1].uniqueCount)
            .slice(0, 30);

        this.resourceAnalytics = {
            scarcestResources,
            highestQualityResources,
            topLocations,
            totalResources,
            averageRichness: averageRichness.toFixed(2),
            resourceCounts,
            locationData
        };
    }

    renderAnalytics() {
        const analytics = this.resourceAnalytics;

        // Update analytics stats
        document.getElementById('scarcestCount').textContent = analytics.scarcestResources.length;
        document.getElementById('averageRichness').textContent = analytics.averageRichness;
        document.getElementById('topSystemsCount').textContent = analytics.topLocations.length;

        // Render scarcest resources
        const scarcestContainer = document.getElementById('scarcestResources');
        scarcestContainer.innerHTML = analytics.scarcestResources.map(([name, count]) => `
            <div class="analysis-card scarce">
                <div class="analysis-header">
                    <h4>${name}</h4>
                    <span class="rarity-badge ultra-rare">Ultra Rare</span>
                </div>
                <div class="analysis-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Locations:</span>
                        <span class="stat-value">${count}</span>
                    </div>
                    <div class="all-locations-section">
                        <div class="locations-header">All Locations:</div>
                        <div class="locations-compact">
                            ${this.getAllResourceLocations(name)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Render highest quality resources
        const qualityContainer = document.getElementById('highestQuality');
        qualityContainer.innerHTML = analytics.highestQualityResources.map(resource => `
            <div class="analysis-card quality">
                <div class="analysis-header">
                    <h4>${resource.name}</h4>
                    <span class="quality-badge high-quality">★ ${resource.averageRichness.toFixed(1)}</span>
                </div>
                <div class="analysis-stats">
                    <div class="stat-item">
                        <span class="stat-label">Avg Richness:</span>
                        <span class="stat-value">${resource.averageRichness.toFixed(2)}/5</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Max Richness:</span>
                        <span class="stat-value">${resource.maxRichness}/5</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Locations:</span>
                        <span class="stat-value">${resource.locations}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Render top locations
        const locationsContainer = document.getElementById('topLocations');
        locationsContainer.innerHTML = analytics.topLocations.map(([systemName, data]) => {
            const system = data.system;
            return `
                <div class="location-card" data-system-key="${system.key}">
                    <div class="location-header">
                        <h4>🌟 ${systemName}</h4>
                        <span class="resource-count-badge">${data.uniqueCount} Unique Resources</span>
                    </div>
                    <div class="location-stats">
                        <div class="stat-item">
                            <span class="stat-label">Unique Resources:</span>
                            <span class="stat-value">${data.uniqueCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Deposits:</span>
                            <span class="stat-value">${data.count}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Planets:</span>
                            <span class="stat-value">${system.planets ? system.planets.length : 0}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Faction:</span>
                            <span class="stat-value">${system.closestFaction || 'Unknown'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Strategic Score:</span>
                            <span class="stat-value">${system.strategicScore}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers for location cards
        document.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', () => {
                const systemKey = card.getAttribute('data-system-key');
                const system = this.data.find(s => s.key === systemKey);
                if (system && window.planetExplorer) {
                    window.planetExplorer.showSystemModal(system);
                }
            });
        });
    }

    getResourceLocations(resourceName, limit = 5) {
        const locations = this.resourceAnalytics.locationData.get(resourceName) || [];
        const topLocations = locations
            .sort((a, b) => b.richness - a.richness)
            .slice(0, limit);

        return topLocations.map(location =>
            `<span class="location-tag" title="${location.system} - ${location.planet}">
                ${location.system} (${location.richness}/5)
            </span>`
        ).join('');
    }

    getAllResourceLocations(resourceName) {
        const locations = this.resourceAnalytics.locationData.get(resourceName) || [];

        // Sort by richness (highest first), then by system name for consistency
        const sortedLocations = locations.sort((a, b) => {
            if (b.richness !== a.richness) {
                return b.richness - a.richness;
            }
            return a.system.localeCompare(b.system);
        });

        return sortedLocations.map(location =>
            `<span class="location-tag-compact" title="${location.planet} in ${location.system} - Richness: ${location.richness}/5">
                ${location.system} (${location.richness})
            </span>`
        ).join('');
    }

    getAnalyticsData() {
        return this.resourceAnalytics;
    }

    // Method for testing - returns resource distribution data
    getResourceDistribution() {
        if (!this.resourceAnalytics) {
            return {};
        }

        const distribution = {};

        // Create distribution data from locationData
        if (this.resourceAnalytics.locationData) {
            this.resourceAnalytics.locationData.forEach((locations, resourceName) => {
                // Count unique systems for this resource
                const uniqueSystems = new Set(locations.map(loc => loc.system));
                distribution[resourceName] = {
                    systems: uniqueSystems.size,
                    totalOccurrences: locations.length,
                    locations: locations
                };
            });
        }

        return distribution;
    }
}
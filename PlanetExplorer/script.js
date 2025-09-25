class PlanetExplorer {
    constructor() {
        this.data = null;
        this.filteredData = null;
        this.allResources = new Set();
        this.currentTab = 'explorer';
        this.resourceAnalytics = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing PlanetExplorer...');
        await this.loadData();
        console.log('📡 Data loaded, setting up event listeners...');
        this.setupEventListeners();
        console.log('📊 Updating stats...');
        this.updateStats();
        console.log('🌟 Rendering systems...');
        this.renderSystems();
        console.log('✅ Initialization complete');
    }

    async loadData() {
        try {
            // Use the data from data.js instead of fetching
            console.log('🔍 Checking for planetData...', typeof planetData);

            if (typeof planetData !== 'undefined') {
                console.log('✅ planetData found');
                console.log('📋 planetData keys:', Object.keys(planetData));
                console.log('🗺️ mapData exists:', planetData.mapData ? 'Yes' : 'No');

                if (planetData.mapData) {
                    console.log('📊 mapData length:', planetData.mapData.length);
                    console.log('🔍 First system sample:', planetData.mapData[0]);
                }

                this.data = planetData.mapData;
                this.filteredData = this.data;

                if (this.data && this.data.length > 0) {
                    console.log('📈 Extracting resources...');
                    this.extractAllResources();
                    console.log('🎛️ Populating resource filter...');
                    this.populateResourceFilter();
                    console.log('📊 Generating analytics...');
                    this.generateResourceAnalytics();
                    console.log(`✅ Loaded ${this.data.length} star systems with ${this.allResources.size} unique resources`);
                } else {
                    console.error('❌ No data found in mapData array');
                    console.log('🔍 Data value:', this.data);
                }
            } else {
                console.error('❌ planetData not found. Make sure data.js is loaded.');
                console.log('🔍 Available globals:', Object.keys(window).filter(k => k.includes('planet')));
            }
        } catch (error) {
            console.error('💥 Error loading data:', error);
        }
    }

    extractAllResources() {
        this.data.forEach(system => {
            if (system.planets) {
                system.planets.forEach(planet => {
                    if (planet.resources) {
                        planet.resources.forEach(resource => {
                            this.allResources.add(resource.name);
                        });
                    }
                });
            }
        });
    }

    setupEventListeners() {
        console.log('🎛️ Setting up event listeners...');

        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('planetModal');
        const navTabs = document.querySelectorAll('.nav-tab');

        console.log('🔍 Found elements:');
        console.log('- searchInput:', searchInput ? 'Found' : 'Not found');
        console.log('- filterSelect:', filterSelect ? 'Found' : 'Not found');
        console.log('- closeModal:', closeModal ? 'Found' : 'Not found');
        console.log('- modal:', modal ? 'Found' : 'Not found');
        console.log('- navTabs:', navTabs.length, 'tabs found');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.handleFilter(e.target.value);
            });
        }

        if (closeModal && modal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Tab switching
        if (navTabs.length > 0) {
            navTabs.forEach((tab, index) => {
                console.log(`🔗 Setting up tab ${index}:`, tab.getAttribute('data-tab'));
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetTab = e.target.getAttribute('data-tab');
                    console.log('🔄 Tab clicked:', targetTab);
                    this.switchTab(targetTab);
                });
            });
        } else {
            console.warn('⚠️ No navigation tabs found');
        }
    }

    populateResourceFilter() {
        const filterSelect = document.getElementById('filterSelect');
        const sortedResources = Array.from(this.allResources).sort();

        sortedResources.forEach(resource => {
            const option = document.createElement('option');
            option.value = resource;
            option.textContent = resource;
            filterSelect.appendChild(option);
        });
    }

    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredData = this.data.filter(system => {
            const systemMatch = system.name.toLowerCase().includes(term);
            const planetMatch = system.planets && system.planets.some(planet =>
                planet.name.toLowerCase().includes(term)
            );
            const resourceMatch = system.planets && system.planets.some(planet =>
                planet.resources && planet.resources.some(resource =>
                    resource.name.toLowerCase().includes(term)
                )
            );
            return systemMatch || planetMatch || resourceMatch;
        });
        this.renderSystems();
        this.updateStats();
    }

    handleFilter(resourceName) {
        if (!resourceName) {
            this.filteredData = this.data;
        } else {
            this.filteredData = this.data.filter(system => {
                return system.planets && system.planets.some(planet =>
                    planet.resources && planet.resources.some(resource =>
                        resource.name === resourceName
                    )
                );
            });
        }
        this.renderSystems();
        this.updateStats();
    }

    updateStats() {
        const totalSystems = this.filteredData ? this.filteredData.length : 0;
        let totalPlanets = 0;

        if (this.filteredData) {
            this.filteredData.forEach(system => {
                if (system.planets) {
                    totalPlanets += system.planets.length;
                }
            });
        }

        document.getElementById('totalSystems').textContent = totalSystems;
        document.getElementById('totalPlanets').textContent = totalPlanets;
        document.getElementById('uniqueResources').textContent = this.allResources.size;
    }

    renderSystems() {
        const grid = document.getElementById('systemsGrid');
        grid.innerHTML = '';

        this.filteredData.forEach(system => {
            const systemCard = this.createSystemCard(system);
            grid.appendChild(systemCard);
        });
    }

    createSystemCard(system) {
        const card = document.createElement('div');
        card.className = 'system-card';

        const starTypeName = this.getStarTypeName(system.star?.type);
        const planetCount = system.planets ? system.planets.length : 0;

        card.innerHTML = `
            <div class="system-header">
                <div class="system-name">${system.name}</div>
                <div class="star-type">${starTypeName}</div>
            </div>
            <div class="system-info">
                <div class="info-item">Planets: ${planetCount}</div>
                <div class="info-item">Faction: ${system.closestFaction || 'Unknown'}</div>
                <div class="info-item">Strategic Score: ${system.strategicScore}</div>
                <div class="info-item">Links: ${system.links ? system.links.length : 0}</div>
            </div>
            <div class="planets-list">
                <div class="planets-header">Planets & Resources (Click system for details)</div>
                ${this.createPlanetsPreviewHTML(system.planets || [])}
            </div>
        `;

        // Add click handler for the entire system card
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a planet item
            if (!e.target.closest('.planet-item')) {
                this.showSystemModal(system);
            }
        });

        return card;
    }

    createPlanetsPreviewHTML(planets) {
        return planets.map(planet => {
            const resources = planet.resources || [];
            const resourceTags = resources.slice(0, 5).map(resource =>
                `<span class="resource-tag">${resource.name}</span>`
            ).join('');

            const moreResourcesText = resources.length > 5 ?
                `<span class="resource-tag">+${resources.length - 5} more</span>` : '';

            const planetDiv = document.createElement('div');
            planetDiv.className = 'planet-item';
            planetDiv.innerHTML = `
                <div class="planet-name">${planet.name}</div>
                <div class="resources">
                    ${resourceTags}
                    ${moreResourcesText}
                </div>
            `;

            planetDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPlanetModal(planet);
            });

            return planetDiv.outerHTML;
        }).join('');
    }

    getStarTypeName(type) {
        const starTypes = {
            1: 'Red Dwarf',
            2: 'Yellow Dwarf',
            3: 'Blue Giant',
            4: 'White Dwarf',
            5: 'Red Giant'
        };
        return starTypes[type] || 'Unknown';
    }

    showSystemModal(system) {
        const modal = document.getElementById('planetModal');
        const modalContent = document.getElementById('modalContent');

        const starTypeName = this.getStarTypeName(system.star?.type);
        const planetCount = system.planets ? system.planets.length : 0;
        const totalResources = system.planets ?
            system.planets.reduce((sum, planet) => sum + (planet.resources ? planet.resources.length : 0), 0) : 0;

        modalContent.innerHTML = `
            <h2>🌟 ${system.name}</h2>

            <div class="system-details">
                <div class="system-overview">
                    <h3>System Overview</h3>
                    <div class="system-info">
                        <div class="info-item">Star Type: ${starTypeName}</div>
                        <div class="info-item">Star Scale: ${system.star?.scale || 'Unknown'}</div>
                        <div class="info-item">Planets: ${planetCount}</div>
                        <div class="info-item">Total Resources: ${totalResources}</div>
                        <div class="info-item">Faction: ${system.closestFaction || 'Unknown'}</div>
                        <div class="info-item">Strategic Score: ${system.strategicScore}</div>
                        <div class="info-item">System Key: ${system.key}</div>
                        <div class="info-item">Main Planet: ${system.mainPlanet || 'Unknown'}</div>
                    </div>

                    ${system.coordinates ? `
                        <h4>Coordinates</h4>
                        <div class="coordinates">
                            X: ${system.coordinates[0]?.toFixed(4)}, Y: ${system.coordinates[1]?.toFixed(4)}
                        </div>
                    ` : ''}

                    ${system.links && system.links.length > 0 ? `
                        <h4>Connected Systems (${system.links.length})</h4>
                        <div class="system-links">
                            ${system.links.map(link => `<span class="link-tag">${link}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>

            <h3>🪐 Planets in ${system.name} (${planetCount})</h3>
            <div class="detailed-planets">
                ${this.createDetailedPlanetsHTML(system.planets || [])}
            </div>
        `;

        modal.style.display = 'block';
    }

    showPlanetModal(planet) {
        const modal = document.getElementById('planetModal');
        const modalContent = document.getElementById('modalContent');

        modalContent.innerHTML = `
            <h2>${planet.name}</h2>
            <div class="system-info">
                <div class="info-item">Type: ${this.getPlanetTypeName(planet.type)}</div>
                <div class="info-item">Orbit: ${planet.orbit?.toFixed(2) || 'Unknown'}</div>
                <div class="info-item">Scale: ${planet.scale || 'Unknown'}</div>
                <div class="info-item">Angle: ${planet.angle || 'Unknown'}°</div>
            </div>

            <h3>Resources (${planet.resources ? planet.resources.length : 0})</h3>
            <div class="resource-details">
                ${this.createResourceDetailsHTML(planet.resources || [])}
            </div>
        `;

        modal.style.display = 'block';
    }

    createDetailedPlanetsHTML(planets) {
        return planets.map(planet => {
            const resources = planet.resources || [];
            const planetTypeName = this.getPlanetTypeName(planet.type);

            return `
                <div class="detailed-planet-card">
                    <div class="planet-header">
                        <h4>🪐 ${planet.name}</h4>
                        <span class="planet-type-badge">${planetTypeName}</span>
                    </div>

                    <div class="planet-meta">
                        <div class="meta-grid">
                            <div class="meta-item">
                                <span class="meta-label">Orbit:</span>
                                <span class="meta-value">${planet.orbit?.toFixed(2) || 'Unknown'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Scale:</span>
                                <span class="meta-value">${planet.scale || 'Unknown'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Angle:</span>
                                <span class="meta-value">${planet.angle || 'Unknown'}°</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Type ID:</span>
                                <span class="meta-value">${planet.type}</span>
                            </div>
                        </div>
                    </div>

                    <div class="planet-resources">
                        <h5>Resources (${resources.length})</h5>
                        ${resources.length > 0 ? `
                            <div class="resource-details">
                                ${this.createResourceDetailsHTML(resources)}
                            </div>
                        ` : '<div class="no-resources">No resources found on this planet</div>'}
                    </div>
                </div>
            `;
        }).join('');
    }

    createResourceDetailsHTML(resources) {
        return resources.map(resource => `
            <div class="resource-card">
                <div class="resource-name">${resource.name}</div>
                <div class="resource-richness">Richness: ${resource.richness}/5</div>
                <div class="richness-bar">
                    <div class="richness-fill" style="width: ${(resource.richness / 5) * 100}%"></div>
                </div>
                <div class="resource-type-id">Type ID: ${resource.type}</div>
            </div>
        `).join('');
    }

    getPlanetTypeName(type) {
        const planetTypes = {
            1: 'Rocky',
            2: 'Desert',
            3: 'Ice',
            4: 'Gas Giant',
            5: 'Volcanic',
            6: 'Ocean',
            7: 'Forest',
            8: 'Toxic',
            9: 'Barren',
            10: 'Tropical',
            11: 'Arctic'
        };
        return planetTypes[type] || `Type ${type}`;
    }

    switchTab(tabName) {
        console.log(`🔄 Switching to tab: ${tabName}`);

        // Update active tab button
        const navTabs = document.querySelectorAll('.nav-tab');
        const targetTabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const targetTabContent = document.getElementById(`${tabName}Tab`);
        const explorerControls = document.getElementById('explorerControls');

        console.log('🔍 Tab elements check:');
        console.log('- navTabs found:', navTabs.length);
        console.log('- targetTabButton:', targetTabButton ? 'Found' : 'Not found');
        console.log('- targetTabContent:', targetTabContent ? 'Found' : 'Not found');
        console.log('- explorerControls:', explorerControls ? 'Found' : 'Not found');

        if (navTabs.length > 0 && targetTabButton && targetTabContent) {
            // Remove active from all tabs
            navTabs.forEach(tab => {
                tab.classList.remove('active');
                console.log('🔹 Removed active from:', tab.getAttribute('data-tab'));
            });

            // Add active to target tab
            targetTabButton.classList.add('active');
            console.log('🔸 Added active to:', tabName);

            // Show/hide tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                console.log('🔹 Removed active from content:', content.id);
            });

            targetTabContent.classList.add('active');
            console.log('🔸 Added active to content:', targetTabContent.id);

            // Show/hide controls
            if (explorerControls) {
                if (tabName === 'explorer') {
                    explorerControls.style.display = 'flex';
                    console.log('🔸 Showing explorer controls');
                } else {
                    explorerControls.style.display = 'none';
                    console.log('🔹 Hiding explorer controls');
                }
            }

            this.currentTab = tabName;

            // Render analytics if switching to analytics tab
            if (tabName === 'analytics' && this.resourceAnalytics) {
                console.log('📊 Rendering analytics...');
                this.renderAnalytics();
            }

            console.log('✅ Tab switch complete');
        } else {
            console.error('❌ Tab switch failed - missing elements');
        }
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
                system.planets.forEach(planet => {
                    if (planet.resources) {
                        systemResourceTotal += planet.resources.length;
                        planet.resources.forEach(resource => {
                            const resourceName = resource.name;

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

        // Find top resource locations (systems with most resources)
        const topLocations = Array.from(systemResourceCounts.entries())
            .sort((a, b) => b[1].count - a[1].count)
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
                        <span class="stat-label">Locations:</span>
                        <span class="stat-value">${count}</span>
                    </div>
                    <div class="locations-list">
                        ${this.getResourceLocations(name, 3)}
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
                        <span class="resource-count-badge">${data.count} Resources</span>
                    </div>
                    <div class="location-stats">
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
                if (system) {
                    this.showSystemModal(system);
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
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM Content Loaded - Starting Planet Explorer');
    try {
        window.planetExplorer = new PlanetExplorer();
        console.log('✅ Planet Explorer instance created successfully');
    } catch (error) {
        console.error('💥 Failed to create Planet Explorer:', error);
    }
});
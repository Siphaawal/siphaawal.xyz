class PlanetExplorer extends BaseExplorer {
    constructor(data) {
        super(data);

        // Initialize properties after calling super
        this.allResources = new Set();

        // Now initialize properly
        this.initialize();
    }

    extractMetadata() {
        this.allResources.clear();
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

    populateFilters() {
        this.populateSystemCheckboxes();
        this.populateResourceCheckboxes();
    }

    populateSystemCheckboxes() {
        const sortedSystems = [...this.data].sort((a, b) => a.name.localeCompare(b.name));
        this.createCheckboxFilter('systemCheckboxes', sortedSystems.map(s => s.key), 'system', (key) => {
            const system = this.data.find(s => s.key === key);
            return system ? system.name : key;
        });
    }

    populateResourceCheckboxes() {
        this.createCheckboxFilter('resourceCheckboxes', this.allResources, 'resource');
    }


    applyFilters() {
        const hasActiveFilters = this.currentSearchTerm ||
                                 this.selectedFilters.get('system')?.size > 0 ||
                                 this.selectedFilters.get('resource')?.size > 0;

        console.log(`🔍 PlanetExplorer applyFilters:`, {
            searchTerm: this.currentSearchTerm,
            systemFilters: this.selectedFilters.get('system')?.size || 0,
            resourceFilters: this.selectedFilters.get('resource')?.size || 0,
            hasActiveFilters
        });

        if (!hasActiveFilters) {
            this.filteredData = [];
            console.log(`📭 No filters active, showing empty state`);
        } else {
            super.applyFilters();
            console.log(`📋 Applied filters, got ${this.filteredData.length} results`);
        }

        this.renderSystems();
        this.updateStats();
    }

    matchesSearch(system, searchTerm) {
        const systemMatch = system.name.toLowerCase().includes(searchTerm);
        const planetMatch = system.planets && system.planets.some(planet =>
            planet.name.toLowerCase().includes(searchTerm)
        );
        const resourceMatch = system.planets && system.planets.some(planet =>
            planet.resources && planet.resources.some(resource =>
                resource.name.toLowerCase().includes(searchTerm)
            )
        );
        return systemMatch || planetMatch || resourceMatch;
    }

    matchesFilter(system, filterType, selectedItems) {
        if (filterType === 'system') {
            return selectedItems.has(system.key);
        } else if (filterType === 'resource') {
            return system.planets && system.planets.some(planet =>
                planet.resources && planet.resources.some(resource =>
                    selectedItems.has(resource.name)
                )
            );
        }
        return true;
    }


    updateStats() {
        const hasActiveFilters = this.currentSearchTerm ||
                                 this.selectedFilters.get('system')?.size > 0 ||
                                 this.selectedFilters.get('resource')?.size > 0;

        const dataToCount = hasActiveFilters ? this.filteredData : this.data;
        const totalSystems = dataToCount ? dataToCount.length : 0;
        let totalPlanets = 0;

        if (dataToCount) {
            dataToCount.forEach(system => {
                if (system.planets) {
                    totalPlanets += system.planets.length;
                }
            });
        }

        document.getElementById('totalSystems').textContent = totalSystems;
        document.getElementById('totalPlanets').textContent = totalPlanets;
        document.getElementById('uniqueResources').textContent = this.allResources.size;
    }

    renderItems() {
        this.renderSystems();
    }

    getModalId() {
        return 'planetModal';
    }

    populateModal(system) {
        this.showSystemModal(system);
    }

    renderSystems() {
        const grid = document.getElementById('systemsGrid');
        grid.innerHTML = '';

        // Check if no filters are active - use the same logic as applyFilters()
        const hasActiveFilters = this.currentSearchTerm ||
                                 this.selectedFilters.get('system')?.size > 0 ||
                                 this.selectedFilters.get('resource')?.size > 0;

        console.log(`🎨 PlanetExplorer renderSystems:`, {
            hasActiveFilters,
            filteredDataLength: this.filteredData.length
        });

        if (!hasActiveFilters) {
            // Show placeholder message when no filters are active
            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'filter-placeholder';
            placeholderDiv.innerHTML = `
                <div class="placeholder-content">
                    <div class="placeholder-icon">🔍</div>
                    <h3>Start Exploring</h3>
                    <p>Use the search bar above or select systems/resources from the sidebars to begin exploring the galaxy.</p>
                    <div class="placeholder-tips">
                        <div class="tip">💡 <strong>Search:</strong> Type any system, planet, or resource name</div>
                        <div class="tip">⭐ <strong>Systems:</strong> Check boxes on the left to filter by specific systems</div>
                        <div class="tip">💎 <strong>Resources:</strong> Check boxes on the right to find systems with specific resources</div>
                    </div>
                </div>
            `;
            grid.appendChild(placeholderDiv);
            return;
        }

        if (this.filteredData.length === 0) {
            // Show no results message
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results-placeholder';
            noResultsDiv.innerHTML = `
                <div class="placeholder-content">
                    <div class="placeholder-icon">🚫</div>
                    <h3>No Results Found</h3>
                    <p>No systems match your current filters. Try adjusting your search terms or selected filters.</p>
                </div>
            `;
            grid.appendChild(noResultsDiv);
            return;
        }

        // Render filtered systems
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
            const planetTypeName = this.getPlanetTypeName(planet.type);

            // Filter resources based on search term AND selected resources
            let filteredResources = resources;

            if (this.currentSearchTerm) {
                filteredResources = filteredResources.filter(resource =>
                    resource.name.toLowerCase().includes(this.currentSearchTerm)
                );
            }

            // Use the new BaseExplorer filter system
            const selectedResources = this.selectedFilters.get('resource');
            if (selectedResources && selectedResources.size > 0) {
                const originalCount = filteredResources.length;
                filteredResources = filteredResources.filter(resource =>
                    selectedResources.has(resource.name)
                );
                console.log(`🎯 Planet ${planet.name}: ${originalCount} → ${filteredResources.length} resources after filtering:`,
                    filteredResources.map(r => r.name));
            }

            // Show filtered resources with richness information
            const resourceTags = filteredResources.map(resource => {
                const richnessStars = '★'.repeat(resource.richness) + '☆'.repeat(5 - resource.richness);
                return `<span class="resource-tag" title="Richness: ${resource.richness}/5">${resource.name} ${richnessStars}</span>`;
            }).join('');

            const planetDiv = document.createElement('div');
            planetDiv.className = 'planet-item';

            // Show resource count based on what filters are active
            let resourceCountText = resources.length.toString();
            if (this.currentSearchTerm || (selectedResources && selectedResources.size > 0)) {
                resourceCountText = `${filteredResources.length}/${resources.length}`;
            }

            planetDiv.innerHTML = `
                <div class="planet-header-info">
                    <div class="planet-name">🪐 ${planet.name}</div>
                    <div class="planet-type">${planetTypeName}</div>
                    <div class="planet-meta">
                        Orbit: ${planet.orbit?.toFixed(2) || 'N/A'} |
                        Scale: ${planet.scale || 'N/A'} |
                        Resources: ${resourceCountText}
                    </div>
                </div>
                <div class="resources">
                    ${resourceTags || '<span class="no-resources">No matching resources found</span>'}
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

    // Helper method for testing - filters systems by name
    filterSystems(searchTerm) {
        if (!searchTerm) return [];
        const term = searchTerm.toLowerCase();
        return this.data.filter(system =>
            system.name.toLowerCase().includes(term)
        );
    }
}
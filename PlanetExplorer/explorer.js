class PlanetExplorer {
    constructor(data) {
        this.data = data;
        this.filteredData = data;
        this.allResources = new Set();
        this.extractAllResources();
        this.populateResourceFilter();
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
}
// Updated with null safety checks - v2025-09-26
class BuildingExplorer {
    constructor(data) {
        this.data = data;
        this.filteredBuildings = [];
        this.currentSearchTerm = '';
        this.selectedTiers = new Set();
        this.selectedProperties = new Set();
        this.selectedEnables = new Set();


        this.extractAllMetadata();
        this.populateFilters();
        this.renderBuildings();
        this.updateStats();
    }

    extractAllMetadata() {
        this.allTiers = new Set();
        this.allResources = new Set();

        this.data.allBuildings.forEach(building => {
            if (building.tier) {
                this.allTiers.add(building.tier);
            }

            if (building.resourceExtractionRate) {
                Object.keys(building.resourceExtractionRate).forEach(resource => {
                    this.allResources.add(resource);
                });
            }
        });
    }

    populateFilters() {
        this.populateTierFilters();
        this.setupPropertyFilters();
        this.setupEnablesFilters();
    }

    populateTierFilters() {
        const container = document.getElementById('tierFilters');
        if (!container) {
            console.log('⚠️ tierFilters container not found, skipping tier filter population');
            return;
        }

        try {
            const sortedTiers = Array.from(this.allTiers).sort((a, b) => a - b);

            sortedTiers.forEach(tier => {
                // Double-check container still exists
                if (!container) {
                    console.log('⚠️ Container became null during tier filter creation');
                    return;
                }

                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `tier-${tier}`;
                checkbox.value = tier;
                checkbox.addEventListener('change', () => this.handleTierFilter());

                const label = document.createElement('label');
                label.htmlFor = `tier-${tier}`;
                label.textContent = `Tier ${tier}`;

                checkboxItem.appendChild(checkbox);
                checkboxItem.appendChild(label);
                container.appendChild(checkboxItem);
            });
        } catch (error) {
            console.log('⚠️ Error in populateTierFilters:', error.message);
        }
    }


    setupPropertyFilters() {
        const propertyCheckboxes = document.querySelectorAll('#propertyFilters input[type="checkbox"]');
        if (propertyCheckboxes.length === 0) {
            console.log('⚠️ Property filter checkboxes not found, skipping property filter setup');
            return;
        }
        propertyCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handlePropertyFilter());
        });
    }

    setupEnablesFilters() {
        const enablesCheckboxes = document.querySelectorAll('#enablesFilters input[type="checkbox"], #productionFilters input[type="checkbox"]');
        if (enablesCheckboxes.length === 0) {
            console.log('⚠️ Enables filter checkboxes not found, skipping enables filter setup');
            return;
        }
        enablesCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleEnablesFilter());
        });
    }

    handleSearch(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase();
        this.applyFilters();
    }

    handleTierFilter() {
        this.selectedTiers.clear();
        document.querySelectorAll('#tierFilters input[type="checkbox"]:checked').forEach(checkbox => {
            this.selectedTiers.add(parseInt(checkbox.value));
        });
        this.applyFilters();
    }


    handlePropertyFilter() {
        this.selectedProperties.clear();
        document.querySelectorAll('#propertyFilters input[type="checkbox"]:checked').forEach(checkbox => {
            this.selectedProperties.add(checkbox.value);
        });
        this.applyFilters();
    }

    handleEnablesFilter() {
        this.selectedEnables.clear();
        document.querySelectorAll('#enablesFilters input[type="checkbox"]:checked, #productionFilters input[type="checkbox"]:checked').forEach(checkbox => {
            this.selectedEnables.add(checkbox.value);
        });
        this.applyFilters();
    }

    applyFilters() {
        this.filteredBuildings = this.data.allBuildings.filter(building => {
            // Search filter
            if (this.currentSearchTerm) {
                const searchMatch =
                    building.name.toLowerCase().includes(this.currentSearchTerm) ||
                    building.description.toLowerCase().includes(this.currentSearchTerm) ||
                    building.id.toLowerCase().includes(this.currentSearchTerm);

                if (!searchMatch) return false;
            }

            // Tier filter
            if (this.selectedTiers.size > 0 && !this.selectedTiers.has(building.tier)) {
                return false;
            }


            // Property filters
            if (this.selectedProperties.size > 0) {
                for (const property of this.selectedProperties) {
                    if (property === 'comesWithStake' && !building.comesWithStake) return false;
                    if (property === 'cannotRemove' && !building.cannotRemove) return false;
                    if (property === 'hasExtraction' && !building.hasExtraction) return false;
                }
            }

            // Enables filters
            if (this.selectedEnables.size > 0) {
                const buildingTags = building.addedTags || [];
                for (const enablesTag of this.selectedEnables) {
                    if (!buildingTags.includes(enablesTag)) return false;
                }
            }

            return true;
        });

        this.renderBuildings();
        this.updateStats();
    }

    renderBuildings() {
        const container = document.getElementById('buildingsContainer');
        if (!container) {
            console.log('⚠️ buildingsContainer not found, skipping building rendering');
            return;
        }
        container.innerHTML = '';

        // Check if no filters are active
        const hasActiveFilters = this.currentSearchTerm ||
            this.selectedTiers.size > 0 ||
            this.selectedProperties.size > 0 ||
            this.selectedEnables.size > 0;

        if (!hasActiveFilters) {
            // Show all buildings when no filters are active
            this.filteredBuildings = this.data.allBuildings;
        }

        if (this.filteredBuildings.length === 0) {
            // Show no results message
            this.showNoResults(container);
            return;
        }

        // Create buildings grid
        const buildingsGrid = document.createElement('div');
        buildingsGrid.className = 'buildings-grid';

        this.filteredBuildings.forEach(building => {
            const buildingCard = this.createBuildingCard(building);
            buildingsGrid.appendChild(buildingCard);
        });

        container.appendChild(buildingsGrid);
    }

    showPlaceholder(container) {
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'filter-placeholder';
        placeholderDiv.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">🏗️</div>
                <h3>Start Exploring Buildings</h3>
                <p>Use the search bar or filters to discover ClaimStake buildings for your needs.</p>
                <div class="placeholder-tips">
                    <div class="tip">🔍 <strong>Search:</strong> Find buildings by name, description, or ID</div>
                    <div class="tip">🏢 <strong>Tier Filter:</strong> Browse buildings by tier level</div>
                    <div class="tip">🏭 <strong>Type Filter:</strong> Filter by building category</div>
                    <div class="tip">⚙️ <strong>Properties:</strong> Find buildings with special features</div>
                </div>
            </div>
        `;
        container.appendChild(placeholderDiv);
    }

    showNoResults(container) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-placeholder';
        noResultsDiv.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">🚫</div>
                <h3>No Buildings Found</h3>
                <p>No buildings match your current filters. Try adjusting your search or filters.</p>
            </div>
        `;
        container.appendChild(noResultsDiv);
    }

    createBuildingCard(building) {
        const card = document.createElement('div');
        card.className = 'building-card';

        // Construction cost summary
        const costItems = building.constructionCost ?
            Object.entries(building.constructionCost).slice(0, 3) : [];
        const costSummary = costItems.map(([material, amount]) =>
            `${material}: ${amount}`).join(', ');

        // Resource extraction summary
        const extractionItems = building.resourceExtractionRate ?
            Object.entries(building.resourceExtractionRate).slice(0, 3) : [];
        const extractionSummary = extractionItems.map(([resource, rate]) =>
            `${resource}: ${rate}`).join(', ');

        card.innerHTML = `
            <div class="building-header">
                <div class="building-name">${building.name}</div>
                <div class="building-tier">T${building.tier || '?'}</div>
            </div>

            <div class="building-info">
                <div class="info-row">
                    <span class="info-label">Type:</span>
                    <span class="info-value">${building.type}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Power:</span>
                    <span class="info-value">${building.power || 0}W</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Storage:</span>
                    <span class="info-value">${building.storage || 0}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Crew Slots:</span>
                    <span class="info-value">${building.crewSlots || 0}</span>
                </div>
            </div>

            ${costSummary ? `
                <div class="building-costs">
                    <div class="section-title">Construction Cost</div>
                    <div class="cost-summary">${costSummary}${costItems.length < Object.keys(building.constructionCost || {}).length ? '...' : ''}</div>
                </div>
            ` : ''}

            ${extractionSummary ? `
                <div class="building-resources">
                    <div class="section-title">Resource Extraction</div>
                    <div class="resource-summary">${extractionSummary}${extractionItems.length < Object.keys(building.resourceExtractionRate || {}).length ? '...' : ''}</div>
                </div>
            ` : ''}

            <div class="building-properties">
                ${building.comesWithStake ? '<span class="property-tag">Comes with Stake</span>' : ''}
                ${building.cannotRemove ? '<span class="property-tag">Cannot Remove</span>' : ''}
                ${building.hasExtraction ? '<span class="property-tag">Resource Extraction</span>' : ''}
            </div>
        `;

        // Add click handler to show details
        card.addEventListener('click', () => {
            this.showBuildingDetails(building);
        });

        return card;
    }

    showBuildingDetails(building) {
        const modal = document.getElementById('buildingModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        if (!modal || !modalTitle || !modalContent) {
            console.log('⚠️ Modal elements not found, skipping building details display');
            return;
        }

        modalTitle.textContent = building.name;

        // Construction cost details
        const constructionCostHTML = building.constructionCost ? `
            <div class="details-section">
                <h3>Construction Cost</h3>
                <div class="cost-grid">
                    ${Object.entries(building.constructionCost).map(([material, amount]) => `
                        <div class="cost-item">
                            <span class="material-name">${material}</span>
                            <span class="material-amount">${amount}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Resource extraction details
        const extractionHTML = building.resourceExtractionRate ? `
            <div class="details-section">
                <h3>Resource Extraction Rate</h3>
                <div class="resource-grid">
                    ${Object.entries(building.resourceExtractionRate).map(([resource, rate]) => `
                        <div class="resource-item">
                            <span class="resource-name">${resource}</span>
                            <span class="resource-rate">${rate}/s</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Resource consumption details
        const consumptionHTML = building.resourceRate ? `
            <div class="details-section">
                <h3>Resource Consumption</h3>
                <div class="resource-grid">
                    ${Object.entries(building.resourceRate).map(([resource, rate]) => `
                        <div class="resource-item">
                            <span class="resource-name">${resource}</span>
                            <span class="resource-rate">${rate}/s</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        modalContent.innerHTML = `
            <div class="building-overview">
                <p class="building-description">${building.description}</p>

                <div class="overview-stats">
                    <div class="stat-item">
                        <span class="stat-label">Tier:</span>
                        <span class="stat-value">${building.tier || 'Unknown'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Type:</span>
                        <span class="stat-value">${building.type}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Power:</span>
                        <span class="stat-value">${building.power || 0}W</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Storage:</span>
                        <span class="stat-value">${building.storage || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Crew Slots:</span>
                        <span class="stat-value">${building.crewSlots || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Construction Time:</span>
                        <span class="stat-value">${building.constructionTime || 0}s</span>
                    </div>
                </div>
            </div>

            ${constructionCostHTML}
            ${extractionHTML}
            ${consumptionHTML}

            <div class="details-section">
                <h3>Properties</h3>
                <div class="properties-list">
                    ${building.comesWithStake ? '<span class="property-tag">Comes with Stake</span>' : ''}
                    ${building.cannotRemove ? '<span class="property-tag">Cannot Remove</span>' : ''}
                    ${building.hasExtraction ? '<span class="property-tag">Has Resource Extraction</span>' : ''}
                    ${building.minimumTier ? `<span class="property-tag">Min Tier: ${building.minimumTier}</span>` : ''}
                </div>
            </div>

            <div class="details-section">
                <h3>Technical Details</h3>
                <div class="technical-info">
                    <p><strong>ID:</strong> ${building.id}</p>
                    <p><strong>Planet Type:</strong> ${building.planetType}</p>
                    ${building.requiredTags ? `<p><strong>Required Tags:</strong> ${building.requiredTags.join(', ')}</p>` : ''}
                    ${building.addedTags ? `<p><strong>Added Tags:</strong> ${building.addedTags.join(', ')}</p>` : ''}
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    updateStats() {
        const totalBuildings = this.data.allBuildings.length;
        const filteredCount = this.filteredBuildings.length;

        const totalElement = document.getElementById('totalBuildings');
        const filteredElement = document.getElementById('filteredBuildings');

        if (totalElement) {
            totalElement.textContent = totalBuildings;
        }
        if (filteredElement) {
            filteredElement.textContent = filteredCount;
        }
    }
}
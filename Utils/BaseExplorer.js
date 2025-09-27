// Enhanced filter handling with better debugging - v2025-09-26b
class BaseExplorer {
    constructor(data) {
        this.data = data;
        this.filteredData = [];
        this.currentSearchTerm = '';
        this.selectedFilters = new Map(); // Generic filter storage

        // Only auto-initialize if this is not a subclass that needs custom initialization
        if (this.constructor === BaseExplorer) {
            this.initialize();
        }
    }

    initialize() {
        try {
            this.extractMetadata();
            this.populateFilters();
            this.renderItems();
            this.updateStats();
        } catch (error) {
            console.warn('BaseExplorer initialization warning:', error.message);
        }
    }

    extractMetadata() {
        throw new Error('extractMetadata must be implemented by subclass');
    }

    populateFilters() {
        throw new Error('populateFilters must be implemented by subclass');
    }

    createCheckboxFilter(containerId, items, filterType, labelTransform = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} not found`);
            return;
        }

        console.log(`📦 Creating ${items.length} ${filterType} checkboxes in container ${containerId}`);
        container.innerHTML = '';
        const sortedItems = Array.from(items).sort();

        sortedItems.forEach(item => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${filterType}-${item}`;
            checkbox.value = item;
            checkbox.addEventListener('change', (e) => {
                console.log(`🔄 ${filterType} checkbox changed: ${item} = ${e.target.checked}`);
                this.handleFilterChange(filterType);
            });

            const label = document.createElement('label');
            label.htmlFor = `${filterType}-${item}`;
            label.textContent = labelTransform ? labelTransform(item) : item;

            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            container.appendChild(checkboxItem);
        });
    }

    handleFilterChange(filterType) {
        const selectedItems = new Set();

        // Try multiple possible container naming patterns
        const possibleSelectors = [
            `#${filterType}Filters input[type="checkbox"]:checked`,
            `#${filterType}Checkboxes input[type="checkbox"]:checked`,
            `#${filterType}Filter input[type="checkbox"]:checked`
        ];

        console.log(`🔍 Handling filter change for: ${filterType}`);
        let found = false;

        possibleSelectors.forEach(selector => {
            const checkboxes = document.querySelectorAll(selector);
            if (checkboxes.length > 0) {
                console.log(`✅ Found ${checkboxes.length} checked checkboxes with selector: ${selector}`);
                found = true;
                checkboxes.forEach(checkbox => {
                    selectedItems.add(checkbox.value);
                    console.log(`  - Selected: ${checkbox.value}`);
                });
            }
        });

        if (!found) {
            // Also check if there are any checkboxes at all (unchecked)
            const allCheckboxSelectors = [
                `#${filterType}Filters input[type="checkbox"]`,
                `#${filterType}Checkboxes input[type="checkbox"]`,
                `#${filterType}Filter input[type="checkbox"]`
            ];

            let hasCheckboxes = false;
            allCheckboxSelectors.forEach(selector => {
                const allCheckboxes = document.querySelectorAll(selector);
                if (allCheckboxes.length > 0) {
                    hasCheckboxes = true;
                    console.log(`📦 Found ${allCheckboxes.length} total checkboxes (none checked) with selector: ${selector}`);
                }
            });

            if (!hasCheckboxes) {
                console.warn(`⚠️ No checkboxes found for filterType: ${filterType} with any selector`);
            }
        }

        console.log(`📋 Selected ${filterType} items:`, Array.from(selectedItems));

        // Always update the filter, even if empty (this ensures unchecking clears the filter)
        this.selectedFilters.set(filterType, selectedItems);

        console.log(`🔄 Filter updated for ${filterType}, total filters:`,
                   Object.fromEntries(Array.from(this.selectedFilters.entries()).map(([k, v]) => [k, Array.from(v)])));

        this.applyFilters();
    }

    handleSearch(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        this.filteredData = this.data.filter(item => this.matchesFilters(item));
        this.renderItems();
        this.updateStats();
    }

    matchesFilters(item) {
        if (this.currentSearchTerm && !this.matchesSearch(item, this.currentSearchTerm)) {
            return false;
        }

        for (const [filterType, selectedItems] of this.selectedFilters.entries()) {
            if (selectedItems.size > 0 && !this.matchesFilter(item, filterType, selectedItems)) {
                return false;
            }
        }

        return true;
    }

    matchesSearch(item, searchTerm) {
        throw new Error('matchesSearch must be implemented by subclass');
    }

    matchesFilter(item, filterType, selectedItems) {
        throw new Error('matchesFilter must be implemented by subclass');
    }

    renderItems() {
        throw new Error('renderItems must be implemented by subclass');
    }

    updateStats() {
        throw new Error('updateStats must be implemented by subclass');
    }

    createItemCard(item, customContent = null) {
        const card = document.createElement('div');
        card.className = 'item-card';

        if (customContent) {
            card.innerHTML = customContent;
        } else {
            card.innerHTML = this.getDefaultCardContent(item);
        }

        return card;
    }

    getDefaultCardContent(item) {
        return `
            <div class="item-header">
                <h3>${item.name || 'Unknown Item'}</h3>
            </div>
            <div class="item-details">
                <p>Details not implemented</p>
            </div>
        `;
    }

    showModal(item) {
        const modal = document.getElementById(this.getModalId());
        if (!modal) {
            console.error('❌ Modal not found');
            return;
        }

        this.populateModal(item);
        modal.style.display = 'block';
    }

    populateModal(item) {
        throw new Error('populateModal must be implemented by subclass');
    }

    getModalId() {
        return 'modal';
    }
}
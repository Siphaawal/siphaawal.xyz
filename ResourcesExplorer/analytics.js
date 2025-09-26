class ResourceAnalytics extends BaseAnalytics {
    constructor(data) {
        super(data);
        this.resourceAnalytics = null;
    }

    generateAnalytics() {
        const categoryStats = new Map();
        const tierStats = new Map();
        const valueAnalysis = [];
        const stackSizeGroups = new Map();

        // Analyze all resources
        this.data.forEach(resource => {
            const category = resource.category || 'unknown';
            const tier = resource.tier || 0;
            const baseValue = resource.baseValue || 0;
            const stackSize = resource.stackSize || 0;

            // Category statistics
            if (!categoryStats.has(category)) {
                categoryStats.set(category, {
                    count: 0,
                    totalValue: 0,
                    averageValue: 0,
                    resources: []
                });
            }
            const categoryData = categoryStats.get(category);
            categoryData.count++;
            categoryData.totalValue += baseValue;
            categoryData.resources.push(resource);

            // Tier statistics
            if (!tierStats.has(tier)) {
                tierStats.set(tier, {
                    count: 0,
                    totalValue: 0,
                    categories: new Set(),
                    resources: []
                });
            }
            const tierData = tierStats.get(tier);
            tierData.count++;
            tierData.totalValue += baseValue;
            tierData.categories.add(category);
            tierData.resources.push(resource);

            // Value analysis
            valueAnalysis.push({
                name: resource.name,
                baseValue: baseValue,
                category: category,
                tier: tier,
                stackSize: stackSize,
                totalStackValue: baseValue * stackSize
            });

            // Stack size grouping
            const stackGroup = this.getStackSizeGroup(stackSize);
            if (!stackSizeGroups.has(stackGroup)) {
                stackSizeGroups.set(stackGroup, {
                    range: stackGroup,
                    count: 0,
                    resources: [],
                    averageValue: 0,
                    totalValue: 0
                });
            }
            const stackGroupData = stackSizeGroups.get(stackGroup);
            stackGroupData.count++;
            stackGroupData.resources.push(resource);
            stackGroupData.totalValue += baseValue;
        });

        // Calculate averages
        categoryStats.forEach(data => {
            data.averageValue = data.count > 0 ? Math.round(data.totalValue / data.count) : 0;
        });

        tierStats.forEach(data => {
            data.averageValue = data.count > 0 ? Math.round(data.totalValue / data.count) : 0;
        });

        stackSizeGroups.forEach(data => {
            data.averageValue = data.count > 0 ? Math.round(data.totalValue / data.count) : 0;
        });

        // Sort value analysis
        const mostValuable = valueAnalysis
            .sort((a, b) => b.baseValue - a.baseValue)
            .slice(0, 30);

        const bestStackValue = valueAnalysis
            .sort((a, b) => b.totalStackValue - a.totalStackValue)
            .slice(0, 20);

        // Calculate overall statistics
        const totalResources = this.data.length;
        const totalValue = this.data.reduce((sum, resource) => sum + (resource.baseValue || 0), 0);
        const averageValue = totalResources > 0 ? Math.round(totalValue / totalResources) : 0;
        const averageTier = totalResources > 0
            ? (this.data.reduce((sum, resource) => sum + (resource.tier || 0), 0) / totalResources).toFixed(1)
            : 0;

        const mostExpensive = Math.max(...this.data.map(r => r.baseValue || 0));

        this.resourceAnalytics = {
            overview: {
                totalResources,
                totalValue,
                averageValue,
                averageTier,
                mostExpensive,
                uniqueCategories: categoryStats.size,
                uniqueTiers: tierStats.size
            },
            categories: categoryStats,
            tiers: tierStats,
            mostValuable,
            bestStackValue,
            stackSizeGroups
        };

        console.log('📊 Resource analytics generated:', this.resourceAnalytics);
        return this.resourceAnalytics;
    }

    getStackSizeGroup(stackSize) {
        if (stackSize <= 10) return '1-10';
        if (stackSize <= 50) return '11-50';
        if (stackSize <= 100) return '51-100';
        if (stackSize <= 200) return '101-200';
        return '200+';
    }

    renderAnalytics() {
        if (!this.resourceAnalytics) {
            this.generateAnalytics();
        }

        this.updateAnalyticsStats();
        this.renderMostValuableResources();
        this.renderCategoryDistribution();
        this.renderStackSizeAnalysis();
    }

    updateAnalyticsStats() {
        const analytics = this.resourceAnalytics;

        this.updateStatElement('mostExpensiveValue', analytics.overview.mostExpensive);
        this.updateStatElement('averageTier', analytics.overview.averageTier);
        this.updateStatElement('totalValue', analytics.overview.totalValue);
    }

    renderMostValuableResources() {
        const container = document.getElementById('mostValuableResources');
        if (!container) {
            console.error('❌ Most valuable resources container not found');
            return;
        }

        container.innerHTML = '';
        const analytics = this.resourceAnalytics;

        analytics.mostValuable.forEach((resource, index) => {
            const card = document.createElement('div');
            card.className = 'analysis-item';

            const tierBadge = resource.tier ? `Tier ${resource.tier}` : 'No Tier';
            const rankEmoji = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`;

            card.innerHTML = `
                <h4>${rankEmoji} ${resource.name}</h4>
                <div class="analysis-metric">
                    <span class="label">Category:</span>
                    <span class="value">${resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Tier:</span>
                    <span class="value">${tierBadge}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Base Value:</span>
                    <span class="value">${resource.baseValue.toLocaleString()}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Stack Value:</span>
                    <span class="value">${resource.totalStackValue.toLocaleString()}</span>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderCategoryDistribution() {
        const container = document.getElementById('categoryDistribution');
        if (!container) {
            console.error('❌ Category distribution container not found');
            return;
        }

        container.innerHTML = '';
        const analytics = this.resourceAnalytics;

        // Sort categories by count
        const sortedCategories = Array.from(analytics.categories.entries())
            .sort((a, b) => b[1].count - a[1].count);

        sortedCategories.forEach(([category, data]) => {
            const card = document.createElement('div');
            card.className = 'analysis-item';

            // Get tier distribution for this category
            const tierDistribution = {};
            data.resources.forEach(resource => {
                const tier = resource.tier || 0;
                tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
            });

            const tierInfo = Object.entries(tierDistribution)
                .sort((a, b) => a[0] - b[0])
                .map(([tier, count]) => `T${tier}: ${count}`)
                .join(', ');

            card.innerHTML = `
                <h4>📦 ${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <div class="analysis-metric">
                    <span class="label">Total Resources:</span>
                    <span class="value">${data.count}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Average Value:</span>
                    <span class="value">${data.averageValue.toLocaleString()}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Total Value:</span>
                    <span class="value">${data.totalValue.toLocaleString()}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Tier Distribution:</span>
                    <span class="value">${tierInfo}</span>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderStackSizeAnalysis() {
        const container = document.getElementById('stackSizeAnalysis');
        if (!container) {
            console.error('❌ Stack size analysis container not found');
            return;
        }

        container.innerHTML = '';
        const analytics = this.resourceAnalytics;

        // Sort stack size groups by range
        const stackOrder = ['1-10', '11-50', '51-100', '101-200', '200+'];
        const sortedStackGroups = stackOrder
            .map(range => [range, analytics.stackSizeGroups.get(range)])
            .filter(([_, data]) => data && data.count > 0);

        sortedStackGroups.forEach(([range, data]) => {
            const card = document.createElement('div');
            card.className = 'analysis-item';

            // Calculate percentage of total
            const percentage = ((data.count / analytics.overview.totalResources) * 100).toFixed(1);

            // Find highest value resource in this group
            const highestValueResource = data.resources.reduce((max, resource) =>
                (resource.baseValue || 0) > (max.baseValue || 0) ? resource : max
            );

            card.innerHTML = `
                <h4>📦 Stack Size ${range}</h4>
                <div class="analysis-metric">
                    <span class="label">Resources:</span>
                    <span class="value">${data.count} (${percentage}%)</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Avg Value:</span>
                    <span class="value">${data.averageValue.toLocaleString()}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Highest Value:</span>
                    <span class="value">${highestValueResource.name}</span>
                </div>
                <div class="analysis-metric">
                    <span class="label">Value:</span>
                    <span class="value">${(highestValueResource.baseValue || 0).toLocaleString()}</span>
                </div>
            `;

            container.appendChild(card);
        });
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (typeof value === 'number' && value !== Math.floor(value)) {
                element.textContent = value; // Keep decimal for averages
            } else {
                element.textContent = value.toLocaleString();
            }
        } else {
            console.warn(`⚠️ Stat element not found: ${elementId}`);
        }
    }
}
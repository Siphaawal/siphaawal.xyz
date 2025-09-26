class BaseAnalytics {
    constructor(data) {
        this.data = data;
        this.analytics = {};
        this.generateAnalytics();
    }

    generateAnalytics() {
        throw new Error('generateAnalytics must be implemented by subclass');
    }

    renderAnalytics() {
        this.updateStats();
        this.renderCharts();
        this.renderTopLists();
    }

    updateStats() {
        throw new Error('updateStats must be implemented by subclass');
    }

    renderCharts() {
        // Override in subclass if needed
    }

    renderTopLists() {
        // Override in subclass if needed
    }

    createAnalyticsCard(title, content) {
        const card = document.createElement('div');
        card.className = 'analytics-card';

        card.innerHTML = `
            <div class="analytics-card-header">
                <h3>${title}</h3>
            </div>
            <div class="analytics-card-content">
                ${content}
            </div>
        `;

        return card;
    }

    createStatCard(label, value, description = '') {
        return `
            <div class="stat-item">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
                ${description ? `<div class="stat-description">${description}</div>` : ''}
            </div>
        `;
    }

    createRankingList(items, title, formatter) {
        if (!items || items.length === 0) {
            return `<div class="ranking-list empty">No ${title.toLowerCase()} data available</div>`;
        }

        const listItems = items.map((item, index) => {
            const formattedData = formatter ? formatter(item, index) : {
                name: item.name || 'Unknown',
                primaryStat: '—',
                secondaryStat: '—'
            };

            return `
                <div class="ranking-item" data-rank="${index + 1}">
                    <div class="rank-number">${index + 1}</div>
                    <div class="item-info">
                        <div class="item-name">${formattedData.name}</div>
                        <div class="item-stats">
                            <span class="primary-stat">${formattedData.primaryStat}</span>
                            ${formattedData.secondaryStat ? `<span class="secondary-stat">${formattedData.secondaryStat}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="ranking-list">
                <div class="ranking-header">
                    <h4>${title}</h4>
                </div>
                <div class="ranking-items">
                    ${listItems}
                </div>
            </div>
        `;
    }

    renderToContainer(containerId, content) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} not found`);
            return;
        }

        if (typeof content === 'string') {
            container.innerHTML = content;
        } else if (content instanceof Element) {
            container.innerHTML = '';
            container.appendChild(content);
        } else {
            console.error('❌ Invalid content type for renderToContainer');
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toLocaleString();
        }
    }

    formatPercentage(value, total) {
        if (total === 0) return '0%';
        return ((value / total) * 100).toFixed(1) + '%';
    }

    formatTime(seconds) {
        if (seconds < 60) {
            return seconds + 's';
        } else if (seconds < 3600) {
            return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + minutes + 'm';
        }
    }
}
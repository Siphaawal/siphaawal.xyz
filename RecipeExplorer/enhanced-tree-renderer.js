class EnhancedTreeRenderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.recipeCache = new Map();
        this.svg = null;
        this.zoomGroup = null;
        this.currentZoom = 1;
        this.currentPan = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.nodeWidth = 280;
        this.nodeHeight = 120;
        this.nodeSpacing = { x: 320, y: 150 };
        this.buildRecipeCache();
        this.setupContainer();
    }

    buildRecipeCache(allRecipes = null) {
        // Use provided recipes if available, otherwise try to get from global recipeData
        let recipesToCache = allRecipes;

        if (!recipesToCache) {
            if (!window.recipeData || !window.recipeData.categories) {
                console.warn('⚠️ Recipe data not available yet, deferring cache build');
                return;
            }

            // Extract recipes the same way as app.js does
            recipesToCache = [];
            window.recipeData.categories.forEach(category => {
                category.recipes.forEach(recipe => {
                    recipesToCache.push({
                        ...recipe,
                        category: category.name,
                        categoryIcon: category.icon
                    });
                });
            });
        }

        recipesToCache.forEach((recipe, index) => {
            this.recipeCache.set(recipe.name, recipe);
        });
    }

    setupContainer() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.cursor = 'grab';

        // Create SVG element
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        this.svg.style.background = 'transparent';

        // Create zoom group
        this.zoomGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.zoomGroup.setAttribute('transform', 'translate(0,0) scale(1)');

        // Create definitions for gradients and patterns
        this.createDefinitions();

        this.svg.appendChild(this.zoomGroup);
        this.container.appendChild(this.svg);

        // Setup event listeners
        this.setupEventListeners();

        // Add zoom controls
        this.createZoomControls();
    }

    createDefinitions() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Node gradients
        const gradients = [
            { id: 'rawGradient', colors: ['#2d5a27', '#4a7c59'] },
            { id: 'intermediateGradient', colors: ['#3d4c7a', '#5a6ca3'] },
            { id: 'finalGradient', colors: ['#7a5d27', '#a37c4a'] },
            { id: 'fluidGradient', colors: ['#2d5a7a', '#4a7ca3'] }
        ];

        gradients.forEach(grad => {
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', grad.id);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', grad.colors[0]);

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', grad.colors[1]);

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
        });

        // Arrow marker for connections
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#64ffda');

        marker.appendChild(polygon);
        defs.appendChild(marker);

        this.svg.appendChild(defs);
    }

    createZoomControls() {
        const controls = document.createElement('div');
        controls.className = 'tree-controls';
        controls.innerHTML = `
            <div class="zoom-controls">
                <button class="zoom-btn" id="zoomIn">🔍+</button>
                <button class="zoom-btn" id="zoomOut">🔍-</button>
                <button class="zoom-btn" id="resetView">⌂</button>
                <span class="zoom-level">${Math.round(this.currentZoom * 100)}%</span>
            </div>
        `;

        controls.style.position = 'absolute';
        controls.style.top = '10px';
        controls.style.right = '10px';
        controls.style.zIndex = '1000';

        this.container.appendChild(controls);

        // Event listeners for controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('resetView').addEventListener('click', () => this.resetView());
    }

    setupEventListeners() {
        // Mouse wheel zoom
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = e.deltaY;
            const zoomFactor = delta < 0 ? 1.1 : 0.9;
            this.zoomAtPoint(mouseX, mouseY, zoomFactor);
        });

        // Pan functionality
        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isDragging = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMousePos.x;
                const deltaY = e.clientY - this.lastMousePos.y;

                this.currentPan.x += deltaX;
                this.currentPan.y += deltaY;

                this.updateTransform();
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.container.style.cursor = 'grab';
        });
    }

    zoomAtPoint(mouseX, mouseY, zoomFactor) {
        const oldZoom = this.currentZoom;
        this.currentZoom = Math.max(0.1, Math.min(3, this.currentZoom * zoomFactor));

        if (this.currentZoom !== oldZoom) {
            // Adjust pan to zoom at mouse position
            const zoomChange = this.currentZoom / oldZoom;
            this.currentPan.x = mouseX - (mouseX - this.currentPan.x) * zoomChange;
            this.currentPan.y = mouseY - (mouseY - this.currentPan.y) * zoomChange;

            this.updateTransform();
            this.updateZoomLevel();
        }
    }

    zoomIn() {
        const centerX = this.container.clientWidth / 2;
        const centerY = this.container.clientHeight / 2;
        this.zoomAtPoint(centerX, centerY, 1.2);
    }

    zoomOut() {
        const centerX = this.container.clientWidth / 2;
        const centerY = this.container.clientHeight / 2;
        this.zoomAtPoint(centerX, centerY, 0.8);
    }

    resetView() {
        this.currentZoom = 1;
        this.currentPan = { x: 50, y: 50 };
        this.updateTransform();
        this.updateZoomLevel();
    }

    updateTransform() {
        this.zoomGroup.setAttribute('transform',
            `translate(${this.currentPan.x}, ${this.currentPan.y}) scale(${this.currentZoom})`
        );
    }

    updateZoomLevel() {
        const zoomLevelEl = this.container.querySelector('.zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }
    }

    renderRecipeTree(recipeName) {
        // Ensure recipe cache is built
        if (this.recipeCache.size === 0) {
            this.buildRecipeCache();
        }

        const recipe = this.recipeCache.get(recipeName);
        if (!recipe) {
            console.error(`❌ Recipe "${recipeName}" not found in cache!`);
            this.renderError(`Recipe "${recipeName}" not found`);
            return;
        }

        this.clearTree();
        const treeData = this.buildTreeData(recipe, new Set());
        const layout = this.calculateLayout(treeData);
        this.renderTree(layout);
        this.resetView();
    }

    buildTreeData(recipe, visited, depth = 0) {
        if (visited.has(recipe.name)) {
            return {
                recipe,
                children: [],
                isCircular: true,
                depth
            };
        }

        visited.add(recipe.name);

        const children = [];
        if (recipe.inputs && recipe.inputs.length > 0) {
            recipe.inputs.forEach(input => {
                const inputRecipe = this.recipeCache.get(input.name);
                if (inputRecipe) {
                    const childData = this.buildTreeData(inputRecipe, new Set(visited), depth + 1);
                    childData.inputAmount = input.amount;
                    children.push(childData);
                }
            });
        }

        visited.delete(recipe.name);

        return {
            recipe,
            children,
            depth
        };
    }

    calculateLayout(treeData) {
        // Simple tree layout algorithm
        const layout = new Map();
        let nextY = 0;

        const calculatePositions = (node, x, depth) => {
            const y = nextY;
            nextY += this.nodeSpacing.y;

            layout.set(node.recipe.name, {
                x: x,
                y: y,
                node: node
            });

            let childX = x + this.nodeSpacing.x;
            node.children.forEach(child => {
                calculatePositions(child, childX, depth + 1);
            });
        };

        calculatePositions(treeData, 0, 0);
        return layout;
    }

    renderTree(layout) {
        this.clearTree();

        // Render connections first (so they appear behind nodes)
        layout.forEach((data, recipeName) => {
            data.node.children.forEach(child => {
                const childData = layout.get(child.recipe.name);
                if (childData) {
                    this.renderConnection(data, childData, child.inputAmount || 1);
                }
            });
        });

        // Render nodes
        layout.forEach((data, recipeName) => {
            this.renderNode(data.x, data.y, data.node);
        });
    }

    renderConnection(fromData, toData, amount) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const startX = fromData.x + this.nodeWidth;
        const startY = fromData.y + this.nodeHeight / 2;
        const endX = toData.x;
        const endY = toData.y + this.nodeHeight / 2;

        const midX = startX + (endX - startX) / 2;

        const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

        line.setAttribute('d', pathData);
        line.setAttribute('stroke', '#64ffda');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('fill', 'none');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        line.setAttribute('opacity', '0.8');

        // Add amount label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', startY - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#64ffda');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = `×${amount}`;

        this.zoomGroup.appendChild(line);
        this.zoomGroup.appendChild(text);
    }

    renderNode(x, y, nodeData) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${x}, ${y})`);

        const recipe = nodeData.recipe;
        const gradientId = this.getGradientId(recipe.type);

        // Node background
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', this.nodeWidth);
        rect.setAttribute('height', this.nodeHeight);
        rect.setAttribute('rx', '12');
        rect.setAttribute('ry', '12');
        rect.setAttribute('fill', `url(#${gradientId})`);
        rect.setAttribute('stroke', this.getNodeBorderColor(recipe.type));
        rect.setAttribute('stroke-width', '2');
        group.appendChild(rect);

        // Recipe icon and name
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '15');
        titleText.setAttribute('y', '25');
        titleText.setAttribute('fill', '#ffffff');
        titleText.setAttribute('font-size', '16');
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = `${this.getTypeIcon(recipe.type)} ${recipe.name}`;
        group.appendChild(titleText);

        // Recipe type badge
        const typeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        typeRect.setAttribute('x', this.nodeWidth - 80);
        typeRect.setAttribute('y', '8');
        typeRect.setAttribute('width', '70');
        typeRect.setAttribute('height', '20');
        typeRect.setAttribute('rx', '10');
        typeRect.setAttribute('fill', this.getTypeBadgeColor(recipe.type));
        group.appendChild(typeRect);

        const typeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        typeText.setAttribute('x', this.nodeWidth - 45);
        typeText.setAttribute('y', '21');
        typeText.setAttribute('text-anchor', 'middle');
        typeText.setAttribute('fill', '#000000');
        typeText.setAttribute('font-size', '12');
        typeText.setAttribute('font-weight', 'bold');
        typeText.textContent = this.getTypeLabel(recipe.type);
        group.appendChild(typeText);

        // Crafting time
        const timeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        timeText.setAttribute('x', '15');
        timeText.setAttribute('y', '45');
        timeText.setAttribute('fill', '#64ffda');
        timeText.setAttribute('font-size', '14');
        timeText.textContent = `⏱️ ${recipe.craftingTime}s`;
        group.appendChild(timeText);

        // Tier info
        const tierText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tierText.setAttribute('x', '15');
        tierText.setAttribute('y', '65');
        tierText.setAttribute('fill', '#ffd700');
        tierText.setAttribute('font-size', '14');
        tierText.textContent = `🏆 Tier ${recipe.tier}`;
        group.appendChild(tierText);

        // Input count
        if (recipe.inputs && recipe.inputs.length > 0) {
            const inputText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            inputText.setAttribute('x', '15');
            inputText.setAttribute('y', '85');
            inputText.setAttribute('fill', '#ff8a65');
            inputText.setAttribute('font-size', '14');
            inputText.textContent = `🔧 ${recipe.inputs.length} ingredients`;
            group.appendChild(inputText);
        }

        // Circular reference indicator
        if (nodeData.isCircular) {
            const circularRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            circularRect.setAttribute('x', '0');
            circularRect.setAttribute('y', '0');
            circularRect.setAttribute('width', this.nodeWidth);
            circularRect.setAttribute('height', this.nodeHeight);
            circularRect.setAttribute('rx', '12');
            circularRect.setAttribute('ry', '12');
            circularRect.setAttribute('fill', 'none');
            circularRect.setAttribute('stroke', '#ff6b6b');
            circularRect.setAttribute('stroke-width', '3');
            circularRect.setAttribute('stroke-dasharray', '10,5');
            group.appendChild(circularRect);
        }

        // Add hover effect
        group.style.cursor = 'pointer';
        group.addEventListener('mouseenter', () => {
            rect.setAttribute('stroke-width', '4');
            rect.setAttribute('filter', 'brightness(1.2)');
        });
        group.addEventListener('mouseleave', () => {
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('filter', 'brightness(1)');
        });

        // Add click handler for detailed view
        group.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showNodeDetails(recipe);
        });

        this.zoomGroup.appendChild(group);
    }

    getGradientId(type) {
        switch (type) {
            case 'raw': return 'rawGradient';
            case 'intermediate': return 'intermediateGradient';
            case 'final': return 'finalGradient';
            case 'fluid': return 'fluidGradient';
            default: return 'intermediateGradient';
        }
    }

    getNodeBorderColor(type) {
        switch (type) {
            case 'raw': return '#4a7c59';
            case 'intermediate': return '#5a6ca3';
            case 'final': return '#a37c4a';
            case 'fluid': return '#4a7ca3';
            default: return '#5a6ca3';
        }
    }

    getTypeBadgeColor(type) {
        switch (type) {
            case 'raw': return '#4a7c59';
            case 'intermediate': return '#9370db';
            case 'final': return '#ffd700';
            case 'fluid': return '#4a7ca3';
            default: return '#9370db';
        }
    }

    getTypeIcon(type) {
        switch (type) {
            case 'raw': return '⛏️';
            case 'intermediate': return '🔧';
            case 'final': return '🏭';
            case 'fluid': return '💧';
            default: return '📦';
        }
    }

    getTypeLabel(type) {
        switch (type) {
            case 'raw': return 'Raw';
            case 'intermediate': return 'Inter';
            case 'final': return 'Final';
            case 'fluid': return 'Fluid';
            default: return 'Item';
        }
    }

    showNodeDetails(recipe) {
        // Reuse the existing modal system from analytics.js
        if (window.recipeExplorerApp && window.recipeExplorerApp.analytics) {
            window.recipeExplorerApp.analytics.showRecipeDetails(recipe);
        }
    }

    renderMultipleRecipes(recipeNames) {
        // Ensure recipe cache is built
        if (this.recipeCache.size === 0) {
            this.buildRecipeCache();
        }

        if (recipeNames.length === 0) {
            this.renderPlaceholder();
            return;
        }

        if (recipeNames.length === 1) {
            this.renderRecipeTree(recipeNames[0]);
            return;
        }

        // For multiple recipes, create a combined view
        this.clearTree();
        let yOffset = 0;

        recipeNames.forEach((recipeName, index) => {
            const recipe = this.recipeCache.get(recipeName);
            if (recipe) {
                const treeData = this.buildTreeData(recipe, new Set());
                const layout = this.calculateLayout(treeData);

                // Adjust positions for multiple trees
                layout.forEach((data, name) => {
                    data.y += yOffset;
                });

                this.renderTree(layout);

                // Calculate the height of this tree for spacing
                let maxY = 0;
                layout.forEach(data => {
                    maxY = Math.max(maxY, data.y + this.nodeHeight);
                });
                yOffset = maxY + 100; // Add spacing between trees
            }
        });

        this.resetView();
    }

    renderPlaceholder() {
        this.clearTree();

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '300');
        text.setAttribute('y', '200');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#64ffda');
        text.setAttribute('font-size', '24');
        text.textContent = '🌲 Select recipes to view dependency trees';

        this.zoomGroup.appendChild(text);
    }

    renderError(message) {
        this.clearTree();

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '300');
        text.setAttribute('y', '200');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#ff6b6b');
        text.setAttribute('font-size', '20');
        text.textContent = `❌ ${message}`;

        this.zoomGroup.appendChild(text);
    }

    clearTree() {
        while (this.zoomGroup.firstChild) {
            this.zoomGroup.removeChild(this.zoomGroup.firstChild);
        }
    }
}
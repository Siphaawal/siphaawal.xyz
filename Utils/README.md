# Explorer Utils

This directory contains shared utility classes for the Explorer applications (RecipeExplorer, ClaimStakeExplorer, and PlanetExplorer).

## Base Classes

### BaseApp.js
Base class for all Explorer applications providing:
- Common initialization pattern
- Tab switching functionality
- Event listener setup
- Modal management
- Extensible module architecture

Usage:
```javascript
class YourApp extends BaseApp {
    async loadData() {
        // Implement data loading
    }

    initializeModules() {
        // Initialize explorer and analytics modules
        this.modules.explorer = new YourExplorer(this.data);
        this.modules.analytics = new YourAnalytics(this.data);
    }

    getModalId() {
        return 'yourModal'; // Return your modal ID
    }
}
```

### BaseExplorer.js
Base class for all Explorer modules providing:
- Generic filtering system
- Checkbox creation utilities
- Search functionality
- Abstract methods for customization

Usage:
```javascript
class YourExplorer extends BaseExplorer {
    extractMetadata() {
        // Extract metadata from your data
    }

    populateFilters() {
        // Populate filter checkboxes
    }

    matchesSearch(item, searchTerm) {
        // Implement search logic
        return item.name.toLowerCase().includes(searchTerm);
    }

    matchesFilter(item, filterType, selectedItems) {
        // Implement filter logic
        return selectedItems.has(item.property);
    }

    renderItems() {
        // Implement item rendering
    }

    updateStats() {
        // Update statistics display
    }

    populateModal(item) {
        // Populate modal with item details
    }
}
```

### BaseAnalytics.js
Base class for all Analytics modules providing:
- Common analytics rendering pattern
- Utility functions for formatting numbers, percentages, time
- Card and ranking list creation utilities

Usage:
```javascript
class YourAnalytics extends BaseAnalytics {
    generateAnalytics() {
        // Generate your analytics data
    }

    updateStats() {
        // Update statistics in the UI
    }

    renderCharts() {
        // Optional: Render charts
    }

    renderTopLists() {
        // Optional: Render top lists
    }
}
```

### DOMUtils.js
Utility class providing common DOM manipulation functions:
- Element creation
- Checkbox creation
- Modal creation
- Container management
- Event handling utilities
- Formatting utilities

## Implementation Status

- ✅ **PlanetExplorer**: Fully refactored to use base classes
- ⚠️ **ClaimStakeExplorer**: Uses original structure but includes Utils for future refactoring
- ⚠️ **RecipeExplorer**: Uses original structure but includes Utils for future refactoring

## Benefits

1. **Code Reuse**: Common functionality is shared across all explorers
2. **Consistency**: All explorers follow the same patterns and behaviors
3. **Maintainability**: Updates to common functionality only need to be made in one place
4. **Extensibility**: New explorers can be easily created by extending the base classes

## Future Improvements

- Refactor ClaimStakeExplorer to use base classes
- Refactor RecipeExplorer to use base classes
- Add more sophisticated analytics utilities
- Add shared styling utilities
- Add data validation utilities
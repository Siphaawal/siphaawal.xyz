# Unified Test Suite

This directory contains the consolidated test suite for all Explorer applications.

## Files

- **`test.js`** - Unified test suite containing all tests from RecipeExplorer, ClaimStakeExplorer, and PlanetExplorer
- **`index.html`** - Test runner interface with console output and controls
- **`README.md`** - This documentation file

## Running Tests

### Browser Interface
1. Open `index.html` in a web browser
2. Use the control buttons to run specific test suites or all tests
3. View results in the console panel

### Programmatic Interface
Open the browser console and use these commands:

```javascript
// Run all test suites
runAllTests()

// Run individual test suites
runRecipeTests()
runClaimStakeTests()
runPlanetTests()
runBaseClassTests()
```

## Test Suites

### Base Class Tests
Tests for the shared utility classes in the `Utils` directory:
- BaseApp functionality
- BaseExplorer functionality
- BaseAnalytics functionality
- DOMUtils static methods

### Recipe Explorer Tests
Tests for Recipe Explorer functionality:
- Data processing functions (`processRecipeData`, `getRecipeType`, etc.)
- RecipeExplorerApp initialization and lifecycle
- EnhancedTreeRenderer functionality including drag-and-drop
- Tree rendering and connection highlighting
- Search and filtering functionality

### ClaimStake Explorer Tests
Tests for ClaimStake Explorer functionality:
- Building data processing (`processBuildingData`)
- BuildingExplorer filtering and search
- BuildingAnalytics data analysis
- ClaimStakeApp initialization and tab switching

### Planet Explorer Tests
Tests for Planet Explorer functionality:
- PlanetApp initialization and data loading
- PlanetExplorer system filtering
- ResourceAnalytics resource analysis
- System and resource filtering functionality

## Test Framework

The test suite uses a lightweight custom testing framework with:

### Test Runner Features
- Asynchronous test execution
- Test result aggregation
- Pass/fail reporting with detailed error messages
- Individual suite execution
- Overall summary reporting

### Assertion Functions
- `assert(condition, message)` - Basic assertion
- `assertEquals(actual, expected, message)` - Equality assertion
- `assertArrayLength(array, expectedLength, message)` - Array length assertion
- `assertExists(value, message)` - Null/undefined check
- `assertInstanceOf(object, constructor, message)` - Instance type check
- `assertGreaterThan(actual, threshold, message)` - Numeric comparison

## Test Structure

Each test suite follows this pattern:

```javascript
const testSuite = new TestRunner('Suite Name');

testSuite.test('Test description', () => {
    // Test setup
    // Assertions
    // Cleanup
});
```

Tests include proper cleanup of DOM elements and restoration of mocked functions to prevent test interference.

## Browser Compatibility

The test suite works in modern browsers with ES6+ support. It has been tested with:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

The test suite requires the following to be loaded in order:
1. Utils classes (BaseApp, BaseExplorer, BaseAnalytics, DOMUtils)
2. Explorer application files (if testing specific functionality)
3. Data files (recipes-data.js, buildings-data.js, data-from-json.js as available)

## Migration Notes

This unified test suite replaces the individual test files that were previously located in:
- `RecipeExplorer/tests.js` and `RecipeExplorer/test.html` ❌ Removed
- `ClaimStakeExplorer/tests.js` ❌ Removed
- `PlanetExplorer/tests.js` and `PlanetExplorer/test.html` ❌ Removed

All tests have been consolidated here with improved organization and a unified interface.
# Galia Viewer - Modular 3D Star Map

A refactored, modular implementation of the 3D galactic viewer with improved code organization and maintainability.

## Architecture

The viewer is now split into focused, single-responsibility modules:

### Core Modules

- **`core.js`** - Main initialization and module coordination
- **`state.js`** - Centralized global state management
- **`scene.js`** - 3D scene setup, rendering, and animation
- **`connections.js`** - Wormhole connection visualization and management
- **`events.js`** - Mouse/keyboard input handling and interactions
- **`ui.js`** - UI controls, buttons, and information displays

## Features

### ✅ Kept Features
- **Show All Connections** - Checkbox to display all direct wormhole connections
- **Single-click star connections** - Click any star to see its wormhole connections
- **Double-click system isolation** - Double-click to focus on a single system
- **3D visualization** - Interactive 3D galaxy with animated planets and stars
- **Connection highlighting** - Visual wormhole connections with particles
- **System information** - Detailed planet and resource information
- **Center on last star** - Button to center camera on last clicked system
- **ESC reset** - Escape key resets all views

### ❌ Removed Features
- **Shortest path calculation** - All Dijkstra's algorithm code removed
- **Shift+click pathfinding** - Two-system path selection removed
- **Spatial proximity routing** - Closest star fallback logic removed
- **Path visualization** - Shortest path highlighting removed

## Module Responsibilities

### `core.js`
- Application initialization
- Module instantiation and coordination
- Global object exposure for HTML handlers

### `state.js`
- Global state management
- System data storage
- UI state tracking
- Helper methods for finding systems

### `scene.js`
- Three.js scene setup and management
- Camera, renderer, lighting configuration
- System and planet creation
- Animation loop
- Starfield background

### `connections.js`
- Wormhole connection visualization
- Connection line creation and animation
- Show all connections functionality
- Connection state management

### `events.js`
- Mouse and keyboard event handling
- Single/double-click detection
- System isolation and restoration
- Label creation and management
- Tooltip display

### `ui.js`
- UI control management
- Button state handling
- System information display
- Camera transition animations
- Fullscreen toggle

## Benefits of Modular Structure

1. **Maintainability** - Each module has a single responsibility
2. **Readability** - Code is organized by functionality
3. **Testability** - Modules can be tested in isolation
4. **Reusability** - Modules can be reused or replaced independently
5. **Collaboration** - Different developers can work on different modules
6. **Performance** - Smaller modules load faster and are easier to optimize

## File Size Reduction

- **Before**: Single `planetMap.js` - 3,009 lines
- **After**: 6 focused modules - ~1,500 total lines
- **Removed**: ~1,500 lines of shortest path functionality

## Usage

The viewer initializes automatically when the page loads. All functionality is accessible through:

- **Mouse interactions** - Click and drag to navigate
- **UI controls** - Checkboxes and buttons in the header
- **Keyboard shortcuts** - ESC to reset view

## Future Enhancements

The modular structure makes it easy to add new features:

- New connection types in `connections.js`
- Additional UI controls in `ui.js`
- Enhanced animations in `scene.js`
- New interaction modes in `events.js`
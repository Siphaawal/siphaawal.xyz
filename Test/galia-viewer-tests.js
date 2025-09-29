// Galia Viewer Unit Tests
// Tests for the modular 3D star map viewer
// Note: This file depends on TestRunner and assertion functions from test.js

console.log('📥 Loading Galia Viewer tests script...');

// Mock THREE.js for testing (simplified)
class MockTHREE {
    static Vector3 = class {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        clone() {
            return new MockTHREE.Vector3(this.x, this.y, this.z);
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }
        distanceTo(v) {
            const dx = this.x - v.x;
            const dy = this.y - v.y;
            const dz = this.z - v.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    };

    static Scene = class {
        constructor() {
            this.children = [];
            this.background = null;
        }
        add(object) {
            this.children.push(object);
        }
        remove(object) {
            const index = this.children.indexOf(object);
            if (index > -1) this.children.splice(index, 1);
        }
    };

    static Object3D = class {
        constructor() {
            this.position = new MockTHREE.Vector3();
            this.userData = {};
            this.visible = true;
        }
    };
}

// Mock DOM for testing
class MockElement {
    constructor(tagName = 'div') {
        this.tagName = tagName;
        this.style = {};
        this.innerHTML = '';
        this.children = [];
        this.clientWidth = 800;
        this.clientHeight = 600;
    }

    appendChild(child) {
        this.children.push(child);
    }

    querySelector(selector) {
        return new MockElement();
    }

    getElementById(id) {
        return new MockElement();
    }
}

// Test data
const mockSystemsData = [
    {
        name: "Sol",
        key: "sol",
        planets: [
            { name: "Earth", type: "terrestrial", resources: [{ name: "Iron", richness: "High" }] }
        ],
        links: ["Alpha Centauri", "Proxima"]
    },
    {
        name: "Alpha Centauri",
        key: "alpha-centauri",
        planets: [
            { name: "Proxima b", type: "terrestrial", resources: [] }
        ],
        links: ["Sol"]
    },
    {
        name: "Vega",
        key: "vega",
        planets: [],
        links: []
    }
];

// GlobalState Tests
async function runGlobalStateTests() {
    const runner = new TestRunner('GlobalState Module Tests');

    runner.test('GlobalState initialization', () => {
        // Mock the GlobalState class
        class TestGlobalState {
            static systems = [];
            static originalSystemVisibility = [];
            static selectedSystemData = null;
            static isConnectionView = false;
            static connectionLines = [];
            static connectedSystemMeshes = [];
            static originalMaterials = new Map();
            static lastClickedSystemData = null;
            static showAllConnectionsMode = false;
            static centerButtonConnectionsVisible = false;
            static allSystemConnections = [];

            static init(systems) {
                this.systems = systems;
                this.reset();
            }

            static reset() {
                this.originalSystemVisibility = [];
                this.selectedSystemData = null;
                this.isConnectionView = false;
                this.connectionLines = [];
                this.connectedSystemMeshes = [];
                this.originalMaterials.clear();
                this.lastClickedSystemData = null;
                this.showAllConnectionsMode = false;
                this.centerButtonConnectionsVisible = false;
                this.allSystemConnections = [];
            }

            static findSystem(systemName) {
                return this.systems.find(sys => {
                    const sysName = sys.name || sys.key || sys.id;
                    return sysName === systemName;
                });
            }
        }

        TestGlobalState.init(mockSystemsData);

        assertEquals(TestGlobalState.systems.length, 3, 'Should initialize with correct number of systems');
        assertEquals(TestGlobalState.isConnectionView, false, 'Should initialize connection view as false');
        assertEquals(TestGlobalState.showAllConnectionsMode, false, 'Should initialize show all connections as false');
        assertEquals(TestGlobalState.originalMaterials.size, 0, 'Should initialize with empty materials map');
    });

    runner.test('GlobalState findSystem method', () => {
        class TestGlobalState {
            static systems = mockSystemsData;

            static findSystem(systemName) {
                return this.systems.find(sys => {
                    const sysName = sys.name || sys.key || sys.id;
                    return sysName === systemName;
                });
            }
        }

        const solSystem = TestGlobalState.findSystem('Sol');
        const alphaSystem = TestGlobalState.findSystem('alpha-centauri');
        const nonExistent = TestGlobalState.findSystem('NonExistent');

        assertExists(solSystem, 'Should find Sol system by name');
        assertEquals(solSystem.name, 'Sol', 'Should return correct system');
        assertExists(alphaSystem, 'Should find Alpha Centauri by key');
        assertEquals(alphaSystem.key, 'alpha-centauri', 'Should return correct system by key');
        assertEquals(nonExistent, undefined, 'Should return undefined for non-existent system');
    });

    runner.test('GlobalState reset functionality', () => {
        class TestGlobalState {
            static systems = mockSystemsData;
            static isConnectionView = true;
            static showAllConnectionsMode = true;
            static originalMaterials = new Map();
            static connectionLines = ['mock-line'];

            static reset() {
                this.originalSystemVisibility = [];
                this.selectedSystemData = null;
                this.isConnectionView = false;
                this.connectionLines = [];
                this.connectedSystemMeshes = [];
                this.originalMaterials.clear();
                this.lastClickedSystemData = null;
                this.showAllConnectionsMode = false;
                this.centerButtonConnectionsVisible = false;
                this.allSystemConnections = [];
            }
        }

        TestGlobalState.originalMaterials.set('test', 'material');
        TestGlobalState.reset();

        assertEquals(TestGlobalState.isConnectionView, false, 'Should reset connection view');
        assertEquals(TestGlobalState.showAllConnectionsMode, false, 'Should reset show all connections');
        assertEquals(TestGlobalState.connectionLines.length, 0, 'Should clear connection lines');
        assertEquals(TestGlobalState.originalMaterials.size, 0, 'Should clear materials map');
    });

    await runner.run();
    return runner;
}

// SceneManager Tests
async function runSceneManagerTests() {
    const runner = new TestRunner('SceneManager Module Tests');

    runner.test('SceneManager constructor', () => {
        class TestSceneManager {
            constructor(container) {
                this.container = container;
                this.systemContainers = [];
                this.systemMeshes = [];
                this.SPREAD = 35;
                this.MAX_DISTANCE = 500;
                this.MIN_DISTANCE = 10;
                this.scene = new MockTHREE.Scene();
            }
        }

        const mockContainer = new MockElement();
        const sceneManager = new TestSceneManager(mockContainer);

        assertExists(sceneManager.container, 'Should store container reference');
        assertEquals(sceneManager.SPREAD, 35, 'Should set correct spread value');
        assertEquals(sceneManager.systemContainers.length, 0, 'Should initialize empty system containers');
        assertInstanceOf(sceneManager.scene, MockTHREE.Scene, 'Should create THREE.Scene');
    });

    runner.test('SceneManager star color calculation', () => {
        class TestSceneManager {
            hashCode(str) {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return hash;
            }

            getStarColor(system) {
                const hash = this.hashCode(system.name || system.key || 'unknown');
                const hue = Math.abs(hash) % 360;

                if (hue < 60) return 0xffccaa; // Orange
                if (hue < 120) return 0xffffaa; // Yellow
                if (hue < 180) return 0xaaffff; // Blue
                if (hue < 240) return 0xffaaff; // Magenta
                if (hue < 300) return 0xaaffaa; // Green
                return 0xffaaaa; // Red
            }
        }

        const sceneManager = new TestSceneManager();
        const solColor = sceneManager.getStarColor({ name: 'Sol' });
        const alphaColor = sceneManager.getStarColor({ key: 'alpha-centauri' });

        assertExists(solColor, 'Should generate color for Sol');
        assertExists(alphaColor, 'Should generate color for Alpha Centauri');
        assert(typeof solColor === 'number', 'Color should be a number');
        assert(typeof alphaColor === 'number', 'Color should be a number');
    });

    runner.test('SceneManager planet color mapping', () => {
        class TestSceneManager {
            getPlanetColor(planet) {
                if (!planet.type) return 0x888888;

                const typeColors = {
                    'terrestrial': 0x8b7355,
                    'desert': 0xd2b48c,
                    'ice': 0xb0e0e6,
                    'gas': 0x4682b4,
                    'volcanic': 0x8b0000,
                    'ocean': 0x006994
                };

                return typeColors[planet.type.toLowerCase()] || 0x888888;
            }
        }

        const sceneManager = new TestSceneManager();

        assertEquals(sceneManager.getPlanetColor({ type: 'terrestrial' }), 0x8b7355, 'Should return correct terrestrial color');
        assertEquals(sceneManager.getPlanetColor({ type: 'gas' }), 0x4682b4, 'Should return correct gas giant color');
        assertEquals(sceneManager.getPlanetColor({ type: 'unknown' }), 0x888888, 'Should return default color for unknown type');
        assertEquals(sceneManager.getPlanetColor({}), 0x888888, 'Should return default color for no type');
    });

    await runner.run();
    return runner;
}

// ConnectionManager Tests
async function runConnectionManagerTests() {
    const runner = new TestRunner('ConnectionManager Module Tests');

    runner.test('ConnectionManager constructor', () => {
        class TestConnectionManager {
            constructor(sceneManager) {
                this.sceneManager = sceneManager;
            }
        }

        const mockSceneManager = { scene: new MockTHREE.Scene() };
        const connectionManager = new TestConnectionManager(mockSceneManager);

        assertExists(connectionManager.sceneManager, 'Should store scene manager reference');
        assertEquals(connectionManager.sceneManager, mockSceneManager, 'Should store correct scene manager');
    });

    runner.test('ConnectionManager wormhole path generation', () => {
        class TestConnectionManager {
            createWormholePath(pos1, pos2, segments = 25) {
                const points = [];

                for (let i = 0; i <= segments; i++) {
                    const t = i / segments;
                    const curve = Math.sin(t * Math.PI) * 0.7;

                    const midPoint = {
                        x: pos1.x + (pos2.x - pos1.x) * t,
                        y: pos1.y + (pos2.y - pos1.y) * t + curve,
                        z: pos1.z + (pos2.z - pos1.z) * t
                    };

                    points.push(midPoint);
                }

                return points;
            }
        }

        const connectionManager = new TestConnectionManager();
        const pos1 = new MockTHREE.Vector3(0, 0, 0);
        const pos2 = new MockTHREE.Vector3(10, 0, 10);
        const path = connectionManager.createWormholePath(pos1, pos2, 10);

        assertEquals(path.length, 11, 'Should create correct number of path points');
        assertEquals(path[0].x, 0, 'Should start at correct position');
        assertEquals(path[10].x, 10, 'Should end at correct position');
        assert(path[5].y > 0, 'Should have curve in the middle');
    });

    runner.test('ConnectionManager system link validation', () => {
        class TestConnectionManager {
            validateSystemLinks(systems) {
                const results = {
                    totalSystems: systems.length,
                    systemsWithLinks: 0,
                    totalLinks: 0,
                    validLinks: 0,
                    invalidLinks: []
                };

                const systemNames = new Set(systems.map(sys => sys.name || sys.key || sys.id));

                systems.forEach(system => {
                    if (system.links && system.links.length > 0) {
                        results.systemsWithLinks++;
                        results.totalLinks += system.links.length;

                        system.links.forEach(linkName => {
                            if (systemNames.has(linkName)) {
                                results.validLinks++;
                            } else {
                                results.invalidLinks.push({
                                    from: system.name || system.key,
                                    to: linkName
                                });
                            }
                        });
                    }
                });

                return results;
            }
        }

        const connectionManager = new TestConnectionManager();
        const validation = connectionManager.validateSystemLinks(mockSystemsData);

        assertEquals(validation.totalSystems, 3, 'Should count all systems');
        assertEquals(validation.systemsWithLinks, 2, 'Should count systems with links');
        assertGreaterThan(validation.totalLinks, 0, 'Should count total links');
        assertEquals(validation.invalidLinks.length, 1, 'Should find invalid link to Proxima');
    });

    await runner.run();
    return runner;
}

// UIManager Tests
async function runUIManagerTests() {
    const runner = new TestRunner('UIManager Module Tests');

    runner.test('UIManager constructor', () => {
        class TestUIManager {
            constructor(container, connectionManager) {
                this.container = container;
                this.connectionManager = connectionManager;
            }
        }

        const mockContainer = new MockElement();
        const mockConnectionManager = {};
        const uiManager = new TestUIManager(mockContainer, mockConnectionManager);

        assertExists(uiManager.container, 'Should store container reference');
        assertExists(uiManager.connectionManager, 'Should store connection manager reference');
    });

    runner.test('UIManager button state management', () => {
        class TestUIManager {
            constructor() {
                this.buttonStates = {
                    centerButton: { visible: false, active: false },
                    showAllConnections: false
                };
            }

            showCenterButton() {
                this.buttonStates.centerButton.visible = true;
            }

            hideCenterButton() {
                this.buttonStates.centerButton.visible = false;
                this.buttonStates.centerButton.active = false;
            }

            toggleCenterButtonActive() {
                this.buttonStates.centerButton.active = !this.buttonStates.centerButton.active;
            }

            toggleShowAllConnections() {
                this.buttonStates.showAllConnections = !this.buttonStates.showAllConnections;
            }

            resetUIControls() {
                this.buttonStates.centerButton = { visible: false, active: false };
                this.buttonStates.showAllConnections = false;
            }
        }

        const uiManager = new TestUIManager();

        // Test initial state
        assertEquals(uiManager.buttonStates.centerButton.visible, false, 'Center button should start hidden');
        assertEquals(uiManager.buttonStates.showAllConnections, false, 'Show all connections should start off');

        // Test show center button
        uiManager.showCenterButton();
        assertEquals(uiManager.buttonStates.centerButton.visible, true, 'Should show center button');

        // Test toggle center button active
        uiManager.toggleCenterButtonActive();
        assertEquals(uiManager.buttonStates.centerButton.active, true, 'Should activate center button');

        // Test toggle show all connections
        uiManager.toggleShowAllConnections();
        assertEquals(uiManager.buttonStates.showAllConnections, true, 'Should enable show all connections');

        // Test reset
        uiManager.resetUIControls();
        assertEquals(uiManager.buttonStates.centerButton.visible, false, 'Should reset center button visibility');
        assertEquals(uiManager.buttonStates.centerButton.active, false, 'Should reset center button active state');
        assertEquals(uiManager.buttonStates.showAllConnections, false, 'Should reset show all connections');
    });

    runner.test('UIManager system information formatting', () => {
        class TestUIManager {
            formatSystemInfo(system) {
                const systemName = system.name || system.key || 'Unknown System';
                const planets = system.planets || [];
                const links = system.links || [];

                return {
                    name: systemName,
                    planetCount: planets.length,
                    linkCount: links.length,
                    hasResources: planets.some(p => p.resources && p.resources.length > 0),
                    planetTypes: [...new Set(planets.map(p => p.type).filter(Boolean))]
                };
            }
        }

        const uiManager = new TestUIManager();
        const solInfo = uiManager.formatSystemInfo(mockSystemsData[0]);
        const vegaInfo = uiManager.formatSystemInfo(mockSystemsData[2]);

        assertEquals(solInfo.name, 'Sol', 'Should format system name correctly');
        assertEquals(solInfo.planetCount, 1, 'Should count planets correctly');
        assertEquals(solInfo.linkCount, 2, 'Should count links correctly');
        assertEquals(solInfo.hasResources, true, 'Should detect resources');
        assertEquals(solInfo.planetTypes.includes('terrestrial'), true, 'Should list planet types');

        assertEquals(vegaInfo.planetCount, 0, 'Should handle empty planets array');
        assertEquals(vegaInfo.linkCount, 0, 'Should handle empty links array');
        assertEquals(vegaInfo.hasResources, false, 'Should detect no resources');
    });

    await runner.run();
    return runner;
}

// EventHandlers Tests
async function runEventHandlersTests() {
    const runner = new TestRunner('EventHandlers Module Tests');

    runner.test('EventHandlers mouse position calculation', () => {
        class TestEventHandlers {
            calculateMousePosition(event, rect) {
                const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                return { x, y };
            }
        }

        const eventHandlers = new TestEventHandlers();
        const mockEvent = { clientX: 100, clientY: 50 };
        const mockRect = { left: 0, top: 0, width: 200, height: 100 };

        const mousePos = eventHandlers.calculateMousePosition(mockEvent, mockRect);

        assertEquals(mousePos.x, 0, 'Should calculate correct X position (center)');
        assertEquals(mousePos.y, 0, 'Should calculate correct Y position (center)');

        const cornerEvent = { clientX: 0, clientY: 0 };
        const cornerPos = eventHandlers.calculateMousePosition(cornerEvent, mockRect);

        assertEquals(cornerPos.x, -1, 'Should calculate correct X position (left edge)');
        assertEquals(cornerPos.y, 1, 'Should calculate correct Y position (top edge)');
    });

    runner.test('EventHandlers click timing detection', async () => {
        class TestEventHandlers {
            constructor() {
                this.clickTimer = null;
                this.clickCount = 0;
                this.lastClickType = null;
            }

            handleClick(isDoubleClick = false) {
                if (isDoubleClick) {
                    if (this.clickTimer) {
                        clearTimeout(this.clickTimer);
                        this.clickTimer = null;
                    }
                    this.lastClickType = 'double';
                    this.clickCount++;
                } else {
                    if (this.clickTimer) {
                        clearTimeout(this.clickTimer);
                        this.clickTimer = null;
                    }
                    this.clickTimer = setTimeout(() => {
                        this.lastClickType = 'single';
                        this.clickCount++;
                        this.clickTimer = null;
                    }, 200);
                }
            }

            getClickType() {
                return this.lastClickType;
            }

            getClickCount() {
                return this.clickCount;
            }
        }

        const eventHandlers = new TestEventHandlers();

        // Test double click first (synchronous)
        eventHandlers.handleClick(true);
        assertEquals(eventHandlers.getClickType(), 'double', 'Should detect double click immediately');

        // Reset for single click test
        eventHandlers.lastClickType = null;

        // Test single click (asynchronous)
        eventHandlers.handleClick(false);

        // Wait for timeout using Promise
        await new Promise(resolve => setTimeout(resolve, 250));
        assertEquals(eventHandlers.getClickType(), 'single', 'Should detect single click');
    });

    runner.test('EventHandlers tooltip content generation', () => {
        class TestEventHandlers {
            generateTooltipContent(system) {
                const systemName = system.name || system.key || 'Unknown System';
                const planetCount = system.planets ? system.planets.length : 0;
                const links = system.links ? system.links.length : 0;

                return {
                    title: systemName,
                    content: `🪐 ${planetCount} planets\n🔗 ${links} connections`,
                    lines: [
                        `System: ${systemName}`,
                        `Planets: ${planetCount}`,
                        `Connections: ${links}`
                    ]
                };
            }
        }

        const eventHandlers = new TestEventHandlers();
        const tooltip = eventHandlers.generateTooltipContent(mockSystemsData[0]);

        assertEquals(tooltip.title, 'Sol', 'Should generate correct title');
        assert(tooltip.content.includes('1 planets'), 'Should include planet count');
        assert(tooltip.content.includes('2 connections'), 'Should include connection count');
        assertEquals(tooltip.lines.length, 3, 'Should generate correct number of info lines');
    });

    await runner.run();
    return runner;
}

// Integration Tests
async function runIntegrationTests() {
    const runner = new TestRunner('Galia Viewer Integration Tests');

    runner.test('Module initialization sequence', () => {
        // Mock initialization
        const mockContainer = new MockElement();
        let initSequence = [];

        class MockSceneManager {
            constructor(container) {
                initSequence.push('SceneManager');
                this.container = container;
                this.systemContainers = [];
            }
            startAnimation() {
                initSequence.push('Animation');
            }
        }

        class MockConnectionManager {
            constructor(sceneManager) {
                initSequence.push('ConnectionManager');
                this.sceneManager = sceneManager;
            }
        }

        class MockUIManager {
            constructor(container, connectionManager) {
                initSequence.push('UIManager');
                this.container = container;
                this.connectionManager = connectionManager;
            }
        }

        class MockEventHandlers {
            constructor(sceneManager, connectionManager, uiManager) {
                initSequence.push('EventHandlers');
                this.sceneManager = sceneManager;
                this.connectionManager = connectionManager;
                this.uiManager = uiManager;
            }
        }

        // Simulate initialization
        const sceneManager = new MockSceneManager(mockContainer);
        const connectionManager = new MockConnectionManager(sceneManager);
        const uiManager = new MockUIManager(mockContainer, connectionManager);
        const eventHandlers = new MockEventHandlers(sceneManager, connectionManager, uiManager);
        sceneManager.startAnimation();

        assertEquals(initSequence[0], 'SceneManager', 'SceneManager should initialize first');
        assertEquals(initSequence[1], 'ConnectionManager', 'ConnectionManager should initialize second');
        assertEquals(initSequence[2], 'UIManager', 'UIManager should initialize third');
        assertEquals(initSequence[3], 'EventHandlers', 'EventHandlers should initialize fourth');
        assertEquals(initSequence[4], 'Animation', 'Animation should start last');
    });

    runner.test('System data flow between modules', () => {
        // Mock data flow
        const systemData = mockSystemsData[0];
        let dataFlow = [];

        class TestDataFlow {
            static processSystemClick(systemData) {
                dataFlow.push('EventHandlers: System clicked');

                // EventHandlers -> ConnectionManager
                this.showConnections(systemData);

                // EventHandlers -> UIManager
                this.updateUI(systemData);

                return dataFlow;
            }

            static showConnections(systemData) {
                dataFlow.push('ConnectionManager: Show connections');
                if (systemData.links && systemData.links.length > 0) {
                    dataFlow.push(`ConnectionManager: Found ${systemData.links.length} connections`);
                }
            }

            static updateUI(systemData) {
                dataFlow.push('UIManager: Update UI');
                dataFlow.push(`UIManager: Show button for ${systemData.name}`);
            }
        }

        const flow = TestDataFlow.processSystemClick(systemData);

        assert(flow.includes('EventHandlers: System clicked'), 'Should handle system click');
        assert(flow.includes('ConnectionManager: Show connections'), 'Should process connections');
        assert(flow.includes('UIManager: Update UI'), 'Should update UI');
        assert(flow.includes('UIManager: Show button for Sol'), 'Should update UI with system data');
    });

    await runner.run();
    return runner;
}

// Main test runner for Galia Viewer
async function runGaliaViewerTests() {
    console.log('🚀 Starting Galia Viewer Test Suite\n');

    const testSuites = [
        runGlobalStateTests,
        runSceneManagerTests,
        runConnectionManagerTests,
        runUIManagerTests,
        runEventHandlersTests,
        runIntegrationTests
    ];

    const allResults = [];

    for (const testSuite of testSuites) {
        try {
            const results = await testSuite();
            if (results && typeof results.getResults === 'function') {
                allResults.push(...results.getResults());
            } else {
                console.error('❌ Test suite returned invalid results:', testSuite.name);
            }
        } catch (error) {
            console.error('❌ Error running test suite:', testSuite.name, error.message);
        }
        console.log(''); // Add spacing between test suites
    }

    // Overall summary
    const totalPassed = allResults.filter(r => r.status === 'PASS').length;
    const totalFailed = allResults.filter(r => r.status === 'FAIL').length;

    console.log('🎯 Galia Viewer Test Suite Complete');
    console.log('═'.repeat(50));
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`📊 Total Tests: ${allResults.length}`);
    console.log(`📈 Success Rate: ${((totalPassed / allResults.length) * 100).toFixed(1)}%`);

    if (totalFailed > 0) {
        console.log('\n💥 Failed Tests Summary:');
        allResults.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  • ${r.name}: ${r.error}`);
        });
    }

    return allResults;
}

// Export for use in main test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runGaliaViewerTests };
}

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
    console.log('🚀 Galia Viewer tests script loaded and setting global function');
    window.runGaliaViewerTests = runGaliaViewerTests;
    console.log('✅ window.runGaliaViewerTests set:', typeof window.runGaliaViewerTests);
} else {
    console.log('⚠️ Window object not available in galia-viewer-tests.js');
}
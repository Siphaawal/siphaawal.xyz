// GaliaViewer Configuration - Centralized settings and constants
export const Config = {
    // Performance settings
    performance: {
        targetFPS: 30,
        frameInterval: 1000 / 30, // Calculated from targetFPS
        pixelRatioMax: 2,
        starfieldUpdateInterval: 5, // Update every Nth frame
        particleUpdateInterval: 3,  // Update every Nth frame
    },

    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 5000,
        defaultPosition: { x: 0, y: 0, z: 300 },
        defaultUp: { x: 0, y: 1, z: 0 },
    },

    // Distance and zoom settings
    distance: {
        max: 1000,
        min: 10,
        overviewDefault: 200, // Default overview distance multiplier
    },

    // Coordinate system
    coordinates: {
        spread: 2.5,
        scaleBase: 80,
        zVariationFactor: 3.14 / 10, // Used in sin calculation for z-axis
    },

    // Movement and controls
    movement: {
        baseSpeed: 0.08,
        deceleration: 0.85,
        minSpeed: 2,
        maxSpeed: 50,
        speedMultiplier: 1,
        keyboardMoveSpeed: 5,
    },

    // Controls sensitivity
    controls: {
        dampingFactor: 0.05,
        baseZoomSpeed: 8.0,
        rotateSpeedBase: 1.0,
        panSpeedBase: 1.0,
        maxPolarAngle: Math.PI,
        minDistance: 0.01,
        maxDistance: Infinity,
    },

    // Zoom sensitivity thresholds
    zoomSensitivity: {
        veryClose: { threshold: 20, factor: 5.0 },
        close: { threshold: 100, factor: 10.0 },
        medium: { threshold: 500, factor: 15.0 },
        far: { threshold: 2000, factor: 20.0 },
        veryFar: { maxFactor: 30.0, increment: 200 },
    },

    // Frustum culling
    frustum: {
        nearMultiplier: 0.0001,
        nearMin: 0.001,
        nearMax: 0.1,
        farMultiplier: 20,
        farMin: 10000,
    },

    // InstancedMesh limits
    instancing: {
        maxStars: 1000,
        maxPlanets: 5000,
    },

    // Starfield settings
    starfield: {
        count: 800,
        minRadius: 800,
        maxRadius: 400,
        sizeBase: 0.5,
        sizeVariation: 2,
        whiteStarProbability: 0.7,
        blueStarProbability: 0.85,
    },

    // Star colors (faction-based)
    factionColors: {
        MUD: 0xff4d4d,   // red
        ONI: 0x4d6bff,   // blue
        UST: 0xffd24d,   // yellow
        default: 0x88c0ff,
    },

    // Star rendering
    star: {
        size: 0.3,
        segments: 6,
        rings: 4,
        emissiveIntensity: 0.3,
        pulseIntensity: 0.1,
    },

    // Planet settings
    planet: {
        baseSize: 0.03,
        segments: 8,
        rings: 6,
        orbitBaseRadius: 0.3,
        orbitSpacing: 0.12,
        orbitSegments: 24,
        orbitOpacity: 0.25,
        baseOrbitSpeed: 0.003,
        orbitSpeedIncrement: 0.001,
        baseRotationSpeed: 0.002,
        rotationSpeedVariation: 0.002,
        yOffsetMax: 0.2,
    },

    // Planet type colors
    planetColors: {
        // Rocky/Terrestrial
        terrestrial: 0xA0522D,
        rocky: 0x8B4513,
        barren: 0x808080,
        rock: 0x8B4513,
        terra: 0xA0522D,
        '0': 0xA0522D,

        // Hot/Volcanic
        volcanic: 0xFF4500,
        molten: 0xFF6347,
        lava: 0xFF4500,
        fire: 0xFF6347,
        '3': 0xFF4500,

        // Desert
        desert: 0xFFD700,
        arid: 0xDAA520,
        sand: 0xF4A460,
        '5': 0xFFD700,

        // Ice
        ice: 0xE0FFFF,
        frozen: 0xAFEEEE,
        tundra: 0xB0E0E6,
        frost: 0xE0FFFF,
        '2': 0xE0FFFF,

        // Gas
        gas: 0x4169E1,
        'gas giant': 0x4169E1,
        gaseous: 0x6495ED,
        '1': 0x4169E1,

        // Ocean/Water
        ocean: 0x00CED1,
        aquatic: 0x20B2AA,
        water: 0x48D1CC,
        sea: 0x00CED1,
        '4': 0x00CED1,

        // Default
        unknown: 0x888888,
    },

    // Lighting
    lighting: {
        ambient: { color: 0x404040, intensity: 0.6 },
        directional: { color: 0xffffff, intensity: 0.8, position: { x: 50, y: 50, z: 50 } },
    },

    // Connection visualization
    connections: {
        wormholeOpacity: 0.6,
        particleOpacity: 0.4,
        directOpacity: 0.8,
        indirectOpacity: 0.6,
        directSpeed: 1.0,
        indirectSpeed: 0.5,
        directPulseIntensity: 0.3,
        indirectPulseIntensity: 0.15,
        particleSpeed: 1.5,
        indirectParticleSpeed: 0.8,
        particlePulseIntensity: 0.4,
        indirectParticlePulseIntensity: 0.2,
        waveAmplitude: 0.02,
        orbitLineColor: 0x555555,
    },

    // Labels
    labels: {
        starFontSize: 24,
        planetFontSize: 16,
        starColor: '#ffff00',
        planetColor: '#ffffff',
        starScale: 0.8,
        planetScale: 0.5,
        lineColor: 0x888888,
        lineOpacity: 0.5,
        baseHeight: 0.5,
        heightVariation: 0.8,
        heightLevels: 4,
        additionalOffsetRange: 3,
        additionalOffsetIncrement: 0.2,
        labelLineOffset: 0.3,
    },

    // Event handling
    events: {
        raycastThrottleMs: 100,
        doubleClickThreshold: 300,
    },

    // Animation and transitions
    animation: {
        zoomDuration: 1500,
        easingFunction: (t) => 1 - Math.pow(1 - t, 3), // Cubic ease-out
    },

    // WebGL Effects (optional features)
    webglEffects: {
        enabled: false, // Toggle WebGL advanced effects
        bloom: {
            exposure: 1,
            bloomStrength: 1.5,
            bloomThreshold: 0.4,
            bloomRadius: 0.8,
        },
        particleSystems: {
            spaceDust: {
                count: 20000,
                size: 0.08,
                color: 0x888888,
                spread: 500,
            },
            nebula: {
                count: 5000,
                size: 1.5,
                spread: 300,
                colors: [0x4400ff, 0xff0088, 0x00ffff, 0xff8800],
            },
        },
    },

    // Debug settings
    debug: {
        logCoordinates: 5, // Log first N systems coordinates
        logSystemClicks: true,
        logPerformanceWarnings: true,
        farDistanceWarning: 50000,
    },
};

// Calculated values (derived from config)
Config.performance.frameInterval = 1000 / Config.performance.targetFPS;
Config.coordinates.scaleCalculation = (rangeX, rangeY) => {
    return (Config.coordinates.scaleBase * Config.coordinates.spread) / Math.max(rangeX, rangeY);
};

// Helper functions
export const ConfigHelpers = {
    /**
     * Get zoom factor based on camera distance
     */
    getZoomFactor(distance) {
        const { veryClose, close, medium, far, veryFar } = Config.zoomSensitivity;

        if (distance < veryClose.threshold) return veryClose.factor;
        if (distance < close.threshold) return close.factor;
        if (distance < medium.threshold) return medium.factor;
        if (distance < far.threshold) return far.factor;

        return Math.min(veryFar.maxFactor, far.factor + (distance - far.threshold) / veryFar.increment);
    },

    /**
     * Get planet color by type
     */
    getPlanetColor(type) {
        if (!type) return Config.planetColors.unknown;

        const normalizedType = String(type).toLowerCase().trim();

        // Direct match
        if (Config.planetColors[normalizedType]) {
            return Config.planetColors[normalizedType];
        }

        // Partial match
        const partialMatch = Object.entries(Config.planetColors).find(([key]) =>
            normalizedType.includes(key) || key.includes(normalizedType)
        );

        return partialMatch ? partialMatch[1] : Config.planetColors.unknown;
    },

    /**
     * Get faction color
     */
    getFactionColor(faction) {
        const normalizedFaction = String(faction || '').toUpperCase();
        return Config.factionColors[normalizedFaction] || Config.factionColors.default;
    },
};

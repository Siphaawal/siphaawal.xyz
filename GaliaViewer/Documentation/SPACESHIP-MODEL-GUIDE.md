# 🚀 Spaceship Model Guide

## Current Implementation

The fleet visualizer now uses a **detailed procedural spaceship** instead of the simple cone geometry.

### New Spaceship Features:

**Components:**
1. **Main Body** (Fuselage) - Gray cylindrical body
2. **Cockpit** - Cyan glowing dome at the front
3. **Wings** - Green wings extending from sides
4. **Engine** - Orange/red glowing engine at rear
5. **Engine Particles** - Glowing particle trail effect

**Animations:**
- Smooth travel between systems
- Points in direction of movement
- Slight rolling motion during flight
- 2-second pause at each destination

**Colors:**
- Body: Gray (#808080)
- Cockpit: Cyan glow (#00ffff)
- Wings: Green (#00ff00)
- Engine: Orange-red glow (#ff6600)
- Particles: Orange trail (#ffaa00)

---

## How to Use External GLTF/GLB Models

If you want to replace the procedural spaceship with a downloaded 3D model:

### Step 1: Download a Model

**Recommended Sources:**
1. **Sketchfab** (https://sketchfab.com/tags/spaceship)
   - Filter by "Downloadable"
   - Look for Creative Commons or Public Domain licenses
   - Download in GLTF or GLB format

2. **Free3D** (https://free3d.com/3d-models/spaceships)
   - Many free spaceship models
   - Multiple formats available

3. **NASA 3D Resources** (https://science.nasa.gov/3d-resources/)
   - Real spacecraft models
   - Free to download and use

### Step 2: Add Model to Project

1. Create a folder: `GaliaViewer/models/`
2. Place your `.glb` or `.gltf` file inside
3. Example: `GaliaViewer/models/spaceship.glb`

### Step 3: Update Fleet Visualizer

Replace the `createSpaceshipGeometry()` method in [fleet-visualizer.js](fleet-visualizer.js):

```javascript
// Import GLTFLoader at the top of the file
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';

export class FleetVisualizer {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        // ... existing code ...

        // Add GLTF loader
        this.gltfLoader = new GLTFLoader();
        this.spaceshipModel = null; // Cache the loaded model
    }

    // Load external spaceship model
    async loadSpaceshipModel() {
        if (this.spaceshipModel) {
            return this.spaceshipModel.clone(); // Return cached model
        }

        try {
            const gltf = await new Promise((resolve, reject) => {
                this.gltfLoader.load(
                    'models/spaceship.glb', // Your model path
                    (gltf) => resolve(gltf),
                    undefined,
                    (error) => reject(error)
                );
            });

            this.spaceshipModel = gltf.scene;
            console.log('✅ Spaceship model loaded');
            return this.spaceshipModel.clone();

        } catch (error) {
            console.error('❌ Error loading spaceship model:', error);
            // Fallback to procedural geometry
            return this.createSpaceshipGeometry();
        }
    }

    // Update createFleetMesh to use external model
    async createFleetMesh(fleet) {
        // Load the external model (or use procedural fallback)
        const mesh = await this.loadSpaceshipModel();

        // Scale to appropriate size
        mesh.scale.set(this.fleetSize, this.fleetSize, this.fleetSize);

        mesh.userData = {
            fleet: fleet,
            type: 'fleet',
            isFleet: true
        };

        // ... rest of the code stays the same ...
    }

    // Update visualizeFleets to handle async
    async visualizeFleets(fleets) {
        try {
            console.log(`🚀 Visualizing ${fleets.length} fleet(s)`);
            this.clearAllFleets();

            // Create fleet meshes sequentially (or use Promise.all for parallel)
            for (const fleet of fleets) {
                this.assignFleetToSystems(fleet);
                await this.createFleetMesh(fleet); // Now async
            }

            this.startFleetAnimations();
            console.log('✅ Fleet visualization complete');
            return true;

        } catch (error) {
            console.error('❌ Error visualizing fleets:', error);
            throw error;
        }
    }
}
```

### Step 4: Model Requirements

**For best results, your GLTF/GLB model should:**
- Be low-poly (< 5,000 triangles) for performance
- Face forward along the +Z axis
- Be centered at origin (0, 0, 0)
- Have a reasonable scale (1-2 units)
- Include PBR materials for best lighting

**Model Orientation:**
- If your model points in a different direction, adjust the rotation in `createFleetMesh()`:
```javascript
mesh.rotation.y = Math.PI; // Rotate 180 degrees if needed
```

---

## Model Customization

### Adjust Size
In [fleet-visualizer.js](fleet-visualizer.js) line 14:
```javascript
this.fleetSize = 0.5; // Change this value (0.5 = default)
```

### Adjust Colors (Procedural Model)
Modify the materials in `createSpaceshipGeometry()`:
```javascript
// Main body color
const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0x808080, // Change color here
    // ...
});

// Cockpit color
const cockpitMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffff, // Change color here
    // ...
});
```

### Adjust Speed
In [fleet-visualizer.js](fleet-visualizer.js) line 15:
```javascript
this.travelSpeed = 0.01; // Higher = faster (0.01 = default)
```

### Adjust Pause Time
In [fleet-visualizer.js](fleet-visualizer.js) line 325:
```javascript
setTimeout(() => {
    this.startFleetMovement(fleetId);
}, 2000); // Change milliseconds (2000 = 2 seconds)
```

---

## Example GLTF Models to Try

### 1. Simple Sci-Fi Ship
- **Source**: Sketchfab "Low-Poly Spaceship" by WJAnders
- **License**: CC Attribution
- **Link**: https://sketchfab.com/3d-models/low-poly-spaceship-de307645e6c84b3a8046bd6fcbb7e744

### 2. Boxy Spaceship
- **Source**: Sketchfab "Boxy Spaceship Generator" by dudecon
- **License**: Public Domain
- **Link**: https://sketchfab.com/3d-models/boxy-spaceship-generator-0392d33a972e442fb15dcedbb5b6351a

### 3. Classic Fighter
- **Source**: Threex.spaceships collection
- **License**: MIT
- **Link**: https://github.com/jeromeetienne/threex.spaceships

---

## Troubleshooting

**Model not appearing:**
- Check browser console for loading errors
- Verify file path is correct
- Ensure model is in GLTF or GLB format

**Model too large/small:**
- Adjust `this.fleetSize` value
- Or add scale in `loadSpaceshipModel()`: `mesh.scale.set(0.1, 0.1, 0.1)`

**Model facing wrong direction:**
- Add rotation in `createFleetMesh()`
- Check model's forward axis in Blender/3D software

**Performance issues:**
- Use lower poly models
- Remove unnecessary textures
- Simplify materials

**Model looks wrong/dark:**
- Model may need different lighting
- Check if model has embedded textures
- Try adjusting material properties

---

## Advanced: Multiple Ship Types

To have different ship models for different fleet types:

```javascript
async loadSpaceshipModel(fleetType) {
    const modelPaths = {
        'fighter': 'models/fighter.glb',
        'cargo': 'models/cargo.glb',
        'capital': 'models/capital.glb'
    };

    const path = modelPaths[fleetType] || 'models/default.glb';

    // Load and return model...
}

async createFleetMesh(fleet) {
    const fleetType = fleet.type || 'fighter';
    const mesh = await this.loadSpaceshipModel(fleetType);
    // ...
}
```

---

## Current Status

✅ **Procedural Spaceship**: Fully implemented and working
✅ **Animation System**: Smooth travel with roll effect
✅ **Memory Management**: Proper cleanup on disposal
⏳ **GLTF Loading**: Ready to integrate (follow guide above)

The current procedural spaceship provides a good baseline. You can keep it or replace it with external models following this guide!

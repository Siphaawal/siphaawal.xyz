# 🎲 Random Ship Models - Multiple FBX Models Per Fleet

## ✅ What's New

Each fleet now gets a **randomly selected ship model** from 3 different designs!

---

## 🚀 Available Ship Models

The system randomly picks from these FBX models:

1. **CAP_ARM_Imp_LowRes.fbx** - Capital ship (Imperial design)
2. **CAP_OKA_JodAsteris_LowRes.fbx** - Capital ship (Jod Asteris design)
3. **MED_FBL_Packlite_LowRes.fbx** - Medium freighter (Packlite)

### Visual Variety
Each time you load fleets, they'll have different ship types, creating a diverse fleet visualization!

---

## 🔧 Implementation Details

### Files Modified:

**[fleet-visualizer.js](../fleet-manager/fleet-visualizer.js)** - v3.2

**Key Changes:**

1. **Multiple Model Caching** (lines 20-29)
   ```javascript
   this.spaceshipModels = new Map(); // Cache multiple models
   this.availableModels = [
       'models/CAP_ARM_Imp_LowRes.fbx',
       'models/CAP_OKA_JodAsteris_LowRes.fbx',
       'models/MED_FBL_Packlite_LowRes.fbx'
   ];
   ```

2. **Random Selection** (line 108-110)
   ```javascript
   if (!modelPath) {
       modelPath = this.availableModels[Math.floor(Math.random() * this.availableModels.length)];
   }
   ```

3. **Per-Model Caching** (line 113-116)
   - Each model type is loaded once
   - Cached and cloned for subsequent fleets
   - Efficient memory usage

---

## 🎮 How It Works

### Fleet Loading Process:

1. **Fleet Assigned to System**
2. **Random Model Selected** - Picks 1 of 3 ship types
3. **Model Loaded** (if not cached)
4. **Model Cached** - Stored for reuse
5. **Model Cloned** - Copy created for this fleet
6. **Ship Added to Scene**

### Example Console Output:
```
📦 Loading FBX spaceship model: models/CAP_OKA_JodAsteris_LowRes.fbx
Loading models/CAP_OKA_JodAsteris_LowRes.fbx: 100%
✅ FBX model loaded successfully: models/CAP_OKA_JodAsteris_LowRes.fbx
✅ Using cached model: models/CAP_ARM_Imp_LowRes.fbx
📦 Loading FBX spaceship model: models/MED_FBL_Packlite_LowRes.fbx
```

---

## 📊 Model Details

### Ship Sizes:
All ships scaled to **0.03** (same as planets)

### Ship Colors:
- Green emissive glow: `0x00ff00`
- Emissive intensity: `0.3`

### Performance:
- **First load:** Each unique model loads once
- **Subsequent:** Instant (uses cache)
- **Memory:** Efficient cloning system

---

## 🎯 Customization

### Add More Models

Edit `availableModels` array in [fleet-visualizer.js](../fleet-manager/fleet-visualizer.js) line 25:

```javascript
this.availableModels = [
    'models/CAP_ARM_Imp_LowRes.fbx',
    'models/CAP_OKA_JodAsteris_LowRes.fbx',
    'models/MED_FBL_Packlite_LowRes.fbx',
    'models/YourNewModel.fbx'  // Add your model here
];
```

### Force Specific Model

```javascript
// In createFleetMesh, pass specific model:
const mesh = await this.loadSpaceshipModel('models/CAP_ARM_Imp_LowRes.fbx');
```

### Different Colors Per Model

Modify the loader to check model type:

```javascript
if (modelPath.includes('CAP_ARM')) {
    child.material.emissive = new THREE.Color(0xff0000); // Red
} else if (modelPath.includes('CAP_OKA')) {
    child.material.emissive = new THREE.Color(0x0000ff); // Blue
} else {
    child.material.emissive = new THREE.Color(0x00ff00); // Green
}
```

---

## 🐛 Troubleshooting

### Only Seeing One Ship Type

**Cause:** Browser cache showing old version

**Fix:**
1. Hard reload: **Ctrl + Shift + R**
2. Check console for loading messages
3. Should see different models loading

### Model Not Loading

**Console shows:** `❌ Error loading FBX model: models/...`

**Solutions:**
1. Verify file exists in `/models/` folder
2. Check filename spelling matches exactly
3. Ensure FBX format is compatible
4. System will fall back to procedural model

### All Ships Same Color

This is expected - all use green glow by default. To change, see "Different Colors Per Model" above.

---

## 📁 Model Files in `/models/`

**Active Models:**
- ✅ `CAP_ARM_Imp_LowRes.fbx` (2.1 MB)
- ✅ `CAP_OKA_JodAsteris_LowRes.fbx` (1.2 MB)
- ✅ `MED_FBL_Packlite_LowRes.fbx` (852 KB)

**LOD Versions (Optional):**
- `CAP_ARM_Imp_LowRes_LOD1.fbx` (43 KB)
- `CAP_OKA_JodAsteris_LowRes_LOD1.fbx` (46 KB)
- `MED_FBL_Packlite_LowRes_LOD1.fbx` (40 KB)

**Source Files:**
- `CAP_ARM_Imp_LowRes.blend`
- `CAP_ARM_Imp_LowRes.max`
- `MED_FBL_Packlite.blend`

---

## ✅ Fleet Viewer Tab

The panel is correctly labeled **"🚀 Fleet Viewer"** (not "Fleet Manager").

**Location:** Bottom-left corner of Galia Viewer

---

## 🎬 See It In Action

1. **Clear Cache:** `Ctrl + Shift + R`
2. **Open Fleet Viewer**
3. **Load Fleets**
4. **Observe:** Different ship models appear!
5. **Console:** Check loading messages

Each fleet will now have a unique ship design from your collection! 🚀

---

**Last Updated:** 2025-10-01
**Fleet Visualizer Version:** 3.2
**Feature:** Random Ship Model Selection

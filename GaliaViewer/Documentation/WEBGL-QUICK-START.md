# 🚀 WebGL Effects - Quick Start Guide

## 🎬 Try It Now!

Open the Galia Viewer and look for the **purple "✨ WebGL Effects"** panel in the bottom-left corner.

### 1. **Demo All Effects** (Easiest Way!)
Click the **🎬 Demo All** button to instantly see:
- ✨ 3 holographic ships flying around
- 🛡️ Energy shields on 3 systems
- 🌀 5 wormhole portals between systems
- 🌌 Nebulas and space dust (already active)

### 2. **Individual Effect Controls**

#### Holographic Fleets 🚀
- **Button**: "Show/Hide"
- **What it does**: Toggles animated holographic ships
- **Default**: 3 demo ships visible on load

#### Energy Shields 🛡️
- **Button**: "Toggle"
- **What it does**:
  - Click button to enable shield mode (turns red)
  - Then click any star system to add/remove shield
- **Tip**: Shields show protective energy fields with hexagonal patterns

#### Wormhole Portals 🌀
- **Button**: "Show/Hide"
- **What it does**: Creates animated portals between connected systems
- **Default**: Creates 5 wormholes when shown

#### Space Atmosphere 🌌
- **Status**: Always active
- **What it includes**:
  - 20,000 dust particles
  - 4 colored nebula clouds
  - Slow rotation for ambiance

### 3. **Clear Everything**
Click **🧹 Clear All** to remove all dynamic effects and start fresh.

---

## 💡 Quick Tips

1. **Stats Display**: Watch the live counter showing how many effects are active
2. **Collapse Panel**: Click the `−` button to minimize the panel
3. **Performance**: All effects are optimized - should run at 60 FPS
4. **Combine Effects**: You can enable multiple effects at once!

---

## 🎮 Recommended Experience

**For Best Visual Impact:**
1. Click "🎬 Demo All"
2. Zoom into different areas to see effects up close
3. Rotate the view to see holographic ships from different angles
4. Watch the wormholes animate and particles swirl

**For Performance Testing:**
1. Enable one effect at a time
2. Monitor FPS in browser dev tools
3. Adjust based on your hardware

---

## 🔧 Console Commands (Advanced)

Open browser console (F12) and try:

```javascript
// Create custom holographic ship
window.galiaViewer.webglEffects.createHolographicFleet(
    'my_fleet',
    new THREE.Vector3(100, 50, 30),
    0xff0000 // Red color
);

// Add shield to specific system
const pos = new THREE.Vector3(50, 20, 10);
window.galiaViewer.webglEffects.createEnergyShield('sol', pos, 10);

// Create wormhole between two points
window.galiaViewer.webglEffects.createWormhole(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(100, 100, 100)
);

// Get current stats
console.log(window.galiaViewer.webglEffects.getEffectsStats());
```

---

## 🎨 Effect Descriptions

### Holographic Shader
- **Visual**: Cyan/blue glowing ships with scan lines
- **Animation**: Constant rotation + pulsing glow
- **Tech**: Fresnel edge detection + procedural scan lines

### Energy Shield
- **Visual**: Green hexagonal energy field
- **Animation**: Pulsing hexagons + ripple on impact
- **Tech**: Spherical force field with pattern overlay

### Wormhole Portal
- **Visual**: Purple/pink spiral vortex
- **Animation**: Rotating spiral + orbiting particles
- **Tech**: Torus geometry with shader distortion

### Space Atmosphere
- **Visual**: Subtle dust + colorful nebula clouds
- **Animation**: Slow rotation and twinkling
- **Tech**: 20K+ particle system with additive blending

---

## ⚡ Performance Notes

- **Modern GPU**: All effects enabled = 60 FPS
- **Integrated Graphics**: Reduce particle count if needed
- **Mobile**: Effects auto-adjust quality

Each effect is independently toggleable for performance tuning!

---

## 📖 Full Documentation

See [WEBGL-EFFECTS-GUIDE.md](WEBGL-EFFECTS-GUIDE.md) for:
- Complete API reference
- Developer integration examples
- Shader technical details
- Advanced customization options

---

## ✨ Enjoy the Effects!

The WebGL effects system transforms the Galia Viewer into a stunning sci-fi experience. Experiment with different combinations and create your perfect visual style!

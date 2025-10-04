# 📚 Galia Viewer Documentation

Welcome to the comprehensive documentation for the Galia Viewer - a 3D interactive star map visualization system for Star Atlas.

---

## 📖 Table of Contents

### 🚀 Getting Started
- [Fleet Viewer Guide](FLEET-VIEWER-README.md) - View and track your Star Atlas SAGE fleets in 3D
- [Spaceship Model Guide](SPACESHIP-MODEL-GUIDE.md) - Customize fleet ship models
- [Clear Cache Instructions](CLEAR-CACHE-INSTRUCTIONS.md) - Fix display issues by clearing browser cache

### ✨ WebGL Effects (Currently Disabled)
- [WebGL Effects Guide](WEBGL-EFFECTS-GUIDE.md) - Complete technical documentation for WebGL effects
- [WebGL Quick Start](WEBGL-QUICK-START.md) - User-friendly guide to WebGL effects
- [WebGL Disabled Note](WEBGL-DISABLED-NOTE.md) - Why WebGL effects are currently disabled

---

## 🎯 Quick Links

### For Users

**Fleet Viewer:**
- How to view your fleets: [Fleet Viewer README](FLEET-VIEWER-README.md#usage)
- Troubleshooting: [Fleet Viewer README](FLEET-VIEWER-README.md#troubleshooting)

**Display Issues:**
- Seeing old visuals? [Clear Cache Instructions](CLEAR-CACHE-INSTRUCTIONS.md)
- Ships look wrong? [Spaceship Model Guide](SPACESHIP-MODEL-GUIDE.md#troubleshooting)

### For Developers

**Fleet System:**
- Architecture: [Fleet Viewer README](FLEET-VIEWER-README.md#architecture)
- API Reference: [Fleet Viewer README](FLEET-VIEWER-README.md#api-overview)
- Customization: [Spaceship Model Guide](SPACESHIP-MODEL-GUIDE.md#model-customization)

**WebGL Effects (Advanced):**
- Technical Details: [WebGL Effects Guide](WEBGL-EFFECTS-GUIDE.md)
- Integration: [WebGL Effects Guide](WEBGL-EFFECTS-GUIDE.md#integration-points)
- Re-enabling: [WebGL Disabled Note](WEBGL-DISABLED-NOTE.md#how-to-re-enable-for-future-debugging)

---

## 📁 Document Index

### FLEET-VIEWER-README.md
**Purpose:** Complete guide to the Fleet Viewer system
**For:** Users and developers
**Contents:**
- Features overview
- Usage instructions
- Network selection (Mainnet/Devnet)
- API integration details
- Troubleshooting

### SPACESHIP-MODEL-GUIDE.md
**Purpose:** Guide for spaceship 3D models
**For:** Users who want to customize ship appearance
**Contents:**
- Current procedural spaceship details
- How to use external GLTF/GLB models
- Model customization options
- Performance optimization
- Free model resources

### CLEAR-CACHE-INSTRUCTIONS.md
**Purpose:** Fix browser caching issues
**For:** Users experiencing display problems
**Contents:**
- Hard reload instructions (all browsers)
- Cache clearing steps
- Verification methods
- Developer mode tips

### WEBGL-EFFECTS-GUIDE.md
**Purpose:** Technical documentation for WebGL effects
**For:** Developers
**Contents:**
- Complete API reference
- Shader details (holographic, shields, wormholes)
- Integration examples
- Performance optimization
- **Status:** Effects currently disabled

### WEBGL-QUICK-START.md
**Purpose:** User-friendly WebGL effects guide
**For:** End users
**Contents:**
- Quick demo instructions
- Effect descriptions
- Console commands
- **Status:** Effects currently disabled

### WEBGL-DISABLED-NOTE.md
**Purpose:** Explain why WebGL effects are disabled
**For:** Users and developers
**Contents:**
- Issue description
- What was disabled
- How to re-enable for debugging
- Potential root causes

---

## 🔧 Common Tasks

### View Your Fleets
1. Open [Fleet Viewer README](FLEET-VIEWER-README.md)
2. Follow the "Usage" section
3. Enter your Solana wallet address

### Fix Display Issues
1. Try [Clear Cache Instructions](CLEAR-CACHE-INSTRUCTIONS.md)
2. Use hard reload: **Ctrl + Shift + R**
3. Check console for errors

### Customize Ships
1. Read [Spaceship Model Guide](SPACESHIP-MODEL-GUIDE.md)
2. Adjust size, colors, or speed
3. Or load external GLTF models

### Debug WebGL Effects
1. Check [WebGL Disabled Note](WEBGL-DISABLED-NOTE.md)
2. Review [WebGL Effects Guide](WEBGL-EFFECTS-GUIDE.md)
3. Test incrementally

---

## 📞 Support

**Issues with Documentation?**
- Open an issue on GitHub
- Check the browser console (F12) for errors
- Ensure all files are loaded correctly

**Need More Help?**
- Review the troubleshooting sections in each guide
- Check console logs for detailed error messages
- Verify you're using a modern browser (Chrome, Firefox, Edge)

---

## 🗂️ File Structure

```
GaliaViewer/
├── Documentation/
│   ├── README.md (this file)
│   ├── FLEET-VIEWER-README.md
│   ├── SPACESHIP-MODEL-GUIDE.md
│   ├── CLEAR-CACHE-INSTRUCTIONS.md
│   ├── WEBGL-EFFECTS-GUIDE.md
│   ├── WEBGL-QUICK-START.md
│   └── WEBGL-DISABLED-NOTE.md
├── fleet-manager/
│   ├── fleet-data.js
│   ├── fleet-visualizer.js
│   └── fleet-ui.js
├── core.js
├── scene.js
├── index.html
└── ...
```

---

## ✅ Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Fleet Viewer README | ✅ Current | 2025-10-01 |
| Spaceship Model Guide | ✅ Current | 2025-10-01 |
| Clear Cache Instructions | ✅ Current | 2025-10-01 |
| WebGL Effects Guide | ⚠️ Effects Disabled | 2025-10-01 |
| WebGL Quick Start | ⚠️ Effects Disabled | 2025-10-01 |
| WebGL Disabled Note | ✅ Current | 2025-10-01 |

---

**Last Updated:** 2025-10-01
**Documentation Version:** 1.0
**Galia Viewer Version:** 3.0

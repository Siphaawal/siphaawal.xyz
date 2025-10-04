# 🔄 Clear Browser Cache to See New Spaceships

## The Issue

If you're still seeing cone-shaped ships instead of detailed spaceships, your browser is using cached (old) JavaScript files.

## Quick Fix - Hard Reload

### Windows/Linux:
1. Open the Galia Viewer in your browser
2. Press **Ctrl + Shift + R** (hard reload)
3. Or **Ctrl + F5**

### Mac:
1. Open the Galia Viewer in your browser
2. Press **Cmd + Shift + R** (hard reload)
3. Or **Cmd + Shift + Delete** to clear cache

## Alternative - Clear Cache Manually

### Chrome:
1. Press **F12** to open DevTools
2. Right-click the **Refresh** button
3. Select **"Empty Cache and Hard Reload"**

### Firefox:
1. Press **Ctrl + Shift + Delete**
2. Select "Cached Web Content"
3. Click "Clear Now"
4. Reload the page

### Edge:
1. Press **Ctrl + Shift + Delete**
2. Select "Cached images and files"
3. Click "Clear"
4. Reload the page

## Verify the Update

After clearing cache and reloading:

1. **Open Browser Console** (F12)
2. Look for this message:
   ```
   🚀 Creating detailed spaceship geometry
   ```

3. **Check the Fleet Manager**
   - Load some fleets
   - You should now see detailed spaceships with:
     - Gray metallic body
     - Cyan glowing cockpit
     - Green wings
     - Orange engine glow
     - Particle trails

## Still Seeing Cones?

If hard reload doesn't work:

1. **Close ALL browser tabs** with the Galia Viewer
2. **Quit the browser completely**
3. **Restart the browser**
4. **Navigate back to the Galia Viewer**

## Developer Mode (For Testing)

To prevent caching during development:

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Check **"Disable cache"** checkbox
4. Keep DevTools open while testing

---

**Note:** The spaceship model code has been updated in [fleet-visualizer.js](fleet-manager/fleet-visualizer.js). The file now has version comment "v2.0 - Spaceship Models" to help with cache busting.

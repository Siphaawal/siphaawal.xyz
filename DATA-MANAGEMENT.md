# Data Management System

This document explains the centralized data management system for the Explorer applications.

## 📁 Directory Structure

```
Siphawaal.xyz/
├── JSON/                     # 📦 Centralized JSON source files
│   ├── recipes.json         # Recipe data source
│   ├── buildings.json       # Building data source
│   └── planets.json         # Planet data source
│
├── Data/                     # 🚀 Generated JavaScript data files
│   ├── recipes-data.js      # Generated from recipes.json
│   ├── buildings-data.js    # Generated from buildings.json
│   └── planet-data.js       # Generated from planets.json
│
└── RefreshData/             # 🔄 Data refresh utilities
    ├── refresh-data.js      # Main refresh script
    ├── refresh-data.bat     # Windows batch script
    └── refresh-data.sh      # Unix shell script
```

## 🔄 Workflow

### 1. **Edit JSON Source Files**
Edit the centralized JSON files in the `JSON/` directory:
- `JSON/recipes.json` - Recipe and crafting data
- `JSON/buildings.json` - ClaimStake building data
- `JSON/planets.json` - Planet and system data

### 2. **Refresh Data Files**
After editing JSON files, run the refresh script:

**Windows:**
```batch
cd RefreshData
refresh-data.bat
```

**Mac/Linux:**
```bash
cd RefreshData
./refresh-data.sh
```

**Direct Node.js (from root directory):**
```bash
node RefreshData/refresh-data.js
```

### 3. **Generated Files**
The script automatically generates JavaScript data files in `Data/`:
- Global variables for backward compatibility
- Module exports for Node.js environments
- Timestamp and source file tracking

## 🎯 Benefits

### **Centralized Management**
- Single source of truth for each data type
- No duplication across explorer directories
- Easy to find and edit data files

### **Automated Processing**
- Consistent format conversion
- Error handling and validation
- File size reporting

### **Clean Architecture**
- Explorer directories contain only application code
- Clear separation of data and logic
- Reduced file clutter

## 📊 File Sizes

Current data file sizes (approximate):
- `recipes.json`: ~4.8 MB (4,863,033 bytes)
- `buildings.json`: ~2.4 MB (2,494,701 bytes)
- `planets.json`: ~13.4 MB (13,709,595 bytes)

## 🛠️ Technical Details

### **DataLoader Integration**
The refresh script generates files compatible with the unified DataLoader system:
- `DataLoader.loadExplorerData('recipe')` → uses recipes-data.js
- `DataLoader.loadExplorerData('claimstake')` → uses buildings-data.js
- `DataLoader.loadExplorerData('planet')` → uses planet-data.js

### **Global Variables**
For backward compatibility, the following global variables are available:
- `window.rawRecipeData` - Recipe data
- `window.rawBuildingData` - Building data
- `window.planetData` - Planet data

### **Error Handling**
- Missing JSON files are reported with clear error messages
- Invalid JSON syntax is caught and reported
- File processing errors don't stop the entire script

## 🚀 Usage Examples

### **Adding New Recipe Data:**
1. Edit `JSON/recipes.json`
2. Run `refresh-data.bat` (Windows) or `./refresh-data.sh` (Unix)
3. Recipe Explorer automatically uses updated data

### **Updating Building Information:**
1. Edit `JSON/buildings.json`
2. Run refresh script
3. ClaimStake Explorer reflects changes

### **Modifying Planet Systems:**
1. Edit `JSON/planets.json`
2. Run refresh script
3. Planet Explorer shows updated systems

## ⚠️ Important Notes

- **Always run the refresh script** after editing JSON files
- JSON files must be valid - syntax errors will prevent processing
- The `Data/` directory files are **auto-generated** - don't edit them directly
- Original JSON files in explorer directories have been removed to prevent confusion

## 🔧 Troubleshooting

**Script fails to run:**
- Ensure Node.js is installed
- Check that JSON files exist in `JSON/` directory
- Verify JSON syntax is valid

**Data not updating in browsers:**
- Clear browser cache
- Check browser console for loading errors
- Verify HTML files reference correct Data/ files

**Missing data in explorers:**
- Ensure refresh script completed successfully
- Check that DataLoader.js is loaded before data files
- Verify explorer apps are using DataLoader.loadExplorerData()
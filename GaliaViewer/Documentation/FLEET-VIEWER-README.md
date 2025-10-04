# 🚀 Fleet Viewer for Galia Viewer

A comprehensive fleet viewing and visualization system integrated into the Galia Viewer, allowing users to view and track their Star Atlas SAGE fleets in 3D space.

## Features

### ✅ Current Features (v1.0)

- **Solana Wallet Integration**: Enter your Solana public address to fetch fleet data
- **Network Selection**: Switch between Mainnet Beta and Devnet
- **3D Fleet Visualization**: Fleets appear as detailed spaceships in the 3D star map
- **Automatic System Assignment**: Fleets are randomly assigned to star systems with wormhole connections
- **Animated Travel**: Fleets automatically travel back and forth between their assigned systems
- **Real-time Updates**: Fleet positions and status update in real-time
- **Fleet Details Panel**: View fleet information, ship count, current location, and travel progress
- **Cache System**: Intelligent caching to reduce redundant API calls

## Usage

### 1. Open Galia Viewer
Navigate to the Galia Viewer in your browser.

### 2. Access Fleet Viewer
Look for the **Fleet Viewer** panel in the bottom-left corner of the screen.

### 3. Enter Wallet Address
```
Enter your Solana wallet address:
Example: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### 4. Select Network
Choose between:
- **Mainnet Beta**: For production/live data
- **Devnet**: For testing

### 5. Load Fleets
Click the **Load** button to fetch and visualize your fleets.

### 6. Watch Your Fleets
Your fleets will appear in the 3D scene as green cone-shaped ships, automatically traveling between assigned star systems!

## File Structure

```
fleet-manager/
├── fleet-data.js       # Data fetching and Solana integration
├── fleet-visualizer.js # 3D visualization and animation
├── fleet-ui.js         # User interface components
└── README.md           # This file
```

## Architecture

### FleetDataManager (`fleet-data.js`)
- Connects to Solana RPC endpoints
- Fetches fleet data for wallet addresses
- Implements caching to reduce API calls
- **Currently uses mock data** - ready for SAGE SDK integration

### FleetVisualizer (`fleet-visualizer.js`)
- Creates 3D meshes for fleets
- Assigns fleets to random star systems
- Animates fleet movement between systems
- Updates fleet positions every frame

### FleetUIManager (`fleet-ui.js`)
- Manages the Fleet Manager panel UI
- Handles wallet address input
- Displays fleet cards with real-time status
- Provides refresh and clear functionality

## Integration with Star Atlas SAGE SDK

### Current Status
The system currently uses **mock fleet data** for demonstration and testing purposes.

### Production Integration

To integrate with the actual Star Atlas SAGE SDK:

1. **Install Dependencies**:
```bash
npm install @staratlas/sage @staratlas/data-source @project-serum/anchor @solana/web3.js
```

2. **Update `fleet-data.js`**:
Replace the `fetchMockFleetData()` method with actual SAGE SDK calls (see commented example in the file).

3. **Required Changes**:
```javascript
import { SageProgram } from '@staratlas/sage';
import { AnchorProvider } from '@project-serum/anchor';

async fetchRealFleetData(publicKey) {
    const provider = new AnchorProvider(this.connection, wallet, {});
    const sageProgram = new SageProgram(provider);

    const playerProfile = await sageProgram.getPlayerProfile(publicKey);

    const fleets = await sageProgram.readAllFromRPC(
        sageProgram.fleet.account.fleet,
        'confirmed',
        [playerProfile.filterByPlayerProfile]
    );

    return fleets.map(fleet => ({
        id: fleet.publicKey.toString(),
        name: byteArrayToString(fleet.data.fleetLabel),
        ships: fleet.data.ships.length,
        // ... map other properties
    }));
}
```

## API Reference

### FleetDataManager

```javascript
// Initialize connection
await fleetDataManager.initialize('mainnet');

// Fetch fleets
const fleets = await fleetDataManager.fetchFleetData(walletAddress);

// Clear cache
fleetDataManager.clearCache();

// Get status
const status = fleetDataManager.getStatus();
```

### FleetVisualizer

```javascript
// Visualize fleets
await fleetVisualizer.visualizeFleets(fleets);

// Get fleet info
const info = fleetVisualizer.getFleetInfo(fleetId);

// Get all fleet info
const allInfo = fleetVisualizer.getAllFleetInfo();

// Clear all fleets
fleetVisualizer.clearAllFleets();
```

## Customization

### Appearance Settings

In `fleet-visualizer.js`:

```javascript
this.fleetColor = 0x00ff00;  // Green (change to any hex color)
this.fleetSize = 0.5;        // Size of fleet meshes
this.travelSpeed = 0.01;     // Speed of travel animation
```

### Fleet Behavior

- **System Assignment**: Modify `assignFleetToSystems()` to use specific assignment logic
- **Travel Routes**: Customize movement patterns in `startFleetMovement()`
- **Animation**: Adjust `updateFleetAnimations()` for different movement styles

## Troubleshooting

### Fleets Not Appearing
- Ensure wallet address is valid
- Check browser console for errors
- Verify network selection matches your wallet's network
- Try clearing cache with the **Refresh** button

### Slow Performance
- Reduce number of fleets visualized
- Increase `travelSpeed` for faster animations
- Check console for WebGL performance warnings

### Connection Issues
- Verify internet connection
- Try switching between Mainnet and Devnet
- Check Solana RPC endpoint status

## Future Enhancements

### Planned Features
- [ ] Real Star Atlas SAGE SDK integration
- [ ] Fleet selection and focus (click fleet to center camera)
- [ ] Fleet routes customization
- [ ] Multiple wallet support
- [ ] Fleet comparison view
- [ ] Historical fleet movements
- [ ] Export fleet data
- [ ] Fleet alert system (low fuel, damage, etc.)

### Advanced Features (Roadmap)
- [ ] WebSocket connection for real-time updates
- [ ] Fleet grouping and formations
- [ ] Resource cargo visualization
- [ ] Combat status indicators
- [ ] Mining operation visualization
- [ ] Trade route planning

## Contributing

To contribute to the Fleet Manager:

1. Test thoroughly with mock data
2. Ensure 3D performance remains smooth
3. Follow existing code style
4. Document any new features
5. Update this README with changes

## License

Part of the Siphawaal.xyz project.

## Credits

- Built for Star Atlas community
- Based on Star Atlas SAGE Cookbook examples
- Powered by Solana Web3.js
- 3D visualization with Three.js

---

**Need Help?** Check the browser console for detailed logs and error messages.

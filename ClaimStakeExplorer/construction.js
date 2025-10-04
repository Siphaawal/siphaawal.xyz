// Construction Facility Manager for ClaimStake Explorer
// Complete replication of GaliaViewer/ui.js building functionality (lines 576-1460)

class ConstructionManager {
    constructor() {
        this.currentFacilityPlan = null;
        this.systems = [];
    }

    // Initialize construction tab with planet data
    async initializeWithPlanetData() {
        if (typeof window.planetData !== 'undefined' && window.planetData.mapData) {
            this.systems = window.planetData.mapData;
            console.log('✅ Loaded', this.systems.length, 'systems for construction');
            this.renderPlanetSelector();
        } else {
            console.warn('⚠️ Planet data not available, loading...');
            const script = document.createElement('script');
            script.src = '../Data/planet-data.js';
            script.onload = () => {
                if (window.planetData && window.planetData.mapData) {
                    this.systems = window.planetData.mapData;
                    this.renderPlanetSelector();
                }
            };
            document.head.appendChild(script);
        }
    }

    // Render planet selection interface
    renderPlanetSelector() {
        const container = document.getElementById('constructionContent');
        if (!container) return;

        let html = `
            <div style="background: #2a2a3e; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #4CAF50; margin-bottom: 15px;">🪐 Select Planet for Construction</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">System:</label>
                    <select id="systemSelect" onchange="window.constructionManager.onSystemChange()"
                            style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="">Select a system...</option>
        `;

        this.systems.forEach((system, index) => {
            if (system.planets && system.planets.length > 0) {
                html += `<option value="${index}">${system.name || system.key} (${system.planets.length} planets)</option>`;
            }
        });

        html += `
                    </select>
                </div>
                <div id="planetSelectContainer" style="display: none; margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Planet:</label>
                    <select id="planetSelect" onchange="window.constructionManager.onPlanetChange()"
                            style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="">Select a planet...</option>
                    </select>
                </div>
            </div>
            <div id="buildingInterface" style="display: none;"></div>
        `;

        container.innerHTML = html;
    }

    // Handle system selection change
    onSystemChange() {
        const systemIndex = document.getElementById('systemSelect').value;
        const planetContainer = document.getElementById('planetSelectContainer');
        const planetSelect = document.getElementById('planetSelect');

        if (!systemIndex) {
            planetContainer.style.display = 'none';
            document.getElementById('buildingInterface').style.display = 'none';
            return;
        }

        const system = this.systems[parseInt(systemIndex)];

        let options = '<option value="">Select a planet...</option>';
        system.planets.forEach((planet, index) => {
            const planetName = planet.name || `Planet ${index + 1}`;
            const planetType = this.getPlanetTypeName(planet.type || 0);
            options += `<option value="${index}">${planetName} - ${planetType}</option>`;
        });

        planetSelect.innerHTML = options;
        planetContainer.style.display = 'block';
        document.getElementById('buildingInterface').style.display = 'none';
    }

    // Handle planet selection change
    onPlanetChange() {
        const systemIndex = document.getElementById('systemSelect').value;
        const planetIndex = document.getElementById('planetSelect').value;
        if (!planetIndex || !systemIndex) return;

        const system = this.systems[parseInt(systemIndex)];
        const planet = system.planets[parseInt(planetIndex)];
        const planetName = planet.name || `Planet ${parseInt(planetIndex) + 1}`;

        this.openBuildingInterface(system, planet, planetName);
    }

    // Open building interface - GaliaViewer: openBuildingInterface()
    openBuildingInterface(system, planet, planetName) {
        this.showBuildingModal(system, planet, planetName);
    }

    // Show building construction modal - EXACT GaliaViewer implementation
    showBuildingModal(system, planet, planetName) {
        const container = document.getElementById('buildingInterface');
        const compatibleBuildings = this.getCompatibleBuildings(planet, system);

        const modalHTML = `
            <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 10px; border: 2px solid #444;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #444; padding-bottom: 10px;">
                    <h2 style="margin: 0; color: #4CAF50;">🏗️ Build Facility - ${planetName}</h2>
                </div>

                <!-- Facility Plan Summary at Top -->
                <div id="facilityPlan" style="margin-bottom: 20px; padding: 15px; background: #2a2a3e; border-radius: 6px; display: none;">
                    <h3 style="color: #2196F3; margin-bottom: 10px;">🏭 Current Facility Plan</h3>
                    <div id="selectedBuildings"></div>
                    <div style="margin-top: 15px; text-align: center;">
                        <button onclick="window.constructionManager.clearFacilityPlan()"
                                style="background: #ff4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                            Clear Plan
                        </button>
                        <button onclick="window.constructionManager.constructFacility()"
                                style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                            🚀 Construct Facility
                        </button>
                    </div>
                </div>

                <!-- Claim Stake Selection -->
                <div style="margin-bottom: 15px; padding: 10px; background: #2a2a3e; border-radius: 6px;">
                    <div style="margin-bottom: 10px;">
                        <strong>🏗️ Select Your Claim Stake Tier:</strong>
                        <select id="claimStakeTier" onchange="window.constructionManager.updateCompatibleBuildings()"
                                style="margin-left: 10px; padding: 4px 8px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
                            <option value="1">Tier 1 - Basic Stake</option>
                            <option value="2">Tier 2 - Advanced Stake</option>
                            <option value="3">Tier 3 - Professional Stake</option>
                            <option value="4">Tier 4 - Industrial Stake</option>
                            <option value="5">Tier 5 - Mega Stake</option>
                        </select>
                    </div>
                    <div>
                        <strong>Planet Type:</strong> ${planet.type || 'Unknown'} |
                        <strong>Available Resources:</strong> ${planet.resources ? planet.resources.map(r => r.name).join(', ') : 'None'}
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <h3 style="color: #FF9800; margin-bottom: 10px;">Compatible Buildings <span id="buildingCount">(${compatibleBuildings.length})</span></h3>
                    <div id="buildingsList" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        ${this.renderBuildingOptions(compatibleBuildings, system, planet)}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = modalHTML;
        container.style.display = 'block';

        // Initialize facility plan storage - EXACT GaliaViewer structure
        this.currentFacilityPlan = {
            system: system,
            planet: planet,
            planetName: planetName,
            buildings: [],
            claimStakeTier: 1,
            availableSlots: this.getClaimStakeSlots(1),
            totalPowerOutput: 0
        };
    }

    // Get buildings compatible with the planet type - EXACT GaliaViewer
    getCompatibleBuildings(planet, system, claimStakeTier = 1) {
        if (typeof window.rawBuildingData === 'undefined') {
            return [];
        }

        const buildings = window.rawBuildingData.buildings || [];
        const planetTypeNum = planet.type;
        const availableResources = (planet.resources || []).map(r => r.name.toLowerCase());

        return buildings.filter(building => {
            // Check planet type requirements
            const requiredTags = building.requiredTags || [];
            const planetTypeCompatible = this.checkPlanetTypeCompatibility(planetTypeNum, requiredTags);

            // Check claim stake tier compatibility
            const tierCompatible = building.minimumTier <= claimStakeTier;

            return planetTypeCompatible && tierCompatible;
        }).sort((a, b) => {
            // Sort by tier, then by name
            if (a.tier !== b.tier) return a.tier - b.tier;
            return a.name.localeCompare(b.name);
        });
    }

    // Update compatible buildings when claim stake tier changes - EXACT GaliaViewer
    updateCompatibleBuildings() {
        if (!this.currentFacilityPlan) return;

        const claimStakeTier = parseInt(document.getElementById('claimStakeTier').value) || 1;
        this.currentFacilityPlan.claimStakeTier = claimStakeTier;
        this.currentFacilityPlan.availableSlots = this.getClaimStakeSlots(claimStakeTier);

        const compatibleBuildings = this.getCompatibleBuildings(
            this.currentFacilityPlan.planet,
            this.currentFacilityPlan.system,
            claimStakeTier
        );

        // Update buildings list
        const buildingsList = document.getElementById('buildingsList');
        const buildingCount = document.getElementById('buildingCount');

        if (buildingsList && buildingCount) {
            buildingsList.innerHTML = this.renderBuildingOptions(
                compatibleBuildings,
                this.currentFacilityPlan.system,
                this.currentFacilityPlan.planet
            );
            buildingCount.textContent = `(${compatibleBuildings.length})`;
        }

        // Re-validate current facility plan
        this.validateFacilityPlan();
    }

    // Get available slots for claim stake tier - EXACT GaliaViewer
    getClaimStakeSlots(tier) {
        const slotsByTier = {
            1: 4,      // Tier 1: 4 slots
            2: 32,     // Tier 2: 32 slots
            3: 108,    // Tier 3: 108 slots
            4: 256,    // Tier 4: 256 slots
            5: 500     // Tier 5: 500 slots
        };
        return slotsByTier[tier] || 4;
    }

    // Get base power output for claim stake tier - EXACT GaliaViewer
    getClaimStakePower(tier) {
        const powerByTier = {
            1: 100,    // Tier 1: 100 power
            2: 200,    // Tier 2: 200 power
            3: 300,    // Tier 3: 300 power
            4: 400,    // Tier 4: 400 power
            5: 500     // Tier 5: 500 power
        };
        return powerByTier[tier] || 100;
    }

    // Validate facility plan for power and slot requirements - EXACT GaliaViewer
    validateFacilityPlan() {
        if (!this.currentFacilityPlan) return { valid: true };

        const buildings = this.currentFacilityPlan.buildings;
        const claimStakeTier = this.currentFacilityPlan.claimStakeTier;

        // Calculate total slots used
        const totalSlotsUsed = buildings.reduce((sum, building) => sum + (building.slots || 0), 0);
        const availableSlots = this.getClaimStakeSlots(claimStakeTier);

        // Calculate power consumption and generation
        const basePower = this.getClaimStakePower(claimStakeTier);
        const buildingPowerOutput = buildings.reduce((sum, building) => sum + (building.power || 0), 0);
        const totalPowerOutput = basePower + buildingPowerOutput;

        // Find buildings that have power consumption (negative power)
        const powerConsumption = buildings.reduce((sum, building) => {
            if (building.resourceRate) {
                Object.values(building.resourceRate).forEach(rate => {
                    if (rate < 0) sum += Math.abs(rate) * 10; // Convert to power units
                });
            }
            return sum;
        }, 0);

        const validation = {
            valid: totalSlotsUsed <= availableSlots && totalPowerOutput >= powerConsumption,
            slotsUsed: totalSlotsUsed,
            availableSlots: availableSlots,
            slotsExceeded: totalSlotsUsed > availableSlots,
            powerOutput: totalPowerOutput,
            powerConsumption: powerConsumption,
            powerInsufficient: totalPowerOutput < powerConsumption,
            basePower: basePower,
            buildingPower: buildingPowerOutput
        };

        this.currentFacilityPlan.validation = validation;
        return validation;
    }

    // Check if planet type is compatible with building requirements - EXACT GaliaViewer
    checkPlanetTypeCompatibility(planetTypeNum, requiredTags) {
        if (!requiredTags || requiredTags.length === 0) return true;

        // Comprehensive mapping from numeric planet types to descriptive planet tags used by buildings
        const numericToPlanetTag = {
            0: 'terrestrial-planet',    // Rocky/Terrestrial
            1: 'gas-planet',           // Gas Giant (rare buildings)
            2: 'ice-planet',           // Ice/Frozen worlds
            3: 'volcanic-planet',      // Volcanic/Lava worlds
            4: 'oceanic-planet',       // Ocean worlds
            5: 'desert-planet',        // Desert/Arid worlds
            6: 'oceanic-planet',       // Ocean (alternate)
            7: 'terrestrial-planet',   // Forest worlds (Earth-like)
            8: 'toxic-planet',         // Toxic worlds
            9: 'barren-planet',        // Barren worlds
            10: 'terrestrial-planet',  // Tropical worlds (Earth-like)
            11: 'ice-planet',          // Arctic worlds
            12: 'terrestrial-planet', // Continental
            13: 'oceanic-planet',     // Archipelago
            14: 'desert-planet',      // Savanna
            15: 'ice-planet',         // Tundra
            16: 'volcanic-planet',    // Molten
            17: 'barren-planet',      // Asteroid
            18: 'dark-planet',        // Dark/Shadow worlds
            19: 'toxic-planet',       // Polluted
            20: 'terrestrial-planet'  // Alpine
            // Types 21+ default to barren-planet for compatibility
        };

        // Get the descriptive planet tag for this numeric type
        const planetTag = numericToPlanetTag[planetTypeNum] || 'barren-planet';

        // Check if any required tag matches this planet type
        return requiredTags.some(tag => {
            const tagLower = tag.toLowerCase();
            return tagLower === planetTag.toLowerCase();
        });
    }

    // Generate detailed explanation when no buildings match - EXACT GaliaViewer
    generateDetailedNoMatchesMessage(planet, system) {
        if (typeof window.rawBuildingData === 'undefined') {
            return '<div style="grid-column: 1 / -1; text-align: center; color: #666;">Building data not available.</div>';
        }

        const buildings = window.rawBuildingData.buildings || [];
        const planetTypeNum = planet.type;
        const claimStakeTier = this.currentFacilityPlan ? this.currentFacilityPlan.claimStakeTier : 1;

        // Get planet type name
        const planetTypes = {
            1: 'Gas Giant',
            2: 'Terrestrial',
            3: 'Ice',
            4: 'Volcanic',
            5: 'Desert',
            6: 'Ocean',
            7: 'Asteroid'
        };
        const planetTypeName = planetTypes[planetTypeNum] || `Type ${planetTypeNum}`;

        // Analyze why buildings don't match
        let planetTypeIncompatible = 0;
        let tierIncompatible = 0;
        let bothIncompatible = 0;

        buildings.forEach(building => {
            const requiredTags = building.requiredTags || [];
            const planetTypeCompatible = this.checkPlanetTypeCompatibility(planetTypeNum, requiredTags);
            const tierCompatible = building.minimumTier <= claimStakeTier;

            if (!planetTypeCompatible && !tierCompatible) {
                bothIncompatible++;
            } else if (!planetTypeCompatible) {
                planetTypeIncompatible++;
            } else if (!tierCompatible) {
                tierIncompatible++;
            }
        });

        let explanation = `
            <div style="grid-column: 1 / -1; text-align: center; color: #666; padding: 20px; background: #2a2a2a; border-radius: 6px; border: 1px solid #444;">
                <h4 style="color: #FF9800; margin-bottom: 15px;">❌ No Compatible Buildings Found</h4>

                <div style="text-align: left; max-width: 500px; margin: 0 auto;">
                    <p style="margin-bottom: 10px;"><strong>Planet:</strong> ${planet.name} (${planetTypeName})</p>
                    <p style="margin-bottom: 15px;"><strong>Current Claim Stake:</strong> Tier ${claimStakeTier}</p>

                    <div style="margin-bottom: 10px;"><strong>Analysis of ${buildings.length} available buildings:</strong></div>
        `;

        if (planetTypeIncompatible > 0) {
            explanation += `<div style="margin-left: 10px; color: #f44336;">• ${planetTypeIncompatible} building(s) incompatible with ${planetTypeName} planets</div>`;
        }

        if (tierIncompatible > 0) {
            explanation += `<div style="margin-left: 10px; color: #ff9800;">• ${tierIncompatible} building(s) require higher than Tier ${claimStakeTier} claim stake</div>`;
        }

        if (bothIncompatible > 0) {
            explanation += `<div style="margin-left: 10px; color: #9e9e9e;">• ${bothIncompatible} building(s) incompatible with both planet type and claim stake tier</div>`;
        }

        explanation += `
                    <div style="margin-top: 15px; padding: 10px; background: #1a1a1a; border-radius: 4px; border-left: 3px solid #4CAF50;">
                        <strong>💡 Suggestions:</strong>
                        <div style="margin-top: 5px;">
                            ${tierIncompatible > 0 ? `• Upgrade your claim stake to access ${tierIncompatible} more building(s)` : ''}
                            ${planetTypeIncompatible > 0 ? `• Try building on a different planet type` : ''}
                            ${tierIncompatible === 0 && planetTypeIncompatible === 0 ? '• Check if building data is loaded properly' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        return explanation;
    }

    // Render building options - EXACT GaliaViewer
    renderBuildingOptions(buildings, system, planet) {
        if (buildings.length === 0) {
            return this.generateDetailedNoMatchesMessage(planet, system);
        }

        return buildings.map(building => {
            const constructionCost = building.constructionCost || {};
            const costEntries = Object.entries(constructionCost);

            return `
                <div style="background: #333; padding: 15px; border-radius: 6px; border: 1px solid #555;">
                    <h4 style="margin: 0 0 8px 0; color: #4CAF50;">${building.name}</h4>
                    <div style="font-size: 11px; color: #ccc; margin-bottom: 8px;">Tier ${building.tier} • ${building.constructionTime || 0} minutes</div>
                    <div style="font-size: 11px; margin-bottom: 10px;">${building.description || 'No description'}</div>

                    ${costEntries.length > 0 ? `
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 11px; color: #aaa; margin-bottom: 4px;">Construction Cost:</div>
                            ${costEntries.map(([resource, amount]) =>
                                `<div style="font-size: 10px;">• ${resource}: ${amount}</div>`
                            ).join('')}
                        </div>
                    ` : ''}

                    <div style="display: flex; gap: 5px; margin-top: 10px;">
                        <button onclick="window.constructionManager.addBuildingToPlan('${building.id}')"
                                style="background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; flex: 1;">
                            ➕ Add to Plan
                        </button>
                        <button onclick="window.constructionManager.showBuildingDetails('${building.id}')"
                                style="background: #FF9800; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; flex: 0 0 auto;">
                            📋 Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Add building to facility plan - EXACT GaliaViewer with validation
    addBuildingToPlan(buildingId) {
        if (!this.currentFacilityPlan) return;

        const building = window.rawBuildingData.buildings.find(b => b.id === buildingId);
        if (!building) return;

        // Check if building is compatible with current claim stake tier
        if (building.minimumTier > this.currentFacilityPlan.claimStakeTier) {
            alert(`❌ This building requires a Tier ${building.minimumTier} claim stake. You currently have Tier ${this.currentFacilityPlan.claimStakeTier}.`);
            return;
        }

        // Temporarily add building to check validation
        this.currentFacilityPlan.buildings.push(building);
        const validation = this.validateFacilityPlan();

        if (!validation.valid) {
            // Remove the building if validation fails
            this.currentFacilityPlan.buildings.pop();

            let errorMessage = '❌ Cannot add building:\n\n';
            if (validation.slotsExceeded) {
                errorMessage += `• Exceeds available slots: ${validation.slotsUsed}/${validation.availableSlots}\n`;
            }
            if (validation.powerInsufficient) {
                errorMessage += `• Insufficient power: ${validation.powerOutput} available, ${validation.powerConsumption} required\n`;
            }
            errorMessage += '\nPlease upgrade your claim stake tier or remove other buildings first.';

            alert(errorMessage);
            return;
        }

        // Building successfully added
        this.updateFacilityPlanDisplay();
    }

    // Update facility plan display - EXACT GaliaViewer comprehensive version
    updateFacilityPlanDisplay() {
        const facilityPlan = document.getElementById('facilityPlan');
        const selectedBuildings = document.getElementById('selectedBuildings');

        if (!facilityPlan || !selectedBuildings || !this.currentFacilityPlan) return;

        if (this.currentFacilityPlan.buildings.length === 0) {
            facilityPlan.style.display = 'none';
            return;
        }

        facilityPlan.style.display = 'block';

        const facilityStats = this.calculateFacilityStats();
        const validation = this.validateFacilityPlan();
        const totalTime = this.currentFacilityPlan.buildings.reduce((sum, b) => sum + (b.constructionTime || 0), 0);

        // Validation status display
        let validationDisplay = '';
        if (!validation.valid) {
            validationDisplay = `
                <div style="background: #ff4444; padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 12px;">
                    ⚠️ <strong>Validation Issues:</strong><br>
                    ${validation.slotsExceeded ? `• Slots exceeded: ${validation.slotsUsed}/${validation.availableSlots}<br>` : ''}
                    ${validation.powerInsufficient ? `• Power insufficient: ${validation.powerOutput}/${validation.powerConsumption}<br>` : ''}
                </div>
            `;
        } else {
            validationDisplay = `
                <div style="background: #4CAF50; padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 12px;">
                    ✅ <strong>Facility plan is valid!</strong>
                </div>
            `;
        }

        selectedBuildings.innerHTML = `
            ${validationDisplay}
            <div style="margin-bottom: 15px;">
                <strong>Buildings Selected: ${this.currentFacilityPlan.buildings.length}</strong><br>
                <strong>Total Construction Time: ${totalTime} minutes</strong><br>
                <strong>Claim Stake: Tier ${this.currentFacilityPlan.claimStakeTier}</strong><br>
                <strong>Slots Used: ${validation.slotsUsed}/${validation.availableSlots}</strong>
                ${validation.slotsExceeded ? ' <span style="color: #ff4444;">⚠️</span>' : ' <span style="color: #4CAF50;">✓</span>'}<br>
                <strong>Power: ${validation.powerOutput} output, ${validation.powerConsumption} consumption</strong>
                ${validation.powerInsufficient ? ' <span style="color: #ff4444;">⚠️</span>' : ' <span style="color: #4CAF50;">✓</span>'}
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin-bottom: 15px;">
                ${this.currentFacilityPlan.buildings.map((building, index) => `
                    <div style="background: #444; padding: 10px; border-radius: 4px; font-size: 11px; position: relative;">
                        <button onclick="window.constructionManager.removeBuildingFromPlan(${index})"
                                style="background: #f44; color: white; border: none; padding: 2px 6px; border-radius: 2px; cursor: pointer; font-size: 10px; position: absolute; top: 5px; right: 5px;">
                            ✕
                        </button>
                        <div style="margin-right: 25px;">
                            <strong style="color: #4CAF50;">${building.name}</strong><br>
                            <div style="color: #ccc; margin: 4px 0;">Tier ${building.tier} • ${building.constructionTime || 0} min</div>
                            <div style="display: flex; gap: 10px; margin-top: 6px;">
                                <span>👥 ${building.neededCrew || 0}/${building.crewSlots || 0}</span>
                                <span>⚡ ${building.power || 0}</span>
                                <span>📦 ${(building.storage || 0).toLocaleString()}</span>
                            </div>
                            ${building.comesWithStake ? '<div style="color: #FF9800; font-size: 10px; margin-top: 4px;">📍 Includes Stake</div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                <!-- Resource Cost -->
                <div style="background: #2a2a3e; padding: 10px; border-radius: 4px;">
                    <strong>📦 Total Resource Cost:</strong><br>
                    ${Object.entries(facilityStats.totalCost).map(([resource, amount]) =>
                        `<div style="font-size: 11px;">• ${resource}: ${amount}</div>`
                    ).join('') || '<div style="font-size: 11px; color: #666;">No resource cost</div>'}
                </div>

                <!-- Crew & Operations -->
                <div style="background: #2a2a3e; padding: 10px; border-radius: 4px;">
                    <strong>👥 Crew & Operations:</strong><br>
                    <div style="font-size: 11px;">• Total Crew Slots: ${facilityStats.totalCrewSlots}</div>
                    <div style="font-size: 11px;">• Crew Required: ${facilityStats.totalNeededCrew}</div>
                    <div style="font-size: 11px;">• Power Output: <span style="color: ${facilityStats.totalPower < 0 ? '#f44336' : 'inherit'}">${facilityStats.totalPower}</span></div>
                    <div style="font-size: 11px;">• Storage Capacity: ${facilityStats.totalStorage.toLocaleString()}</div>
                </div>

                <!-- Facility Features -->
                <div style="background: #2a2a3e; padding: 10px; border-radius: 4px;">
                    <strong>🏗️ Facility Features:</strong><br>
                    <div style="font-size: 11px;">• Building Slots: ${facilityStats.totalSlots}</div>
                    <div style="font-size: 11px;">• Comes with Stake: ${facilityStats.comesWithStake ? 'Yes' : 'No'}</div>
                    <div style="font-size: 11px;">• Removable Buildings: ${facilityStats.removableBuildings}</div>
                    ${facilityStats.enabledFeatures.length > 0 ? `<div style="font-size: 11px;">• Enables: ${facilityStats.enabledFeatures.slice(0, 3).join(', ')}${facilityStats.enabledFeatures.length > 3 ? '...' : ''}</div>` : ''}
                </div>

                <!-- Resource Production -->
                ${Object.keys(facilityStats.resourceExtraction).length > 0 || Object.keys(facilityStats.resourceConsumption).length > 0 ? `
                <div style="background: #2a2a3e; padding: 10px; border-radius: 4px;">
                    <strong>🔄 Resource Production:</strong><br>
                    ${Object.entries(facilityStats.resourceExtraction).map(([resource, rate]) =>
                        `<div style="font-size: 11px; color: #4CAF50;">• ${resource}: +${rate.toFixed(3)}/hour</div>`
                    ).join('')}
                    ${Object.entries(facilityStats.resourceConsumption).map(([resource, rate]) =>
                        `<div style="font-size: 11px; color: #f44336;">• ${resource}: -${rate.toFixed(3)}/hour</div>`
                    ).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Calculate comprehensive facility statistics - EXACT GaliaViewer
    calculateFacilityStats() {
        if (!this.currentFacilityPlan) return {};

        const buildings = this.currentFacilityPlan.buildings;
        const stats = {
            totalCost: {},
            totalCrewSlots: 0,
            totalNeededCrew: 0,
            totalPower: 0,
            totalStorage: 0,
            totalSlots: 0,
            comesWithStake: false,
            removableBuildings: 0,
            enabledFeatures: [],
            resourceExtraction: {},
            resourceConsumption: {}
        };

        // Calculate totals from all buildings
        buildings.forEach(building => {
            // Resource costs
            const cost = building.constructionCost || {};
            Object.entries(cost).forEach(([resource, amount]) => {
                stats.totalCost[resource] = (stats.totalCost[resource] || 0) + amount;
            });

            // Crew and operations
            stats.totalCrewSlots += building.crewSlots || 0;
            stats.totalNeededCrew += building.neededCrew || 0;
            stats.totalPower += building.power || 0;
            stats.totalStorage += building.storage || 0;
            stats.totalSlots += building.slots || 0;

            // Special properties
            if (building.comesWithStake) {
                stats.comesWithStake = true;
            }
            if (!building.cannotRemove) {
                stats.removableBuildings++;
            }

            // Resource extraction rates
            if (building.resourceExtractionRate) {
                Object.entries(building.resourceExtractionRate).forEach(([resource, rate]) => {
                    stats.resourceExtraction[resource] = (stats.resourceExtraction[resource] || 0) + rate;
                });
            }

            // Resource consumption rates (negative rates)
            if (building.resourceRate) {
                Object.entries(building.resourceRate).forEach(([resource, rate]) => {
                    if (rate < 0) {
                        stats.resourceConsumption[resource] = (stats.resourceConsumption[resource] || 0) + Math.abs(rate);
                    } else {
                        stats.resourceExtraction[resource] = (stats.resourceExtraction[resource] || 0) + rate;
                    }
                });
            }

            // Enabled features (from addedTags)
            if (building.addedTags) {
                building.addedTags.forEach(tag => {
                    if (tag.startsWith('enables-') && !stats.enabledFeatures.includes(tag)) {
                        // Convert enables-processing-hub to "Processing Hub"
                        const featureName = tag.replace('enables-', '').replace(/-/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());
                        stats.enabledFeatures.push(featureName);
                    }
                });
            }
        });

        return stats;
    }

    // Remove building from plan - EXACT GaliaViewer
    removeBuildingFromPlan(index) {
        if (!this.currentFacilityPlan || index < 0 || index >= this.currentFacilityPlan.buildings.length) return;

        this.currentFacilityPlan.buildings.splice(index, 1);
        this.updateFacilityPlanDisplay();
    }

    // Clear facility plan - EXACT GaliaViewer
    clearFacilityPlan() {
        if (!this.currentFacilityPlan) return;

        this.currentFacilityPlan.buildings = [];
        this.updateFacilityPlanDisplay();
    }

    // Construct facility (simulation) - EXACT GaliaViewer
    constructFacility() {
        if (!this.currentFacilityPlan || this.currentFacilityPlan.buildings.length === 0) {
            alert('No buildings selected for construction!');
            return;
        }

        // Validate facility plan before construction
        const validation = this.validateFacilityPlan();
        if (!validation.valid) {
            let errorMessage = '❌ Cannot construct facility due to validation errors:\n\n';
            if (validation.slotsExceeded) {
                errorMessage += `• Slots exceeded: ${validation.slotsUsed}/${validation.availableSlots}\n`;
            }
            if (validation.powerInsufficient) {
                errorMessage += `• Insufficient power: ${validation.powerOutput} available, ${validation.powerConsumption} required\n`;
            }
            errorMessage += '\nPlease fix these issues before constructing the facility.';
            alert(errorMessage);
            return;
        }

        const facilityStats = this.calculateFacilityStats();
        const totalTime = this.currentFacilityPlan.buildings.reduce((sum, b) => sum + (b.constructionTime || 0), 0);
        const buildingNames = this.currentFacilityPlan.buildings.map(b => b.name);

        // Enhanced confirmation message with comprehensive stats
        let confirmMessage = `🏗️ Construct facility on ${this.currentFacilityPlan.planetName}?\n\n`;
        confirmMessage += `📋 Buildings (${this.currentFacilityPlan.buildings.length}): ${buildingNames.join(', ')}\n\n`;
        confirmMessage += `⏱️ Total Construction Time: ${totalTime} minutes\n`;
        confirmMessage += `👥 Crew: ${facilityStats.totalNeededCrew}/${facilityStats.totalCrewSlots} required/available\n`;
        confirmMessage += `⚡ Power Output: ${facilityStats.totalPower}${facilityStats.totalPower < 0 ? ' ⚠️ NEGATIVE!' : ''}\n`;
        confirmMessage += `📦 Storage: ${facilityStats.totalStorage.toLocaleString()}\n\n`;

        const costEntries = Object.entries(facilityStats.totalCost);
        if (costEntries.length > 0) {
            confirmMessage += `💰 Resources Needed:\n${costEntries.map(([r, a]) => `  • ${r}: ${a}`).join('\n')}\n\n`;
        }

        if (Object.keys(facilityStats.resourceExtraction).length > 0) {
            confirmMessage += `📈 Resource Production:\n${Object.entries(facilityStats.resourceExtraction).map(([r, rate]) =>
                `  • ${r}: +${rate.toFixed(3)}/hour`).join('\n')}\n\n`;
        }

        confirmMessage += `⚠️ This is a simulation - no actual resources will be consumed.`;

        if (confirm(confirmMessage)) {
            let successMessage = `🎉 Facility construction started!\n\n`;
            successMessage += `Buildings are now being constructed on ${this.currentFacilityPlan.planetName}.\n`;
            successMessage += `Estimated completion: ${totalTime} minutes\n`;
            successMessage += `Crew required: ${facilityStats.totalNeededCrew} personnel\n`;
            successMessage += `Power generation: ${facilityStats.totalPower} units${facilityStats.totalPower < 0 ? ' (⚠️ Negative Power!)' : ''}`;

            alert(successMessage);

            // Log construction for reference
            console.log('Facility Construction Started:', {
                planet: this.currentFacilityPlan.planetName,
                system: this.currentFacilityPlan.system.name,
                buildings: this.currentFacilityPlan.buildings,
                facilityStats: facilityStats,
                totalTime: totalTime
            });
        }
    }

    // Show detailed building information in a modal - EXACT GaliaViewer
    showBuildingDetails(buildingId) {
        const building = window.rawBuildingData.buildings.find(b => b.id === buildingId);
        if (!building) {
            console.error('Building not found:', buildingId);
            return;
        }

        // Remove existing detail modal if any
        const existingModal = document.getElementById('buildingDetailModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Construction cost details
        const constructionCostHTML = building.constructionCost ? `
            <div class="details-section" style="margin-bottom: 20px;">
                <h3 style="color: #FF9800; border-bottom: 1px solid #444; padding-bottom: 5px;">Construction Cost</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                    ${Object.entries(building.constructionCost).map(([material, amount]) => `
                        <div style="background: #2a2a3e; padding: 8px; border-radius: 4px;">
                            <span style="font-weight: bold;">${material}</span>
                            <span style="float: right; color: #4CAF50;">${amount}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Resource extraction details
        const extractionHTML = building.resourceExtractionRate ? `
            <div class="details-section" style="margin-bottom: 20px;">
                <h3 style="color: #4CAF50; border-bottom: 1px solid #444; padding-bottom: 5px;">Resource Extraction Rate</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                    ${Object.entries(building.resourceExtractionRate).map(([resource, rate]) => `
                        <div style="background: #2a2a3e; padding: 8px; border-radius: 4px;">
                            <span style="font-weight: bold;">${resource}</span>
                            <span style="float: right; color: #4CAF50;">+${rate}/hour</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Resource consumption details
        const consumptionHTML = building.resourceRate ? `
            <div class="details-section" style="margin-bottom: 20px;">
                <h3 style="color: #f44336; border-bottom: 1px solid #444; padding-bottom: 5px;">Resource Consumption</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                    ${Object.entries(building.resourceRate).map(([resource, rate]) => `
                        <div style="background: #2a2a3e; padding: 8px; border-radius: 4px;">
                            <span style="font-weight: bold;">${resource}</span>
                            <span style="float: right; color: ${rate < 0 ? '#f44336' : '#4CAF50'};">${rate}/hour</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Build enabled features list
        const enabledFeatures = building.addedTags ? building.addedTags.filter(tag => tag.startsWith('enables-')).map(tag =>
            tag.replace('enables-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        ) : [];

        const modalHTML = `
            <div id="buildingDetailModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;">
                <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 90%; overflow-y: auto; min-width: 600px; border: 2px solid #444;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #444; padding-bottom: 10px;">
                        <h2 style="margin: 0; color: #4CAF50;">${building.name}</h2>
                        <button onclick="document.getElementById('buildingDetailModal').remove()"
                                style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                            ✕ Close
                        </button>
                    </div>

                    <div class="building-overview" style="margin-bottom: 20px;">
                        <p style="color: #ccc; font-style: italic; margin-bottom: 15px;">${building.description || 'No description available'}</p>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Tier</div>
                                <div style="font-size: 18px; font-weight: bold; color: #4CAF50;">${building.tier || 'Unknown'}</div>
                            </div>
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Min Tier</div>
                                <div style="font-size: 18px; font-weight: bold; color: #FF9800;">${building.minimumTier || 'N/A'}</div>
                            </div>
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Power</div>
                                <div style="font-size: 18px; font-weight: bold; color: #2196F3;">${building.power || 0}W</div>
                            </div>
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Slots</div>
                                <div style="font-size: 18px; font-weight: bold; color: #9C27B0;">${building.slots || 0}</div>
                            </div>
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Storage</div>
                                <div style="font-size: 18px; font-weight: bold; color: #607D8B;">${(building.storage || 0).toLocaleString()}</div>
                            </div>
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Build Time</div>
                                <div style="font-size: 18px; font-weight: bold; color: #FF5722;">${building.constructionTime || 0}min</div>
                            </div>
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Crew Slots</div>
                                <div style="font-size: 18px; font-weight: bold; color: #795548;">${building.crewSlots || 0}</div>
                            </div>
                            <div style="background: #2a2a3e; padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #aaa;">Crew Needed</div>
                                <div style="font-size: 18px; font-weight: bold; color: #E91E63;">${building.neededCrew || 0}</div>
                            </div>
                        </div>
                    </div>

                    ${constructionCostHTML}
                    ${extractionHTML}
                    ${consumptionHTML}

                    <div class="details-section" style="margin-bottom: 20px;">
                        <h3 style="color: #9C27B0; border-bottom: 1px solid #444; padding-bottom: 5px;">Properties</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                            ${building.comesWithStake ? '<span style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Comes with Stake</span>' : ''}
                            ${building.cannotRemove ? '<span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Cannot Remove</span>' : ''}
                            ${Object.keys(building.resourceExtractionRate || {}).length > 0 ? '<span style="background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Has Resource Extraction</span>' : ''}
                            ${enabledFeatures.length > 0 ? enabledFeatures.map(f => `<span style="background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Enables: ${f}</span>`).join('') : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Get planet type name
    getPlanetTypeName(type) {
        const planetTypes = {
            0: 'Rocky',
            1: 'Gas Giant',
            2: 'Ice',
            3: 'Volcanic',
            4: 'Ocean',
            5: 'Desert',
            6: 'Forest',
            7: 'Barren'
        };
        return planetTypes[type] || 'Unknown';
    }
}

// Initialize when tab is switched
function initializeConstructionTab() {
    if (!window.constructionManager) {
        window.constructionManager = new ConstructionManager();
        window.constructionManager.initializeWithPlanetData();
    }
}

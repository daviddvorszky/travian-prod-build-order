const filenames = [
    'bakery.json',
    'brickyard.json',
    'clay_pit.json',
    'cropland.json',
    'grain_mill.json',
    'iron_foundry.json',
    'iron_mine.json',
    'sawmill.json',
    'woodcutter.json',
    'heros_mansion.json',
];

const villageTypes = Object.freeze({
    wheat_15: 0,
    wheat_9: 1,
    wheat_7_no_wood: 2,
    wheat_7_no_clay: 3,
    wheat_7_no_iron: 4,
    wheat_6: 5,
    wheat_6_wood_no_clay: 6,
    wheat_6_wood_no_iron: 7,
    wheat_6_clay_no_wood: 8,
    wheat_6_clay_no_iron: 9,
    wheat_6_iron_no_wood: 10,
    wheat_6_iron_no_clay: 11,
});

// The order must be the same as the indices in the villageTypes object
const buildingLimits = [
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 1, 'Cropland': 15, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 1, 'Sawmill': 1, 'Woodcutter': 1, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 3, 'Cropland': 9, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, 'Sawmill': 1, 'Woodcutter': 3, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 4, 'Cropland': 7, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, 'Sawmill': 1, 'Woodcutter': 3, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 3, 'Cropland': 7, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, 'Sawmill': 1, 'Woodcutter': 4, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 4, 'Cropland': 7, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, 'Sawmill': 1, 'Woodcutter': 4, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 4, 'Cropland': 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, 'Sawmill': 1, 'Woodcutter': 4, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 3, 'Cropland': 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, 'Sawmill': 1, 'Woodcutter': 5, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 4, 'Cropland': 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, 'Sawmill': 1, 'Woodcutter': 5, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 5, 'Cropland': 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, 'Sawmill': 1, 'Woodcutter': 3, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 5, 'Cropland': 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, 'Sawmill': 1, 'Woodcutter': 4, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 4, 'Cropland': 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 5, 'Sawmill': 1, 'Woodcutter': 3, 'Hero\'s Mansion': 1 },
    { 'Bakery': 1, 'Brickyard': 1, 'Clay Pit': 3, 'Cropland': 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 5, 'Sawmill': 1, 'Woodcutter': 4, 'Hero\'s Mansion': 1 },
];

const maxLevels = {
    'Bakery': 5,
    'Brickyard': 5,
    'Clay Pit': 10,
    'Cropland': 10,
    'Grain Mill': 5,
    'Iron Foundry': 5,
    'Iron Mine': 10,
    'Sawmill': 5,
    'Woodcutter': 10,
    'Hero\'s Mansion': 3,
}

var buildingData = [];
const oases = [
    { "wood": 0, "clay": 0, "iron": 0, "crop": 0 },
    { "wood": 0, "clay": 0, "iron": 0.25, "crop": 0.25 },
    { "wood": 0, "clay": 0, "iron": 0, "crop": 0 },
    { "wood": 0, "clay": 0, "iron": 0, "crop": 0 },
];

function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

async function loadJson(fileName, index) {
    return fetch(`data/${fileName}`)
        .then(response => response.json())
        .catch(error => console.error('Error loading JSON:', error));
}

function setupBuildings(villageType) {
    buildings = []
    for (const buildingType in buildingLimits[villageType]) {
        const limit = buildingLimits[villageType][buildingType];
        for (let i = 0; i < limit; i++) {
            buildings.push({
                type: buildingType,
                level: 0,
                paybackPeriod: Infinity,
                canBeUpgraded: !['Bakery', 'Brickyard', 'Grain Mill', 'Iron Foundry', 'Sawmill'].includes(buildingType)
            });
        }
    }

    // Sort the buildings alphabetically based on the type
    buildings.sort((a, b) => a.type.localeCompare(b.type));

    return buildings;
}

function calculateProduction(buildings, hasBonus = false) {
    const bonus = hasBonus ? 1.25 : 1;
    let woodProduction = 0;
    let clayProduction = 0;
    let ironProduction = 0;
    let cropProduction = 0;
    let woodProductionMultiplier = 1;
    let clayProductionMultiplier = 1;
    let ironProductionMultiplier = 1;
    let cropProductionMultiplier = 1;
    let totalProduction = 0;

    for (let buildingIndex in buildings) {
        const building = buildings[buildingIndex];
        if (building.type == "Woodcutter") {
            woodProduction += buildingData[building.type][building.level].prod;
        } else if (building.type == "Clay Pit") {
            clayProduction += buildingData[building.type][building.level].prod;
        } else if (building.type == "Iron Mine") {
            ironProduction += buildingData[building.type][building.level].prod;
        } else if (building.type == "Cropland") {
            cropProduction += buildingData[building.type][building.level].prod;
        }
    }

    for (let buildingIndex in buildings) {
        const building = buildings[buildingIndex];
        if (building.type == "Sawmill") {
            woodProductionMultiplier += buildingData[building.type][building.level].prod;
        } else if (building.type == "Brickyard") {
            clayProductionMultiplier += buildingData[building.type][building.level].prod;
        } else if (building.type == "Iron Foundry") {
            ironProductionMultiplier += buildingData[building.type][building.level].prod;
        } else if (building.type == "Grain Mill") {
            cropProductionMultiplier += buildingData[building.type][building.level].prod;
        } else if (building.type == "Bakery") {
            cropProductionMultiplier += buildingData[building.type][building.level].prod;
        }
    }

    for (let buildingIndex in buildings) {
        const building = buildings[buildingIndex];
        if (building.type == "Hero's Mansion") {
            for (let level = 0; level <= building.level; level++) {
                woodProductionMultiplier += oases[level].wood;
                clayProductionMultiplier += oases[level].clay;
                ironProductionMultiplier += oases[level].iron;
                cropProductionMultiplier += oases[level].crop;
            }
        }
    }

    woodProduction *= woodProductionMultiplier * bonus;
    clayProduction *= clayProductionMultiplier * bonus;
    ironProduction *= ironProductionMultiplier * bonus;
    cropProduction *= cropProductionMultiplier * bonus;

    totalProduction = woodProduction + clayProduction + ironProduction + cropProduction;

    return totalProduction;
}

function calculatePaybackPeriods(buildings, hasBonus = false) {
    const currentProduction = calculateProduction(buildings, hasBonus);
    buildings.forEach(building => {
        const currentLevel = building.level;
        building.level += 1;
        const newProduction = calculateProduction(buildings, hasBonus);
        building.level = currentLevel;
        const increase = newProduction - currentProduction;
        const cost = buildingData[building.type][building.level + 1].total;
        const paybackHours = cost / increase;
        building.paybackPeriod = paybackHours;
    });
}

function getBuildingWithLowestPaybackPeriod(buildings) {
    calculatePaybackPeriods(buildings);
    const minValidObject = buildings.reduce((min, obj) => {
        if (!obj.canBeUpgraded) return min; // Skip invalid objects
        return (min === null || obj.paybackPeriod < min.paybackPeriod) ? obj : min;
      }, null);
      return minValidObject;
}

function isThereAnyBuildingToUpgrade(buildings) {
    return buildings.some(building => building.canBeUpgraded == true);
}

document.addEventListener("DOMContentLoaded", async function () {
    const content = document.getElementById('content');
    const promises = filenames.map(loadJson);
    const response = await Promise.all(promises);
    for (let dataKey in response) {
        const data = response[dataKey];
        key = Object.keys(data)[0];
        value = data[key];
        buildingData[key] = value;
    }
    const buildings = setupBuildings(villageTypes.wheat_6);
    while(isThereAnyBuildingToUpgrade(buildings)) {
        const toUpgrade = getBuildingWithLowestPaybackPeriod(buildings);
        toUpgrade.level += 1;
        if(toUpgrade.level == maxLevels[toUpgrade.type]){
            toUpgrade.canBeUpgraded = false;
        }
        const buildingName = toUpgrade.type;
        const buildingLevel = buildingName == 'Hero\'s Mansion' ? 'asd' : toUpgrade.level;
        content.innerHTML += `Upgrade ${buildingName} to ${buildingLevel}<br>`;
    }
});

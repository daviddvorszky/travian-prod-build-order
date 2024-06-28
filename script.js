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

const maxLevelsDefault = {
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
};

const herosMansionMap = {
    1: 10,
    2: 15,
    3: 20,
}

var maxLevels = {};

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
            if(building.level == 23){
                console.log(building);
            }
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
        if(!building.canBeUpgraded){
            return;
        }
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

function setOasesValues(){
    const wood1 = document.getElementById("wood1");
    const clay1 = document.getElementById("clay1");
    const iron1 = document.getElementById("iron1");
    const crop1 = document.getElementById("crop1");
    const wood2 = document.getElementById("wood2");
    const clay2 = document.getElementById("clay2");
    const iron2 = document.getElementById("iron2");
    const crop2 = document.getElementById("crop2");
    const wood3 = document.getElementById("wood3");
    const clay3 = document.getElementById("clay3");
    const iron3 = document.getElementById("iron3");
    const crop3 = document.getElementById("crop3");

    oases[1].wood = parseFloat(wood1.value);
    oases[1].clay = parseFloat(clay1.value);
    oases[1].iron = parseFloat(iron1.value);
    oases[1].crop = parseFloat(crop1.value);
    oases[2].wood = parseFloat(wood2.value);
    oases[2].clay = parseFloat(clay2.value);
    oases[2].iron = parseFloat(iron2.value);
    oases[2].crop = parseFloat(crop2.value);
    oases[3].wood = parseFloat(wood3.value);
    oases[3].clay = parseFloat(clay3.value);
    oases[3].iron = parseFloat(iron3.value);
    oases[3].crop = parseFloat(crop3.value);
}

function writeData() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    const villageTypeField = document.getElementById("villageType");
    const villageType = villageTypeField.value;
    const isCapitalCheckbox = document.getElementById('isCapital');
    const isCapital = isCapitalCheckbox.checked;

    maxLevels = structuredClone(maxLevelsDefault);
    if(isCapital){
        maxLevels['Woodcutter'] = 22;
        maxLevels['Clay Pit'] = 22;
        maxLevels['Iron Mine'] = 22;
        maxLevels['Cropland'] = 22;
    }

    setOasesValues();

    const buildings = setupBuildings(villageType);
    while (isThereAnyBuildingToUpgrade(buildings)) {
        const toUpgrade = getBuildingWithLowestPaybackPeriod(buildings);
        toUpgrade.level += 1;
        if (toUpgrade.level == maxLevels[toUpgrade.type]) {
            toUpgrade.canBeUpgraded = false;
        }
        const buildingName = toUpgrade.type;
        const buildingLevel = buildingName == 'Hero\'s Mansion' ? herosMansionMap[toUpgrade.level] : toUpgrade.level;
        content.innerHTML += `Upgrade ${buildingName} to ${buildingLevel}<br>`;
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const promises = filenames.map(loadJson);
    const response = await Promise.all(promises);
    for (let dataKey in response) {
        const data = response[dataKey];
        key = Object.keys(data)[0];
        value = data[key];
        buildingData[key] = value;
    }
    document.getElementById("calculateButton").onclick = writeData;
});

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

const buildingLimits = [
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 1, Cropland: 15, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 1, Sawmill: 1, Woodcutter: 1, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 3, Cropland: 9, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, Sawmill: 1, Woodcutter: 3, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 4, Cropland: 7, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, Sawmill: 1, Woodcutter: 3, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 3, Cropland: 7, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, Sawmill: 1, Woodcutter: 4, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 4, Cropland: 7, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, Sawmill: 1, Woodcutter: 4, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 4, Cropland: 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, Sawmill: 1, Woodcutter: 4, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 3, Cropland: 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, Sawmill: 1, Woodcutter: 5, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 4, Cropland: 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, Sawmill: 1, Woodcutter: 5, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 5, Cropland: 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 4, Sawmill: 1, Woodcutter: 3, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 5, Cropland: 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 3, Sawmill: 1, Woodcutter: 4, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 4, Cropland: 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 5, Sawmill: 1, Woodcutter: 3, "Hero's Mansion": 1 },
    { Bakery: 1, Brickyard: 1, 'Clay Pit': 3, Cropland: 6, 'Grain Mill': 1, 'Iron Foundry': 1, 'Iron Mine': 5, Sawmill: 1, Woodcutter: 4, "Hero's Mansion": 1 },
];

const maxLevelsDefault = {
    Bakery: 5,
    Brickyard: 5,
    'Clay Pit': 10,
    Cropland: 10,
    'Grain Mill': 5,
    'Iron Foundry': 5,
    'Iron Mine': 10,
    Sawmill: 5,
    Woodcutter: 10,
    "Hero's Mansion": 3,
};

const herosMansionMap = {
    1: 10,
    2: 15,
    3: 20,
};

let maxLevels = {};
let buildingData = [];
const oases = [
    { wood: 0, clay: 0, iron: 0, crop: 0 },
    { wood: 0, clay: 0, iron: 0.25, crop: 0.25 },
    { wood: 0, clay: 0, iron: 0, crop: 0 },
    { wood: 0, clay: 0, iron: 0, crop: 0 },
];

const deepcopy = (obj) => JSON.parse(JSON.stringify(obj));

const loadJson = async (fileName) => {
    try {
        const response = await fetch(`data/${fileName}`);
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
};

const setupBuildings = (villageType) => {
    const buildings = [];
    for (const [buildingType, limit] of Object.entries(buildingLimits[villageType])) {
        for (let i = 0; i < limit; i++) {
            buildings.push({
                type: buildingType,
                level: 0,
                paybackPeriod: Infinity,
                canBeUpgraded: !['Bakery', 'Brickyard', 'Grain Mill', 'Iron Foundry', 'Sawmill'].includes(buildingType),
            });
        }
    }

    buildings.sort((a, b) => a.type.localeCompare(b.type));
    return buildings;
};

const calculateProduction = (buildings, hasBonus = false) => {
    const bonus = hasBonus ? 1.25 : 1;
    let woodProduction = 0;
    let clayProduction = 0;
    let ironProduction = 0;
    let cropProduction = 0;
    let woodProductionMultiplier = 1;
    let clayProductionMultiplier = 1;
    let ironProductionMultiplier = 1;
    let cropProductionMultiplier = 1;

    buildings.forEach((building) => {
        const production = buildingData[building.type][building.level]?.prod || 0;
        switch (building.type) {
            case 'Woodcutter':
                woodProduction += production;
                break;
            case 'Clay Pit':
                clayProduction += production;
                break;
            case 'Iron Mine':
                ironProduction += production;
                break;
            case 'Cropland':
                cropProduction += production;
                break;
            case 'Sawmill':
                woodProductionMultiplier += production;
                break;
            case 'Brickyard':
                clayProductionMultiplier += production;
                break;
            case 'Iron Foundry':
                ironProductionMultiplier += production;
                break;
            case 'Grain Mill':
            case 'Bakery':
                cropProductionMultiplier += production;
                break;
            case "Hero's Mansion":
                for (let level = 0; level <= building.level; level++) {
                    woodProductionMultiplier += oases[level].wood;
                    clayProductionMultiplier += oases[level].clay;
                    ironProductionMultiplier += oases[level].iron;
                    cropProductionMultiplier += oases[level].crop;
                }
                break;
        }
    });

    woodProduction *= woodProductionMultiplier * bonus;
    clayProduction *= clayProductionMultiplier * bonus;
    ironProduction *= ironProductionMultiplier * bonus;
    cropProduction *= cropProductionMultiplier * bonus;

    return woodProduction + clayProduction + ironProduction + cropProduction;
};

const calculatePaybackPeriods = (buildings, hasBonus = false) => {
    const currentProduction = calculateProduction(buildings, hasBonus);
    buildings.forEach((building) => {
        if (!building.canBeUpgraded) return;
        const currentLevel = building.level;
        building.level += 1;
        const newProduction = calculateProduction(buildings, hasBonus);
        building.level = currentLevel;
        const increase = newProduction - currentProduction;
        const cost = buildingData[building.type][building.level + 1]?.total || 0;
        const paybackHours = cost / increase;
        building.paybackPeriod = paybackHours;
    });
};

const getBuildingWithLowestPaybackPeriod = (buildings) => {
    calculatePaybackPeriods(buildings);
    return buildings.reduce((min, obj) => {
        if (!obj.canBeUpgraded) return min;
        return (min === null || obj.paybackPeriod < min.paybackPeriod) ? obj : min;
    }, null);
};

const isThereAnyBuildingToUpgrade = (buildings) => buildings.some(building => building.canBeUpgraded);

const setOasesValues = () => {
    oases[1].wood = parseFloat(document.getElementById("wood1").value);
    oases[1].clay = parseFloat(document.getElementById("clay1").value);
    oases[1].iron = parseFloat(document.getElementById("iron1").value);
    oases[1].crop = parseFloat(document.getElementById("crop1").value);
    oases[2].wood = parseFloat(document.getElementById("wood2").value);
    oases[2].clay = parseFloat(document.getElementById("clay2").value);
    oases[2].iron = parseFloat(document.getElementById("iron2").value);
    oases[2].crop = parseFloat(document.getElementById("crop2").value);
    oases[3].wood = parseFloat(document.getElementById("wood3").value);
    oases[3].clay = parseFloat(document.getElementById("clay3").value);
    oases[3].iron = parseFloat(document.getElementById("iron3").value);
    oases[3].crop = parseFloat(document.getElementById("crop3").value);
};

const writeData = () => {
    const content = document.getElementById('content');
    content.innerHTML = '';
    const villageType = document.getElementById("villageType").value;
    const isCapital = document.getElementById('isCapital').checked;

    maxLevels = { ...maxLevelsDefault };
    if (isCapital) {
        maxLevels.Woodcutter = 22;
        maxLevels['Clay Pit'] = 22;
        maxLevels['Iron Mine'] = 22;
        maxLevels.Cropland = 22;
    }

    setOasesValues();
    const buildings = setupBuildings(villageType);

    while (isThereAnyBuildingToUpgrade(buildings)) {
        const toUpgrade = getBuildingWithLowestPaybackPeriod(buildings);
        toUpgrade.level += 1;
        if (toUpgrade.level === maxLevels[toUpgrade.type]) {
            toUpgrade.canBeUpgraded = false;
        }
        const buildingName = toUpgrade.type;
        const buildingLevel = buildingName === "Hero's Mansion" ? herosMansionMap[toUpgrade.level] : toUpgrade.level;
        content.innerHTML += `Upgrade ${buildingName} to ${buildingLevel}<br>`;
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    const promises = filenames.map(loadJson);
    const response = await Promise.all(promises);
    response.forEach(data => {
        const [key, value] = Object.entries(data)[0];
        buildingData[key] = value;
    });
    document.getElementById("calculateButton").onclick = writeData;
});

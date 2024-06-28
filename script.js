files = [
    'bakery.json',
    'brickyard.json',
    'clay_pit.json',
    'cropland.json',
    'grain_mill.json',
    'iron_foundry.json',
    'iron_mine.json',
    'sawmill.json',
    'woodcutter.json',
    'heros_mansion.json'
]

function addTable(data) {
    const content = document.getElementById('content');
    //content.innerHTML = '';  // Clear any existing content

    // Function to create and append a table to the content div
    function createTable(data, tableName) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Extract headers dynamically
        const firstKey = Object.keys(data[0])[0];
        const headers = Object.keys(data[0][firstKey][0]);

        // Create table headers
        const headerRow = document.createElement('tr');
        const tableHeader = document.createElement('th');
        tableHeader.textContent = tableName;
        headerRow.appendChild(tableHeader);

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create table rows from JSON data
        data.forEach(entry => {
            for (let level in entry) {
                if (entry.hasOwnProperty(level)) {
                    const levelData = entry[level][0];
                    const row = document.createElement('tr');

                    const levelCell = document.createElement('td');
                    levelCell.textContent = level;
                    row.appendChild(levelCell);

                    headers.forEach(header => {
                        const cell = document.createElement('td');
                        cell.textContent = levelData[header];
                        row.appendChild(cell);
                    });

                    tbody.appendChild(row);
                }
            }
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        content.appendChild(table);
    }

    // Iterate over each key in the JSON object and create a table for each
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            createTable(data[key], key);
        }
    }
}

function loadJson(fileName, index) {
    fetch(`data/${fileName}`)
        .then(response => response.json())
        .then(data => {
            addTable(data);
        })
        .catch(error => console.error('Error loading JSON:', error));
}

document.addEventListener("DOMContentLoaded", function () {
    files.forEach(loadJson);
});

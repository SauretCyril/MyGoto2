function closeCSVTable() {
    window.close();
}

function addFilterRow(table) {
    const thead = table.querySelector('thead');
    const filterRow = document.createElement('tr');
    const columns = table.querySelectorAll('thead th');
    columns.forEach((col, index) => {
        const filterCell = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Filter';
        input.oninput = function() {
            filterCSVTable(table, index, input.value);
        };
        filterCell.appendChild(input);
        filterRow.appendChild(filterCell);
    });
    thead.appendChild(filterRow);
}

function filterCSVTable(table, colIndex, filterValue) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cell = row.querySelector(`td:nth-child(${colIndex + 1})`);
        if (cell) {
            const cellValue = cell.textContent.toLowerCase();
            if (cellValue.includes(filterValue.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function saveCSVData(table, filePath) {
    const data = [];
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            rowData[headers[index]] = cell.textContent;
        });
        data.push(rowData);
    });
    eel.save_    git diff --name-only {commit_id}csv_file(filePath, data)();
}

// Load CSV file when the page loads
window.addEventListener('load', function() {
    const params = new URLSearchParams(window.location.search);
    const filePath = params.get('file');
    if (filePath) {
        eel.read_csv_file(filePath)().then(data => {
            const tableContainer = document.getElementById('csv-table-container');
            const table = document.createElement('table');
            table.classList.add('csv-table');

            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            if (data.length > 0) {
                Object.keys(data[0]).forEach(key => {
                    const th = document.createElement('th');
                    th.textContent = key;
                    headerRow.appendChild(th);
                });
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            data.forEach(row => {
                const tr = document.createElement('tr');
                Object.values(row).forEach(value => {
                    const td = document.createElement('td');
                    td.contentEditable = true; // Permettre la saisie de valeurs
                    td.textContent = value;
                    td.addEventListener('blur', () => saveCSVData(table, filePath)); // Enregistrer les modifications
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            // Clear existing content and append the new table
            tableContainer.innerHTML = '';
            tableContainer.appendChild(table);

            // Add filter row
            addFilterRow(table);
        }).catch(error => {
            console.error('Error reading CSV file:', error);
        });
    }
});
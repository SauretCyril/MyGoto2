// document.querySelectorAll('.url-cell a').forEach(link => {
//     link.addEventListener('click', (e) => {
//         e.preventDefault();
//         const url = link.href;
//         eel.openUrl(url);  // Call the Python function
//     });
// });


// Add status tooltips
/* document.querySelectorAll('.status-badge').forEach(badge => {
    badge.title = `Dernier changement: ${new Date().toLocaleDateString()}`;
}); */

// Declare the global array
window.tabActive = "Campagne";
window.annonces = [];
window.columns = [
    { key: 'dossier', editable: false, width: '80px', visible: true, type: 'tb' },
    { 
        key: 'description', 
        class: 'description-cell', 
        editable: false, 
        style: { cursor: 'pointer', color: 'blue', textDecoration: 'underline' }, 
        event: 'click', 
        eventHandler: 'openUrlHandler', // Store function name as string
        width: '200px',
        visible: true,
        type: 'tb' 
    },
    { key: 'id', editable: true, width: '100px',"visible":true,"type":"tb"  },
    { key: 'entreprise', editable: true, width: '150px',"visible":true ,"type":"tb" },
    { key: 'categorie', editable: true, class: 'category-badge', prefix: 'category-', width: '200px',"visible":true,"type":"tb"  },
    { key: 'etat', editable: true, width: '95px',"visible":true ,"type":"tb" },
    { key: 'Date', editable: true, default: 'N/A', width: '120px',"visible":true ,"type":"tb" },
    { key: 'todo', editable: true, width: '180px',"visible":true ,"type":"tb" },
    { key: 'tel', editable: true, width: '125px',"visible":true ,"type":"tb" },
    { key: 'contact', editable: true, width: '150px',"visible":true ,"type":"tb" },
    { key: 'Commentaire', editable: true, width: '150px',"visible":false,"type":"tb"  },
    { key: 'url', editable: false, width: '100px',"visible":false ,"type":"tb" },
    { key: 'type', editable: true, width: '80px',"visible":false ,"type":"tb" },
    { key: 'annonce_pdf', editable: true, width: '80px',"visible":false ,"type":"tb" },
    { key: 'type_question', editable: true, width: '80px',"visible":false ,"type":"tb" },
    { key: 'lien_Etape', editable: true, width: '80px',"visible":false ,"type":"tb" },
    { key: 'GptSum', editable: true, width: '80px',"visible":true ,"type":"tb" }
];
/**
 * Saves the current configuration of columns.
 * Serializes the columns and sends them to the backend for saving.
 */
function save_config_col() {
    const serializedColumns = serializeColumns(window.columns);
    eel.save_config_col(serializedColumns, window.tabActive);
}
//save_config_col();

function openUrlHandler(item) {
    if (item.url) {
        eel.openUrl(item.url);
    }
}


// Example usage
function loadTableData(callback) {
    //loadColumnsFromJson();
    reassignEventHandlers(window.columns);
    //reassignEventHandlers(window.columns);
    generateTableHeaders();
    eel.read_annonces_json()()
        .then(data => {
           

            // Store the data in the global array
            window.annonces = data;
           
            const tableBody = document.getElementById('table-body');
            if (!tableBody) {
                throw new Error('Element with id "table-body" not found.');
            }

            tableBody.innerHTML = ''; // Clear existing rows

            const categories = new Set();
            const etats = new Set();
            const todos = new Set();
            const types = new Set();
            window.annonces.forEach((itemWrapper, index) => {
                const filePath = Object.keys(itemWrapper)[0];
                const item = itemWrapper[filePath];
                const dir_path = filePath.substring(0, filePath.lastIndexOf('/'));
                const isCvRef = item.Commentaire && item.Commentaire.includes('<CV-REF>');
                const fichier_annonce = dir_path + '/' + item.dossier+"_annonce_.pdf";
                const row = document.createElement('tr');
                row.id = filePath;
                row.style.position = 'relative'; // Ajout du positionnement relatif sur la ligne
// forEach((col
                window.columns.forEach((col, colIndex) => {
                    if (col.type === "tb" && col.visible === true) {
                        const cell = document.createElement('td');
                        isurl = false;
                        isresumGpt = false;
                        if (col.key === 'GptSum' && item.hasOwnProperty('GptSum') && item.GptSum=="True") { 
                            isresumGpt = true; 
                        }
                        
                        
                        if (col.key === 'description' && item.url) { isurl = true; }

                        if (isurl ) {
                            cell.style.cursor = col.style.cursor;
                            cell.style.color = col.style.color;
                            cell.style.textDecoration = col.style.textDecoration;
                            cell.addEventListener(col.event, () => col.eventHandler(item));
                        } 
                        else {
                            cell.style.color = ''; // Default color
                            cell.style.textDecoration = ''; // Default text decoration
                        }
                        cell.textContent = item[col.key] || col.default || '';
                        if (col.class) cell.classList.add(col.class);
                        //if (col.prefix) cell.classList.add(`${col.prefix}${item[col.key].replace(/\s+/g, '-')}`);
                        if (col.editable) cell.contentEditable = "true";
                        if (col.width) cell.style.width = col.width;

                        cell.onblur = () => updateAnnonces(index, col.key, cell.textContent);
                      
                        row.appendChild(cell);
                       
                    }
                });
                
                if (isCvRef) {
                    row.style.backgroundColor = '#8be28b';
                }
                eel.file_exists(fichier_annonce)().then(exists => {
                    if (exists) {
                        const attachmentIcon = document.createElement('span');
                        attachmentIcon.classList.add('attachment-icon');
                        if (item.GptSum=="True") {
                            attachmentIcon.textContent = '😊'; // Remplacer par une icône sourire
                        }
                        else {
                            attachmentIcon.textContent = '📎';
                        }
                        
                        attachmentIcon.style.position = 'absolute';
                        attachmentIcon.style.left = '0px'; // Ajusté pour être visible sur le côté gauche
                        attachmentIcon.style.top = '50%';
                        attachmentIcon.style.transform = 'translateY(-55%)';
                        attachmentIcon.style.zIndex = '1'; // Assure que l'icône est au-dessus du contenu
                        
                        // Ajouter l'icône au premier td de la ligne plutôt qu'à la ligne elle-même
                        const firstCell = row.firstChild;
                        if (firstCell) {
                            firstCell.style.position = 'relative';
                            firstCell.appendChild(attachmentIcon);
                        }
                    }
                })
                
                
                //tableBody.appendChild(row);

                row.addEventListener('contextmenu', function(e) 
                {
                    e.preventDefault();
                    const contextMenu = document.getElementById('contextMenu');
                    contextMenu.style.display = 'block';
                    contextMenu.style.left = e.pageX + 'px';
                    contextMenu.style.top = e.pageY + 'px';
                    contextMenu.dataset.targetRow = row.id;

                    document.getElementById('EditRow').onclick = () => {
                        const rowId = contextMenu.dataset.targetRow;
                        set_current_row(rowId);
                        openEditModal(row.id);
                        contextMenu.style.display = 'none';
                    };
                   /*  document.getElementById('CtrlRow').onclick = () => {
                        const rowId = contextMenu.dataset.targetRow;
                        set_current_row(rowId);
                        get_status_qualif(rowId);
                        contextMenu.style.display = 'none';
                    }; */
                    document.getElementById('SetCurrentRow').onclick = () => {
                        const rowId = contextMenu.dataset.targetRow;
                        set_current_row(rowId);
                        contextMenu.style.display = 'none';
                    };
                    document.getElementById('Open').onclick = () => {
                        
                        open_dir(filePath);
                        set_current_row(rowId);
                        //set_current_row(rowId);
                        contextMenu.style.display = 'none';
                    };
                    // document.getElementById('Question').onclick = () => {
                    //     const rowId = contextMenu.dataset.targetRow;
                    //     set_current_row(rowId);
                    //     const isResq='Ok';
                    //     let typeQ="pdf";
                        
                    //      // Correction ici
                    //    /* 
                    //     AIQ(typeQ, fichier_annonce, item);
                    //     if(item.type_question=="url"){
                    //         typeQ="url";
                    //         lien=item.url;
                    //     } */
                    //     //alert("Question sur : "+fichier);
                    //     AIQ(typeQ,fichier,item);
                    //     contextMenu.style.display = 'none';
                    // };


                    document.getElementById('Delete').onclick = () => {
                 
                        if (confirm("Voulez-vous vraiment supprimer ce dossier ?")) {
                               updateAnnonces(index, 'etat', 'DELETED');
                            // Update the 'etat' column in the HTML row
                            const etatCell = row.querySelector('td:nth-child(' + (window.columns.findIndex(col => col.key === 'etat') + 1) + ')');
                            if (etatCell) {
                                etatCell.textContent = 'DELETED';
                            }
                            }
                        };
                    document.getElementById('Repondue').onclick = () => {
                        const rowId = contextMenu.dataset.targetRow;
                        if (confirm("Vous avez répondu :")) {
                                   
                            // Update the 'etat' column in the HTML row
                            UpdateState(rowId,'etat','close');
                            UpdateState(rowId,'todo','Répondue');
                           
                            }
                        };
                });
                tableBody.appendChild(row);

                categories.add(item.categorie);
                etats.add(item.etat);
                todos.add(item.todo);
                types.add(item.type);
            });
         
            // Populate the filter-categorie dropdown
            const filterCategorie = document.getElementById('select-categorie');
            if (filterCategorie){
                categories.forEach(categorie => {
                    const option = document.createElement('option');
                    option.value = categorie;
                    option.textContent = categorie;
                    filterCategorie.appendChild(option);
                });
             }

            // Populate the filter-etat dropdown
            const filterEtat = document.getElementById('select-etat');
            if (filterEtat){
                etats.forEach(etat => {
                    const option = document.createElement('option');
                    option.value = etat;
                    option.textContent = etat;
                    filterEtat.appendChild(option);
                });
            }

            // Populate the filter-todo dropdown
            
            const filterTodo = document.getElementById('select-todo');
            if (filterTodo){
                todos.forEach(todo => {
                    const option = document.createElement('option');
                    option.value = todo;
                    option.textContent = todo;
                    filterTodo.appendChild(option);
                });
            }   

          
            const filterTypes = document.getElementById('select-type');
            if (filterTypes){
                types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    filterTypes.appendChild(option);
                });
            }
            eel.read_filters_json(window.tabActive)() // Ensure this function is defined in Python
            .then(filters => {
                console.log('db67-Filter values loaded:', filters);
                if (filters) {
                    updateFilterValues(filters);  // Update filter input fields
                    filterTable();  // Trigger table filtering
                }
            })
            .catch(error => {
                console.error('Error loading filter values:', error);
            });
            
           /*  loadFilterValues(function() {
                filterTable();
            }); */
            
            // Execute the callback if provided
         
        })
      /*   .catch(error => {
            console.error('Error loading table data:', error);
        }); */
    // Cacher le menu contextuel lors d'un clic ailleurs
    document.addEventListener('click', function() {
        document.getElementById('contextMenu').style.display = 'none';
    });
}
function getStatus(filepath){
    return "Toto";
}

// Function to filter table rows based on input values
function filterTable() {
    const filters = {};
    // Collect filter values
    window.columns.forEach(col => {
        if (col.type === "tb" && col.visible === true) {
            const filterElement = document.getElementById(`filter-${col.key}`);
            if (filterElement) {
                filters[col.key] = filterElement.value.toLowerCase();
            }
        }
    });

    const rows = document.querySelectorAll('#table-body tr');
    console.log(`Filter for ${rows.length} rows...`);
    rows.forEach(row => {
        let shouldDisplay = true;
        // Check each cell against the filter
        window.columns.forEach(col => {
            if (col.type === "tb" && col.visible === true) {
                const cellIndex = window.columns.findIndex(c => c.key === col.key);
                const cell = row.querySelector(`td:nth-child(${cellIndex + 1})`);
                if (cell) {
                    const cellValue = cell.textContent.toLowerCase();
                    const filterValue = filters[col.key];
                    console.log(`Cell value for ${col.key}: ${cellValue}, Filter value: ${filterValue}`);
                    if (filterValue && !cellValue.includes(filterValue)) {
                        shouldDisplay = false;
                    }
                }
            }
        });
        row.style.display = shouldDisplay ? '' : 'none';
    });

    // Save filter values to JSON file
    saveFilterValues(filters);
}

// Function to update the global array when a cell is edited
function updateAnnonces(index, key, value) {
    const filePath = Object.keys(window.annonces[index])[0];
    window.annonces[index][filePath][key] = value;
    //console.log(`Updated window.annonces[${index}][${filePath}][${key}] to ${value}`);
    
}

function UpdateState(rowId,col,value) {
    const selectedRow = document.getElementById(rowId);
    const Cell = selectedRow.querySelector('td:nth-child(' + (window.columns.findIndex(col => col.key === col) + 1) + ')');
                            if (Cell) {
                                Cell.textContent = value;
                                //updateAnnonces(index, col, value);
                            }
}

function refresh()
{
    saveTableData()
        .then(() => {
            //console.log('Save completed, now loading table data...');
            loadTableData();
        })
        .catch(error => {
            console.error('Error during refresh:', error);
        });
}
// Function to save the global array to the JSON file
function saveTableData() {
    return new Promise((resolve, reject) => {
       
        eel.save_annonces_json(window.annonces)()
            .then(() => {
                //console.log('Data successfully saved.');
                resolve();
            })
            .catch(error => {
                console.error('Error saving data:', error);
                reject(error);
            });
    });
}




function saveFilterValues(filters) {
    eel.save_filters_json(filters,window.tabActive)()
        .then(() => {
            //console.log('Filter values successfully saved.');
        })
        .catch(error => {
            console.error('Error saving filter values:', error);
        });
}


function updateFilterValues(filters) {
    //console.log('Filters object:', typeof(filters), filters); // Vérifier le format de filters
    // Itérer directement sur les clés de l'objet filters

    // forEach((col =W
    for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
            //console.log(`Filter value for ${key}:`, filters[key]); 
            const filterElement = document.getElementById(`filter-${key}`);
            const selectElement = document.getElementById(`select-${key}`);
            if (filterElement) {
                filterElement.value = filters[key] || '';
                //console.log(`Filter value for ${key}:`, filterElement.value); // Add console.log
            }
            if (selectElement) {
                const option = document.createElement('option');
                option.value = filters[key];
                option.textContent = filters[key];
                selectElement.appendChild(option);
                selectElement.value = filters[key];
            }
        }
    }
}

// Function to load filter values from JSON file and update input fields
function  loadFilterValues() {
    eel.read_filters_json()  // Corrected syntax
        .then(filters => {
            //console.log('Filter values loaded:', filters);
            updateFilterValues(filters);
           
        })
        .catch(error => {
            console.error('Error loading filter values:', error);
        });
}
/* 
function editRow(row) {
    // Rendre toutes les cellules éditables temporairement
    Array.from(row.cells).forEach(cell => {
        if (!cell.classList.contains('description-cell')) {
            cell.contentEditable = true;
            cell.focus();
        }
    });
}

 */

function openEditModal(rowId) {
    // Find the annonce data
    const index = window.annonces.findIndex(a => Object.keys(a)[0] === rowId);
    if (index === -1) return;
    const annonce = window.annonces[index][rowId];

    // Définir les groupes d'onglets
    const tabGroups = {
        'Informations principales': ['dossier', 'description', 'id', 'entreprise', 'categorie'],
        'Statut et suivi': ['etat', 'Date' ,'url','todo','lien_Etape'],
        'Contact': ['tel', 'contact'],
        'Détails': ['Commentaire', 'type', 'type_question'], 
        'GPT': ['GptSum']
    };
//'annonce_pdf'
    // Create modal HTML with tabs
    let modalHtml = `
        <dialog id="editModal" class="edit-modal">
            <form method="dialog">
                <h2>Modifier l'annonce</h2>
                <div class="edit-tabs">
                    ${Object.keys(tabGroups).map((tabName, index) => `
                        <button type="button" class="tab-button ${index === 0 ? 'active' : ''}" 
                                onclick="switchEditTab(event, '${tabName}')">${tabName}</button>
                    `).join('')}
                </div>

                ${Object.entries(tabGroups).map(([tabName, fields], index) => `
                    <div id="${tabName}" class="tab-content ${index === 0 ? 'active' : ''}">
                        ${fields.map(field => `
                            <div class="form-group">
                                <label>${field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                                <input type="text" id="edit-${field}" value="${annonce[field] || ''}" 
                                       ${field === 'dossier' ? 'readonly' : ''}>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}

                <div class="button-group">
                    <button type="button" onclick="saveEdit('${rowId}')">Enregistrer</button>
                    <button type="button" onclick="cancelEdit()">Annuler</button>
                </div>
            </form>
        </dialog>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = document.getElementById('editModal');
    modal.showModal();
}

function switchEditTab(event, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let content of tabContents) {
        content.classList.remove('active');
    }

    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let button of tabButtons) {
        button.classList.remove('active');
    }

    // Show the selected tab content and activate the button
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

function saveEdit(rowId) {
    // Ensure the index is correct
    const index = window.annonces.findIndex(a => Object.keys(a)[0] === rowId);
    if (index === -1) return;
    const annonce = window.annonces[index][rowId];

    // Update annonce with new values based on window.columns
    window.columns.forEach(col => {
        const inputElement = document.getElementById(`edit-${col.key}`);
        if (inputElement) {
            annonce[col.key] = inputElement.value;
        }
    });

    // Save changes and refresh table
    refresh();
  

    // Close modal
    document.getElementById('editModal').close();
}

function cancelEdit() {
    document.getElementById('editModal').close();
}



function set_current_row(rowId) {
    // Reset the background color of all rows
    document.querySelectorAll('#table-body tr').forEach(row => {
        row.style.backgroundColor = ''; // Reset to original color
    });

    // Set the backgr/* ound color of the selected row to light blue
    const selectedRow = document.getElementById(rowId);
    if (selectedRow) {
        selectedRow.style.backgroundColor = 'lightblue';
    }
}

function generateTableHeaders() {
    const thead = document.querySelector('thead tr');
    const filterRow = document.querySelector('thead tr:nth-child(2)');
    // Clear existing headers
    thead.innerHTML = '';
    filterRow.innerHTML = '';
    
// forEach((col
    window.columns.forEach(col => {
        if (col.type === "tb" && col.visible === true) {
            // Create header cell
            const th = document.createElement('th');
            th.style.width = col.width;
            th.classList.add('filter-cell');
            th.textContent = col.key.charAt(0).toUpperCase() + col.key.slice(1);
            thead.appendChild(th);

            // Create filter cell
            const filterCell = document.createElement('th');
            
            filterCell.classList.add('filter-cell');
            if (col.key === 'categorie' || col.key === 'etat' || col.key === 'todo' || col.key === 'type') {
                const container = document.createElement('div');
                container.classList.add('filter-container');

                const input = document.createElement('input');
                input.type = 'text';
                input.id = `filter-${col.key}`;
                input.placeholder = 'Filter';
                container.appendChild(input);

                const select = document.createElement('select');
                select.id = `select-${col.key}`;
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'All';
                select.appendChild(option);
                container.appendChild(select);

                filterCell.appendChild(container);

                input.addEventListener('input', filterTable);
                select.addEventListener('change', () => {
                    input.value = select.value;
                    filterTable();
                });
            } else {
                const input = document.createElement('input');
                input.classList.add('filter-container')
                input.type = 'text';
                input.id = `filter-${col.key}`;
                input.placeholder = 'Filter';
                filterCell.appendChild(input);
                input.addEventListener('input', filterTable);
            }
            filterCell.classList.add('filter-cell');
            filterRow.appendChild(filterCell);
        }
    });

    // Add status header and filter cell
    const statusHeader = document.createElement('th');
    statusHeader.classList.add('header');
    // statusHeader.textContent = 'Status';
    thead.appendChild(statusHeader);

    const statusFilterCell = document.createElement('th');
    
}

function setNewTab(){
    const activeTab = document.querySelector('.tab.active');
    window.tabActive=activeTab.textContent;
}

function changeTab(tabName) {
    // Remove 'active' class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // Add 'active' class to the clicked tab
    document.querySelector(`.tab[onclick="changeTab('${tabName}')"]`).classList.add('active');
  
    setNewTab();
    refresh();
}

// Function to generate the column visibility form
function generateColumnVisibilityForm() {
    const formHtml = `
        <dialog id="columnVisibilityModal" class="modal">
            <form id="columnVisibilityForm">
                <h3>Manage Column Visibility</h3>
                ${window.columns.map((col, index) => `
                    <div>
                        <input type="checkbox" id="col-${index}" ${col.visible ? 'checked' : ''}>
                        <label for="col-${index}">${col.key.charAt(0).toUpperCase() + col.key.slice(1)}</label>
                    </div>
                `).join('')}
                <button type="button" onclick="saveColumnVisibility()">Save</button>
                <button type="button" onclick="toggleColumnVisibilityForm()">Close</button>
            </form>
        </dialog>
    `;
    document.body.insertAdjacentHTML('beforeend', formHtml);
}

// Function to save column visibility settings
function saveColumnVisibility() {
    window.columns.forEach((col, index) => {
        const checkbox = document.getElementById(`col-${index}`);
        if (checkbox) {
            col.visible = checkbox.checked;
        }
    });
    save_config_col(window.columns);
    
    toggleColumnVisibilityForm(); // Close the modal after saving
}

// Function to toggle the visibility of the column visibility form
function toggleColumnVisibilityForm() {
    const modal = document.getElementById('columnVisibilityModal');
    if (modal) {
        if (modal.open) {
            modal.close();
        } else {
            modal.showModal();
        }
    }
}

// Call the function to generate the form when the page loads
window.addEventListener('load', function() {
    setNewTab();
    //setNewTab();
    
    loadTableData(function() {
        //console.log('Table data loaded and callback executed.');
        // Add any additional code to execute after loading table data here
    });
});

// ...existing code...


// Function to serialize columns
function serializeColumns(columns) {
    return columns.map(col => {
        const serializedCol = {};
        for (const key in col) {
            if (col.hasOwnProperty(key)) {
                serializedCol[key] = col[key];
            }
        }
        if (typeof col.eventHandler === 'function') {
            serializedCol.eventHandler = col.eventHandler.name;
        }
        return serializedCol;
    });
}



// Modify save_config_col to use serializeColumns
function save_config_col() {
    const serializedColumns = serializeColumns(window.columns);
    eel.save_config_col(serializedColumns, window.tabActive);
}

// Modify loadColumnsFromJson to use deserializeColumns
function loadColumnsFromJson() {
    eel.load_config_col(window.tabActive)()
        .then(data => {
            const mcolumns = JSON.parse(data);
            window.columns = deserializeColumns(mcolumns);
            reassignEventHandlers(window.columns);
            generateTableHeaders();
            generateColumnVisibilityForm();
        })
        .catch(error => {
            console.error('Error loading column configuration:', error);
        });
}
// Function to reassign event handlers after deserialization
function reassignEventHandlers(columns) {
    columns.forEach(col => {
        if (col.eventHandler === 'openUrlHandler') {
            col.eventHandler = openUrlHandler;
        }
        // Add more handlers as needed
    });
}


// Function to deserialize columns
function deserializeColumns(columns) {
    return columns.map(col => {
        const deserializedCol = {};
        for (const key in col) {
            if (col.hasOwnProperty(key)) {
                deserializedCol[key] = col[key];
            }
        }
        if (col.eventHandler === 'openUrlHandler') {
            deserializedCol.eventHandler = openUrlHandler;
        }
        // Add more handlers as needed
        return deserializedCol;
    });
}
// ...existing code...
function open_dir(filepath){
    eel.open_parent_directory(filepath);

}

function delete_dir(dir_path){
    eel.delete_directory(dir_path);

}

function getFilePathFromRowId(rowId) {
    // Implémentez cette fonction pour obtenir le chemin du fichier à partir de l'ID de la ligne
    // Par exemple :
    return document.querySelector(`#row-${rowId}`).dataset.filePath;
}

function AIQ(ispdf, value, oneitem) {
    const params = new URLSearchParams();
    params.append('ispdf', ispdf);
    params.append('value', encodeURIComponent(value));
    params.append('description', encodeURIComponent(oneitem.description));
   
    window.open(`qa.html?${params.toString()}`, '_blank');
}

// Function to open the log window
function openLogWindow() {
    const logWindowHtml = `
        <dialog id="logWindow" class="log-window">
            <h2>Logs</h2>
            <pre id="logContent"></pre>
            <button onclick="closeLogWindow()">Close</button>
        </dialog>
    `;
    document.body.insertAdjacentHTML('beforeend', logWindowHtml);
    const logWindow = document.getElementById('logWindow');
    logWindow.showModal();
}

// Function to close the log window
function closeLogWindow() {
    const logWindow = document.getElementById('logWindow');
    if (logWindow) {
        logWindow.close();
        logWindow.remove();
    }
}

// Function to update the log content
function updateLogContent(log) {
    const logContent = document.getElementById('logContent');
    if (logContent) {
        logContent.textContent += log + '\n';
    }
}

// Redirect JavaScript console logs to the log window
console.log = (function (oldLog) {
    return function (message) {
        oldLog(message);
        updateLogContent(message);
    };
})(console.log);

// Function to fetch Python logs
function fetchPythonLogs() {
    eel.get_python_logs()().then(logs => {
        updateLogContent(logs);
    });
}

// Call fetchPythonLogs periodically
setInterval(fetchPythonLogs, 5000);

// ...existing code...

function loadCSVFile(filePath) {
    eel.read_csv_file(filePath)().then(data => {
        displayCSVTable(data);
    }).catch(error => {
        console.error('Error reading CSV file:', error);
    });
}

function displayCSVTable(data) {
    const tableContainer = document.getElementById('csv-table-container');
    if (!tableContainer) {
        console.error('Element with id "csv-table-container" not found.');
        return;
    }

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
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Clear existing content and append the new table
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

function openCSVTable(filePath) {
    const params = new URLSearchParams();
    params.append('file', filePath);
    window.open(`csv_table.html?${params.toString()}`, '_blank');
}

// Add menu
function createMenu() {
    const menu = document.createElement('div');
    menu.id = 'menu';
    menu.innerHTML = `
        <button onclick="openCSVTable('Suivi_annonce_apec.csv')">Load CSV File</button>
    `;
    document.body.insertBefore(menu, document.body.firstChild);
}

// Call createMenu on page load
window.addEventListener('load', function() {
    createMenu();
    // ...existing code...
});

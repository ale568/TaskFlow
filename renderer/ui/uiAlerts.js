async function initializeAlertsView() {
    console.log("🚨 Inizializzazione Alerts View...");

    // Carica solo la tabella
    await loadAlertsData();

    // Associa modale/eventi se non già inizializzati
    if (!window.alertsModalInitialized) {
        setupAlertModal();
        window.alertsModalInitialized = true; // evita doppia inizializzazione
    }
}

function setupAlertModal() {
    const modal = document.getElementById("alertModal");
    const openBtn = document.getElementById("addAlertBtn");
    const saveBtn = document.getElementById("saveAlertBtn");
    const cancelBtn = document.getElementById("cancelAlertBtn");

    const titleInput = document.getElementById("alertTitleInput");
    const dateInput = document.getElementById("alertDateInput");

    const projectBtn = document.getElementById("alertProjectBtn");
    const projectMenu = document.getElementById("alertProjectMenu");

    const typeBtn = document.getElementById("alertTypeBtn");
    const typeMenu = document.getElementById("alertTypeMenu");

    const priorityBtn = document.getElementById("alertPriorityBtn");
    const priorityMenu = document.getElementById("alertPriorityMenu");

    let selectedProjectId = null;
    let selectedType = null;
    let selectedPriority = null;
    let alertSelectedDate = null;
    let isEditing = false;
    let editingAlertId = null;


    // Popola progetti
    window.electronAPI.getAllProjects().then(projects => {
        projectMenu.innerHTML = "";
        projects.forEach(p => {
            const li = document.createElement("li");
            li.textContent = p.name;
            li.dataset.value = p.id;
            li.addEventListener("click", () => {
                selectedProjectId = p.id;
                projectBtn.textContent = p.name;
                projectMenu.classList.add("hidden");
            });
            projectMenu.appendChild(li);
        });
    });

    // Dropdown toggle
    projectBtn.addEventListener("click", () => projectMenu.classList.toggle("hidden"));
    typeBtn.addEventListener("click", () => typeMenu.classList.toggle("hidden"));
    priorityBtn.addEventListener("click", () => priorityMenu.classList.toggle("hidden"));

    // Dropdown selezione
    typeMenu.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            selectedType = item.dataset.value;
            typeBtn.textContent = item.textContent;
            typeMenu.classList.add("hidden");
        });
    });

    priorityMenu.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            selectedPriority = item.dataset.value;
            priorityBtn.textContent = item.textContent;
            priorityMenu.classList.add("hidden");
        });
    });

    // Date picker
    const datepicker = new AirDatepicker('#alertDateInput', {
        defaultDate: new Date(),
        timepicker: true,
        dateFormat: 'yyyy-MM-dd HH:mm',
        locale: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            months: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        timeFormat: 'HH:mm',
        minutesStep: 5,
        autoClose: true,
        position: 'top left',
        navTitles: {
            days: 'MMMM yyyy'
        },
        onSelect({ date }) {
            alertSelectedDate = date;
            console.log("📆 Data selezionata dal picker:", date);
        }
    });

    openBtn.addEventListener("click", () => modal.classList.remove("hidden"));

    cancelBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        resetAlertModalFields();
    });

    saveBtn.addEventListener("click", async () => {
        const title = titleInput.value;
        
        const selectedDate = alertSelectedDate;

        const isoDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
        ? selectedDate.toISOString()
        : null;

        if (!title || !selectedProjectId || !selectedType || !selectedPriority || !isoDate) {
            alert("Please fill in all required fields.");
            return;
        }
    
        try {
            if (isEditing && editingAlertId !== null) {
                // Modalità modifica
                await window.electronAPI.updateAlert(editingAlertId, {
                    title,
                    project_id: parseInt(selectedProjectId),
                    type: selectedType,
                    priority: selectedPriority,
                    date: isoDate
                });
            } else {
                // Modalità creazione
                await window.electronAPI.createAlert({
                    title,
                    projectId: parseInt(selectedProjectId),
                    type: selectedType,
                    priority: selectedPriority,
                    date: isoDate
                });
            }
    
            await loadAlertsData();
            modal.classList.add("hidden");
            resetAlertModalFields();
        } catch (err) {
            console.error("Errore nella creazione/modifica alert:", err);
        }
    });    

    function resetAlertModalFields() {
        titleInput.value = "";
        dateInput.value = "";

        selectedProjectId = null;
        selectedType = null;
        selectedPriority = null;
        alertSelectedDate = null;

        editingAlertId = null;
        isEditing = false;

        projectBtn.textContent = "Select project";
        typeBtn.textContent = "Select type";
        priorityBtn.textContent = "Select priority";

        document.getElementById("alertModalTitle").textContent = "Create new Alert";
        saveBtn.textContent = "Save Alert";
    }

    // Chiudi dropdown al click fuori
    document.addEventListener("click", (e) => {
        const isInsideProject = projectBtn.contains(e.target) || projectMenu.contains(e.target);
        const isInsideType = typeBtn.contains(e.target) || typeMenu.contains(e.target);
        const isInsidePriority = priorityBtn.contains(e.target) || priorityMenu.contains(e.target);

        if (!isInsideProject) projectMenu.classList.add("hidden");
        if (!isInsideType) typeMenu.classList.add("hidden");
        if (!isInsidePriority) priorityMenu.classList.add("hidden");
    });

    function openEditModal(alert) {
        // Cambia modalità
        isEditing = true;
        editingAlertId = alert.id;
    
        // Cambia testi modale
        document.getElementById("alertModalTitle").textContent = "Edit Alert";
        saveBtn.textContent = "Update Alert";
    
        // Precompila i campi
        titleInput.value = alert.title;
        const parsedDate = new Date(alert.date);
        alertSelectedDate = parsedDate;
        datepicker.selectDate(parsedDate);
        alertSelectedDate = parsedDate;
    
        // Project
        projectBtn.textContent = alert.project_id;
        selectedProjectId = alert.project_id;
    
        // Type e Priority
        typeBtn.textContent = alert.type;
        selectedType = alert.type;
    
        priorityBtn.textContent = alert.priority;
        selectedPriority = alert.priority;
    
        // Apri modale
        modal.classList.remove("hidden");
    }

    window.openEditModal = openEditModal;
}


async function loadAlertsData() {
    const alerts = await window.electronAPI.getAllAlerts();
    const tableBody = document.getElementById("alertsTableBody");
    tableBody.innerHTML = "";

    if (!alerts || alerts.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 9;
        cell.className = "empty-alerts-cell";
        cell.textContent = "No alerts found.";
        row.appendChild(cell);
        tableBody.appendChild(row);
    } else {
        alerts.forEach(renderAlertRow);
    }    
}

/**
 * Crea e inserisce una riga della tabella per un alert
 */
async function renderAlertRow(alert) {
    const tableBody = document.getElementById("alertsTableBody");
    const row = document.createElement("tr");

    const projectName = await window.electronAPI.getProjectNameById(alert.project_id);

    row.innerHTML = `
        <td><input type="checkbox" /></td>
        <td><span class="priority-dot ${getPriorityColor(alert.priority)}"></span></td>
        <td>${alert.title}</td>
        <td>${projectName || "-"}</td>
        <td>${alert.type}</td>
        <td>${alert.priority}</td>
        <td>
            <div style="display: flex; flex-direction: column;">
                <span>${formatTime(alert.date)}</span>
                <span>${formatDate(alert.date)}</span>
            </div>
        </td>
        <td class="alert-actions-wrapper">
            <button class="alert-actions-btn">⋮</button>
            <div class="alert-actions-menu hidden">
                <ul>
                    <li class="edit-alert"><i class="fa-regular fa-pen-to-square"></i> Edit alert</li>
                    <li class="delete-alert"><i class="fa-regular fa-trash-can"></i> Delete alert</li>
                </ul>
            </div>
        </td>

    `;

    tableBody.appendChild(row);

    const actionBtn = row.querySelector(".alert-actions-btn");
    const actionsMenu = row.querySelector(".alert-actions-menu");
    const editBtn = row.querySelector(".edit-alert");
    const deleteBtn = row.querySelector(".delete-alert");

    // Toggle menu
    actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllMenus();
        actionsMenu.classList.toggle("hidden");
    });

    // Azioni
    editBtn.addEventListener("click", () => {
        // Chiama la funzione già definita nel contesto del modale
        const setupModal = window.alertsModalInitialized && typeof window.openEditModal === 'function';
        if (setupModal) {
            window.openEditModal(alert);
        }
    });        

    deleteBtn.addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to delete this alert?");
        if (confirmed) {
            await window.electronAPI.deleteAlert(alert.id);
            await loadAlertsData();
        }
    });

}

function closeAllMenus() {
    document.querySelectorAll(".alert-actions-menu").forEach(menu => menu.classList.add("hidden"));
}

document.addEventListener("click", () => closeAllMenus());

/**
 * Restituisce una classe CSS per il colore del pallino in base alla priorità
 */
function getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
        case "high": return "priority-red";
        case "medium": return "priority-yellow";
        case "low": return "priority-green";
        default: return "";
    }
}

/**
 * Estrae solo la data
 */
function formatDate(dateString) {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "-" : d.toISOString().split("T")[0];
}

/**
 * Estrae solo l'orario
 */
function formatTime(dateString) {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
async function initializeTimeSheetView() {
    console.log("📊 Inizializzazione vista TimeSheet...");

    // Stato locale
    let selectedProjectId = null;
    let selectedTaskId = null;
    const timeSheetState = { entries: [] };


    const container = document.querySelector(".daily-hours-table");
    const projectBtn = document.getElementById("projectSelectBtn-timesheet");
    const taskBtn = document.getElementById("taskSelectBtn-timesheet");
    const removeProjectBtn = document.getElementById("removeProjectBtn-timesheet");
    const removeTaskBtn = document.getElementById("removeTaskBtn-timesheet");

    if (!container || !projectBtn || !taskBtn || !removeProjectBtn || !removeTaskBtn) {
        console.warn("❌ Elementi non trovati. Ignoro init TimeSheet (non è la vista corrente).");
        return;
    }

    // Distrugge datepicker precedente, se presente
    const dateInput = document.getElementById("date-picker-timesheet");
    if (!dateInput) return;
    if (dateInput.airDatepicker) dateInput.airDatepicker.destroy();


    // Inizializza datepicker mensile
    dateInput.airDatepicker = new AirDatepicker(dateInput, {
        view: 'months',
        minView: 'months',
        dateFormat: 'MMMM yyyy',
        autoClose: true,
        locale: {
            months: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        navTitles: { months: 'yyyy', years: 'yyyy1 - yyyy2' },
        prevHtml: '‹',
        nextHtml: '›',
        onSelect({ date }) {
            if (date && selectedProjectId && selectedTaskId) {
                loadTimeSheetData();
            }
        }
    });
    dateInput.airDatepicker.selectDate(new Date());


    // Resetta selezioni precedenti
    selectedProjectId = null;
    selectedTaskId = null;
    container.innerHTML = "";

    // Nasconde eventuali badge selezionati
    document.getElementById("selectedProjectBadge-timesheet").classList.add("hidden");
    projectBtn.classList.remove("hidden");

    document.getElementById("selectedTaskBadge-timesheet").classList.add("hidden");
    taskBtn.classList.remove("hidden");

    // Reset dropdown text
    projectBtn.textContent = "Click to select the project";
    taskBtn.textContent = "Click to select the task";

    // Assegna i listener (una sola volta)
    removeProjectBtn.onclick = handleProjectRemoval;
    removeTaskBtn.onclick = handleTaskRemoval;
    document.getElementById("exportTimeSheetBtn-timesheet").addEventListener("click", handleExportTimeSheet);

    // Popola selettori
    await populateProjectSelector();
    await populateTaskSelector();
    await loadTimeSheetData();

    async function populateProjectSelector() {
        const button = document.getElementById("projectSelectBtn-timesheet");
        if (!button) return;
    
        const projects = await window.electronAPI.getAllProjects();
        if (!projects.length) {
            button.disabled = true;
            button.textContent = "No projects available";
            return;
        }
    
        button.disabled = false;
        button.onclick = () => {
            showDropdown(projects.map(p => ({
                id: p.id,
                label: p.name
            })), (selected) => handleProjectSelect(selected.id, selected.label));
        };
    }

    async function populateTaskSelector(activities = null) {
        const button = document.getElementById("taskSelectBtn-timesheet");
        if (!button) return;
    
        const allActivities = activities || await window.electronAPI.getAllActivities();
    
        if (!allActivities.length) {
            button.disabled = true;
            button.textContent = "No tasks available";
            return;
        }
    
        button.disabled = false;
        button.onclick = () => {
            showDropdown(allActivities.map(a => ({
                id: a.id,
                label: a.name,
                project_id: a.project_id
            })), async (selected) => await handleTaskSelect(selected.id, selected.label, selected.project_id));
        };
    }

    // Menu dropdown dinamico
    function showDropdown(items, onSelect) {
        const menu = document.createElement("ul");
        menu.classList.add("dropdown-menu");
    
        items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.label;
        li.addEventListener("click", () => {
            menu.remove();
            document.removeEventListener("click", handleOutsideClick);
            onSelect(item);
        });
        menu.appendChild(li);
        });
    
        // Chiude eventuale menu precedente
        const old = document.querySelector(".dropdown-menu");
        if (old) old.remove();
    
        // ➕ Inserisce il dropdown nel contenitore padre
        const trigger = event.target;
        const parent = trigger.closest(".dropdown-container");
        parent.appendChild(menu);
    
        // Posiziona con top 100%
        menu.style.top = "100%";
        menu.style.left = "0";
    
        // 🔐 Chiudi se clicchi fuori
        setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
        }, 0);
    
        function handleOutsideClick(e) {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", handleOutsideClick);
        }
        }
    }  
    
    // Selezione progetto ➝ aggiorna interfaccia + attività
    async function handleProjectSelect(id, name) {

        selectedProjectId = id;

        // Mostra pill
        document.getElementById("selectedProjectName-timesheet").textContent = name;
        document.getElementById("selectedProjectBadge-timesheet").classList.remove("hidden");
        document.getElementById("projectSelectBtn-timesheet").classList.add("hidden");
    
        // Popola attività solo relative a questo progetto
        const activities = await window.electronAPI.getActivitiesByProjectId(id);
        await populateTaskSelector(activities);
    
        // Salva projectId corrente (puoi salvarlo in variabile globale se ti serve dopo)
        document.getElementById("selectedProjectBadge-timesheet").dataset.projectId = id;

        if (selectedProjectId && selectedTaskId) {
            await loadTimeSheetData();
        }
    }
    
    // Selezione attività ➝ aggiorna interfaccia + forza progetto
    async function handleTaskSelect(id, name, projectId) {

        selectedTaskId = id;

        // Mostra attività pill
        document.getElementById("selectedTaskName-timesheet").textContent = name;
        document.getElementById("selectedTaskBadge-timesheet").classList.remove("hidden");
        document.getElementById("taskSelectBtn-timesheet").classList.add("hidden");
    
        // Se nessun progetto ancora selezionato, seleziona anche il progetto
        const projectBadge = document.getElementById("selectedProjectBadge-timesheet");
        const isProjectSelected = !projectBadge.classList.contains("hidden");
    
        if (!isProjectSelected) {
        const project = await window.electronAPI.getProjectById(projectId);
        await handleProjectSelect(project.id, project.name);
        }
    
        // Salva taskId (se vuoi usarlo in export o altro)
        document.getElementById("selectedTaskBadge-timesheet").dataset.taskId = id;

        if (selectedProjectId && selectedTaskId) {
            await loadTimeSheetData();
        }
    }
    
    // Rimuove selezione progetto
    async function handleProjectRemoval() {

        selectedProjectId = null;
        selectedTaskId = null;

        // ⬅️ Nascondi pill e mostra di nuovo selettore progetto
        document.getElementById("selectedProjectBadge-timesheet").classList.add("hidden");
        document.getElementById("projectSelectBtn-timesheet").classList.remove("hidden");
        document.getElementById("selectedProjectBadge-timesheet").dataset.projectId = "";
    
        // 🔁 Nascondi anche la pill dell’attività se selezionata
        document.getElementById("selectedTaskBadge-timesheet").classList.add("hidden");
        document.getElementById("taskSelectBtn-timesheet").classList.remove("hidden");
        document.getElementById("selectedTaskBadge-timesheet").dataset.taskId = "";
    
        // 🔄 Ripristina attività disponibili globalmente
        await populateTaskSelector();
    }  
    
    // Rimuove selezione task
    async function handleTaskRemoval() {

        selectedProjectId = null;
        selectedTaskId = null;

        document.getElementById("selectedTaskBadge-timesheet").classList.add("hidden");
        document.getElementById("taskSelectBtn-timesheet").classList.remove("hidden");
    
        document.getElementById("selectedTaskBadge-timesheet").dataset.taskId = "";
    
        // Se il progetto è ancora selezionato, ricarica solo attività di quel progetto
        const projectId = document.getElementById("selectedProjectBadge-timesheet").dataset.projectId;
        if (projectId) {
        const activities = await window.electronAPI.getActivitiesByProjectId(parseInt(projectId));
        await populateTaskSelector(activities);
        } else {
        await populateTaskSelector();
        }
    }  
    
    async function loadTimeSheetData() {
        console.log("📊 Caricamento dati TimeSheet...");

        const container = document.querySelector(".daily-hours-table");
        if (!container) {
            console.warn("❌ Griglia non trovata, probabilmente non siamo nella vista TimeSheet.");
            return;
        }

        container.innerHTML = "";

        const dateInput = document.getElementById("date-picker-timesheet");
        if (!dateInput || !dateInput.value) return;

        const parsedDate = new Date(dateInput.value);
        if (isNaN(parsedDate)) {
            console.warn("❌ Mese non valido selezionato nel date picker.");
            return;
        }
        const year = parsedDate.getFullYear();
        const month = parsedDate.getMonth();


        const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
        const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

        const entries = await window.electronAPI.getTimeEntriesByDateRange(startDate, endDate);

        const projectId = selectedProjectId;
        const taskId = selectedTaskId;

        const filtered = entries.filter(e => {
            const matchProject = !projectId || e.project_id === Number(projectId);
            const matchTask = !taskId || e.task === document.getElementById("selectedTaskName-timesheet")?.textContent;
            return matchProject && matchTask;
        });

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [...Array(daysInMonth)].map((_, i) => i + 1);
        const half = Math.ceil(daysInMonth / 2);
        const chunkedDays = [days.slice(0, half), days.slice(half)];

        // Inserisci qui la logica per la griglia vuota se mancano selezioni
        if (!selectedProjectId || !selectedTaskId) {
            const title = document.createElement("p");
            title.textContent = "Hours Per Day";
            title.classList.add("table-title");
            container.appendChild(title);

            chunkedDays.forEach(daysChunk => {
                const table = document.createElement("table");
                table.classList.add("timeSheet-grid");

                const thead = document.createElement("thead");
                const headRow = document.createElement("tr");
                headRow.innerHTML = `
                    <th style="background-color: #f8f8f8; font-weight: bold;">Σ</th>
                    ${daysChunk.map(d => `<th>${d}</th>`).join('')}
                `;
                thead.appendChild(headRow);
                table.appendChild(thead);

                const tbody = document.createElement("tbody");
                const emptyRow = document.createElement("tr");
                emptyRow.innerHTML = `<td>0m</td>` + daysChunk.map(() => `<td></td>`).join('');
                tbody.appendChild(emptyRow);

                table.appendChild(tbody);
                container.appendChild(table);
            });

            return; // Interrompe la funzione, evitando di elaborare dati reali
        }

        const grouped = {};
        let totalMinutes = 0;

        for (const entry of filtered) {
            const day = new Date(entry.startTime).getDate();
            const key = `${entry.project_id}_${entry.task}`;

            if (!grouped[key]) grouped[key] = { label: entry.task, data: {} };
            grouped[key].data[day] = (grouped[key].data[day] || 0) + (entry.duration || 0);

            totalMinutes += entry.duration || 0;
        }

        const totalFormatted = formatDuration(totalMinutes);

        // 🧩 Titolo sopra la griglia
        const title = document.createElement("p");
        title.textContent = "Hours Per Day";
        title.classList.add("table-title");
        container.appendChild(title);

        // 🔁 Per ciascuna metà mese, generiamo una tabella
        chunkedDays.forEach((daysChunk, index) => {
            const table = document.createElement("table");
            table.classList.add("timeSheet-grid");

            const thead = document.createElement("thead");
            const headRow = document.createElement("tr");

            headRow.innerHTML = `
                <th style="background-color: #f8f8f8; font-weight: bold;">Σ</th>
                ${daysChunk.map(d => `<th>${d}</th>`).join('')}
            `;

            thead.appendChild(headRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");

            const rowsToRender = Object.keys(grouped).length ? grouped : {
                "_": {
                    label: taskId ? document.getElementById("selectedTaskName-timesheet").textContent : "No Task",
                    data: {}
                }
            };

            for (const { label, data } of Object.values(rowsToRender)) {
                const row = document.createElement("tr");

                // Aggiungiamo la cella iniziale con il totale del mese
                const sumMins = Object.values(data).reduce((acc, val) => acc + val, 0);
                row.innerHTML = `<td><strong>${formatDuration(sumMins)}</strong></td>` +
                    daysChunk.map(day => {
                        const mins = data[day] || 0;
                        return `<td>${mins ? formatDuration(mins) : ""}</td>`;
                    }).join('');

                tbody.appendChild(row);
            }

            table.appendChild(tbody);
            container.appendChild(table);
        });
    }

    function formatDuration(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h ? `${h}h ${m}m` : `${m}m`;
    }

    async function handleExportTimeSheet() {
        const dateInput = document.getElementById("date-picker-timesheet");
        const date = new Date(dateInput?.value);
        if (isNaN(date) || !selectedProjectId || !selectedTaskId) {
            createToast("warning", "Export", "Please select a valid month, project, and task.");
            return;
        }

        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
        const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

        const entries = await window.electronAPI.getTimeEntriesByDateRange(startDate, endDate);
        const taskName = document.getElementById("selectedTaskName-timesheet")?.textContent || "Unknown";
        const projectName = document.getElementById("selectedProjectName-timesheet")?.textContent || "Unknown";

        const filtered = entries.filter(e =>
            e.project_id === Number(selectedProjectId) &&
            e.task === taskName
        );

        const dataToExport = filtered.map(e => ({
            date: new Date(e.startTime).toISOString().slice(0, 10),
            project: projectName,
            task: taskName,
            hoursWorked: formatDuration(e.duration || 0),
        }));

        if (dataToExport.length === 0) {
            createToast("info", "Export", "No data available to export.");
            return;
        }

        const result = await window.electronAPI.exportTimeSheetToPDF(dataToExport);

        if (result?.success) {
            createToast("success", "Export", "PDF exported successfully.");
        } else {
            createToast("error", "Export Error", result?.message || "Failed to export PDF.");
        }
    }
}

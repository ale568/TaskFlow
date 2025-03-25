let timerContainer = null;
let removeActivityBtn = null;
let isManualMode = false; // Flag per controllare la modalità attiva
let lastLoadedDate = null; // Memorizza l'ultima data caricata
let selectedDate = new Date().toISOString().split("T")[0]; // Memorizza la data selezionata

window.timerDisplay = null; // Riferimento globale


/**
 * Aggiorna la scritta "Today, data di oggi"
 */
function updateFormattedDate(selectedDate = new Date()) {

    const formattedDateElement = document.getElementById("formatted-date");
    if (!formattedDateElement) {
        console.error("ERROR: 'formatted-date' NOT FOUND!");
        return;
    }

    const today = new Date();
    const selected = new Date(selectedDate);

    // Opzioni per ottenere il nome del mese e il giorno in formato numerico
    const options = { month: "long", day: "numeric" };
    const formatted = selected.toLocaleDateString("en-US", options);

    if (
        today.getFullYear() === selected.getFullYear() &&
        today.getMonth() === selected.getMonth() &&
        today.getDate() === selected.getDate()
    ) {
        // Mostra "Today, data odierna" se la data selezionata è oggi
        formattedDateElement.textContent = `Today, ${formatted}`;
    } else {
        // Mostra "Wed, March 12" se la data selezionata è diversa da oggi
        const dayShort = selected.toLocaleDateString("en-US", { weekday: "short" });
        formattedDateElement.textContent = `${dayShort}, ${formatted}`;
    }
}

/**
 * Inizializza il date picker
 */
function initializeDatePicker() {
    const datePicker = document.getElementById("date-picker");

    if (!datePicker) {
        console.error("ERROR: 'date-picker' NOT FOUND! Retrying...");
        setTimeout(initializeDatePicker, 500);
        return;
    }

    if (datePicker._datepicker) {
        datePicker._datepicker.destroy(); // Distrugge l'istanza esistente per reinizializzarla
    }

    const dp = new AirDatepicker(datePicker, {
        autoClose: true,
        dateFormat: 'yyyy-MM-dd',
        selectedDates: [new Date()],
        toggleSelected: true,
        allowInput: true,
        buttons: ['today'],
        locale: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            today: 'Today'
        },
        navTitles: {
            days: 'MMMM <i>yyyy</i>',
            months: 'yyyy',
            years: 'yyyy1 - yyyy2'
        },
        prevHtml: '‹',
        nextHtml: '›',
        onSelect: ({ date }) => {
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000) // Normalizziamo al fuso orario locale
                .toISOString()
                .split("T")[0]; // Prendiamo solo la parte della data (YYYY-MM-DD)

            selectedDate = localDate; // Aggiorniamo la data selezionata

            updateFormattedDate(date); // Aggiorniamo la UI con la nuova data formattata
            clearPreviousDaysEntriesPrevious(); // Puliamo i blocchi dei giorni precedenti
            loadTimeEntriesMain(localDate); // Carichiamo le entry per la nuova data
        }
    });

    // Imposta la formattazione iniziale per la data odierna
    updateFormattedDate(new Date());

}

async function populateProjectSelector() {
    const timerContainer = document.querySelector(".timer-container");
    const projectButton = document.getElementById("project-button");
    const projectList = document.getElementById("project-list");
    const projectContainer = document.getElementById("selected-project-container");
    const selectedProjectSpan = document.getElementById("selected-project");
    const activitySelection = document.getElementById("activity-selection");
    const projectDescription = document.getElementById("project-description");

    const removeProjectBtn = document.getElementById("remove-project");

    // Se c'è un timer attivo, non permettiamo di selezionare un altro progetto
    if (window.id) {
        console.log("⏳ Timer attivo rilevato, il selettore progetti non verrà ripristinato.");
        return;
    }

    if (!projectButton || !projectList || !projectContainer) {
        console.error("Elementi UI non trovati.");
        return;
    }

    try {
        const projects = await window.electronAPI.getAllProjects();

        console.log("📌 Progetti ricevuti:", projects);

        if (!Array.isArray(projects) || projects.length === 0) {
            console.warn("Nessun progetto trovato.");
            projectButton.textContent = "No projects available";
            projectButton.disabled = true;
            return;
        }

        projectList.innerHTML = "";

        projects.forEach(project => {
            const listItem = document.createElement("li");
            listItem.textContent = project.name;
            listItem.dataset.projectId = project.id;
            listItem.dataset.description = project.description || "No description";

            listItem.addEventListener("click", async () => {

                console.log(`✅ Progetto selezionato: ${project.name} (ID: ${project.id})`);

                // Mostra il progetto selezionato come pill
                selectedProjectSpan.textContent = project.name;
                selectedProjectSpan.dataset.projectId = project.id;
                projectContainer.classList.remove("hidden");

                // Nasconde il pulsante di selezione progetto
                timerContainer.classList.add("project-selected");

                // Mostra il selettore delle attività
                activitySelection.classList.remove("hidden");

                // Manteniamo la descrizione del progetto nascosta
                projectDescription.textContent = project.description || "No description";
                projectDescription.classList.add("hidden");

                // Nasconde il dropdown dei progetti
                projectList.classList.add("hidden");

                // Popola il selettore delle attività
                await populateActivitySelector(project.id);
            });

            projectList.appendChild(listItem);
        });

        console.log("✅ Dropdown popolato correttamente.");

        projectButton.addEventListener("click", () => {
            projectList.classList.toggle("hidden");
        });

        removeProjectBtn.addEventListener("click", () => {
            selectedProjectSpan.textContent = "";
            selectedProjectSpan.dataset.projectId = "";
            projectContainer.classList.add("hidden");
            timerContainer.classList.remove("project-selected");
            activitySelection.classList.add("hidden");
            projectDescription.classList.add("hidden");

            // Reset attività selezionata
            removeActivitySelection();
        });

    } catch (error) {
        console.error("Errore nel recupero dei progetti:", error);
    }
}

async function populateActivitySelector(projectId) {

    console.log(`🔄 Chiamata a populateActivitySelector() con projectId: ${projectId}`);

    const activityButton = document.getElementById("activity-button");
    const activityList = document.getElementById("activity-list");
    const activityContainer = document.getElementById("selected-activity-container");
    const selectedActivitySpan = document.getElementById("selected-activity");
    const timerContainer = document.querySelector(".timer-container");

    removeActivityBtn = document.getElementById("remove-activity");

    if (!projectId) {
        console.error("Errore: Nessun progetto selezionato.");
        return;
    }

    try {

        // Recupera le attività
        const activities = await window.electronAPI.getActivitiesByProjectId(projectId);
        console.log("📌 Attività ricevute:", activities);

        // Pulisce il dropdown prima di popolarlo con nuove attività
        activityList.innerHTML = "";

        // Se non ci sono attività, disabilita il pulsante
        if (!Array.isArray(activities) || activities.length === 0) {
            console.warn("Nessuna attività trovata.");
            activityButton.textContent = "No activities available";
            activityButton.disabled = true;
            return;
        }

        // Abilita il pulsante e imposta il testo corretto
        activityButton.disabled = false;
        activityButton.textContent = "Click to select the activity";

        // 🔄 Popola il dropdown con le attività
        activities.forEach(activity => {
            const listItem = document.createElement("li");
            listItem.textContent = activity.name;
            listItem.dataset.activityId = activity.id;

            listItem.addEventListener("click", async () => {

                console.log(`✅ Attività selezionata: ${activity.name} (ID: ${activity.id})`);

                // Mostra l’attività selezionata come pill
                selectedActivitySpan.textContent = activity.name;
                selectedActivitySpan.dataset.activityId = activity.id;
                activityContainer.classList.remove("hidden");

                document.getElementById("project-description").classList.remove("hidden");

                // Nasconde il pulsante di selezione attività
                timerContainer.classList.add("activity-selected");

                // Nasconde il dropdown delle attività
                activityList.classList.add("hidden");
            });

            activityList.appendChild(listItem);
        });

        console.log("✅ Dropdown attività aggiornato correttamente.");

        // Rimuove eventuali listener duplicati sul pulsante di selezione attività
        const newActivityButton = activityButton.cloneNode(true);
        activityButton.replaceWith(newActivityButton);
        newActivityButton.addEventListener("click", () => {
            console.log("🔄 Toggle del dropdown attività.");
            activityList.classList.toggle("hidden");
        });

        // Rimuove tutti i vecchi event listener prima di aggiungerne uno nuovo
        if (removeActivityBtn) {
            const newRemoveActivityBtn = removeActivityBtn.cloneNode(true);
            removeActivityBtn.replaceWith(newRemoveActivityBtn);

            // Riapplichiamo la variabile al nuovo elemento
            removeActivityBtn = document.getElementById("remove-activity");

            // Assicuriamoci che sia nascosto quando un timer è attivo
            if (window.id) {
                removeActivityBtn.classList.add("hidden-remove-btn");
            } else {
                removeActivityBtn.classList.remove("hidden-remove-btn");
            }

            // Aggiungiamo il listener per la rimozione dell'attività
            removeActivityBtn.addEventListener("click", () => {
                removeActivitySelection();
            });
        }

    } catch (error) {
        console.error("Errore nel recupero delle attività:", error);
    }
}

function removeActivitySelection() {
    const selectedActivitySpan = document.getElementById("selected-activity");
    const activityContainer = document.getElementById("selected-activity-container");
    const timerContainer = document.querySelector(".timer-container");

    selectedActivitySpan.textContent = "";
    selectedActivitySpan.dataset.activityId = "";
    activityContainer.classList.add("hidden");
    timerContainer.classList.remove("activity-selected");
}

function displayPill(text, className, container) {

    let pill = document.createElement("span");
    pill.classList.add("pill", className);
    pill.textContent = text;

    let closeButton = document.createElement("button");
    closeButton.textContent = "x";
    closeButton.classList.add("pill-close");
    closeButton.onclick = () => container.removeChild(pill);

    pill.appendChild(closeButton);
    container.appendChild(pill);
}

/** Timer management  **/
async function initializeTimeTracking() {

    let startTimerBtn = document.getElementById("start-timer");
    window.timerDisplay = document.getElementById("timer-display");
    const startTimeDisplay = document.getElementById("start-time-static");
    const endTimeDisplay = document.getElementById("end-time-static");

    // Se siamo in modalità manuale, non resettiamo la UI del timer
    if (isManualMode) {
        console.log("Modalità manuale attiva - Nessun reset del timer necessario");
        return;
    }

    // Se esiste già un timer attivo, usciamo immediatamente
    if (window.id) {
        console.log("⏳ Timer attivo rilevato, ripristiniamo il display...");

        // Assicuriamoci che il timer continui ad aggiornarsi
        if (window.intervalId) {
            clearInterval(window.intervalId); // Assicuriamoci di non avviare più intervalli
            await window.electronAPI.setGlobalState({ intervalId: null });
        }
        window.intervalId = setInterval(updateTimerDisplay, 150);
        await window.electronAPI.setGlobalState({ intervalId: window.intervalId });

        return; // Se il timer è attivo, non resettiamo la UI
    }

    console.log("⏳ Nessun Timer attivo, resettiamo la UI.");

    // Reset UI del timer

    if (window.intervalId) {
        clearInterval(window.intervalId);
        window.intervalId = null; // Ora ha senso resettarlo
        await window.electronAPI.setGlobalState({ intervalId: null }); // Sincronizza con il Global State
    }

    timerDisplay.textContent = "00:00:00";
    startTimerBtn.textContent = "Start Timer";
    startTimeDisplay.textContent = "--:--";
    endTimeDisplay.textContent = "--:--";

    console.log("Timer UI resettata all'avvio");

    assignStartButtonBehavior();
}

/**
 * Avvia un nuovo timer per un progetto e attività selezionati o da un'entry esistente.
 * @param {string} projectName - Il nome del progetto (se avviato da un'entry)
 * @param {string} taskName - Il nome dell'attività (se avviato da un'entry)
 */
async function startNewTimer(projectName = null, taskName = null) {

    let startTimerBtn = document.getElementById("start-timer");
    if (!startTimerBtn) {
        console.error("❌ Errore: startTimerBtn non trovato nel DOM.");
        return;
    }

    const startTimeDisplay = document.getElementById("start-time-static");
    const endTimeDisplay = document.getElementById("end-time-static");
    const removeProjectBtn = document.getElementById("remove-project");
    const toggleBtn = document.getElementById("toggle-timer-mode");
    let removeActivityBtn = document.getElementById("remove-activity");

    let projectDescription = document.getElementById("project-description").textContent.trim();

    let selectedProject = projectName || document.getElementById("selected-project").dataset.projectId;
    let selectedActivity = taskName || document.getElementById("selected-activity").textContent;

    console.log(`🔍 Verifica valori -> Progetto: ${selectedProject}, Attività: ${selectedActivity}`);

    if (!selectedProject || !selectedActivity) {
        createToast("warning", "Warning", "Select a project and a task before starting the timer.");
        return;
    }

    let projectId = parseInt(selectedProject, 10);  // Conversione in numero
    let finalProjectName = null;

    try {
        if (isNaN(projectId)) {
            console.warn(`⚠️ Ricevuto nome progetto invece di ID (${selectedProject}). Recupero ID...`);
            projectId = await window.electronAPI.getProjectIdByName(selectedProject);
        } else {
            console.log(`ID progetto ricevuto direttamente: ${projectId}`);
            finalProjectName = await window.electronAPI.getProjectNameById(projectId);
        }

        if (!projectId || isNaN(projectId)) {
            throw new Error("ID progetto non valido.");
        }

        projectId = Number(projectId);
        console.log(`ID progetto confermato: ${projectId}`);

        // Se finalProjectName non è stato valorizzato, lo recuperiamo ora
        if (!finalProjectName) {
            finalProjectName = selectedProject;
        }
    } catch (error) {
        console.error(`❌ Errore nel recupero del progetto:`, error);
        createToast("error", "Error", "Error retrieving the project. Please try again.");
        return;
    }

    const startTime = new Date().toISOString(); // Convertiamo il tempo in formato ISO

    try {

        console.log(`⌛ Creazione timer per Progetto ${projectId}, Task: ${selectedActivity}, StartTime: ${startTime}`);

        //Creiamo il timer nel database e otteniamo il suo ID
        const timerId = await window.electronAPI.createTimer(projectId, selectedActivity, startTime, 'running');

        console.log(`Risposta da createTimer: ${timerId}`);

        if (!timerId) {
            throw new Error("Errore nella creazione del timer, ID non ricevuto.");
        }

        // Salviamo i dati del timer attivo nel global state
        window.projectId = projectId;
        window.projectName = finalProjectName;
        window.projectDescription = projectDescription;
        window.task = selectedActivity;
        window.startTime = startTime;
        window.status = "running";
        window.id = timerId;


        await window.electronAPI.setGlobalState({
            projectId: projectId,
            projectName: finalProjectName,
            projectDescription: projectDescription,
            task: selectedActivity,
            startTime: startTime,
            status: "running",
            id: timerId
        });

        // Aggiorna UI
        startTimeDisplay.textContent = window.electronAPI.formatTime(startTime);
        endTimeDisplay.textContent = "--:--";
        startTimerBtn.textContent = "Stop Timer";
        startTimerBtn.classList.add("stop");
        // startTimerBtn.offsetHeight; Forza il ricalcolo dello stile

        // Nasconde le 'x' di rimozione per evitare modifiche mentre il timer è attivo
        removeProjectBtn.classList.add("hidden-remove-btn");
        removeActivityBtn.classList.add("hidden-remove-btn");

        // Disabilita il pulsante di switch modalità
        if (toggleBtn) toggleBtn.disabled = true;

        console.log(`Timer avviato! ID: ${timerId}`);

        createToast("success", "Success", "Timer started!");

        if (window.intervalId) {
            clearInterval(window.intervalId); // Assicuriamoci di non avviare più intervalli
        }
        window.intervalId = setInterval(updateTimerDisplay, 150);
        await window.electronAPI.setGlobalState({ intervalId: window.intervalId });

        assignStartButtonBehavior();

    } catch (error) {
        console.error("Errore nell'avvio del timer:", error);
        createToast("error", "Error", "An error occurred while starting the timer. Please try again.");
    }
}

async function stopActiveTimer() {

    // Aggiorniamo i riferimenti agli elementi del DOM
    let startTimerBtn = document.getElementById("start-timer");
    let timerDisplay = document.getElementById("timer-display");
    let endTimeDisplay = document.getElementById("end-time-static");
    let removeProjectBtn = document.getElementById("remove-project");
    let toggleBtn = document.getElementById("toggle-timer-mode");
    let removeActivityBtn = document.getElementById("remove-activity");

    if (!startTimerBtn) {
        console.error("Errore: startTimerBtn non trovato nel DOM.");
        return;
    }

    try {
        const endTime = new Date().toISOString();

        // Inviamo la richiesta per fermare il timer nel database
        const elapsedTime = await window.electronAPI.stopTimer(window.id);

        if (window.intervalId) {
            clearInterval(window.intervalId);
            window.intervalId = null; // Ora ha senso resettarlo
            await window.electronAPI.setGlobalState({ intervalId: null }); // Sincronizza con il Global State
        }

        window.projectId = null;
        window.projectName = null;
        window.projectDescription = null;
        window.task = null;
        window.startTime = null;
        window.status = null;
        window.id = null;

        await window.electronAPI.setGlobalState({
            projectId: null,
            projectName: null,
            projectDescription: null,
            task: null,
            startTime: null,
            status: null,
            id: null,
            intervalId: null
        });

        // Reset UI del timer
        timerDisplay.textContent = "00:00:00";
        startTimerBtn.textContent = "Start Timer";
        startTimerBtn.classList.remove("stop");
        endTimeDisplay.textContent = window.electronAPI.formatTime(endTime);

        // Riabilita le 'x' di rimozione per permettere di cambiare progetto/attività
        removeProjectBtn.classList.remove("hidden-remove-btn");
        removeActivityBtn.classList.remove("hidden-remove-btn");

        // Riabilita il pulsante di switch modalità
        if (toggleBtn) toggleBtn.disabled = false;

        assignStartButtonBehavior();

        console.log(`Timer fermato e UI resettata! Durata: ${elapsedTime}`);

        createToast("success", "Success", "Timer stopped!");

    } catch (error) {
        console.error("❌ Errore nel fermare il timer:", error);
        createToast("error", "Error", "An error occurred while stopping the timer. Please try again.");
    }
}

function updateTimerDisplay() {
    if (!window.id || !window.timerDisplay) return;

    const elapsedTime = getElapsedTime(window.startTime);
    window.timerDisplay.textContent = elapsedTime;
}

/**
 * Converte un oggetto Date in una stringa formattata HH:mm:ss.
 * @param {string|Date} date - Data da formattare.
 * @returns {string} Ora formattata (HH:mm:ss).
 */
function formatTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date); // Converte stringa ISO in Date
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Calcola il tempo trascorso tra due date e lo formatta in HH:mm:ss
 * @param {Date} startTime - Orario di inizio
 * @param {Date} endTime - Orario di fine (default: ora corrente)
 * @returns {string} - Tempo trascorso formattato
 */
function getElapsedTime(startTime, endTime = new Date()) {
    const diffMs = endTime - new Date(startTime); // Differenza in millisecondi
    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Gestione pulsate di switch
async function setupToggleTimerMode() {

    const toggleBtn = document.getElementById("toggle-timer-mode");
    const timerContainer = document.querySelector(".timer-container");

    if (!toggleBtn || !timerContainer) {
        console.error("❌ Errore: Elementi UI non trovati per il toggle!");
        return;
    }

    toggleBtn.addEventListener("click", async () => {

        // Se c'è un timer attivo, impediamo il cambio di modalità
        if (window.id) {
            createToast("error", "Error", "You cannot switch modes while a timer is running. Stop the timer first.");

            return;
        }

        toggleBtn.classList.add("active-mode"); // Aggiunge l'effetto visivo

        setTimeout(() => {
            toggleBtn.classList.remove("active-mode"); // Rimuove l'effetto dopo l'animazione
        }, 900);

        const dropdowns = document.querySelectorAll(".dropdown-menu");
        dropdowns.forEach(dropdown => dropdown.classList.add("hidden"));

        // Cambia lo stato della modalità
        isManualMode = !isManualMode;
        timerContainer.classList.toggle("manual-entry-mode", isManualMode);

        // Aggiorna il testo del pulsante in base alla modalità
        toggleBtn.textContent = isManualMode
            ? "Switch to tracking time by starting trackers"
            : "Switch to adding time entries manually";

        // Attiva la modalità corrispondente
        if (isManualMode) {
            enableManualEntryMode();
        } else {
            enableTimerMode();
        }

        assignStartButtonBehavior();

    });
}

function enableTimerMode() {

    const startTimerBtn = document.getElementById("start-timer");

    document.getElementById("manual-duration").classList.add("hidden");
    document.getElementById("timer-display").classList.remove("hidden");

    document.getElementById("manual-start-time").classList.add("hidden");
    document.getElementById("manual-end-time").classList.add("hidden");

    document.getElementById("start-time-static").classList.remove("hidden");
    document.getElementById("end-time-static").classList.remove("hidden");

    startTimerBtn.textContent = "Start Timer";
}

function enableManualEntryMode() {

    const startTimerBtn = document.getElementById("start-timer");

    document.getElementById("timer-display").classList.add("hidden");

    const manualDurationInput = document.getElementById("manual-duration");
    const manualStartTimeInput = document.getElementById("manual-start-time");
    const manualEndTimeInput = document.getElementById("manual-end-time");


    manualDurationInput.classList.remove("hidden");
    //  Disabilita il campo durata
    if (manualDurationInput) {
        manualDurationInput.disabled = true;
        manualDurationInput.value = "0m"; // Imposta un valore iniziale
    }

    document.getElementById("start-time-static").classList.add("hidden");
    document.getElementById("end-time-static").classList.add("hidden");

    if (manualStartTimeInput) manualStartTimeInput.classList.remove("hidden");
    if (manualEndTimeInput) manualEndTimeInput.classList.remove("hidden");

    startTimerBtn.textContent = "Log Time";

    function formatTimeOnBlur(inputElement) {
        inputElement.addEventListener("blur", function () {
            let input = this.value.replace(/\D/g, ""); // Rimuove tutto tranne numeri

            // Se l'input è vuoto, lo lasciamo tale
            if (input === "") {
                this.value = "";
                return;
            }

            // Se l'utente ha scritto meno di 4 cifre, completiamo con zeri
            while (input.length < 4) {
                input = "0" + input;
            }

            let hours = parseInt(input.substring(0, 2), 10);
            let minutes = parseInt(input.substring(2, 4), 10);

            if (hours > 23) hours = 23;
            if (minutes > 59) minutes = 59;

            this.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

            // Dopo la formattazione, aggiorniamo la durata
            updateManualDuration();
        });
    }

    // Gli input accettano solo numeri e ':'
    function allowOnlyValidInput(inputElement) {
        inputElement.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9:]/g, ""); // Permette solo numeri e ':'
        });
    }

    // Applichiamo la validazione sugli input di inizio e fine
    if (manualStartTimeInput && manualEndTimeInput) {
        allowOnlyValidInput(manualStartTimeInput);
        allowOnlyValidInput(manualEndTimeInput);
        formatTimeOnBlur(manualStartTimeInput);
        formatTimeOnBlur(manualEndTimeInput);
    }

    /**
     * Calcola e aggiorna la durata automaticamente in base a startTime e endTime
     */
    function updateManualDuration() {
        if (!manualStartTimeInput.value || !manualEndTimeInput.value) return;

        const today = new Date().toISOString().split("T")[0];

        let startTime = new Date(`${today}T${manualStartTimeInput.value}:00.000Z`);
        let endTime = new Date(`${today}T${manualEndTimeInput.value}:00.000Z`);

        let duration = (endTime - startTime) / 60000; // Converti in minuti

        // Gestione della mezzanotte
        if (duration < 0) {
            duration += 1440; // Aggiungiamo 24 ore
        }

        // Limitiamo la durata massima a 24h (1440 minuti)
        duration = Math.min(duration, 1440);

        // Formattiamo la durata in `1h 30m`
        if (duration >= 60) {
            let hours = Math.floor(duration / 60);
            let minutes = duration % 60;
            manualDurationInput.value = minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
        } else {
            manualDurationInput.value = `${duration}m`;
        }
    }
}

async function logManualEntry() {

    try {
        const selectedProject = document.getElementById("selected-project").dataset.projectId;
        const selectedActivity = document.getElementById("selected-activity").textContent;
        const manualStartTimeInput = document.getElementById("manual-start-time").value.trim();
        const manualEndTimeInput = document.getElementById("manual-end-time").value.trim();
        const selectedDate = document.getElementById("date-picker").value;

        // Validazione: assicuriamoci che tutti i campi siano compilati
        if (!selectedProject || !selectedActivity) {
            createToast("warning", "Warning", "Select a project and a task before logging an entry.");

            return;
        }

        if (!manualStartTimeInput || !manualEndTimeInput || !selectedDate) {
            createToast("warning", "Warning", "Fill in all fields before logging an entry.");

            return;
        }

        // Otteniamo la data corrente
        const formattedDate = new Date(selectedDate).toISOString().split("T")[0]; // YYYY-MM-DD

        // Creiamo gli oggetti Date per startTime e endTime
        let startTime = new Date(`${formattedDate}T${manualStartTimeInput}:00.000Z`);
        let endTime = new Date(`${formattedDate}T${manualEndTimeInput}:00.000Z`);

        // Sottraiamo un'ora per salvare in UTC nel DB
        startTime.setHours(startTime.getHours() - 1);
        endTime.setHours(endTime.getHours() - 1);

        // Convertiamo in formato ISO corretto
        startTime = startTime.toISOString();
        endTime = endTime.toISOString();

        // Calcoliamo la durata in minuti
        let duration = (new Date(endTime) - new Date(startTime)) / 60000;

        // Se l'orario di fine è inferiore a quello di inizio, significa che è passata la mezzanotte
        if (duration < 0) {
            duration += 1440; // Aggiungiamo 24 ore (1440 minuti)
        }

        // Assicuriamoci che la durata sia almeno 1 minuto e non superi le 24 ore
        duration = Math.max(1, Math.min(duration, 1440));

        // Creiamo il timer nel DB (stato 'stopped')
        const timerId = await window.electronAPI.createTimer(selectedProject, selectedActivity, startTime, 'stopped');

        if (!timerId) {
            throw new Error("Errore nella creazione del timer.");
        }

        // Simuliamo `stopTimer()` per creare l'entry in `time_entries`
        await window.electronAPI.stopTimer(timerId, endTime);


        console.log(`Entry manuale registrata! Progetto: ${selectedProject}, Attività: ${selectedActivity}, Start: ${startTime}, End: ${endTime}, Durata: ${duration}m`);

        createToast("success", "Success", "Task successfully logged!");

        // Aggiorna le entry in UI dopo il log manuale
        loadTimeEntriesMain(formattedDate);

        // Reset UI
        document.getElementById("manual-start-time").value = "";
        document.getElementById("manual-end-time").value = "";



    } catch (error) {
        console.error("❌ Errore nel log manuale:", error);
        createToast("error", "Error", "An error occurred while logging the entry. Please try again.");
    }

    //  Riattiviamo il Date Picker e gli input dopo il log manuale
    initializeDatePicker();  // Reinizializza il Date Picker se necessario

    // Riabilitiamo i campi di input
    document.getElementById("manual-start-time").disabled = false;
    document.getElementById("manual-end-time").disabled = false;

    console.log(" UI aggiornata dopo il log manuale.");

}

/*
 ***  AGGIORNAMENTO ENTRY BLOCCO PRINCIPALE E RELATIVI LISTENERS ***
 */
async function loadTimeEntriesMain(date) {

    try {
        const entries = await window.electronAPI.getEntriesByDate(date);
        if (!date) {
            console.error("❌ Errore: La data passata a getEntriesByDate è NULL o vuota!");
        }

        // Controlliamo se il contenitore esiste prima di modificarlo
        const activityContainer = document.getElementById("activity-container-main");
        if (!activityContainer) {
            console.error("❌ Errore: Il contenitore 'activity-container-main' non è stato trovato!");
            return;
        }

        const deleteButton = document.getElementById("delete-selected-btn-main");
        const totalTimeElement = document.getElementById("total-time-main");
        const selectAllCheckbox = document.getElementById("select-all-main");

        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        if (deleteButton) deleteButton.classList.add("hidden");

        activityContainer.innerHTML = ""; // Puliamo la UI precedente

        if (entries.length === 0) {
            activityContainer.innerHTML = `
                <div class="no-entries">
                    <p>No time entries on that day.</p>
                </div>
            `;
            totalTimeElement.textContent = "Total: 0m";
            return;
        }

        let totalDuration = 0;

        entries.forEach(entry => {
            const tagColor = entry.tag_color ? entry.tag_color : "#e4e3e3";
            totalDuration += entry.duration;

            const formattedDuration = formatDuration(entry.duration);

            const entryElement = document.createElement("div");
            entryElement.classList.add("activity-item");

            entryElement.dataset.id = entry.id;
            entryElement.style.setProperty("--tag-color", tagColor);

            entryElement.innerHTML = `
                <input type="checkbox" class="custom-checkbox entry-checkbox-main" data-id="${entry.id}">
                <div class="task-project">
                    <span class="task-name">${entry.task}</span>
                    <span class="project-name">${entry.project_name}</span>
                </div>
                <span class="description-name">${entry.project_description || 'No description'}</span>
                <span class="task-duration">${formattedDuration}</span>
                <span class="task-time">${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}</span>
                <span class="task-date">${entry.startTime.split("T")[0]}</span>
                <button class="start-timer-btn-main" data-project="${entry.project_name}" data-task="${entry.task}">▶</button>
            `;

            activityContainer.appendChild(entryElement);
        });

        totalTimeElement.textContent = `Total: ${formatDuration(totalDuration)}`;

        attachMainCheckboxListeners();
        attachTimerListenersMain();

    } catch (error) {
        console.error("❌ Errore nel caricamento delle entry:", error);
    }
}

function attachMainCheckboxListeners() {

    const checkboxes = document.querySelectorAll(".entry-checkbox-main"); // Solo il blocco principale
    const selectAllCheckbox = document.getElementById("select-all-main");
    const deleteButton = document.getElementById("delete-selected-btn-main");

    if (!selectAllCheckbox || !deleteButton) {
        console.warn("⚠️ Warning: Checkbox principale o pulsante Delete All non trovati nel blocco principale.");
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            updateDeleteButtonMain();
            updateSelectAllCheckboxMain();
        });
    });

    selectAllCheckbox.addEventListener("change", function () {
        const isChecked = selectAllCheckbox.checked;
        checkboxes.forEach(checkbox => checkbox.checked = isChecked);
        updateDeleteButtonMain();
    });

    deleteButton.classList.add("hidden");
}

function updateDeleteButtonMain() {

    const selectedEntries = document.querySelectorAll("#activity-container-main .entry-checkbox-main:checked");
    const deleteButton = document.getElementById("delete-selected-btn-main");

    if (!deleteButton) return;

    if (selectedEntries.length > 0) {
        deleteButton.classList.remove("hidden");
    } else {
        deleteButton.classList.add("hidden");
    }
}

function updateSelectAllCheckboxMain() {

    const checkboxes = document.querySelectorAll("#activity-container-main .entry-checkbox-main");
    const selectAllCheckbox = document.getElementById("select-all-main");
    const checkedCheckboxes = document.querySelectorAll("#activity-container-main .entry-checkbox-main:checked");

    if (!selectAllCheckbox) return;

    selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedCheckboxes.length;
}

function attachTimerListenersMain() {

    const timerButtons = document.querySelectorAll(".start-timer-btn-main"); // Solo per il blocco principale
    timerButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const project = button.dataset.project;
            const task = button.dataset.task;
            await handleStartTimerFromEntryMain(project, task);
        });
    });
}

/**
 * Gestisce l'avvio di un timer quando viene premuto il pulsante Play ▶ su una entry del blocco principale
 */
async function handleStartTimerFromEntryMain(project, task) {

    try {

        // Controlliamo se esiste un timer attivo
        if (window.id) {
            console.warn("⚠️ Tentativo di avvio di un nuovo timer mentre un altro è attivo.");
            createToast("warning", "Warning", "You already have an active timer! Stop it before starting a new one.");

            return; // Blocchiamo l'avvio di un nuovo timer
        }

        console.log(`▶️ Avvio timer per: ${project} - ${task} (Blocco principale)`);

        // Passa alla modalità Timer
        enableTimerMode();

        // Verifica se gli elementi esistono prima di aggiornare il contenuto
        const selectedProject = document.getElementById("selected-project");
        const selectedActivity = document.getElementById("selected-activity");
        const selectedProjectContainer = document.getElementById("selected-project-container");
        const selectedActivityContainer = document.getElementById("selected-activity-container");
        const timerContainer = document.querySelector(".timer-container");
        const removeProjectBtn = document.getElementById("remove-project");
        const removeActivityBtn = document.getElementById("remove-activity");
        const projectDescription = document.getElementById("project-description");


        if (!selectedProject || !selectedActivity) {
            throw new Error("❌ Gli elementi UI 'selected-project' o 'selected-activity' non sono stati trovati nel DOM.");
        }

        // Aggiorna la UI con i dettagli dell'entry selezionata
        selectedProject.textContent = project;
        selectedProjectContainer.classList.remove("hidden"); // Mostra la pill del progetto

        selectedActivity.textContent = task;
        selectedActivityContainer.classList.remove("hidden"); // Mostra la pill dell'attività

        timerContainer.classList.add("project-selected", "activity-selected");

        // Nascondi le 'X' di rimozione progetto e attività
        removeProjectBtn.classList.add("hidden-remove-btn");
        removeActivityBtn.classList.add("hidden-remove-btn");

        // Aggiorna la descrizione del progetto
        const projectId = await window.electronAPI.getProjectIdByName(project);
        console.log("📌 Project ID ottenuto:", projectId);
        const projectData = await window.electronAPI.getProjectDetailsById(projectId);
        console.log("📌 Dati progetto ricevuti:", projectData);
        projectDescription.textContent = projectData?.description || "No description";
        console.log("📌 Descrizione trovata:", projectData?.description);
        projectDescription.classList.remove("hidden");

        console.log("✅ UI aggiornata con le pill prima di avviare il timer.");

        // Avvia il timer con i dettagli dell'entry
        await startNewTimer(project, task);
    } catch (error) {
        console.error("❌ Errore nell'avvio del timer nel blocco principale:", error);
    }
}

async function deleteSelectedEntriesMain(event) {

    const block = document.getElementById("activity-container-main");

    if (!block) {
        console.error("❌ Errore: `block` è undefined in deleteSelectedEntriesMain.");
        return;
    }

    const selectedCheckboxes = block.querySelectorAll(".entry-checkbox-main:checked");
    const idsToDelete = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);
    const deleteButton = document.getElementById("delete-selected-btn-main");

    if (idsToDelete.length === 0) {
        console.warn("⚠️ Nessuna entry selezionata per l'eliminazione.");
        return;
    }

    try {
        const success = await window.electronAPI.deleteTimeEntries(idsToDelete);

        if (success) {
            console.log(`✅ Eliminati con successo ${idsToDelete.length} record.`);
            selectedCheckboxes.forEach(checkbox => checkbox.closest(".activity-item").remove()); // Rimuove dalla UI
        } else {
            console.error("❌ Errore: eliminazione fallita.");
        }

        // Nasconde il pulsante "Delete All" dopo l'eliminazione
        deleteButton.classList.add("hidden");

    } catch (error) {
        console.error("❌ Errore durante l'eliminazione delle entry nel blocco principale:", error);
    }
}

/**
 * Converte una durata in minuti in un formato leggibile (es. "1h 15m")
 * @param {number} minutes - Durata in minuti
 * @returns {string} - Durata formattata
 */
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
}

// Ascolta l'evento per aggiornare la UI del blocco principale
window.electronAPI.receive("updateTimeEntriesMain", () => {
    console.log("🔄 DEBUG: Ricevuto evento updateTimeEntriesMain, ricarico le entries...");
    const datePicker = document.getElementById("date-picker");
    const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split("T")[0];

    // Aggiorna SOLO il blocco principale
    loadTimeEntriesMain(selectedDate);
});


// Ascolta l'evento per aggiornare la UI dei blocchi dei giorni precedenti
window.electronAPI.receive("updateTimeEntriesPrevious", () => {
    console.log("🔄 DEBUG: Ricevuto evento updateTimeEntriesPrevious, ricarico i giorni precedenti...");
    loadPreviousDaysEntriesPrevious();
});



/*
*** AGGIORNAMENTO UI BLOCCHI GIORNI PRECEDENTI E RELATIVI LISTENERS
*/
async function loadPreviousDaysEntriesPrevious() {

    const previousDaysContainer = document.getElementById("previous-days-entries");

    // **Se ci sono già blocchi presenti, aggiungere un separatore prima dei nuovi blocchi**
    if (previousDaysContainer.children.length > 0) {
        const separator = document.createElement("hr");
        separator.classList.add("separator-line");
        previousDaysContainer.appendChild(separator);
    }

    // **Inizializza lastLoadedDate se è null**
    if (!lastLoadedDate) {
        const datePicker = document.getElementById("date-picker");
        const selectedDate = datePicker && datePicker.value ? new Date(datePicker.value) : new Date();
        lastLoadedDate = new Date(selectedDate);
        lastLoadedDate.setDate(lastLoadedDate.getDate() - 1); // Partiamo da un giorno prima della data selezionata
    }

    let newBlocks = document.createDocumentFragment();

    for (let i = 0; i < 7; i++) {
        const formattedDate = lastLoadedDate.toISOString().split("T")[0];

        try {
            const entries = await window.electronAPI.getEntriesByDate(formattedDate);

            // ** Header con la data sopra il blocco **
            const dateHeader = document.createElement("div");
            dateHeader.classList.add("previous-day-header-global");
            dateHeader.textContent = formatDateToReadable(formattedDate);
            newBlocks.appendChild(dateHeader);

            // ** Contenitore del giorno **
            const dayBlock = document.createElement("section");
            dayBlock.classList.add("previous-day-block");

            // ** Header del blocco (senza "Recent Activities") **
            const activityHeader = document.createElement("div");
            activityHeader.classList.add("activity-header");

            const selectAllCheckbox = document.createElement("input");
            selectAllCheckbox.type = "checkbox";
            selectAllCheckbox.classList.add("custom-checkbox", "select-all-checkbox");

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-selected-btn", "delete-selected-btn-global", "hidden");
            deleteButton.textContent = "Delete All";
            deleteButton.addEventListener("click", deleteSelectedEntriesPrevious);

            const totalTimeElement = document.createElement("span");
            totalTimeElement.classList.add("total-time");

            activityHeader.appendChild(selectAllCheckbox);
            activityHeader.appendChild(deleteButton);
            activityHeader.appendChild(totalTimeElement);

            // ** Contenitore delle attività **
            const activityContainer = document.createElement("div");
            activityContainer.classList.add("activity-container");

            let totalDuration = 0;

            if (entries.length > 0) {
                entries.forEach(entry => {
                    totalDuration += entry.duration;
                    const entryElement = document.createElement("div");
                    entryElement.classList.add("activity-item");
                    entryElement.dataset.id = entry.id;

                    entryElement.innerHTML = `
                        <input type="checkbox" class="custom-checkbox entry-checkbox-previous" data-id="${entry.id}">
                        <div class="task-project">
                            <span class="task-name">${entry.task}</span>
                            <span class="project-name">${entry.project_name}</span>
                        </div>
                        <span class="description-name">${entry.project_description || 'No description'}</span>
                        <span class="task-duration">${formatDuration(entry.duration)}</span>
                        <span class="task-time">${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}</span>
                        <span class="task-date">${entry.startTime.split("T")[0]}</span>
                        <button class="start-timer-btn start-timer-btn-previous" data-project="${entry.project_name}" data-task="${entry.task}">▶</button>
                    `;

                    activityContainer.appendChild(entryElement);
                });
            } else {
                const noEntriesMessage = document.createElement("div");
                noEntriesMessage.classList.add("no-activities-message");
                noEntriesMessage.innerHTML = `<p>No time entries on that day.</p>`;
                activityContainer.appendChild(noEntriesMessage);
            }

            totalTimeElement.textContent = `Total: ${formatDuration(totalDuration)}`;

            dayBlock.appendChild(activityHeader);
            dayBlock.appendChild(activityContainer);
            newBlocks.appendChild(dayBlock);

            // ** Aggiungiamo un separatore tra i blocchi **
            if (i < 6) {
                const separator = document.createElement("hr");
                separator.classList.add("separator-line");
                newBlocks.appendChild(separator);
            }

        } catch (error) {
            console.error(`❌ Errore nel caricamento delle entry per ${formattedDate}:`, error);
        }

        // ⬇️ **AGGIORNA lastLoadedDate per il prossimo ciclo** ⬇️
        lastLoadedDate.setDate(lastLoadedDate.getDate() - 1);
    }

    previousDaysContainer.appendChild(newBlocks);

    attachPreviousDaysCheckboxListenersPrevious();
    attachTimerListenersPreviousDays();

    setTimeout(() => {
        const previousDaysContainer = document.querySelector(".previous-days-container");
        if (previousDaysContainer) {
            previousDaysContainer.style.marginTop = "20px";
            console.log("✅ Margin-top applicato dinamicamente a previous-days-container.");
        } else {
            console.warn("⚠️ previous-days-container non trovato nel DOM.");
        }
    }, 300);
}

function attachPreviousDaysCheckboxListenersPrevious() {

    const blocks = document.querySelectorAll(".previous-day-block");

    blocks.forEach(block => {
        //  Usa il selettore corretto per le checkbox
        const checkboxes = block.querySelectorAll(".custom-checkbox.entry-checkbox-previous");

        // ✅ Usa il selettore corretto per il "Select All"
        const selectAllCheckbox = block.querySelector(".custom-checkbox.select-all-checkbox");

        // ✅ Usa il selettore corretto per il pulsante Delete All
        const deleteButton = block.querySelector(".delete-selected-btn");

        if (!selectAllCheckbox || !deleteButton) {
            console.warn("⚠️ Warning: Checkbox principale o pulsante Delete All non trovati per un blocco precedente.");
            return;
        }

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                updateDeleteButtonPrevious(block);
                updateSelectAllCheckboxPrevious(block);
            });
        });

        selectAllCheckbox.addEventListener("change", function () {
            const isChecked = selectAllCheckbox.checked;
            checkboxes.forEach(checkbox => checkbox.checked = isChecked);
            updateDeleteButtonPrevious(block);
        });

        // Rimuove "hidden" se ci sono checkbox selezionate
        updateDeleteButtonPrevious(block);
    });
}

function attachTimerListenersPreviousDays() {

    const timerButtons = document.querySelectorAll(".start-timer-btn-previous"); // Solo per i blocchi dei giorni precedenti
    timerButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const project = button.dataset.project;
            const task = button.dataset.task;
            await handleStartTimerFromEntryPreviousDays(project, task);
        });
    });
}

function updateDeleteButtonPrevious(block) {

    if (!block) {
        console.error("❌ Errore: `block` è undefined in updateDeleteButtonPrevious.");
        return;
    }

    const selectedEntries = block.querySelectorAll(".entry-checkbox-previous:checked");

    // TROVA IL PULSANTE DELETE ALL
    let deleteButton = block.querySelector(".delete-selected-btn");

    if (!deleteButton) {
        console.warn("⚠️ Warning: Nessun pulsante Delete All trovato direttamente nel blocco. Controllo dentro header...");
        deleteButton = block.querySelector(".activity-header .delete-selected-btn");
    }

    if (!deleteButton) {
        console.error("❌ Errore: Ancora nessun pulsante Delete All trovato in questo blocco!");
        return;
    }

    //  Mostra o nasconde il pulsante in base alle checkbox selezionate
    if (selectedEntries.length > 0) {
        deleteButton.classList.remove("hidden");
    } else {
        deleteButton.classList.add("hidden");
    }
}


function updateSelectAllCheckboxPrevious(block) {

    if (!block) {
        console.error("❌ Errore: `block` è undefined in updateSelectAllCheckboxPrevious.");
        return;
    }

    const checkboxes = block.querySelectorAll(".entry-checkbox-previous");
    const selectAllCheckbox = block.querySelector(".select-all-checkbox");

    if (!selectAllCheckbox) {
        console.warn("⚠️ Warning: Nessuna checkbox 'Select All' trovata per questo blocco.");
        return;
    }

    // Conta quante checkbox sono selezionate
    const checkedCheckboxes = block.querySelectorAll(".entry-checkbox-previous:checked").length;

    // ✅ Se tutte le checkbox sono selezionate, attiva "Select All", altrimenti disattivala
    selectAllCheckbox.checked = checkedCheckboxes === checkboxes.length;
}

async function deleteSelectedEntriesPrevious(event) {

    const block = event.target.closest(".previous-day-block"); // Trova il blocco dei giorni precedenti

    if (!block) {
        console.error("❌ Errore: `block` è undefined in deleteSelectedEntriesPrevious.");
        return;
    }

    const selectedCheckboxes = block.querySelectorAll(".entry-checkbox-previous:checked");
    const idsToDelete = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);
    const deleteButton = block.querySelector(".delete-selected-btn");
    const selectAllCheckbox = block.querySelector(".select-all-checkbox"); // Troviamo la checkbox principale

    if (idsToDelete.length === 0) return;

    try {
        const success = await window.electronAPI.deleteTimeEntries(idsToDelete);

        if (success) {
            selectedCheckboxes.forEach(checkbox => {
                const entryElement = checkbox.closest(".activity-item");
                if (entryElement) {
                    entryElement.remove();
                } else {
                    console.warn("⚠️ Warning: Nessun elemento `.activity-item` trovato per questa checkbox.");
                }
            });

            updateTotalTimePrevious(block);

            // **Se tutte le entry sono state eliminate, aggiorna il contenitore**
            const activityContainer = block.querySelector(".activity-container");

            if (block.querySelectorAll(".activity-item").length === 0) {
                if (activityContainer) {
                    activityContainer.innerHTML = `
                        <div class="no-activities-message-previous">
                            <p>No time entries on that day.</p>
                        </div>
                    `;
                } else {
                    console.warn("⚠️ Warning: `.activity-container` non trovato nel DOM, impossibile aggiornare.");
                }

                // Deseleziona la checkbox principale se il blocco è vuoto
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                } else {
                    console.warn("⚠️ Warning: Checkbox 'Select All' non trovata per questo blocco.");
                }
            }

        } else {
            console.error("❌ Errore: eliminazione fallita.");
        }

        // **Fix: Verifica che deleteButton esista prima di modificarlo**
        if (deleteButton) {
            if (block.querySelectorAll(".entry-checkbox-previous:checked").length === 0) {
                deleteButton.classList.add("hidden");
            }
        } else {
            console.warn("⚠️ Warning: Pulsante 'Delete All' non trovato, potrebbe essere già stato rimosso.");
        }

    } catch (error) {
        console.error("❌ Errore durante l'eliminazione delle entry nei blocchi dei giorni precedenti:", error);
    }
}

function updateTotalTimePrevious(block) {

    if (!block) {
        console.error("❌ Errore: Il blocco passato a updateTotalTimePrevious è undefined.");
        return;
    }

    let totalDuration = 0;

    // Somma tutte le durate delle entry ancora presenti nel blocco
    block.querySelectorAll(".activity-item").forEach(item => {
        const durationElement = item.querySelector(".task-duration");
        if (durationElement) {
            const durationText = durationElement.textContent.trim();
            totalDuration += parseDuration(durationText); // Converte il testo in minuti
        }
    });

    // Aggiorna l'elemento total-time con il nuovo valore
    const totalTimeElement = block.querySelector(".total-time");
    if (totalTimeElement) {
        totalTimeElement.textContent = `Total: ${formatDuration(totalDuration)}`; // Riconverte il totale in formato leggibile
    } else {
        console.warn("⚠️ Warning: Elemento '.total-time' non trovato nel blocco.");
    }
}

function parseDuration(durationText) {
    let totalMinutes = 0;
    const hoursMatch = durationText.match(/(\d+)h/);
    const minutesMatch = durationText.match(/(\d+)m/);

    if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1]);
    }

    return totalMinutes;
}

// Pulisce i blocchi dei giorni precedenti quando si cambia data nel date picker
function clearPreviousDaysEntriesPrevious() {

    const previousDaysContainer = document.getElementById("previous-days-entries");

    if (!previousDaysContainer) {
        console.error("❌ Errore: Il contenitore dei giorni precedenti non è stato trovato!");
        return;
    }

    // Cancella i blocchi precedenti
    previousDaysContainer.innerHTML = "";

    // Resettiamo tutte le checkbox selezionate nei giorni precedenti
    document.querySelectorAll(".entry-checkbox-previous:checked").forEach(checkbox => {
        checkbox.checked = false;
    });

    // Nascondiamo tutti i pulsanti "Delete All" dei blocchi precedenti
    document.querySelectorAll(".delete-selected-btn-previous").forEach(button => {
        button.classList.add("hidden");
    });

    // Resettiamo l'ultima data caricata per forzare un nuovo caricamento corretto
    lastLoadedDate = null;
}

async function handleStartTimerFromEntryPreviousDays(project, task) {

    try {
        console.log(`▶️ Avvio timer per: ${project} - ${task} (Blocco giorni precedenti)`);

        // Passa alla modalità Timer
        enableTimerMode();

        // Verifica se gli elementi esistono
        const selectedProject = document.getElementById("selected-project");
        const selectedActivity = document.getElementById("selected-activity");

        if (!selectedProject || !selectedActivity) {
            throw new Error("❌ Gli elementi UI 'selected-project-previous' o 'selected-activity-previous' non sono stati trovati nel DOM.");
        }

        // Aggiorna la UI con i dettagli dell'entry selezionata SOLO nei blocchi precedenti
        selectedProject.textContent = project;
        selectedActivity.textContent = task;

        // Avvia il timer con i dettagli dell'entry
        await startNewTimer(project, task);
    } catch (error) {
        console.error("❌ Errore nell'avvio del timer nel blocco dei giorni precedenti:", error);
    }
}


/**
 * Converte una data nel formato leggibile (es. "Monday, March 10")
 * @param {string} dateStr - Data in formato YYYY-MM-DD
 * @returns {string} - Data formattata
 */
function formatDateToReadable(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

async function resetHomeUI() {

    // Recupera gli elementi del DOM ogni volta che la funzione viene chiamata
    let timerContainer = document.querySelector(".timer-container");
    let removeActivityBtn = document.getElementById("remove-activity");
    let startTimerBtn = document.getElementById("start-timer");
    let timerDisplay = document.getElementById("timer-display");
    let startTimeDisplay = document.getElementById("start-time-static");
    let endTimeDisplay = document.getElementById("end-time-static");
    let removeProjectBtn = document.getElementById("remove-project");
    let toggleBtn = document.getElementById("toggle-timer-mode");

    let projectButton = document.getElementById("project-button");
    let projectList = document.getElementById("project-list");
    let selectedProjectContainer = document.getElementById("selected-project-container");
    let selectedProjectSpan = document.getElementById("selected-project");
    let activitySelection = document.getElementById("activity-selection");
    let projectDescription = document.getElementById("project-description");

    let activityButton = document.getElementById("activity-button");
    let activityList = document.getElementById("activity-list");
    let selectedActivityContainer = document.getElementById("selected-activity-container");
    let selectedActivitySpan = document.getElementById("selected-activity");

    let manualStartTimeInput = document.getElementById("manual-start-time");
    let manualEndTimeInput = document.getElementById("manual-end-time");
    let datePicker = document.getElementById("date-picker");

    if (window.id) {
        console.log("✅ Timer attivo rilevato, resettiamo SOLO la UI esterna, NON la sezione Timer.");

        // Salviamo il projectId PRIMA del reset
        const savedProjectId = window.projectId;

        // ✅ Nascondiamo il selettore del progetto e mostriamo la pill
        projectButton.classList.add("hidden"); // Nasconde il selettore progetti
        selectedProjectSpan.textContent = window.projectName;
        selectedProjectSpan.dataset.projectId = window.projectId;
        selectedProjectContainer.classList.remove("hidden"); // Mostra la pill del progetto

        // ✅ Nascondiamo il selettore dell'attività e mostriamo la pill
        activityButton.classList.add("hidden"); // Nasconde il selettore attività
        selectedActivitySpan.textContent = window.task;
        selectedActivityContainer.classList.remove("hidden"); // Mostra la pill dell'attività
        selectedActivityContainer.style.marginTop = "5px";   //  -------------

        // ✅ Mostriamo la descrizione del progetto
        projectDescription.textContent = window.projectDescription;
        projectDescription.classList.remove("hidden");

        // ✅ Aggiorniamo il Timer Display
        startTimeDisplay.textContent = window.electronAPI.formatTime(window.startTime);
        startTimerBtn.textContent = "Stop Timer";
        startTimerBtn.classList.add("stop");

        // aggiungiamo le classi css alle pill
        if (selectedProjectContainer && !selectedProjectContainer.classList.contains("hidden")) {
            timerContainer.classList.add("project-selected");
        }

        if (selectedActivityContainer && !selectedActivityContainer.classList.contains("hidden")) {
            timerContainer.classList.add("activity-selected");
        }

        // Nascondiamo le 'X' per rimuovere progetto e attività
        removeProjectBtn.classList.add("hidden-remove-btn");
        removeActivityBtn.classList.add("hidden-remove-btn");

        // Rimuoviamo e ri-assegniamo gli event listener per il pulsante Start/Stop Timer
        if (startTimerBtn) {
            assignStartButtonBehavior();
        }

        // Rimuoviamo gli event listener duplicati dai pulsanti di rimozione
        removeProjectBtn.replaceWith(removeProjectBtn.cloneNode(true));
        removeActivityBtn.replaceWith(removeActivityBtn.cloneNode(true));

        // Ri-assegniamo i listener per la rimozione di progetto/attività
        document.getElementById("remove-project").addEventListener("click", async () => {
            console.log("🔄 Rimozione progetto");

            selectedProjectSpan.textContent = "";
            selectedProjectSpan.dataset.projectId = "";
            selectedProjectContainer.classList.add("hidden");
            timerContainer.classList.remove("project-selected");
            projectDescription.classList.add("hidden");

            removeActivitySelection(); // ✅ Reset dell'attività selezionata

            // 🔄 Prima ripristiniamo il selettore dei progetti
            await restoreProjectSelector();

            // 🔄 Dopo che il progetto è stato ripristinato, gestiamo la popolazione del selettore attività
            document.getElementById("project-list").addEventListener("click", async (event) => {
                const selectedItem = event.target;
                if (selectedItem.tagName === "LI") {
                    const newProjectId = selectedItem.dataset.projectId;
                    console.log(`✅ Nuovo progetto selezionato: ${newProjectId}`);

                    // ✅ Se `newProjectId` è null (global state resettato), usiamo `savedProjectId`
                    const finalProjectId = newProjectId || savedProjectId;

                    // Ora ripristiniamo il selettore delle attività con l'ID corretto
                    await restoreActivitySelector(finalProjectId);

                    // ✅ Mostriamo il selettore delle attività
                    activitySelection.classList.remove("hidden");
                    activitySelection.style.display = "block";
                    console.log("✅ Selettore attività mostrato dopo la selezione del progetto.");
                }
            }, { once: true }); // L'evento viene rimosso automaticamente dopo il primo click
        });


        document.getElementById("remove-activity").addEventListener("click", async () => {
            console.log("🔄 Rimozione attività");
            selectedActivitySpan.textContent = "";
            selectedActivitySpan.dataset.activityId = "";
            selectedActivityContainer.classList.add("hidden");
            timerContainer.classList.remove("activity-selected");
            await restoreActivitySelector(savedProjectId);
        });

        console.log("✅ Reset parziale completato. Il Timer resta attivo.");
        return;
    }

    // 🔴 Se nessun Timer è attivo, RESET COMPLETO della UI
    console.log("⏳ Nessun Timer attivo, resettiamo tutta la UI della Home.");

    timerContainer.classList.remove("project-selected", "activity-selected", "manual-entry-mode");

    projectButton.textContent = "Click to select the project";
    projectButton.disabled = false;
    projectList.classList.add("hidden");
    selectedProjectContainer.classList.add("hidden");
    selectedProjectSpan.textContent = "";
    selectedProjectSpan.dataset.projectId = "";
    projectDescription.textContent = "No description";
    projectDescription.classList.add("hidden");

    activityButton.textContent = "Click to select the activity";
    activityButton.disabled = false;
    activityList.classList.add("hidden");
    selectedActivityContainer.classList.add("hidden");
    selectedActivitySpan.textContent = "";
    selectedActivitySpan.dataset.activityId = "";

    manualStartTimeInput.value = "";
    manualEndTimeInput.value = "";

    if (datePicker && datePicker._datepicker) {
        datePicker._datepicker.clear();
    }

    removeProjectBtn.classList.remove("hidden-remove-btn");
    removeActivityBtn.classList.remove("hidden-remove-btn");

    if (toggleBtn) toggleBtn.disabled = false;

    timerDisplay.textContent = "00:00:00";
    startTimerBtn.textContent = "Start Timer";
    startTimeDisplay.textContent = "--:--";
    endTimeDisplay.textContent = "--:--";
    startTimerBtn.classList.remove("stop");

    if (window.intervalId) {
        clearInterval(window.intervalId);
        window.intervalId = null; // Ora ha senso resettarlo
        await window.electronAPI.setGlobalState({ intervalId: null }); // Sincronizza con il Global State
    }

    window.projectId = null;
    window.projectName = null;
    window.projectDescription = null;
    window.task = null;
    window.startTime = null;
    window.status = null;
    window.id = null;
    window.intervalId = null;

    await window.electronAPI.setGlobalState({
        projectId: null,
        projectName: null,
        projectDescription: null,
        task: null,
        startTime: null,
        status: null,
        id: null,
        intervalId: null
    });

    console.log("✅ Reset COMPLETO della UI eseguito.");

    isManualMode = false;

    assignStartButtonBehavior();
}

window.electronAPI.getGlobalState().then((state) => {
    console.log("🔄 Stato Globale ricevuto nel Renderer:", state);

    window.projectId = state.projectId || null;
    window.projectName = state.projectName || null;
    window.projectDescription = state.projectDescription || null;
    window.task = state.task || null;
    window.startTime = state.startTime || null;
    window.status = state.status || null;
    window.id = state.id || null;

    if (window.id) {
        console.log("✅ Timer attivo trovato, ripristino UI...");
        console.log("🔍 Nome Progetto:", window.projectName);
        console.log("🔍 Attività:", window.task);
    }
});

// Ripristina il selettore del progetto dopo la rimozione della pill
async function restoreProjectSelector() {
    console.log("🔄 Ripristino del selettore progetti senza resettare la UI");

    let projectButton = document.getElementById("project-button");
    let projectList = document.getElementById("project-list");

    let selectedProjectSpan = document.getElementById("selected-project"); // Recupera l'elemento ogni volta
    let selectedProjectContainer = document.getElementById("selected-project-container");

    let timerContainer = document.querySelector(".timer-container");
    let activitySelection = document.getElementById("activity-selection");
    let projectDescription = document.getElementById("project-description");

    if (!timerContainer) {
        console.error("❌ timerContainer non trovato nel DOM.");
        return;
    }


    if (!selectedProjectSpan || !selectedProjectContainer) {
        console.error("❌ selectedProjectSpan non trovato nel DOM.");
        return;
    }

    if (!projectButton || !projectList) {
        console.error("❌ Elementi UI per il selettore progetti non trovati.");
        return;
    }

    // Riattiva il selettore dei progetti
    projectButton.classList.remove("hidden");
    projectButton.disabled = false;
    projectList.classList.add("hidden"); // Assicura che non sia aperto di default

    activitySelection.classList.add("hidden"); // Nasconde il selettore delle attività
    activitySelection.style.display = "none";  // Imposta lo stile per forzare la scomparsa

    // 🔄 Recupera e popola i progetti senza alterare la UI
    const projects = await window.electronAPI.getAllProjects();
    if (!projects || projects.length === 0) {
        console.error("❌ Nessun progetto trovato, impossibile popolare il selettore.");
        return;
    }

    projectList.innerHTML = "";
    projects.forEach(project => {
        const listItem = document.createElement("li");
        listItem.textContent = project.name;
        listItem.dataset.projectId = project.id;
        listItem.dataset.description = project.description || "No description";

        listItem.addEventListener("click", async () => {
            console.log(`✅ Progetto selezionato: ${project.name} (ID: ${project.id})`);

            selectedProjectSpan.textContent = project.name;
            selectedProjectSpan.dataset.projectId = project.id;
            selectedProjectContainer.classList.remove("hidden");

            timerContainer.classList.add("project-selected");
            activitySelection.classList.remove("hidden");
            activitySelection.style.display = "block";

            projectDescription.textContent = project.description || "No description";
            projectDescription.classList.add("hidden");

            projectList.classList.add("hidden");

            // Popola il selettore delle attività per il progetto selezionato
            await populateActivitySelector(project.id);
        });

        projectList.appendChild(listItem);
    });

    if (!projectButton.dataset.listenerAdded) {
        projectButton.addEventListener("click", () => {
            projectList.classList.toggle("hidden");
        });
        projectButton.dataset.listenerAdded = "true"; // Imposta il flag per evitare duplicati
    }

    console.log("✅ Selettore progetti ripristinato e popolato correttamente.");
}

// Ripristina il selettore dell’attività dopo la rimozione della pill
async function restoreActivitySelector(projectId) {
    console.log(`🔄 Ripristino del selettore attività per projectId: ${projectId}`);

    let activityButton = document.getElementById("activity-button");
    let activityList = document.getElementById("activity-list");
    let activitySelection = document.getElementById("activity-selection");

    if (!activitySelection) {
        console.error("❌ Elemento #activity-selection non trovato nel DOM.");
        return;
    }

    if (!activityButton || !activityList) {
        console.error("❌ Elementi UI per il selettore attività non trovati.");
        return;
    }

    if (!projectId) {
        console.warn("⚠️ Nessun progetto selezionato, impossibile ripristinare il selettore attività.");
        return;
    }

    // ✅ Controlliamo che non sia già visibile prima di chiamare populateActivitySelector()
    if (!activitySelection.classList.contains("hidden")) {
        console.log("🔄 Il selettore attività è già visibile, non richiamiamo populateActivitySelector.");
        return;
    }

    // Riattiva il selettore delle attività
    activityButton.disabled = false;
    activityList.classList.add("hidden"); // Assicura che non sia aperto di default
    activityButton.addEventListener("click", () => {
        activityList.classList.toggle("hidden");
    });

    // ✅ Mostriamo il selettore solo se è nascosto
    activitySelection.classList.remove("hidden");
    activityButton.classList.remove("hidden");

    // ✅ Chiamata singola a populateActivitySelector()
    console.log("📌 Chiamata a populateActivitySelector con projectId:", projectId);
    await populateActivitySelector(projectId);

    console.log("✅ Selettore attività ripristinato correttamente.");
}

function assignStartButtonBehavior() {
    let btn = document.getElementById("start-timer");

    if (!btn) {
        console.error("❌ Pulsante start-timer non trovato!");
        return;
    }

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    btn = newBtn;

    if (isManualMode) {
        btn.textContent = "Log Time";
        btn.classList.remove("stop");
        btn.addEventListener("click", async () => {
            console.log("👉 click → logManualEntry()");
            await logManualEntry();
        });
    } else if (!window.id) {
        btn.textContent = "Start Timer";
        btn.classList.remove("stop");
        btn.addEventListener("click", async () => {
            console.log("👉 click → startNewTimer()");
            await startNewTimer();
        });
    } else {
        btn.textContent = "Stop Timer";
        btn.classList.add("stop");
        btn.addEventListener("click", async () => {
            await stopActiveTimer();
            console.log("👉 click → stopActiveTimer()");
        });
    }
}
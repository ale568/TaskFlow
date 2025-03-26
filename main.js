const { app, BrowserWindow, ipcMain } = require('electron');

const path = require("path");

const ProjectsController = require('./renderer/controllers/projectsController');
const ActivityController = require('./renderer/controllers/activityController');
const TimerController = require('./renderer/controllers/timerController');
const TimeEntryController = require('./renderer/controllers/timeEntryController');
const TagsController = require('./renderer/controllers/tagsController');
const ExportUtils = require('./renderer/utils/exportUtils');
const AlertsController = require('./renderer/controllers/alertsController');

let mainWindow;

let globalState = {
    intervalId: null,
    id: null, 
    projectId: null, 
    projectName: null, 
    task: null,
    startTime: null, 
    status: null 
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        minWidth: 1280,  
        minHeight: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false,  // Disabilitiamo il sandbox per permettere script personalizzati
            contextIsolation: true, // Permette l'accesso agli script JS
            enableRemoteModule: false,
            nodeIntegration: false,
            webSecurity: true,
            allowRunningInsecureContent: false, // Evita blocchi su contenuti locali
        }
    });

    mainWindow.loadFile('renderer/index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function handleWindowClose() {
    if (mainWindow && typeof mainWindow.close === 'function') {
        mainWindow.close();
    }
}

app.on('ready', createWindow);

app.on('before-quit', async (event) => {
    console.log("⚠️ L'app sta per chiudersi, controllo timer attivi...");

    try {
        // Recuperiamo il timer attivo (se esiste)
        const activeTimers = await TimerController.getAllTimers();
        const runningTimer = activeTimers.find(timer => timer.status === 'running');

        if (runningTimer) {
            console.log(`🛑 Timer attivo trovato (ID: ${runningTimer.id}) -> Fermiamo il timer prima della chiusura.`);
            
            // Fermiamo il timer e aggiorniamo il database
            await TimerController.stopTimer(runningTimer.id);
            console.log("✅ Timer fermato con successo.");
        } else {
            console.log("✅ Nessun timer attivo trovato, chiusura normale.");
        }
    } catch (error) {
        console.error("❌ Errore nel fermare il timer prima della chiusura:", error);
    }
});

app.on('before-quit', () => {
    if (mainWindow) {
        mainWindow.webContents.send('reset-timer-ui'); // Manda l'evento alla UI per resettare il timer
        globalState = {
            intervalId: null,
            id: null, 
            projectId: null, 
            projectName: null, 
            task: null,
            startTime: null, 
            status: null 
        };
    }
});

app.on('activate', function () {
    if (!mainWindow || mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('notify', (event, arg) => {
    console.log(arg);
    if (event?.sender) {
        event.sender.send('notify-reply', 'pong');
    }
});

ipcMain.handle('getAllProjects', async () => {
    console.log("Richiesta ricevuta in main.js: getAllProjects()");
    try {
        const projects = await ProjectsController.getAllProjects();
        console.log("Progetti recuperati dal controller:", projects);
        return projects;
    } catch (error) {
        console.error("Errore in main.js durante getAllProjects:", error);
        return []; // Restituisce un array vuoto in caso di errore
    }
});

ipcMain.handle('getActivitiesByProjectId', async (event, projectId) => {
    return await ActivityController.getAllActivities({ project_id: projectId });
});

ipcMain.handle('createTimer', async (event, projectId, task, startTime, status) => {
    try {

        projectId = Number(projectId);
        if (!Number.isInteger(projectId) || projectId <= 0) {
            throw new Error(`❌ Errore: projectId non valido (${projectId})`);
        }

        // Recuperiamo il nome del progetto tramite l'id
        const projectName1 = await ProjectsController.getProjectNameById(projectId);
        if (!projectName1) {
            throw new Error("❌ Errore: dettagli progetto non trovati.");
        }

        console.log(`📥 createTimer ricevuto -> projectId: ${projectId}, task: ${task}, startTime: ${startTime}, status: ${status}`);

        const timerId = await TimerController.createTimer(projectId, task, startTime, status);

        if (!timerId) {
            throw new Error("Errore: Timer ID non ricevuto.");
        }

        console.log("🔄 Aggiornamento globalState: Impostazione nuovo timer attivo...");
        globalState = { 
            ...globalState,  // Mantiene eventuali altre proprietà (es. intervalId)
            id: timerId, 
            projectId: projectId, 
            projectName: projectName1, 
            task: task,
            startTime: startTime, 
            status: status 
        };        

        // Sincronizziamo subito lo stato globale nel Renderer
        await setGlobalStateInMain(globalState);

        console.log(`✅ Timer creato con ID: ${timerId}`);
        return timerId;

    } catch (error) {
        console.error("❌ Errore nella creazione del timer:", error);
        return null;
    }
});

ipcMain.handle('stopTimer', async (event, timerId, manualEndTime = null) => {
    try {
        console.log(`🛑 Fermando timer con ID: ${timerId}`);

        timerId = Number(timerId);
        if (!Number.isInteger(timerId) || timerId <= 0) {
            throw new Error(`❌ Errore: timerId non valido (${timerId})`);
        }

        const elapsedTime = await TimerController.stopTimer(timerId, manualEndTime);

        globalState = {
            intervalId: null,
            id: null, 
            projectId: null, 
            projectName: null, 
            task: null,
            startTime: null, 
            status: null 
        };        

        // Sincronizziamo subito lo stato globale nel Renderer
        await setGlobalStateInMain(globalState);

        console.log(`✅ Timer fermato! Durata: ${elapsedTime}`);

        // ✅ Notifica al renderer di aggiornare SOLO il blocco principale
        event.sender.send('updateTimeEntriesMain');

        return elapsedTime;
    } catch (error) {
        console.error("❌ Errore nel fermare il timer:", error);
        return null;
    }
});

ipcMain.handle("deleteTimeEntries", async (event, ids) => {

    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            console.error("❌ Nessun ID fornito per la cancellazione.");
            return false; // <-- Ritorniamo false per segnalare l'errore
        }

        // Convertiamo gli ID a numeri
        const numericIds = ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);

        if (numericIds.length === 0) {
            console.error("❌ Nessun ID valido trovato dopo la conversione.");
            return false; // <-- Ritorniamo false per segnalare l'errore
        }

        // Eliminare tutte le time_entries
        const deleteSuccess = await TimeEntryController.deleteTimeEntries(numericIds);
        if (!deleteSuccess) {
            console.error("❌ ERRORE: TimeEntryController.deleteTimeEntries() ha restituito false.");
            return false;
        }

        // Eliminare tutte le corrispondenti timer entries
        for (const id of numericIds) {
            const timerDeleted = await TimerController.deleteTimer(id);
            if (!timerDeleted) {
                console.warn(`⚠️ Warning: Timer ID ${id} non trovato o non eliminato.`);
            } else {
                console.log(`🟢 DEBUG: Timer ID ${id} eliminato.`);
            }
        }

        // Notifica al renderer di aggiornare la lista delle entry
        event.sender.send("updateTimeEntriesMain");

        return true;
    } catch (error) {
        console.error("❌ Errore nella cancellazione delle entry:", error);
        return false;
    }
});


ipcMain.handle('getEntriesByDate', async (event, date) => {
    return await TimeEntryController.getEntriesByDate(date);
});

ipcMain.handle('getProjectIdByName', async (event, name) => {
    try {
        console.log(`📡 Richiesta IPC: cerco ID per progetto '${name}'`);
        const projectId = await ProjectsController.getProjectIdByName(name);
        console.log(`📡 Risposta IPC: ID per '${name}': ${projectId}`);
        return projectId;
    } catch (error) {
        console.error(`❌ Errore nel recupero dell'ID progetto per '${name}':`, error);
        return null;
    }
});

ipcMain.handle('project:create', async (event, name, description) => {
    try {
        const projectId = await ProjectsController.createProject(name, description);
        return projectId;
    } catch (error) {
        console.error("Errore in project:create:", error);
        throw error;
    }
});

ipcMain.handle("getProjectNameById", async (event, projectId) => {
    try {
        const projectName = await ProjectsController.getProjectNameById(projectId);
        console.log(`📡 Risposta IPC: Nome per ID '${projectId}': ${projectName}`);
        return projectName;
    } catch (error) {
        console.error(`❌ Errore nel recupero del nome progetto per ID '${projectId}':`, error);
        return null;
    }
});

ipcMain.handle('getProjectDetailsById', async (event, projectId) => {
    try {
        const projectDetails = await ProjectsController.getProjectDetailsById(projectId);
        return projectDetails;
    } catch (error) {
        console.error(`❌ Errore nel recupero dei dettagli del progetto con ID '${projectId}':`, error);
        return null;
    }
});

ipcMain.handle("getDailyProjectTimeEntries", async () => {
    return await TimeEntryController.getDailyProjectTimeEntries();
});

// Recupera lo stato globale
ipcMain.handle("get-global-state", async () => {
    return globalState; // Assicuriamoci che restituisca sempre l'ultimo stato aggiornato
});

// Aggiorna lo stato globale
ipcMain.handle("set-global-state", (event, newState) => {
    globalState = { ...globalState, ...newState };
    return globalState;
});

// Funzione helper per aggiornare lo stato globale e sincronizzarlo con il Renderer Process
async function setGlobalStateInMain(newState) {
    globalState = { ...globalState, ...newState };

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-global-state", globalState);
    } else {
        console.warn("⚠️ Tentativo di aggiornare lo stato globale, ma `mainWindow` non è attivo.");
    }
}

ipcMain.handle("getAllTags", async () => {
    try {
        const tags = await TagsController.getAllTags(); // ← Chiami il tuo controller
        return tags;
    } catch (error) {
        console.error("❌ Errore nel recupero dei tag:", error);
        return [];
    }
});

ipcMain.handle('create-tag', async (event, name, color) => {
    try {
        const newTagId = await TagsController.createTag(name, color);
        return newTagId;
    } catch (error) {
        console.error("Errore handler create-tag:", error);
        throw error;
    }
});

ipcMain.handle('update-tag', async (event, tagId, updates) => {
    return await TagsController.updateTag(tagId, updates);
});

ipcMain.handle('delete-tag', async (event, tagId) => {
    return await TagsController.deleteTag(tagId);
});

ipcMain.handle('is-tag-in-use', async (event, tagId) => {
    return await TagsController.isTagInUse(tagId);
});

ipcMain.handle("get-all-time-entries", async () => {
    try {
        const entries = await TimeEntryController.getAllTimeEntries();
        return entries;
    } catch (error) {
        console.error("❌ Errore nel recupero delle time entries:", error);
        return [];
    }
});

ipcMain.handle("get-project-summaries", async () => {
    return await TimeEntryController.getProjectSummaries();
});

ipcMain.handle("getAllActivities", async () => {
    try {
        const activities = await ActivityController.getAllActivities();
        return activities;
    } catch (error) {
        console.error("❌ Errore in getAllActivities:", error);
        return [];
    }
});

ipcMain.handle("createActivity", async (event, name, projectId, duration) => {
    try {
        const activityId = await ActivityController.createActivity(name, projectId, duration);
        return activityId;
    } catch (error) {
        console.error("❌ Errore in createActivity:", error);
        throw error;
    }
});

ipcMain.handle("updateActivity", async (event, activityId, updates) => {
    try {
        const result = await ActivityController.updateActivity(activityId, updates);
        return result;
    } catch (error) {
        console.error("❌ Errore in updateActivity:", error);
        throw error;
    }
});

ipcMain.handle("deleteActivity", async (event, activityId) => {
    try {
        const result = await ActivityController.deleteActivity(activityId);
        return result;
    } catch (error) {
        console.error("❌ Errore in deleteActivity:", error);
        throw error;
    }
});

ipcMain.handle('get-project-by-id', async (event, projectId) => {
    try {
        return await ProjectsController.getProjectById(projectId);
    } catch (error) {
        console.error(`❌ Errore in getProjectById (${projectId}):`, error);
        return null;
    }
});

ipcMain.handle("delete-project", async (event, projectId) => {
    try {
        const result = await ProjectsController.deleteProject(projectId);
        return result;
    } catch (error) {
        console.error("❌ Errore nell'handler 'delete-project':", error);
        return false;
    }
});

ipcMain.handle("update-project", async (event, projectId, updates) => {
    try {
        const result = await ProjectsController.updateProject(projectId, updates);
        return result;
    } catch (error) {
        console.error("❌ Errore nell'handler 'update-project':", error);
        return false;
    }
});

ipcMain.handle('getTimeEntriesByDateRange', async (event, start, end) => {
    return await TimeEntryController.getTimeEntriesByDateRange(start, end);
});

ipcMain.handle("export-timeSheet-pdf", async (event, data) => {
    try {
        await ExportUtils.exportData("pdf", data);
        return { success: true };
    } catch (error) {
        console.error("❌ Errore nell'esportazione PDF:", error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle("get-aggregated-time-entries", async (event, options) => {
    try {
      const result = await TimeEntryController.getAggregatedTimeEntries(options);
      return result;
    } catch (error) {
      console.error("❌ Errore in get-aggregated-time-entries:", error);
      return [];
    }
});

ipcMain.handle('exportReportToPDF', async (_, reportData) => {
    const filePath = await ExportUtils.showSaveDialog('pdf');
    if (!filePath) return { success: false, message: 'Export cancelled' };

    try {
        ExportUtils.exportProjectReportToPDF(reportData, filePath);
        return { success: true };
    } catch (err) {
        console.error('PDF export failed:', err);
        return { success: false, message: err.message };
    }
});

ipcMain.handle("getAllAlerts", async () => {
    return await AlertsController.getAllAlerts();
});

ipcMain.handle("createAlert", async (event, alertData) => {
    const { title, projectId, type, priority, date } = alertData;
    return await AlertsController.createAlert(title, projectId, type, priority, date);
});

ipcMain.handle("updateAlert", async (event, id, updates) => {
    return await AlertsController.updateAlert(id, updates);
});

ipcMain.handle("deleteAlert", async (event, id) => {
    return await AlertsController.deleteAlert(id);
});

ipcMain.handle("getAlertById", async (event, id) => {
    return await AlertsController.getAlertById(id);
});

ipcMain.on('notify', (_, message) => {
    new Notification({ title: 'Alert', body: message }).show();
});

module.exports = { createWindow, handleWindowClose };
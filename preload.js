const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
    sendNotification: (message) => {
        if (!message || typeof message !== 'string' || message.trim() === '') {
            console.warn('Message is empty, undefined, or not a valid string');
            return;
        }
        ipcRenderer.send('notify', message);
    },
    onReceiveData: (callback) => {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const listener = (event, data) => callback(data);

        // Ensure the listener is not registered multiple times
        ipcRenderer.removeAllListeners('receive-data');
        ipcRenderer.on('receive-data', listener);

        // Return a function to remove the listener to avoid memory leaks
        return () => ipcRenderer.removeListener('receive-data', listener);
    },
    getAllProjects: () => ipcRenderer.invoke('getAllProjects'),
    getActivitiesByProjectId: (projectId) => ipcRenderer.invoke('getActivitiesByProjectId', projectId),
    onAppClose: (callback) => ipcRenderer.on('reset-timer-ui', callback),
    createTimer: (projectId, task, startTime, status) => ipcRenderer.invoke('createTimer', projectId, task, startTime, status),
    stopTimer: (timerId, manualEndTime = null) => ipcRenderer.invoke('stopTimer', timerId, manualEndTime),
    updateTimer: (timerId, updates) => ipcRenderer.invoke('updateTimer', timerId, updates),
    formatTime: (date) => new Date(date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    getEntriesByDate: (date) => ipcRenderer.invoke('getEntriesByDate', date),
    receive: (channel, callback) => {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },
    deleteTimeEntries: (ids) => {
        return ipcRenderer.invoke("deleteTimeEntries", ids);
    },
    getProjectIdByName: (name) => ipcRenderer.invoke('getProjectIdByName', name),
    getProjectNameById: (projectId) => ipcRenderer.invoke("getProjectNameById", projectId),
    getProjectDetailsById: (projectId) => ipcRenderer.invoke('getProjectDetailsById', projectId),
    getGlobalState: () => ipcRenderer.invoke("get-global-state"),
    setGlobalState: (newState) => ipcRenderer.invoke("set-global-state", newState),
    getDailyProjectTimeEntries: () => ipcRenderer.invoke("getDailyProjectTimeEntries"),
    getAllTags: () => ipcRenderer.invoke("getAllTags"),    
    createTag: (name, color) => ipcRenderer.invoke('create-tag', name, color),
    updateTag: (tagId, updates) => ipcRenderer.invoke('update-tag', tagId, updates),
    deleteTag: (tagId) => ipcRenderer.invoke('delete-tag', tagId),
    isTagInUse: (tagId) => ipcRenderer.invoke('is-tag-in-use', tagId),
    getAllTimeEntries: () => ipcRenderer.invoke("get-all-time-entries"),
    getProjectSummaries: () => ipcRenderer.invoke("get-project-summaries"),
    getAllActivities: () => ipcRenderer.invoke("getAllActivities"),
    createActivity: (name, projectId, duration) => ipcRenderer.invoke("createActivity", name, projectId, duration),
    updateActivity: (activityId, updates) => ipcRenderer.invoke("updateActivity", activityId, updates),
    deleteActivity: (activityId) => ipcRenderer.invoke("deleteActivity", activityId),
    createProject: (name, description) => ipcRenderer.invoke('project:create', name, description),
    getProjectById: (projectId) => ipcRenderer.invoke('get-project-by-id', projectId),
    deleteProject: async (projectId) => {
        return await ipcRenderer.invoke("delete-project", projectId);
    },
    updateProject: async (projectId, updates) => {
        return await ipcRenderer.invoke("update-project", projectId, updates);
    },
    getTimeEntriesByDateRange: (start, end) => ipcRenderer.invoke('getTimeEntriesByDateRange', start, end),
    exportTimeSheetToPDF: (data) => ipcRenderer.invoke("export-timeSheet-pdf", data),
    getAggregatedTimeEntries: (options) => ipcRenderer.invoke("get-aggregated-time-entries", options),
    exportReportToPDF: (data) => ipcRenderer.invoke('exportReportToPDF', data),
    getAllAlerts: () => ipcRenderer.invoke("getAllAlerts"),
    createAlert: (alertData) => ipcRenderer.invoke("createAlert", alertData),
    updateAlert: (id, updates) => ipcRenderer.invoke("updateAlert", id, updates),
    deleteAlert: (id) => ipcRenderer.invoke("deleteAlert", id),
    getAlertById: (id) => ipcRenderer.invoke("getAlertById", id),


};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
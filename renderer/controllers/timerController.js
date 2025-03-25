const Timer = require('../models/timer');
const loggingUtils = require('../utils/loggingUtils');
const timerUtils = require('../utils/timerUtils'); 
const dateTimeFormatUtils = require('../utils/dateTimeFormatUtils');
const TimeEntry = require('../models/timeEntry');
const dbUtils = require('../utils/dbUtils');

class TimerController {
    /**
     * Creates a new timer.
     * @param {number} projectId - The project ID associated with the timer.
     * @param {string} task - The task name linked to the timer.
     * @param {string} status - The initial status of the timer (`running`, `paused`, `stopped`).
     * @returns {Promise<number>} The ID of the newly created timer.
     */
    static async createTimer(projectId, task, startTime, status) {
        try {
            // 🛠️ Normalizza status per evitare errori dovuti a maiuscole o spazi
            status = typeof status === 'string' ? status.trim().toLowerCase() : null;
    
            // 🔍 Controllo di validità
            if (!['running', 'paused', 'stopped'].includes(status)) {
                throw new Error(`❌ Errore: Status non valido (${status})`);
            }
    
            if (!Number.isInteger(projectId) || projectId <= 0) {
                throw new Error(`❌ Errore: projectId non valido (${projectId})`);
            }
    
            if (!task || typeof task !== 'string' || task.trim() === '') {
                throw new Error(`❌ Errore: Task non valida (${task})`);
            }
    
            if (!startTime || isNaN(Date.parse(startTime))) {
                throw new Error(`❌ Errore: startTime non valido (${startTime})`);
            }
    
            console.log(`🔍 Creazione timer con -> ProjectID: ${projectId}, Task: ${task}, StartTime: ${startTime}, Status: ${status}`);
    
            // Crea il timer nel database
            const timerId = await Timer.createTimer(projectId, task, startTime, status);
    
            if (!timerId) {
                throw new Error("❌ Errore: Timer ID non ricevuto.");
            }
    
            loggingUtils.logMessage('info', `Timer creato con ID ${timerId}: Task ${task}, Progetto ${projectId}`, 'CONTROLLERS');
            return timerId;
            
        } catch (error) {
            loggingUtils.logMessage('error', `❌ Errore nella creazione del timer: ${error.message}`, 'CONTROLLERS');
            console.error(`❌ Errore nella creazione del timer: ${error.message}`);
            throw new Error('Failed to create timer');
        }
    }    

    /**
     * Retrieves a timer by ID.
     * @param {number} timerId - The ID of the timer.
     * @returns {Promise<Object|null>} The timer object or null if not found.
     */
    static async getTimerById(timerId) {
        try {
            const timer = await Timer.getTimerById(timerId);
            if (!timer) {
                loggingUtils.logMessage('warn', `Timer not found: ID ${timerId}`, 'CONTROLLERS');
            }
            return timer;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve timer');
        }
    }

    /**
     * Updates an existing timer.
     * @param {number} timerId - The ID of the timer.
     * @param {Object} updates - The updated fields (e.g., status, endTime).
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateTimer(timerId, updates) {
        try {
            if (updates.endTime && !dateTimeFormatUtils.isValidDate(updates.endTime)) {
                throw new Error('Invalid end time format');
            }
    
            // ⬇️ Controlliamo se il timer esiste prima di aggiornarlo
            const existingTimer = await Timer.getTimerById(timerId);
            if (!existingTimer) {
                loggingUtils.logMessage('error', `Error updating timer: Timer ID ${timerId} not found`, 'CONTROLLERS');
                return { success: false };
            }
    
            const success = await Timer.updateTimer(timerId, updates);
    
            if (!success) {
                loggingUtils.logMessage('error', `Error updating timer: Timer ID ${timerId} update failed`, 'CONTROLLERS');
                return { success: false };
            }
    
            loggingUtils.logMessage('info', `Timer updated: ID ${timerId}`, 'CONTROLLERS');
            return { success: true };
        } catch (error) {
            loggingUtils.logMessage('error', `Error updating timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to update timer');
        }
    }    

    /**
     * Deletes a timer.
     * @param {number} timerId - The ID of the timer to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteTimer(timerId) {
        try {
            const numericId = Number(timerId); // Convertiamo in numero
    
            if (isNaN(numericId) || numericId <= 0) {
                console.error(`❌ Errore: Timer ID non valido (${timerId})`);
                return false;
            }
    
            const success = await Timer.deleteTimer(numericId);
    
            if (!success) {
                loggingUtils.logMessage('error', `Error deleting timer: Timer ID ${numericId} not found`, 'CONTROLLERS');
                return false;
            }
    
            loggingUtils.logMessage('info', `Timer deleted: ID ${numericId}`, 'CONTROLLERS');
            return true;
        } catch (error) {
            loggingUtils.logMessage('error', `Error deleting timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete timer');
        }
    }    

    /**
     * Retrieves all timers.
     * @returns {Promise<Array>} An array of all timers.
     */
    static async getAllTimers() {
        try {
            const timers = await Timer.getAllTimers();
            loggingUtils.logMessage('info', `Retrieved ${timers.length} timers`, 'CONTROLLERS');
            return timers;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving timers: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve timers');
        }
    }

    /**
     * Stops a timer and calculates total elapsed time.
     * @param {number} timerId - The ID of the timer.
     * @returns {Promise<string>} Total elapsed time in HH:mm:ss format.
     */
    static async stopTimer(timerId, manualEndTime = null) {
        try {
            // Recuperiamo il timer esistente
            const timer = await Timer.getTimerById(timerId);
            if (!timer) {
                throw new Error(`Timer non trovato: ID ${timerId}`);
            }
    
            let endTime;
    
            if (manualEndTime) {
                // ✅ Caso 1: entry manuale → usiamo endTime passato da `logManualEntry()`
                endTime = manualEndTime;
                console.log(`🟡 DEBUG -> Entry manuale, uso endTime passato: ${endTime}`);
            } else {
                // ✅ Caso 2: entry normale (timer) → usiamo il momento attuale
                endTime = new Date().toISOString();
                console.log(`🟡 DEBUG -> Entry timer, uso ora attuale come endTime: ${endTime}`);
            }
    
            const elapsedTime = timerUtils.getElapsedTime(timer.startTime, endTime);
    
            console.log(`🟡 DEBUG -> endTime PRIMA di salvare nel DB: ${endTime}`);
    
            //  Aggiorniamo il timer esistente, cambiando stato e aggiungendo endTime
            await Timer.updateTimer(timerId, { endTime, status: 'stopped' });
    
            // Creiamo un nuovo record nella tabella time_entries
            await TimeEntry.createTimeEntry(timer.project_id, timer.task, timer.startTime, endTime);
    
            loggingUtils.logMessage('info', `Timer fermato: ID ${timerId}, Durata: ${elapsedTime}`, 'CONTROLLERS');
            return elapsedTime;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nel fermare il timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Impossibile fermare il timer');
        }
    }
    
    /**
     * Retrieves the currently active timer (status = 'running').
     * @returns {Promise<Object|null>} The active timer object or null if no active timer exists.
     */
    static async getActiveTimer() {
        try {
            const query = `SELECT * FROM timers WHERE status = 'running' LIMIT 1`;
            const result = await dbUtils.runQuery(query);
            console.log("🔍 DEBUG: Risultato query getActiveTimer:", result);

            if (result.length === 0) {
                return null; // Nessun timer attivo
            }

            return result[0]; // Restituiamo il primo timer attivo trovato
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nel recupero del timer attivo: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve active timer');
        }
    }
}

module.exports = TimerController;
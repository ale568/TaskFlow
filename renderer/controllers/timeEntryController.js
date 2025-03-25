const dbUtils = require('../utils/dbUtils');
const TimeEntry = require('../models/timeEntry');
const loggingUtils = require('../utils/loggingUtils');

class TimeEntryController {

    /**
     * Crea una nuova entry di tempo
     * @param {number} project_id - ID del progetto
     * @param {string} task - Nome dell'attività
     * @param {string} startTime - Orario di inizio (ISO)
     * @param {string|null} endTime - Orario di fine (ISO o null)
     * @param {number|null} tag_id - ID del tag associato (opzionale)
     * @returns {Promise<number>} - L'ID della nuova entry creata
     */
    static async createTimeEntry(project_id, task, startTime, endTime = null, tag_id = null) {
        try {
            const entryId = await TimeEntry.createTimeEntry(project_id, task, startTime, endTime, tag_id);
            if (!entryId) {
                throw new Error("Errore nella creazione dell'entry.");
            }
            loggingUtils.logMessage('info', `Time entry creata con ID ${entryId}`, 'CONTROLLERS');
            return entryId;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nella creazione dell'entry: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to create time entry');
        }
    }

    /**
     * Recupera una entry specifica tramite ID
     * @param {number} id - ID dell'entry
     * @returns {Promise<Object|null>} - L'entry trovata o null se non esiste
     */
    static async getTimeEntryById(id) {
        try {
            const entry = await TimeEntry.getTimeEntryById(id);
            if (!entry) {
                loggingUtils.logMessage('warn', `Time entry non trovata: ID ${id}`, 'CONTROLLERS');
            }
            return entry;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nel recupero dell'entry: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve time entry');
        }
    }

    /**
     * Aggiorna una entry esistente
     * @param {number} id - ID dell'entry
     * @param {Object} updates - Campi da aggiornare
     * @returns {Promise<boolean>} - True se l'aggiornamento è andato a buon fine, False altrimenti
     */
    static async updateTimeEntry(id, updates) {
        try {
            const success = await TimeEntry.updateTimeEntry(id, updates);
            if (!success) {
                loggingUtils.logMessage('error', `Errore nell'aggiornamento dell'entry: ID ${id} non trovato`, 'CONTROLLERS');
                return false;
            }

            loggingUtils.logMessage('info', `Time entry aggiornata: ID ${id}`, 'CONTROLLERS');
            return true;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nell'aggiornamento dell'entry: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to update time entry');
        }
    }

    /**
     * Elimina una entry di tempo dal database
     * @param {number} id - ID dell'entry
     * @returns {Promise<boolean>} - True se la rimozione è avvenuta con successo
     */
    static async deleteTimeEntry(id) {
        try {
            const success = await TimeEntry.deleteTimeEntry(id);
            if (!success) {
                loggingUtils.logMessage('error', `Errore nell'eliminazione dell'entry: ID ${id} non trovato`, 'CONTROLLERS');
                return false;
            }

            loggingUtils.logMessage('info', `Time entry eliminata: ID ${id}`, 'CONTROLLERS');
            return true;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nell'eliminazione dell'entry: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete time entry');
        }
    }

    static async deleteTimeEntries(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error("❌ Errore: Nessun ID fornito per la cancellazione.");
            }
    
            console.log("🟡 DEBUG: Eliminazione in corso per gli ID ->", ids);
    
            for (const id of ids) {
                const numericId = Number(id); // Convertiamo in numero
    
                if (isNaN(numericId) || numericId <= 0) {
                    console.error(`❌ Errore: ID non valido (${id})`);
                    continue;
                }
    
                const success = await TimeEntry.deleteTimeEntry(numericId);
                if (!success) {
                    loggingUtils.logMessage('error', `Errore nell'eliminazione dell'entry: ID ${numericId} non trovato`, 'CONTROLLERS');
                } else {
                    loggingUtils.logMessage('info', `Time entry eliminata: ID ${numericId}`, 'CONTROLLERS');
                }
            }
            return true;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nell'eliminazione delle entry: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete time entries');
        }
    }        

    /**
     * Recupera tutte le entry dal database
     * @returns {Promise<Array>} - Un array contenente tutte le time entries
     */
    static async getAllTimeEntries() {
        try {
            const entries = await TimeEntry.getAllTimeEntries();
            loggingUtils.logMessage('info', `Recuperate ${entries.length} time entries`, 'CONTROLLERS');
            return entries;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nel recupero delle time entries: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve time entries');
        }
    }

    static async getTimeEntriesByDateRange(startDate, endDate) {
        try {
            const entries = await TimeEntry.getTimeEntriesByDateRange(startDate, endDate);
            loggingUtils.logMessage('info', `Recuperate ${entries.length} entry tra ${startDate} e ${endDate}`, 'CONTROLLERS');
            return entries;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nel recupero delle time entries nel range: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve time entries by date range');
        }
    }    

    /**
     * Recupera le entry per una specifica data
     * @param {string} date - Data in formato YYYY-MM-DD
     * @returns {Promise<Array>} - Lista delle entry con dettagli progetto e tag
     */
    static async getEntriesByDate(date) {
        try {
            const query = `
                SELECT 
                    te.id, te.project_id, te.task, te.startTime, te.endTime, te.duration, te.tag_id,
                    p.name AS project_name, p.description AS project_description,
                    t.color AS tag_color
                FROM time_entries te
                JOIN projects p ON te.project_id = p.id
                LEFT JOIN tags t ON te.tag_id = t.id
                WHERE strftime('%Y-%m-%d', te.startTime) = ?;
            `;

            // Usa runQuery() per ottenere i dati
            const result = await dbUtils.runQuery(query, [date]);

            // Se il risultato contiene un array, restituiscilo direttamente
            if (Array.isArray(result)) {
                return result;
            }

            // Se il risultato contiene un errore, loggalo e restituisci un array vuoto
            console.error(`❌ Errore nel recupero delle entry per la data ${date}:`, result.error || "Errore sconosciuto");
            return [];
        } catch (error) {
            console.error(`❌ Errore critico nel recupero delle entry per la data ${date}:`, error);
            return [];
        }
    }

    static async getDailyProjectTimeEntries() {
        try {
            console.log("🔍 Recupero tempo totale lavorato per progetto oggi...");
            const entries = await TimeEntry.getDailyProjectTimeEntries();
            
            if (!entries || entries.length === 0) {
                console.warn("⚠️ Nessuna entry trovata per oggi.");
                return [];
            }
    
            return entries;
        } catch (error) {
            console.error("❌ Errore nel recupero delle entry giornaliere dal controller:", error);
            return [];
        }
    }

    static async getProjectSummaries() {
        try {
            const query = `
                SELECT 
                    p.id AS project_id,
                    p.name AS project_name,
                    p.description AS project_description,
                    COALESCE(SUM(te.duration), 0) AS total_minutes,
                    COALESCE((
                        SELECT t.color
                        FROM time_entries te2
                        JOIN tags t ON te2.tag_id = t.id
                        WHERE te2.project_id = p.id
                        AND te2.tag_id IS NOT NULL
                        LIMIT 1
                    ), '#d3d3d3') AS tag_color
                FROM projects p
                LEFT JOIN time_entries te ON te.project_id = p.id
                GROUP BY p.id, p.name, p.description
            `;
    
            const result = await dbUtils.runQuery(query);
            return result || [];
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nel riepilogo progetti: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to get project summaries');
        }
    }
    
    static async getAggregatedTimeEntries({ projectIds, period, date }) {

        try {

            const data = await TimeEntry.getAggregatedTimeEntries({ projectIds, period, date });
            loggingUtils.logMessage('info', `📊 Aggregated time entries fetched (period: ${period})`, 'CONTROLLERS');
            return data;
        } catch (error) {
            loggingUtils.logMessage('error', `❌ Errore nel controller getAggregatedTimeEntries: ${error.message}`, 'CONTROLLERS');
            return [];
        }
    }
    
}

module.exports = TimeEntryController;
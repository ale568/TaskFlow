const storageUtils = require('../utils/storageUtils');
const dbUtils = require('../utils/dbUtils');

class Project {
// static dbName = 'taskflow_test_project.sqlite';  DB test
   static dbName = 'taskflow.sqlite';

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new project record in the database.
     * @param {string} name - The name of the project.
     * @param {string} [description] - Optional project description.
     * @returns {Promise<number>} - The ID of the created project.
     * @throws Will throw an error if the operation fails.
     */
    static async createProject(name, description = null) {
        return await storageUtils.createRecord('projects', { name, description }, this.dbName);
    }

    /**
     * Retrieves a project by its ID.
     * @param {number} id - The project ID.
     * @returns {Promise<Object|null>} - The project record or null if not found.
     */
    static async getProjectById(id) {
        return await storageUtils.getRecordById('projects', id, this.dbName);
    }

    /**
     * Retrieves the ID of a project by its name.
     * @param {string} name - The project name.
     * @returns {Promise<number|null>} - The project ID or null if not found.
     */
    static async getProjectIdByName(name) {
        const query = `SELECT id FROM projects WHERE name = ? LIMIT 1`;
        
        console.log(`🛠️ Eseguo query per ottenere ID progetto con nome: '${name}'`);
        
        try {
            const result = await dbUtils.runQuery(query, [name], this.dbName);
            
            console.log(`🛠️ Risultato query per '${name}':`, result);
            
            if (result && result.length > 0) {
                console.log(`✅ ID trovato per '${name}': ${result[0].id}`);
                return result[0].id;
            }

            console.warn(`⚠️ Nessun ID trovato per il progetto '${name}'`);
            return null;
        } catch (error) {
            console.error(`❌ Errore nella query getProjectIdByName per '${name}':`, error);
            return null;
        }
    }

    /**
     * Retrieves the name of a project by its ID.
     * @param {number} projectId - The ID of the project.
     * @returns {Promise<string | null>} - The project name or null if not found.
     */
    static async getProjectNameById(projectId) {
        const query = `SELECT name FROM projects WHERE id = ? LIMIT 1`;

        console.log(`🛠️ Eseguo query per ottenere il nome del progetto con ID: '${projectId}'`);

        try {
            const result = await dbUtils.runQuery(query, [projectId]);

            if (result && result.length > 0) {
                console.log(`✅ Nome del progetto trovato: ${result[0].name}`);
                return result[0].name;
            }

            console.warn(`⚠️ Nessun progetto trovato con ID '${projectId}'`);
            return null;
        } catch (error) {
            console.error(`❌ Errore nella query getProjectNameById per ID '${projectId}':`, error);
            return null;
        }
    }

    /**
     * Retrieves the name and description of a project by its ID.
     * @param {number} projectId - The project ID.
     * @returns {Promise<{name: string, description: string} | null>} - The project details or null if not found.
     */
    static async getProjectDetailsById(projectId) {
        const query = `SELECT name, description FROM projects WHERE id = ? LIMIT 1`;
        
        console.log(`🛠️ Eseguo query per ottenere dettagli progetto con ID: '${projectId}'`);
        
        try {
            const result = await dbUtils.runQuery(query, [projectId], this.dbName);
            
            console.log(`🛠️ Risultato query per ID '${projectId}':`, result);
            
            if (result && result.length > 0) {
                console.log(`✅ Dettagli trovati per ID '${projectId}':`, result[0]);
                return result[0]; // Ritorna un oggetto con { name, description }
            }

            console.warn(`⚠️ Nessun dettaglio trovato per il progetto con ID '${projectId}'`);
            return null;
        } catch (error) {
            console.error(`❌ Errore nella query getProjectDetailsById per ID '${projectId}':`, error);
            return null;
        }
    }

    /**
     * Updates an existing project record.
     * @param {number} id - The project ID.
     * @param {Object} updates - The fields to update.
     * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
     */
    static async updateProject(id, updates) {
        return await storageUtils.updateRecord('projects', id, updates, this.dbName);
    }

    /**
     * Deletes a project by its ID.
     * @param {number} id - The project ID.
     * @returns {Promise<boolean>} - True if the project was deleted, false otherwise.
     */
    static async deleteProject(id) {
        return await storageUtils.deleteRecord('projects', id, this.dbName);
    }

    /**
     * Retrieves all projects from the database.
     * @returns {Promise<Array>} - A list of all project records.
     */
    static async getAllProjects() {
        return await storageUtils.getAllRecords('projects', this.dbName);
    }
}

module.exports = Project;
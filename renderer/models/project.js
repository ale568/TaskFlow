const storageUtils = require('../utils/storageUtils');
const dbUtils = require('../utils/dbUtils');

class Project {
    static dbName = 'taskflow_test_project.sqlite'; // Default to the test database

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
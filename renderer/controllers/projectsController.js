const Project = require('../models/project');
const LoggingUtils = require('../utils/loggingUtils');

/**
 * Controller for managing project operations.
 * Provides methods to create, retrieve, update, and delete projects.
 */
class ProjectsController {
    /**
     * Creates a new project.
     * @param {string} name - The name of the project.
     * @param {string} [description] - Optional description of the project.
     * @returns {Promise<number>} The ID of the newly created project.
     */
    static async createProject(name, description = null) {
        try {
            const projectId = await Project.createProject(name, description);
            LoggingUtils.logMessage('info', `Project created: ID ${projectId}`, 'CONTROLLERS');
            return projectId;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error creating project: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to create project');
        }
    }

    /**
     * Retrieves a project by ID.
     * @param {number} projectId - The ID of the project.
     * @returns {Promise<Object|null>} The project object or null if not found.
     */
    static async getProjectById(projectId) {
        try {
            const project = await Project.getProjectById(projectId);
            if (project) {
                LoggingUtils.logMessage('info', `Project retrieved: ID ${projectId}`, 'CONTROLLERS');
            } else {
                LoggingUtils.logMessage('warn', `Project ID ${projectId} not found`, 'CONTROLLERS');
            }
            return project;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error retrieving project: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve project');
        }
    }

    /**
     * Retrieves the ID of a project by its name.
     * @param {string} name - The project name.
     * @returns {Promise<number|null>} - The project ID or null if not found.
     */
    static async getProjectIdByName(name) {
        try {
            console.log(`🔍 Cerco ID per il progetto: '${name}' nel controller...`);
            const projectId = await Project.getProjectIdByName(name);
    
            if (projectId) {
                console.log(`✅ Project ID trovato per '${name}': ${projectId}`);
                LoggingUtils.logMessage('info', `Project ID retrieved for '${name}': ${projectId}`, 'CONTROLLERS');
            } else {
                console.warn(`⚠️ Project '${name}' non trovato nel database.`);
                LoggingUtils.logMessage('warn', `Project '${name}' not found`, 'CONTROLLERS');
            }
    
            return projectId;
        } catch (error) {
            console.error(`❌ Errore nel recupero dell'ID progetto per '${name}':`, error);
            LoggingUtils.logMessage('error', `Error retrieving project ID for '${name}': ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve project ID');
        }
    }

    /**
     * Retrieves project name by its ID.
     * @param {number} projectId - The ID of the project.
     * @returns {Promise<string | null>} - The project name or null if not found.
     */
    static async getProjectNameById(projectId) {
        try {
            console.log(`🔍 Cerco nome del progetto con ID: '${projectId}' nel controller...`);
            const projectName = await Project.getProjectNameById(projectId);

            if (projectName) {
                console.log(`✅ Nome progetto trovato per ID '${projectId}': ${projectName}`);
            } else {
                console.warn(`⚠️ Nessun progetto trovato con ID '${projectId}'`);
            }

            return projectName;
        } catch (error) {
            console.error(`❌ Errore nel recupero del nome progetto per ID '${projectId}':`, error);
            throw new Error('Failed to retrieve project name');
        }
    }

    /**
     * Retrieves the name and description of a project by its ID.
     * @param {number} projectId - The project ID.
     * @returns {Promise<{name: string, description: string} | null>} - The project details or null if not found.
     */
    static async getProjectDetailsById(projectId) {
        try {
            console.log(`🔍 Cerco dettagli per il progetto con ID: '${projectId}' nel controller...`);
            const projectDetails = await Project.getProjectDetailsById(projectId);

            if (projectDetails) {
                console.log(`✅ Dettagli trovati per ID '${projectId}':`, projectDetails);
                LoggingUtils.logMessage('info', `Project details retrieved for ID '${projectId}': ${JSON.stringify(projectDetails)}`, 'CONTROLLERS');
            } else {
                console.warn(`⚠️ Nessun dettaglio trovato per il progetto con ID '${projectId}'`);
                LoggingUtils.logMessage('warn', `Project details not found for ID '${projectId}'`, 'CONTROLLERS');
            }

            return projectDetails;
        } catch (error) {
            console.error(`❌ Errore nel recupero dei dettagli progetto per ID '${projectId}':`, error);
            LoggingUtils.logMessage('error', `Error retrieving project details for ID '${projectId}': ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve project details');
        }
    }


    /**
     * Updates an existing project.
     * @param {number} projectId - The ID of the project.
     * @param {Object} updates - The updated project fields.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateProject(projectId, updates) {
        try {
            const success = await Project.updateProject(projectId, updates);
            if (success) {
                LoggingUtils.logMessage('info', `Project updated: ID ${projectId}`, 'CONTROLLERS');
            } else {
                LoggingUtils.logMessage('warn', `Project update failed: ID ${projectId}`, 'CONTROLLERS');
            }
            return success;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error updating project: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to update project');
        }
    }

    /**
     * Deletes a project.
     * @param {number} projectId - The ID of the project to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteProject(projectId) {
        try {
            const success = await Project.deleteProject(projectId);
            if (success) {
                LoggingUtils.logMessage('info', `Project deleted: ID ${projectId}`, 'CONTROLLERS');
            } else {
                LoggingUtils.logMessage('warn', `Failed to delete project ID ${projectId}`, 'CONTROLLERS');
            }
            return success;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error deleting project: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete project');
        }
    }

    /**
     * Retrieves all projects, optionally filtered by criteria.
     * @param {Object} filters - Optional filtering criteria.
     * @returns {Promise<Array>} An array of all projects.
     */
    static async getAllProjects() {
        try {
            const projects = await Project.getAllProjects();
            LoggingUtils.logMessage('info', `Retrieved ${projects.length} projects`, 'CONTROLLERS');
            return projects;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error retrieving projects: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve projects');
        }
    }    
}

module.exports = ProjectsController;
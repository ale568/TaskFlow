const fs = require('fs');
const path = require('path');
const Project = require('../models/project');

const LOG_FILE = path.resolve(__dirname, '../../logs/controllers.log');

/**
 * Logs messages to a file instead of the terminal.
 * @param {string} message - The log message.
 */
function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

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
            return await Project.createProject(name, description);
        } catch (error) {
            logToFile(`❌ Error creating project: ${error.message}`);
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
            return await Project.getProjectById(projectId);
        } catch (error) {
            logToFile(`❌ Error retrieving project: ${error.message}`);
            throw new Error('Failed to retrieve project');
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
            return await Project.updateProject(projectId, updates);
        } catch (error) {
            logToFile(`❌ Error updating project: ${error.message}`);
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
            return await Project.deleteProject(projectId);
        } catch (error) {
            logToFile(`❌ Error deleting project: ${error.message}`);
            throw new Error('Failed to delete project');
        }
    }

    /**
     * Retrieves all projects.
     * @returns {Promise<Array>} An array of all projects.
     */
    static async getAllProjects() {
        try {
            return await Project.getAllProjects();
        } catch (error) {
            logToFile(`❌ Error retrieving projects: ${error.message}`);
            throw new Error('Failed to retrieve projects');
        }
    }
}

module.exports = ProjectsController;
const Project = require('../models/project');
const LoggingUtils = require('../utils/loggingUtils');
const FilterUtils = require('../utils/filterUtils');

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
    static async getAllProjects(filters = {}) {
        try {
            const projects = await Project.getAllProjects();

            if (Object.keys(filters).length > 0) {
                const filteredProjects = FilterUtils.filterProjects(projects, filters);
                LoggingUtils.logMessage('info', `Retrieved ${filteredProjects.length} filtered projects`, 'CONTROLLERS');
                return filteredProjects;
            }

            LoggingUtils.logMessage('info', `Retrieved ${projects.length} projects`, 'CONTROLLERS');
            return projects;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error retrieving projects: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve projects');
        }
    }
}

module.exports = ProjectsController;
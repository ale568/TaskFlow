const storageUtils = require('../utils/storageUtils');

class Project {
    // Creates a new project record
    static async createProject(name, description) {
        return await storageUtils.createRecord('projects', { name, description });
    }

    // Retrieves a project by ID
    static async getProjectById(id) {
        return await storageUtils.getRecordById('projects', id);
    }

    // Retrieves all projects
    static async getAllProjects() {
        return await storageUtils.getAllRecords('projects');
    }

    // Updates an existing project record
    static async updateProject(id, updates) {
        if (updates.name !== undefined && updates.name.trim() === '') {
            throw new Error('Project name cannot be empty');
        }
        return await storageUtils.updateRecord('projects', id, updates);
    }
    

    // Deletes a project record
    static async deleteProject(id) {
        if (!id || typeof id !== 'number') {
            throw new Error('Invalid project ID');
        }
        return await storageUtils.deleteRecord('projects', id);
    }
    
}

module.exports = Project;
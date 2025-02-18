const storageUtils = require('../utils/storageUtils');

class Activity {
    constructor(id, name, project_id, duration) {
        this.id = id;
        this.name = name;
        this.project_id = project_id;
        this.duration = duration;
    }

    // Creates a new activity in the database
    static async createActivity(name, projectId, duration) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid name');
        }
        if (!projectId || typeof projectId !== 'number') {
            throw new Error('Invalid project ID');
        }
        if (!duration || typeof duration !== 'number' || duration <= 0) {
            throw new Error('Invalid duration');
        }
    
        const activityId = await storageUtils.createRecord('activities', {
            name,
            project_id: projectId,
            duration
        });
    
        return new Activity(activityId, name, projectId, duration);
    }
    

    // Retrieves an activity by ID
    static async getActivityById(activityId) {
        if (!activityId || typeof activityId !== 'number' || activityId <= 0) {
            throw new Error('Invalid activity ID');
        }

        const data = await storageUtils.getRecordById('activities', activityId);
        return data ? new Activity(data.id, data.name, data.project_id, data.duration) : null;
    }

    // Retrieves all activities for a given project
    static async getActivitiesByProjectId(project_id) {
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project ID');
        }

        const results = await storageUtils.getRecordsByField('activities', 'project_id', project_id);
        return results.map(row => new Activity(row.id, row.name, row.project_id, row.duration));
    }

    // Updates an activity
    static async updateActivity(activityId, updates) {
        if (!activityId || typeof activityId !== 'number' || activityId <= 0) {
            throw new Error('Invalid activity ID');
        }
        
        const success = await storageUtils.updateRecord('activities', activityId, updates);
        if (!success) {
            throw new Error('Failed to update activity');
        }

        return this.getActivityById(activityId);
    }

    // Deletes an activity
    static async deleteActivity(activityId) {
        if (!activityId || typeof activityId !== 'number' || activityId <= 0) {
            throw new Error('Invalid activity ID');
        }

        return await storageUtils.deleteRecord('activities', activityId);
    }
}

module.exports = Activity;

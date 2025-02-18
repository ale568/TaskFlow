const storageUtils = require('../utils/storageUtils');

class Timer {
    constructor(id, project_id, task, startTime, endTime, status) {
        this.id = id;
        this.project_id = project_id;
        this.task = task;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    // Creates a new timer entry in the database
    static async createTimer(project_id, task) {
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project_id');
        }
        if (!task || typeof task !== 'string' || task.trim() === '') {
            throw new Error('Invalid task');
        }

        const data = {
            project_id,
            task,
            startTime: new Date().toISOString(),
            status: 'running'
        };

        const timerId = await storageUtils.createRecord('timers', data);
        return new Timer(timerId, project_id, task, data.startTime, null, 'running');
    }

    // Retrieves a timer entry by ID
    static async getTimerById(timerId) {
        if (!timerId || typeof timerId !== 'number' || timerId <= 0) {
            throw new Error('Invalid timer ID');
        }

        const row = await storageUtils.getRecordById('timers', timerId);
        if (!row) return null;

        return new Timer(row.id, row.project_id, row.task, row.startTime, row.endTime, row.status);
    }

    // Updates the status of a timer
    static async updateTimerStatus(timerId, newStatus) {
        if (!['running', 'paused', 'stopped'].includes(newStatus)) {
            throw new Error('Invalid status');
        }

        const updateData = { status: newStatus };
        if (newStatus === 'stopped') {
            updateData.endTime = new Date().toISOString();
        }

        const success = await storageUtils.updateRecord('timers', timerId, updateData);
        
        if (!success) {
            throw new Error('Failed to update timer');  // Throw an error if the timer does not exist
        }

        const updatedTimer = await this.getTimerById(timerId);
        if (!updatedTimer) {
            throw new Error('Failed to update timer');  // Throw an error if the timer is not found
        }

        return updatedTimer;
    }
    // Deletes a timer entry by ID
    static async deleteTimer(timerId) {
        if (!timerId || typeof timerId !== 'number' || timerId <= 0) {
            throw new Error('Invalid timer ID');
        }

        return await storageUtils.deleteRecord('timers', timerId);
    }
}

module.exports = Timer;

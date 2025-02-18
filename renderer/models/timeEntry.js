const storageUtils = require('../utils/storageUtils');

class TimeEntry {
    constructor(id, project_id, task, startTime, endTime, duration, tag_id) {
        this.id = id;
        this.project_id = project_id;
        this.task = task;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.tag_id = tag_id;
    }

    static async createTimeEntry(project_id, task, startTime, tag_id = null) {
        const entryData = await storageUtils.createTimeEntry(project_id, task, startTime, tag_id);
        return entryData ? new TimeEntry(...Object.values(entryData)) : null;
    }

    static async getTimeEntryById(entryId) {
        const entryData = await storageUtils.getTimeEntryById(entryId);
        return entryData ? new TimeEntry(...Object.values(entryData)) : null;
    }

    static async getAllTimeEntries() {
        const entries = await storageUtils.getAllTimeEntries();
        return entries.map(data => new TimeEntry(...Object.values(data)));
    }

    static async updateTimeEntry(id, updates) {
        return await storageUtils.updateTimeEntry(id, updates);
    }

    static async deleteTimeEntry(id) {
        return await storageUtils.deleteTimeEntry(id);
    }
}

module.exports = TimeEntry;

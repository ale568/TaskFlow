const TimeEntry = require('../models/timeEntry');

class TimeSheetController {
    constructor() {
        this.entries = [];
    }

    addEntry(entry) {
        this.entries.push(entry);
    }

    removeEntry(id) {
        this.entries = this.entries.filter(entry => entry.id !== id);
    }

    getEntries() {
        return this.entries;
    }

    getEntriesByProject(project) {
        return this.entries.filter(entry => entry.project === project);
    }

    getTotalWorkedHours() {
        return this.entries.reduce((total, entry) => total + entry.duration, 0);
    }

    setEntries(entries) {
        this.entries = entries;
    }
}

module.exports = TimeSheetController;
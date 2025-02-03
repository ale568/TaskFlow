class Activity {
    constructor(name, duration, project = null, startTime = new Date()) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid name');
        }
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('Invalid duration');
        }
        if (project !== null && typeof project !== 'string') {
            throw new Error('Invalid project');
        }
        if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
            throw new Error('Invalid startTime');
        }

        this.name = name;
        this.duration = duration;
        this.project = project;
        this.startTime = startTime;
        this.endTime = new Date(this.startTime.getTime() + duration * 1000);
        this.createdAt = new Date(); 
    }
}

module.exports = Activity;
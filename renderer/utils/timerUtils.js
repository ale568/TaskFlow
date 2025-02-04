function formatTime(seconds) {
    if (seconds == null || seconds < 0) {
        return '00:00:00';
    }
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
}

function getTotalTime(intervals) {
    return intervals.reduce((total, interval) => {
        if (interval.start == null || interval.end == null) {
            return total;
        }
        return total + (interval.end - interval.start);
    }, 0);
}

class Timer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now() - this.elapsedTime;
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.elapsedTime = Date.now() - this.startTime;
        }
    }

    reset() {
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
    }

    getTime() {
        if (this.isRunning) {
            return (Date.now() - this.startTime) / 1000;
        }
        return this.elapsedTime / 1000;
    }
}

module.exports = {
    formatTime,
    getTotalTime,
    Timer
};
// Funzione che converte i secondi in formato hh:mm:ss
function formatTime(seconds) {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
}

// Funzione che calcola il tempo totale da più intervalli di tempo
function getTotalTime(intervals) {
    return intervals.reduce((total, interval) => total + (interval.end - interval.start), 0);
}

// Classe Timer con metodi start e pause
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
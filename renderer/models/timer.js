class Timer {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.running = false;
        this.interval = null;
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.interval = setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
            }, 100);
        }
    }

    stop() {
        if (this.running) {
            this.running = false;
            clearInterval(this.interval);
            this.interval = null;
            this.elapsedTime = Date.now() - this.startTime;
        }
    }

    reset() {
        this.stop();
        this.elapsedTime = 0;
    }

    getTime() {
        return this.elapsedTime / 1000; // return time in seconds
    }
}

module.exports = Timer;
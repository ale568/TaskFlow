const Timer = require('../renderer/models/timer');

describe('Timer', () => {
    afterEach(() => {
        jest.useRealTimers(); // Real timer used for avoid interference with Jest
        jest.clearAllTimers(); // Removes any leftover active timers
    });

    test('The timer should be able to start and stop, recording the elapsed time.', (done) => {
        const timer = new Timer();
        timer.start();
        
        setTimeout(() => {
            timer.stop(); // Timer is always stopped
            expect(timer.getTime()).toBeGreaterThan(0);
            done();
        }, 500);
    });

    test('The timer should set an interval when it starts.', () => {
        const timer = new Timer();
        timer.start();
        expect(timer.interval).not.toBeNull();
        timer.stop(); // I always stop the timer after the test.
    });

    test('The timer should be able to reset to zero.', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        timer.reset();
        expect(timer.getTime()).toBe(0);
    });

    test('The timer should not increase time if start() is called multiple times without stop().', () => {
        const timer = new Timer();
        timer.start();
        const initialTime = timer.getTime();
        timer.start();
        expect(timer.getTime()).toBe(initialTime);
        timer.stop(); // Ensures the timer is stopped
    });

    test('The timer should stop correctly if stop() is called multiple times.', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        const stoppedTime = timer.getTime();
        timer.stop();
        expect(timer.getTime()).toBe(stoppedTime);
    });

    test('The timer should reset correctly if reset() is called multiple times.', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        timer.reset();
        timer.reset();
        expect(timer.getTime()).toBe(0);
    });
});
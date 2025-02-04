const timerUtils = require('../../renderer/utils/timerUtils');

describe('Timer Utils', () => {

    test('It should convert seconds into the hh:mm:ss format', () => {
        expect(timerUtils.formatTime(3661)).toBe('01:01:01');
        expect(timerUtils.formatTime(59)).toBe('00:00:59');
        expect(timerUtils.formatTime(0)).toBe('00:00:00');
    });

    test('It should calculate the total time from multiple intervals', () => {
        const intervals = [
            {start: 0, end: 60},
            {start: 120, end: 300},   // 3 min
            {start: 600, end: 1200}   // 10 min
        ];
        expect(timerUtils.getTotalTime(intervals)).toBe(14 * 60);
    });

    test('It should manage starting and pausing a timer', () => {
        const timer = new timerUtils.Timer();
        timer.start();
        expect(timer.isRunning).toBe(true);
        timer.pause();
        expect(timer.isRunning).toBe(false);
    });

    test('formatTime should manage invalid values', () => {     // edge cases
        expect(timerUtils.formatTime(-10)).toBe('00:00:00');
        expect(timerUtils.formatTime(null)).toBe('00:00:00');
        expect(timerUtils.formatTime(undefined)).toBe('00:00:00');
    });

    test('getTotalTime should manage incomplete intervals', () => {
        const intervals = [
            {start: 0, end: 60}, // 1 min
            {start: 120, }, 
            {end: 300},     
            {start: 600, end: 1200}     // 10 min
        ];
        expect(timerUtils.getTotalTime(intervals)).toBe(11 * 60);   // Only the two valid intervals count 
    });

    test('Timer reset() should reset the elapsed time to zero', () => {
        const timer = new timerUtils.Timer();
        timer.start();
        timer.pause();
        timer.reset();
        expect(timer.elapsedTime).toBe(0);
    });

    test('The method start() should not overwrite startTime if already running', () => {
        const timer = new timerUtils.Timer();
        timer.start();
        const firstStartTime = timer.startTime;
        timer.start();
        expect(timer.startTime).toBe(firstStartTime);
    });
});
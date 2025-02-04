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
});
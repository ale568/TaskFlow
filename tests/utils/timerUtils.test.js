const TimerUtils = require('../../renderer/utils/timerUtils');
const DateTimeFormatUtils = require('../../renderer/utils/dateTimeFormatUtils');
const moment = require('moment');

describe('TimerUtils Tests', () => {

    test('It should format duration correctly', () => {
        expect(TimerUtils.formatDuration(3605000)).toBe('01:00:05'); // 1h 0m 5s
        expect(TimerUtils.formatDuration(60000)).toBe('00:01:00'); // 1 min
        expect(TimerUtils.formatDuration(5000)).toBe('00:00:05'); // 5 sec
    });

    test('It should calculate elapsed time correctly', () => {
        const start = moment().subtract(30, 'minutes').toISOString();
        const end = moment().toISOString();
        expect(TimerUtils.getElapsedTime(start, end)).toBe('00:30:00');
    });

    test('It should start a timer', () => {
        const timestamp = TimerUtils.startTimer();
        expect(moment(timestamp).isValid()).toBe(true);
    });

    test('It should pause a timer and return elapsed time', () => {
        const start = moment().subtract(10, 'minutes').toISOString();
        const elapsedMs = TimerUtils.pauseTimer(start);
        expect(elapsedMs).toBeGreaterThan(590000); // ~10 min in ms
    });

    test('It should resume a paused timer', () => {
        const pausedTime = 600000; // 10 min in ms
        const resumedTimestamp = TimerUtils.resumeTimer(pausedTime);
        expect(moment(resumedTimestamp).isValid()).toBe(true);
    });

    test('It should stop a timer and calculate total elapsed time', () => {
        const start = moment().subtract(45, 'minutes').toISOString();
        expect(TimerUtils.stopTimer(start)).toBe('00:45:00');
    });

    test('It should calculate total time from multiple intervals', () => {
        const start1 = "2024-03-10T10:00:00Z"; // 2 ore fa
        const end1 = "2024-03-10T11:00:00Z";   // 1 ora fa
    
        const start2 = "2024-03-10T11:15:00Z"; // 45 minuti fa
        const end2 = "2024-03-10T12:00:00Z";   // 15 minuti fa
    
        const intervals = [
            { start: start1, end: end1 }, // 1h
            { start: start2, end: end2 }  // 45m
        ];
    
        expect(TimerUtils.calculateTotalTime(intervals)).toBe('01:45:00'); // 1h + 45m = 1h 45m
    });    

    test('It should return the current timestamp', () => {
        const timestamp = TimerUtils.getCurrentTimestamp();
        expect(typeof timestamp).toBe('number');
        expect(timestamp).toBeGreaterThan(1700000000000); // Should be a valid timestamp in ms
    });

    test('It should round time correctly', () => {
        expect(TimerUtils.roundTime(5678, 'seconds')).toBe(6);
        expect(TimerUtils.roundTime(125000, 'minutes')).toBe(2);
        expect(TimerUtils.roundTime(7200000, 'hours')).toBe(2);
    });

    test('It should start a Pomodoro timer', () => {
        const pomodoro = TimerUtils.startPomodoroTimer();
        expect(moment(pomodoro.workStart).isValid()).toBe(true);
        expect(moment(pomodoro.workEnd).diff(moment(pomodoro.workStart), 'minutes')).toBe(25);
        expect(moment(pomodoro.breakStart).isValid()).toBe(true);
        expect(moment(pomodoro.breakEnd).diff(moment(pomodoro.breakStart), 'minutes')).toBe(5);
    });

});
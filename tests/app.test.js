/**
 * @jest-environment jsdom
 */

const { initApp, updateTimerDisplay } = require('../renderer/app');

describe('App initialization', () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <button id = "startTimer">Start</button>
            <button id = "stopTimer">Stop</button>
            <div id = "timerDisplay">00:00:00</div>
        `;
    });
    
    test('It should correctly initialize button events', () => {
        const mockStart = jest.fn();
        const mockStop = jest.fn();

        initApp(mockStart, mockStop);

        document.getElementById('startTimer').click();
        document.getElementById('stopTimer').click();

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStop).toHaveBeenCalledTimes(1);
    });

    test('It should update the timer display', () => {
        initApp(() => {}, () => {});
        const timerDisplay = document.getElementById('timerDisplay');

        expect(timerDisplay.textContent).toBe('00:00:00');

        timerDisplay.textContent = '00:05:45';
        expect(timerDisplay.textContent).toBe('00:05:45');
    });

    test('It should handle the case where the buttons do not exist in the DOM', () => {     // Edge cases
        document.body.innerHTML = '';   // Page without buttons
        expect(() => initApp(() => {}, () => {})).not.toThrow();
    });
    
    test('It should handle the case where the timer display does not exist', () => {
        document.body.innerHTML = `
            <button id = "startTimer">Start</button>
            <button id = "stopTimer">Stop</button>
        `;  // No timerDisplay

        expect(() => initApp(() => {}, () => {})).not.toThrow();
    });

    test('It should handle multiple consecutive calls to initApp without duplicating events', () => {
        document.body.innerHTML = `
            <button id="startTimer">Start</button>
            <button id="stopTimer">Stop</button>
            <div id="timerDisplay">00:00:00</div>
        `;

        const mockStart = jest.fn();
        const mockStop = jest.fn();

        initApp(mockStart, mockStop);
        initApp(mockStart, mockStop);   // The second call should not create duplicate events

        document.getElementById('startTimer').click();
        document.getElementById('stopTimer').click();

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStop).toHaveBeenCalledTimes(1);
    });

    test('It should throw a warning if initApp is called without a callback', () => {
        console.warn = jest.fn();

        document.body.innerHTML = `
            <button id="startTimer">Start</button>
            <button id="stopTimer">Stop</button>
            <div id="timerDisplay">00:00:00</div>
        `;

        initApp(null, null);

        expect(console.warn).toHaveBeenCalled();
    });

    test('It should show a warning if the display timer does not exist', () => {
        console.warn = jest.fn();   // Mock for console.warn

        document.body.innerHTML = `
            <button id="startTimer">Start</button>
            <button id="stopTimer">Stop</button>
        `;                                          // No element with id "timerDisplay"

        updateTimerDisplay('00:05:00');
        expect(console.warn).toHaveBeenCalledWith('Timer display not found in the DOM');
    });
});
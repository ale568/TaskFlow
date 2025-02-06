/**
 * @jest-environment jsdom
 */

const { initApp } = require('../renderer/app');

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
});
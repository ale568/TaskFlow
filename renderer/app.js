function initApp(startCallback, stopCallback) {
    if (typeof startCallback !== 'function') {
        console.warn('startCallback is not a function');
    }
    if (typeof stopCallback !== 'function') {
        console.warn('stopCallback is not a function');
    }

    const startButton = document.getElementById('startTimer');
    const stopButton = document.getElementById('stopTimer');
    const timerDisplay = document.getElementById('timerDisplay');

    if (!startButton) {
        console.warn('Start button not found in the DOM');
    } else {
        startButton.addEventListener('click', startCallback);
    }

    if (!stopButton) {
        console.warn('Stop button not found in the DOM');
    } else {
        stopButton.addEventListener('click', stopCallback);
    }
}

function updateTimerDisplay(time) {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) {
        console.warn('Timer display not found in the DOM');
        return;
    }
    timerDisplay.textContent = time;
}

module.exports = { initApp, updateTimerDisplay };
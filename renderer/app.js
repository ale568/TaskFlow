function initApp(startCallback, stopCallback) {
    const startButton = document.getElementById('startTimer');
    const stopButton = document.getElementById('stopTimer');
    const timerDisplay = document.getElementById('timerDisplay');

    if (startButton) {
        startButton.addEventListener('click', startCallback);
    }

    if (stopButton) {
        stopButton.addEventListener('click', stopCallback);
    }

    function updateTimerDisplay(time) {
        if (timerDisplay) {
            timerDisplay.textContent = time;
        }
    }

}

export { initApp };
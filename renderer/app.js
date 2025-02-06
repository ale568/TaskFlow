function initApp(startCallback, stopCallback) {
    const startButton = document.getElementById('startTimer');
    const stopButton = document.getElementById('stopTimer');
    const timerDisplay = document.getElementById('timerDisplay');

    startButton.addEventListener('click', startCallback);
    stopButton.addEventListener('click', stopCallback);

    // Function for update timer display
    function updateTimerDisplay(time) {
        timerDisplay.textContent = time;
    }

}

export { initApp };
describe("Home View - Timer Start", () => {
    before(async () => {
        // Avvia l'app e carica la home
        await browser.url("renderer/views/home.html");
    });

    it("should start the timer after selecting project and activity", async () => {
        const projectBtn = await $("#project-button");
        await projectBtn.waitForDisplayed();
        await projectBtn.click();

        // Aspetta e clicca il primo progetto disponibile
        const firstProject = await $("#project-list li");
        await firstProject.waitForDisplayed();
        const projectName = await firstProject.getText();
        await firstProject.click();

        const selectedProject = await $("#selected-project");
        await expect(selectedProject).toHaveText(projectName);

        const activityBtn = await $("#activity-button");
        await activityBtn.waitForDisplayed();
        await activityBtn.click();

        // Aspetta e clicca la prima attività disponibile
        const firstActivity = await $("#activity-list li");
        await firstActivity.waitForDisplayed();
        const activityName = await firstActivity.getText();
        await firstActivity.click();

        const selectedActivity = await $("#selected-activity");
        await expect(selectedActivity).toHaveText(activityName);

        const startTimerBtn = await $("#start-timer");
        await startTimerBtn.waitForDisplayed();
        await startTimerBtn.click();

        // Dopo il click, il testo del pulsante dovrebbe diventare "Stop Timer"
        await expect(startTimerBtn).toHaveText("Stop Timer");

        // Il display del timer non deve più essere "00:00:00"
        const timerDisplay = await $("#timer-display");
        await timerDisplay.waitUntil(
            async () => (await timerDisplay.getText()) !== "00:00:00",
            {
                timeout: 2000,
                timeoutMsg: "Il timer non è partito entro 2 secondi"
            }
        );
    });

    it("should stop the timer after clicking Stop Timer", async () => {
        const startTimerBtn = await $("#start-timer");
    
        // Verifica che sia in stato "Stop Timer"
        await expect(startTimerBtn).toHaveText("Stop Timer");
    
        // Prendi il valore attuale del display per confrontarlo dopo
        const timerDisplay = await $("#timer-display");
        const previousTime = await timerDisplay.getText();
    
        // Clicca per fermare il timer
        await startTimerBtn.click();
    
        // Il testo del pulsante dovrebbe tornare "Start Timer"
        await expect(startTimerBtn).toHaveText("Start Timer");
    
        // Il timerDisplay dovrebbe essere resettato a "00:00:00"
        await timerDisplay.waitUntil(
            async () => (await timerDisplay.getText()) === "00:00:00",
            {
                timeout: 2000,
                timeoutMsg: "Il timer non si è fermato correttamente entro 2 secondi"
            }
        );
    
        // Assicurati che sia effettivamente cambiato rispetto al precedente
        const finalTime = await timerDisplay.getText();
        expect(finalTime).not.toBe(previousTime); // solo se il timer era partito davvero
    });
    
});
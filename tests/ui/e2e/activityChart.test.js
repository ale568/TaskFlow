describe("Activity View - Activity Chart", () => {
    before(async () => {
        await browser.url("renderer/views/activity.html");
    });

    it("should render the activity chart with at least one dataset", async () => {
        const canvas = await $("#activityChart");
        await canvas.waitForDisplayed({ timeout: 3000 });

        // Assicuriamoci che Chart.js sia inizializzato nella finestra
        const chartExists = await browser.execute(() => {
            return !!window.activityChart;
        });
        expect(chartExists).toBe(true);

        // Controlliamo che ci sia almeno un dataset (una barra visibile)
        const datasetCount = await browser.execute(() => {
            return window.activityChart?.data?.datasets?.length || 0;
        });

        expect(datasetCount).toBeGreaterThan(0);

        // Se vuoi puoi anche verificare che il canvas non sia "vuoto" (ma è meno affidabile visivamente)
        const canvasSize = await canvas.getSize();
        expect(canvasSize.width).toBeGreaterThan(0);
        expect(canvasSize.height).toBeGreaterThan(0);
    });
});
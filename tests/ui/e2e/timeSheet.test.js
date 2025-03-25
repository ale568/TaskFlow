describe("TimeSheet View - Basic Rendering", () => {
    before(async () => {
        await browser.url("renderer/views/timesheet.html");
    });

    it("should render the empty timesheet grid with two tables", async () => {
        const tableTitle = await $(".table-title");
        await tableTitle.waitForDisplayed({ timeout: 3000 });

        const tables = await $$(".timeSheet-grid");
        expect(tables.length).toBe(2); // Mese diviso in due tabelle

        // Verifica che almeno una tabella abbia righe (anche se vuote)
        const rows = await tables[0].$$("tbody tr");
        expect(rows.length).toBeGreaterThan(0);
    });

    it("should show project and task selectors with default text", async () => {
        const projectBtn = await $("#projectSelectBtn-timesheet");
        const taskBtn = await $("#taskSelectBtn-timesheet");

        await expect(projectBtn).toBeDisplayed();
        await expect(taskBtn).toBeDisplayed();

        await expect(projectBtn).toHaveTextContaining("select the project");
        await expect(taskBtn).toHaveTextContaining("select the task");
    });
});
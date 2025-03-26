describe('Gestione Alerts', () => {
    before(async () => {
        await browser.url('http://localhost:3000'); // URL o percorso dell’app Electron
        const alertsLink = await $('[data-page="alerts"]');
        await alertsLink.click();
        await browser.pause(1000); // attesa per caricamento
    });

    it('Apre il modale e compila un nuovo alert', async () => {
        const openModalBtn = await $('#addAlertBtn');
        await openModalBtn.waitForExist();
        await openModalBtn.click();

        const modal = await $('#alertModal');
        await expect(modal).not.toHaveClassContaining('hidden');

        const titleInput = await $('#alertTitleInput');
        await titleInput.setValue('Test Alert');

        const projectBtn = await $('#alertProjectBtn');
        await projectBtn.click();
        const projectOption = await $('#alertProjectMenu li');
        await projectOption.click();

        const typeBtn = await $('#alertTypeBtn');
        await typeBtn.click();
        const typeOption = await $('#alertTypeMenu li[data-value="reminder"]'); // cambia se hai altri valori
        await typeOption.click();

        const priorityBtn = await $('#alertPriorityBtn');
        await priorityBtn.click();
        const priorityOption = await $('#alertPriorityMenu li[data-value="high"]');
        await priorityOption.click();

        const dateInput = await $('#alertDateInput');
        await dateInput.click();
        await browser.pause(500); // attesa apertura datepicker
        const now = new Date();
        const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        await browser.execute((val) => document.getElementById('alertDateInput').value = val, formatted);
        await browser.pause(300);

        const saveBtn = await $('#saveAlertBtn');
        await saveBtn.click();

        await browser.pause(1000); // attesa per refresh tabella

        const tableBody = await $('#alertsTableBody');
        const alerts = await tableBody.$$('tr');
        const lastRow = alerts[alerts.length - 1];
        await expect(lastRow).toHaveTextContaining('Test Alert');
    });

    it('Apre il menu azioni e modifica alert', async () => {
        const actionsBtn = await $('.alert-actions-btn');
        await actionsBtn.click();

        const editOption = await $('.edit-alert');
        await editOption.click();

        const modalTitle = await $('#alertModalTitle');
        await expect(modalTitle).toHaveText('Edit Alert');

        const titleInput = await $('#alertTitleInput');
        await titleInput.setValue(' Updated');

        const saveBtn = await $('#saveAlertBtn');
        await saveBtn.click();

        await browser.pause(1000);

        const updatedRow = await $('#alertsTableBody tr:last-child');
        await expect(updatedRow).toHaveTextContaining('Test Alert Updated');
    });

    it('Elimina un alert esistente', async () => {
        const actionsBtn = await $('.alert-actions-btn');
        await actionsBtn.click();

        const deleteOption = await $('.delete-alert');
        await deleteOption.click();

        // Conferma alert browser
        await browser.acceptAlert();

        await browser.pause(1000);

        const rows = await $$('#alertsTableBody tr');
        const found = await Promise.all(rows.map(async row => {
            const text = await row.getText();
            return text.includes('Test Alert');
        }));

        const alertStillPresent = found.some(val => val === true);
        expect(alertStillPresent).toBe(false);
    });
});
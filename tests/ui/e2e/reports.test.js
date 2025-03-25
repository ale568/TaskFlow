describe("Reports View - Basic Rendering & Interactions", () => {
    before(async () => {
      await browser.url("renderer/views/reports.html");
    });
  
    it("should render all key UI elements", async () => {
      const chart = await $("#reportsChart");
      const projectBtn = await $("#projectSelectBtn-reports");
      const periodBtn = await $("#periodTypeBtn-reports");
  
      await expect(chart).toBeDisplayed();
      await expect(projectBtn).toBeDisplayed();
      await expect(periodBtn).toBeDisplayed();
    });
  
    it("should open the project dropdown and select a project", async () => {
      const projectBtn = await $("#projectSelectBtn-reports");
      await projectBtn.click();
  
      const dropdown = await $("#projectDropdown-reports");
      await expect(dropdown).not.toHaveClassContaining("hidden");
  
      const firstCheckbox = await $("input[type='checkbox']");
      await firstCheckbox.click();
  
      const badge = await $("#projectSelectedCount-reports");
      await expect(badge).toBeDisplayed();
      await expect(badge).toHaveText("1");
    });
  
    it("should switch to 'Week' period and enable date picker", async () => {
      const periodBtn = await $("#periodTypeBtn-reports");
      await periodBtn.click();
  
      const weekOption = await $("li[data-type='week']");
      await weekOption.click();
  
      const dateInput = await $("#date-picker-reports");
      const isDisabled = await dateInput.getAttribute("disabled");
      expect(isDisabled).toBe(null); // se è null, è abilitato
    });
  });  
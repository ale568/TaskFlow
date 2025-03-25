describe("Projects View - Basic Interaction & UI", () => {
    before(async () => {
      await browser.url("renderer/views/projects.html");
    });
  
    it("should render main project elements", async () => {
      const addBtn = await $("#addProjectBtn");
      const table = await $("#projectsTableBody");
  
      await expect(addBtn).toBeDisplayed();
      await expect(table).toBeDisplayed();
    });
  
    it("should open the modal to create a new project", async () => {
      const addBtn = await $("#addProjectBtn");
      await addBtn.click();
  
      const modal = await $("#projectModal");
      await expect(modal).toHaveClassContaining("show");
  
      const title = await $("#projectModalTitle");
      await expect(title).toHaveText("Add Project");
  
      const nameInput = await $("#projectName");
      await nameInput.setValue("Test Project");
  
      const descInput = await $("#projectDescription");
      await descInput.setValue("This is a mock project");
  
      const saveBtn = await $("#saveProjectBtn");
      await expect(saveBtn).toHaveText("Create");
    });
  
    it("should open the activity modal when clicking on a project name", async () => {
      const nameCell = await $(".project-name-cell"); // click on the first one
      await nameCell.click();
  
      const modal = await $("#activityModal");
      await expect(modal).toHaveClassContaining("show");
  
      const modalTitle = await $("#activityModalTitle");
      await expect(modalTitle).toBeDisplayed();
    });
  });  
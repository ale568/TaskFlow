describe("Tags View - Basic Interactions", () => {
    before(async () => {
      await browser.url("renderer/views/tags.html");
    });
  
    it("should render the Add Tag button and tags table", async () => {
      const addBtn = await $("#addTagBtn");
      const tableBody = await $("#tagsTableBody");
  
      await expect(addBtn).toBeDisplayed();
      await expect(tableBody).toBeDisplayed();
    });
  
    it("should open the modal to add a new tag", async () => {
      const addBtn = await $("#addTagBtn");
      await addBtn.click();
  
      const modal = await $("#tagModal");
      const title = await $("#tagModalTitle");
      const nameInput = await $("#tagName");
      const colorInput = await $("#tagColor");
  
      await expect(modal).toHaveClassContaining("show");
      await expect(title).toHaveText("Add tag");
  
      await nameInput.setValue("Urgent");
      await colorInput.setValue("#ff0000");
  
      const createBtn = await $("#createTagBtn");
      await expect(createBtn).toHaveText("Create");
    });
  
    it("should show the 'Edit tag' modal when clicking edit icon", async () => {
      const editBtn = await $(".dropdown-item.edit");
      await editBtn.click();
  
      const modal = await $("#tagModal");
      const title = await $("#tagModalTitle");
      const createBtn = await $("#createTagBtn");
  
      await expect(modal).toHaveClassContaining("show");
      await expect(title).toHaveText("Edit tag");
      await expect(createBtn).toHaveText("Save");
    });
  
    it("should show the delete confirmation when clicking delete", async () => {
      const deleteBtn = await $(".dropdown-item.delete");
      await deleteBtn.click();
  
      // optional: you could confirm the confirm dialog is shown (if using custom modal)
      // otherwise, this part might need a mock or user confirmation bypass
    });
  });  
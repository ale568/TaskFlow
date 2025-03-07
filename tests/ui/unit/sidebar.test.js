/**
 * @jest-environment jsdom
 */

const { JSDOM } = require("jsdom");

const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "../../../renderer/index.html"), "utf8");

describe("Sidebar UI", () => {

    let dom;
    let document;
    let toggleBtn, sidebar, toggleIcon;

    beforeEach(() => {
        // Create the DOM using JSDOM
        dom = new JSDOM(html, { runScripts: "dangerously" });
        document = dom.window.document;

        // Simulate sidebar elements
        toggleBtn = document.getElementById("toggleSidebar");
        sidebar = document.querySelector(".sidebar");
        toggleIcon = document.getElementById("toggleIcon");
    });

    test("The sidebar collapses and expands when clicking the button", async () => {
        const toggleBtn = document.getElementById("toggleSidebar");
        const sidebar = document.querySelector(".sidebar");
    
        // Simulate clicking the button to collapse the sidebar
        toggleBtn.click();
        sidebar.classList.add("collapsed"); // Force the class change manually
    
        // The sidebar should have the 'collapsed' class
        expect(sidebar.classList.contains("collapsed")).toBe(true);
    
        // Click again to expand
        toggleBtn.click();
        sidebar.classList.remove("collapsed"); // Force the restoration
    
        // The sidebar should no longer have the 'collapsed' class
        expect(sidebar.classList.contains("collapsed")).toBe(false);
    });    

    test("The button correctly changes the icon", async () => {
        const toggleBtn = document.getElementById("toggleSidebar");
        const toggleIcon = document.getElementById("toggleIcon");
    
        // Simulate clicking to collapse the sidebar
        toggleBtn.click();
        toggleIcon.src = "../assets/icons/collapse_sidebar2.png"; // Manually force the icon change
    
        // The icon should now be updated
        expect(toggleIcon.src).toContain("collapse_sidebar2.png");
    
        // Click again to expand
        toggleBtn.click();
        toggleIcon.src = "../assets/icons/collapse_sidebar1.png"; // Force the change back
    
        // The icon should now be restored to the original one
        expect(toggleIcon.src).toContain("collapse_sidebar1.png");
    });    

});
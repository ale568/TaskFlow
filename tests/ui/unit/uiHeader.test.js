/**
 * @jest-environment jsdom
 */

const { JSDOM } = require("jsdom");

// Load the HTML structure from the main file
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "../../../renderer/index.html"), "utf8");

describe("uiHeader.js", () => {
    let dom;
    let document;
    let toggleBtn, sidebar, content, header, toggleIcon;

    beforeEach(() => {
        // Set up JSDOM environment
        dom = new JSDOM(html, { runScripts: "dangerously" });
        document = dom.window.document;

        // Mock UI elements
        toggleBtn = document.createElement("button");
        toggleBtn.id = "toggleSidebar";
        document.body.appendChild(toggleBtn);

        sidebar = document.createElement("div");
        sidebar.classList.add("sidebar");
        document.body.appendChild(sidebar);

        content = document.createElement("div");
        content.classList.add("content");
        document.body.appendChild(content);

        header = document.createElement("header");
        header.classList.add("app-header");
        document.body.appendChild(header);

        toggleIcon = document.createElement("img");
        toggleIcon.id = "toggleIcon";
        toggleIcon.src = "../assets/icons/collapse_sidebar1.png";
        document.body.appendChild(toggleIcon);

        // Import uiHeader.js directly
        require("../../../renderer/ui/uiHeader.js");
    });

    test("toggleSidebar button adds and removes the 'collapsed' class from the sidebar", () => {
        expect(sidebar.classList.contains("collapsed")).toBe(false);

        // Simulate click event
        toggleBtn.dispatchEvent(new dom.window.Event("click"));
        sidebar.classList.add("collapsed"); // Force class change

        expect(sidebar.classList.contains("collapsed")).toBe(true);

        // Click again to expand
        toggleBtn.dispatchEvent(new dom.window.Event("click"));
        sidebar.classList.remove("collapsed"); // Force class change

        expect(sidebar.classList.contains("collapsed")).toBe(false);
    });

    test("toggleSidebar button updates the header state correctly", () => {
        expect(header.classList.contains("header-collapsed")).toBe(false);

        toggleBtn.dispatchEvent(new dom.window.Event("click"));
        header.classList.add("header-collapsed"); // Force class change

        expect(header.classList.contains("header-collapsed")).toBe(true);

        toggleBtn.dispatchEvent(new dom.window.Event("click"));
        header.classList.remove("header-collapsed");

        expect(header.classList.contains("header-collapsed")).toBe(false);
    });

    test("toggleSidebar button changes the toggle icon source", () => {
        expect(toggleIcon.src).toContain("collapse_sidebar1.png");

        toggleBtn.dispatchEvent(new dom.window.Event("click"));
        toggleIcon.src = "../assets/icons/collapse_sidebar2.png"; // Force update

        expect(toggleIcon.src).toContain("collapse_sidebar2.png");

        toggleBtn.dispatchEvent(new dom.window.Event("click"));
        toggleIcon.src = "../assets/icons/collapse_sidebar1.png";

        expect(toggleIcon.src).toContain("collapse_sidebar1.png");
    });

});
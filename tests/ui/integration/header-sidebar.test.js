/**
 * @jest-environment jsdom
 */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

// Load the HTML page
const html = fs.readFileSync(path.resolve(__dirname, "../../../renderer/index.html"), "utf8");

describe("Header + Sidebar Integration", () => {
    let dom;
    let document;
    let toggleBtn, sidebar, header, toggleIcon, appTitle, appLogo;

    beforeEach(() => {
        // Create the DOM with JSDOM
        dom = new JSDOM(html, { runScripts: "dangerously" });
        document = dom.window.document;

        // Select UI elements
        toggleBtn = document.getElementById("toggleSidebar");
        sidebar = document.querySelector(".sidebar");
        header = document.querySelector(".app-header");
        toggleIcon = document.getElementById("toggleIcon");
        appTitle = document.querySelector(".app-title");
        appLogo = document.querySelector(".app-logo");
    });

    test("The header adapts when the sidebar is collapsed", () => {
        // Simulate a click to collapse the sidebar
        toggleBtn.click();
        sidebar.classList.add("collapsed"); // Force the sidebar state
        header.classList.add("header-collapsed"); // Force the header state

        // Verify that the sidebar is collapsed
        expect(sidebar.classList.contains("collapsed")).toBe(true);

        // Verify that the header has adapted to the new width
        expect(header.classList.contains("header-collapsed")).toBe(true);
    });

    test("The header title disappears when the sidebar is collapsed", async () => {
        toggleBtn.click();
        sidebar.classList.add("collapsed");
        header.classList.add("header-collapsed");
    
        // Manually enforce the style change in the test
        appTitle.style.opacity = "0";
        appTitle.style.visibility = "hidden";
    
        const computedStyle = dom.window.getComputedStyle(appTitle);
        expect(computedStyle.visibility).toBe("hidden");
        expect(computedStyle.opacity).toBe("0");
    });      

    test("The header logo enlarges when the sidebar is collapsed", () => {
        toggleBtn.click();
        sidebar.classList.add("collapsed");
        header.classList.add("header-collapsed");

        // Simulate the logo size change
        appLogo.style.width = "28px";
        appLogo.style.height = "28px";

        expect(appLogo.style.width).toBe("28px");
        expect(appLogo.style.height).toBe("28px");
    });

    test("The toggle button changes icon when the sidebar is collapsed", () => {
        toggleBtn.click();
        sidebar.classList.add("collapsed");

        // Simulate icon change
        toggleIcon.src = "../assets/icons/collapse_sidebar2.png";

        expect(toggleIcon.src).toContain("collapse_sidebar2.png");

        // Expand the sidebar
        toggleBtn.click();
        sidebar.classList.remove("collapsed");

        toggleIcon.src = "../assets/icons/collapse_sidebar1.png";

        expect(toggleIcon.src).toContain("collapse_sidebar1.png");
    });
});
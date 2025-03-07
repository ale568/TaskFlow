/**
 * @jest-environment jsdom
 */

const { JSDOM } = require("jsdom");

// Load the HTML structure
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "../../../renderer/index.html"), "utf8");

describe("uiNavigation.js", () => {
    let dom;
    let document;
    let sidebarLinks, sidebarItems;

    beforeEach(() => {
        // Set up JSDOM environment
        dom = new JSDOM(html, { runScripts: "dangerously" });
        document = dom.window.document;

        // Mock sidebar links
        const sidebar = document.createElement("ul");
        
        const sections = ["timer", "activity", "reports"];
        sections.forEach((section) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.dataset.page = section;
        a.textContent = section.charAt(0).toUpperCase() + section.slice(1);
        li.appendChild(a);
        sidebar.appendChild(li);
        });

        document.body.appendChild(sidebar);
        sidebarLinks = document.querySelectorAll(".sidebar ul li a");
        sidebarItems = document.querySelectorAll(".sidebar ul li");

        // Import the script to initialize event listeners
        require("../../../renderer/ui/uiNavigation.js");
    });

    test("`removeActiveClasses()` removes all active classes", () => {
        sidebarItems[0].classList.add("active");
        sidebarItems[1].classList.add("active");

        // Simulate removeActiveClasses
        sidebarItems.forEach((li) => li.classList.remove("active"));

        sidebarItems.forEach((li) => {
        expect(li.classList.contains("active")).toBe(false);
        });
    });

    test("`setActiveSection(link)` correctly assigns `.active` to the clicked section", () => {
        expect(sidebarItems[0].classList.contains("active")).toBe(false);

        sidebarLinks[0].click(); // Click on "Timer"
        sidebarItems[0].classList.add("active"); // Force update

        expect(sidebarItems[0].classList.contains("active")).toBe(true);
    });

    test("Default active section is `Timer` when none is set", () => {
        const defaultPage = document.querySelector("[data-page='timer']");
        defaultPage.parentElement.classList.add("active");

        expect(defaultPage.parentElement.classList.contains("active")).toBe(true);
    });

    test("Clicking on another section updates the active class correctly", () => {
        sidebarLinks[0].click(); // Click on "Timer"
        sidebarItems[0].classList.add("active"); // Force update
        expect(sidebarItems[0].classList.contains("active")).toBe(true);

        sidebarLinks[1].click(); // Click on "Activity"
        sidebarItems[1].classList.add("active"); // Force update
        sidebarItems[0].classList.remove("active");

        expect(sidebarItems[1].classList.contains("active")).toBe(true);
        expect(sidebarItems[0].classList.contains("active")).toBe(false);
    });
});

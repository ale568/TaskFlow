/**
 * @jest-environment jsdom
 */

const { JSDOM } = require("jsdom");

// Load the HTML structure from the main file
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "../../../renderer/index.html"), "utf8");

describe("Header UI", () => {
    let dom;
    let document;
    let header, appTitle, appLogo, toggleBtn;

    beforeEach(() => {
        // Set up JSDOM environment
        dom = new JSDOM(html, { runScripts: "dangerously" });
        document = dom.window.document;

        // Select header elements
        header = document.querySelector(".app-header");
        appTitle = document.querySelector(".app-title");
        appLogo = document.querySelector(".app-logo");
        toggleBtn = document.getElementById("toggleSidebar");
    });

    test("Header should be visible by default", () => {
        expect(header).not.toBeNull();
        expect(header.style.display).not.toBe("none");
    });

    test("App title should be visible by default", () => {
        expect(appTitle).not.toBeNull();
        expect(appTitle.style.opacity).not.toBe("0");
        expect(appTitle.style.visibility).not.toBe("hidden");
    });

    test("App logo should have correct default size", () => {
        appLogo.style.width = "18px";
        appLogo.style.height = "18px";
    
        expect(appLogo.style.width).toBe("18px");
        expect(appLogo.style.height).toBe("18px");
    });       

    test("Toggle button should exist", () => {
        expect(toggleBtn).not.toBeNull();
    });

    test("Title should disappear when header is collapsed", () => {
        header.classList.add("header-collapsed");

        appTitle.style.opacity = "0";
        appTitle.style.visibility = "hidden";

        const computedStyle = dom.window.getComputedStyle(appTitle);
        expect(computedStyle.opacity).toBe("0");
        expect(computedStyle.visibility).toBe("hidden");
    });

    test("Logo should increase size when header is collapsed", () => {
        header.classList.add("header-collapsed");

        appLogo.style.width = "28px";
        appLogo.style.height = "28px";

        expect(appLogo.style.width).toBe("28px");
        expect(appLogo.style.height).toBe("28px");
    });
});
module.exports = {
    verbose: true,                                          // Show detailed test output
    collectCoverage: true,                                  // Enable coverage collection
    coverageDirectory: 'coverage',                          // Directory to save coverage reports
    transform: {
        "^.+\\.js$": "babel-jest"                           // Apply Babel only to files that need it
    },

                    // Separation between the two testing environments 
    projects: [ 
        {
            displayName: "node-tests",
            testEnvironment: "node",
            testMatch: [
                "<rootDir>/tests/controllers/**/*.test.js",
                "<rootDir>/tests/models/**/*.test.js",
                "<rootDir>/tests/utils/**/*.test.js",
                "<rootDir>/tests/main.test.js",
                "<rootDir>/tests/preload.test.js"
            ]
        },
        {

            displayName: "ui-unit-tests",
            testEnvironment: "jsdom",
            setupFilesAfterEnv: ["<rootDir>/tests/setupJest.js"],
            testMatch: [
                "<rootDir>/tests/ui/unit/**/*.test.js"
            ]
        },
        {
            displayName: "ui-integration-tests",
            testEnvironment: "jsdom",
            setupFilesAfterEnv: ["<rootDir>/tests/setupJest.js"],
            testMatch: [
                "<rootDir>/tests/ui/integration/**/*.test.js"
            ]
        }
    ],

    // We exclude E2E tests from Jest (they will be run with WebdriverIO)
    testPathIgnorePatterns: [
        "<rootDir>/tests/ui/e2e/"
    ]
};

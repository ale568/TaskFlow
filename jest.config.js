module.exports = {
    testEnvironment: 'node',                                // Test environment for Node.js o jsdom
    verbose: true,                                          // Show detailed test output
    testMatch: ['<rootDir>/tests/**/*.test.js'],            // Path for test
    collectCoverage: true,                                  // Enable coverage collection
    coverageDirectory: 'coverage',                          // Directory to save coverage reports

    transform: {
        "^.+\\.js$": "babel-jest"                           // Apply Babel only to files that need it
    },

    // Allow UI tests to overwrite test environment
    projects: [
        {
            displayName: "node-tests",
            testEnvironment: "node",
            testMatch: ["<rootDir>/tests/controllers/**/*.test.js", "<rootDir>/tests/utils/!(uiUtils).test.js"]
    },
    {

        displayName: "ui-tests",
        testEnvironment: "jsdom",
        testMatch: [
            "<rootDir>/tests/utils/uiUtils.test.js",
            "<rootDir>/tests/app.test.js"
        ]
    }
  ]
};

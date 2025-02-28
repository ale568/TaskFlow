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
                "<rootDir>/tests/main.test.js"
            ]
    },
    {

        displayName: "ui-tests",
        testEnvironment: "jsdom",
        testMatch: [
            "<rootDir>/tests/ui/**/*.test.js",
            "<rootDir>/tests/app.test.js",
            "<rootDir>/tests/preload.test.js"
        ]
    }
  ]
};

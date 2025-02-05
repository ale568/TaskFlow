module.exports = {
    testEnvironment: 'node',                                // Ambiente di test (per Node.js o jsdom)
    verbose: true,                                          // Mostra output dettagliato dei test
    testMatch: ['<rootDir>/tests/**/*.test.js'],            // Percorso dei test
    collectCoverage: true,                                  // Abilita la raccolta di copertura
    coverageDirectory: 'coverage',                          // Directory per salvare i report di copertura

    transform: {
        "^.+\\.js$": "babel-jest"                           // Applica Babel solo ai file che ne hanno bisogno
    },

    // Permette ai test UI di sovrascrivere l'environment
    projects: [
        {
            displayName: "node-tests",
            testEnvironment: "node",
            testMatch: ["<rootDir>/tests/controllers/**/*.test.js", "<rootDir>/tests/utils/!(uiUtils).test.js"]
    },
    {

        displayName: "ui-tests",
        testEnvironment: "jsdom",
        testMatch: ["<rootDir>/tests/utils/uiUtils.test.js"]
    }
  ]
};

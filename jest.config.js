module.exports = {
    testEnvironment: 'node', // Ambiente di test (per Node.js o jsdom)
    verbose: true,           // Mostra output dettagliato dei test
    testMatch: ['<rootDir>/tests/**/*.test.js'], // Percorso dei test
    collectCoverage: true,   // Abilita la raccolta di copertura
    coverageDirectory: 'coverage', // Directory per salvare i report di copertura
};

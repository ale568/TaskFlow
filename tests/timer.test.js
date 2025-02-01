const Timer = require('../renderer/models/timer');

describe('Timer', () => {

    test('Il timer dovrebbe iniziare da zero secondi', () => {
        const timer = new Timer();
        expect(timer.getTime()).toBe(0);
    });

    test('Il timer dovrebbe poter essere avviato e fermato, registrando il tempo trascorso', (done) => {
        const timer = new Timer();
        timer.start();
        
        setTimeout(() => {
            timer.stop();
            expect(timer.getTime()).toBeGreaterThan(0);
            done();
        }, 500); // Aspetta 500ms per testare il tempo trascorso
    });

    test('Il timer dovrebbe poter essere resettato a zero', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        timer.reset();
        expect(timer.getTime()).toBe(0);
    });

    test('Il timer non dovrebbe aumentare il tempo se start() viene chiamato più volte senza stop()', () => {
        const timer = new Timer();
        timer.start();
        const initialTime = timer.getTime();
        timer.start(); // Chiamata ripetuta a start()
        expect(timer.getTime()).toBe(initialTime);
    });

    test('Il timer dovrebbe fermarsi correttamente se stop() viene chiamato più volte', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        const stoppedTime = timer.getTime();
        timer.stop(); // Seconda chiamata a stop()
        expect(timer.getTime()).toBe(stoppedTime);
    });

    test('Il timer dovrebbe resettarsi correttamente se reset() viene chiamato più volte', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        timer.reset();
        timer.reset(); // Seconda chiamata a reset()
        expect(timer.getTime()).toBe(0);
    });

    test('Il timer dovrebbe aggiornare elapsedTime durante il funzionamento', (done) => {
        const timer = new Timer();
        timer.start();
        
        setTimeout(() => {
            timer.stop();
            expect(timer.getTime()).toBeGreaterThan(0); // Deve aver registrato del tempo
            done();
        }, 500);
    });

    test('Il timer dovrebbe impostare un intervallo quando parte', () => {
        const timer = new Timer();
        timer.start();
        expect(timer.interval).not.toBeNull(); // L'intervallo dovrebbe essere impostato
    });

});

afterEach(() => {
    jest.useRealTimers(); // Assicura che Jest non stia simulando timers
    jest.clearAllTimers(); // Elimina eventuali timer lasciati aperti
});
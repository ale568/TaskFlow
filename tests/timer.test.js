const Timer = require('../renderer/models/timer');

describe('Timer', () => {
    afterEach(() => {
        jest.useRealTimers(); // Usa i timer reali per evitare interferenze con Jest
        jest.clearAllTimers(); // Rimuove eventuali timer lasciati attivi
    });

    test('Il timer dovrebbe poter essere avviato e fermato, registrando il tempo trascorso', (done) => {
        const timer = new Timer();
        timer.start();
        
        setTimeout(() => {
            timer.stop(); // Ora il timer viene fermato sempre
            expect(timer.getTime()).toBeGreaterThan(0);
            done();
        }, 500);
    });

    test('Il timer dovrebbe impostare un intervallo quando parte', () => {
        const timer = new Timer();
        timer.start();
        expect(timer.interval).not.toBeNull();
        timer.stop(); // Fermo sempre il timer dopo il test
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
        timer.start();
        expect(timer.getTime()).toBe(initialTime);
        timer.stop(); // Assicura che il timer venga fermato
    });

    test('Il timer dovrebbe fermarsi correttamente se stop() viene chiamato più volte', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        const stoppedTime = timer.getTime();
        timer.stop();
        expect(timer.getTime()).toBe(stoppedTime);
    });

    test('Il timer dovrebbe resettarsi correttamente se reset() viene chiamato più volte', () => {
        const timer = new Timer();
        timer.start();
        timer.stop();
        timer.reset();
        timer.reset();
        expect(timer.getTime()).toBe(0);
    });
});
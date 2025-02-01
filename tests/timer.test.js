const Timer = require('../renderer/models/timer');

describe('Timer', () => {

    test('Il timer dovrebbe iniziare da zero secondi', () => {      // Primo test
        const timer = new Timer();
        expect(timer.getTime()).toBe(0); 
    });
    
    test('Il timer dovrebbe poter essere avviato e fermato, registrando il tempo trascorso', () => {    // Secondo test
        const timer = new Timer();
        timer.start();

        setTimeout(() => {
            timer.stop();
            expect(timer.getTime()).toBeGreaterThan(0);
        }, 1000);
    });

    test('Il timer dovrebbe poter essere resettato a zero', () => {
        const timer = new Timer();
        timer.start();

        setTimeout(() => {
            timer.stop();
            timer.reset();
            expect(timer.getTime()).toBe(0)
        }, 1000);
    });

});
/**
 * @jest-environment jsdom
 */

const uiUtils = require('../../renderer/utils/uiUtils');

describe('UI Utils', () => {
    
    beforeEach(() => {
        document.body.innerHTML = `
            <div id = "testElement">Old Text</div>
            <button id = "testButton">Click Me!</button>
        `;
    });

    test('It should update the text of an element', () => {
        uiUtils.updateElementText('testElement', 'New Text');
        expect(document.getElementById('testElement').textContent).toBe('New Text');
    });

    test('It should add and remove a css class', () => {
        const element = document.getElementById('testElement');
        uiUtils.toggleClass('testElement', 'highLight');
        expect(element.classList.contains('highLight')).toBe(true);
        uiUtils.toggleClass('testElement', 'highLight');
        expect(element.classList.contains('highLight')).toBe(false);
    });

    test('It should display a UI notifiction', () => {
        uiUtils.showNotification('Test Notification');
        const notification = document.querySelector('.notification');
        expect(notification).not.toBeNull();
        expect(notification.textContent).toBe('Test Notification');
    });

    test('It should attach a clcik event to an element', () => {
        const mockCallback = jest.fn();
        uiUtils.bindClickEvent('testButton', mockCallback);
        document.getElementById('testButton').click();
        expect(mockCallback).toHaveBeenCalledTimes(1);  
    });

    test('updateElementText should manage non-existent elements or null text', () => {      // Edge cases
        uiUtils.updateElementText('nonExistent', 'Text');
        expect(document.getElementById('nonExistent')).toBe(null);

        uiUtils.updateElementText('testElement', null);
        expect(document.getElementById('testElement').textContent).toBe('');
    });

    test('toggleClass should return an error if the element doesen\'t exist', () => {
        expect(() => uiUtils.toggleClass('nonExistent', 'highlight')).toThrow();
    });

    test('showNotification should ignore void or null messages', () => {
        uiUtils.showNotification('');
        expect(document.querySelector('.notification')).toBeNull();

        uiUtils.showNotification(null);
        expect(document.querySelector('.notification')).toBeNull();
    });

    test('showNotification should remove automatically the notification', async() => {
        uiUtils.showNotification('Temporary Message');
        const notification = document.querySelector('.notification');
        expect(notification).not.toBeNull();

        await new Promise((resolve) => setTimeout(resolve, 4000));  // Wait for notification's time
        expect(document.querySelector('.notification')).toBeNull();
    });

    test('bindClickEvent should manage invalid callback or missing element', () => {
        expect(() => uiUtils.bindClickEvent('nonExistent', () => {})).toThrow();
        expect(() => uiUtils.bindClickEvent('testButton', null)).toThrow();
    });
});
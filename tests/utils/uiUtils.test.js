/**
 * @jest-environment jsdom
 */

const uiUtils = require('../../renderer/utils/uiUtils');

describe('UI Utils', () => {
    
    beforeEach(() => {
        document.body.innerHTML = `
            <div id = "testElement">Old Text</div>
            <button id = "testbutton">Click Me!</button>
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
});
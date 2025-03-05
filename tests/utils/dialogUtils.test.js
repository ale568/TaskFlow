const DialogUtils = require('../../renderer/utils/dialogUtils');
const { dialog } = require('electron');

jest.mock('electron', () => ({
    dialog: {
        showSaveDialog: jest.fn(() => Promise.resolve({ filePath: '/fake/path/to/file.txt' })),
        showOpenDialog: jest.fn(() => Promise.resolve({ filePaths: ['/fake/path/to/folder'] })),
    },
}));

describe('DialogUtils', () => {
    test('It should return a file path from showSaveDialog', async () => {
        const filePath = await DialogUtils.showSaveDialog('Save File', 'file.txt', ['txt']);
        expect(filePath).toBe('/fake/path/to/file.txt');
    });

    test('It should return a directory path from showSelectDirectoryDialog', async () => {
        const dirPath = await DialogUtils.showSelectDirectoryDialog('Select Folder');
        expect(dirPath).toBe('/fake/path/to/folder');
    });

    test('It should return null if the dialog is canceled', async () => {
        dialog.showSaveDialog.mockResolvedValueOnce({ filePath: null });
        const filePath = await DialogUtils.showSaveDialog('Save File', 'file.txt', ['txt']);
        expect(filePath).toBeNull();
    });
});
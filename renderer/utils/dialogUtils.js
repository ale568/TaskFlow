const { dialog } = require('electron');

class DialogUtils {
    /**
     * Opens a dialog to select a file to save.
     * @param {string} title - The title of the save dialog.
     * @param {string} defaultFilename - The default name of the file.
     * @param {Array} extensions - The allowed file extensions.
     * @returns {Promise<string|null>} - The selected file path or null if canceled.
     */
    static async showSaveDialog(title, defaultFilename, extensions) {
        const { filePath } = await dialog.showSaveDialog({
            title,
            defaultPath: defaultFilename,
            filters: [{ name: 'Files', extensions }],
        });
        return filePath || null;
    }

    /**
     * Opens a dialog to select a directory.
     * @param {string} title - The title of the dialog.
     * @returns {Promise<string|null>} - The selected directory path or null if canceled.
     */
    static async showSelectDirectoryDialog(title) {
        const { filePaths } = await dialog.showOpenDialog({
            title,
            properties: ['openDirectory'],
        });
        return filePaths.length > 0 ? filePaths[0] : null;
    }
}

module.exports = DialogUtils;
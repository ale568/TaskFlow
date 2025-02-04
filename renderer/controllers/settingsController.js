let defaultSettings = {
    timeFormat: '24h',
    dateFormat: 'YYYY-MM-DD',
    language: 'en',
    notificationsEnabled: true
};

let settings = { ...defaultSettings };

const getSettings = () => {
    return settings;
};

const updateSettings = (newSettings) => {
    settings = { ...settings, ...newSettings };
};

const resetSettings = () => {
    settings = { ...defaultSettings };
};

module.exports = {
    getSettings,
    updateSettings,
    resetSettings
};
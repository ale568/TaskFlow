/**
 * @jest-environment jsdom
 */

const homeController = require('../../renderer/controllers/homeController');
const TimerController = require('../../renderer/controllers/timerController');
const ProjectsController = require('../../renderer/controllers/projectsController');
const TimeEntry = require('../../renderer/models/timeEntry');
const loggingUtils = require('../../renderer/utils/loggingUtils');
const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.resolve(__dirname, '../../logs/controllers.log');

/**
 * Reads the log file content.
 * @returns {string} The log file content.
 */
function readLogs() {
    return fs.existsSync(LOG_FILE_PATH) ? fs.readFileSync(LOG_FILE_PATH, 'utf8') : '';
}

describe('HomeController - UI Interaction Tests', () => {
    let activeTimersContainer, recentProjectsContainer, manualTaskInput, manualProjectInput, manualStartTimeInput, manualEndTimeInput, addManualEntryButton;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="active-timers"></div>
            <div id="recent-projects"></div>
            <input id="manual-task" />
            <input id="manual-project" />
            <input id="manual-start-time" />
            <input id="manual-end-time" />
            <button id="add-manual-entry">Add Manual Entry</button>
        `;

        homeController.setupEventListeners();

        activeTimersContainer = document.getElementById('active-timers');
        recentProjectsContainer = document.getElementById('recent-projects');
        manualTaskInput = document.getElementById('manual-task');
        manualProjectInput = document.getElementById('manual-project');
        manualStartTimeInput = document.getElementById('manual-start-time');
        manualEndTimeInput = document.getElementById('manual-end-time');
        addManualEntryButton = document.getElementById('add-manual-entry');
    });

    test('It should load and display recent projects', async () => {
        ProjectsController.getAllProjects = jest.fn().mockResolvedValue([
            { id: 1, name: 'Project A' },
            { id: 2, name: 'Project B' }
        ]);
    
        await homeController.loadRecentProjects();
    
        expect(recentProjectsContainer.innerHTML).toContain('Project A');
        expect(recentProjectsContainer.innerHTML).toContain('Project B');
    });    

    test('It should log errors when loading active timers fails', async () => {
        jest.spyOn(TimerController, 'getAllTimers').mockImplementation(() => {
            throw new Error('Database error');
        });
    
        await homeController.loadActiveTimers();
    
        const logs = readLogs();
        expect(logs).toMatch(/Error loading active timers: Database error/);
    });    

    test('It should load and display recent projects', async () => {
        ProjectsController.getAllProjects.mockResolvedValue([
            { id: 1, name: 'Project A' },
            { id: 2, name: 'Project B' }
        ]);
    
        await homeController.loadRecentProjects();
    
        expect(recentProjectsContainer.innerHTML).toContain('Project A');
        expect(recentProjectsContainer.innerHTML).toContain('Project B');
    });
    
    test('It should log errors when loading recent projects fails', async () => {
        jest.spyOn(ProjectsController, 'getAllProjects').mockImplementation(() => {
            throw new Error('Database error');
        });
    
        await homeController.loadRecentProjects();
    
        const logs = readLogs();
        expect(logs).toMatch(/Error loading recent projects: Database error/);
    });    

    test('It should handle manual time entry addition', async () => {
        jest.spyOn(TimeEntry, 'createTimeEntry').mockResolvedValue(1);
        jest.spyOn(TimeEntry, 'getAllTimeEntries').mockResolvedValue([
            { id: 1, project_id: 1, task: 'Test Task', start_time: '2024-02-21T10:00:00', end_time: '2024-02-21T11:00:00' }
        ]);
    
        manualTaskInput.value = 'Test Task';
        manualProjectInput.value = '1';
        manualStartTimeInput.value = '2024-02-21T10:00:00';
        manualEndTimeInput.value = '2024-02-21T11:00:00';
    
        await addManualEntryButton.click();
    
        const timeEntries = await TimeEntry.getAllTimeEntries();
        expect(timeEntries).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ task: 'Test Task', project_id: 1 })
            ])
        );
    });    

    test('It should start a new timer on button click', async () => {
        TimerController.createTimer = jest.fn().mockResolvedValue(1);
    
        document.body.innerHTML += `<button class="timer-action" data-id="1" data-action="start">Start</button>`;
    
        homeController.setupTimerListeners();
    
        const startButton = document.querySelector('.timer-action[data-action="start"]');
        await startButton.click();
    
        expect(TimerController.createTimer).toHaveBeenCalledWith(
            '1', 'New Task', expect.any(String), 'running'
        );
    });      

    test('It should stop an active timer on button click', async () => {
        jest.spyOn(TimerController, 'updateTimer').mockResolvedValue({ success: true });
    
        document.body.innerHTML += `<button class="timer-action" data-id="1" data-action="stop">Stop</button>`;
        homeController.setupTimerListeners();
    
        const stopButton = document.querySelector('.timer-action[data-action="stop"]');
        await stopButton.click();
    
        expect(TimerController.updateTimer).toHaveBeenCalledWith('1', { status: 'stopped' });
    
        TimerController.updateTimer.mockRestore();
    });      

    test('It should show "No active timers" if no timers are available', async () => {
        TimerController.getAllTimers = jest.fn().mockResolvedValue([]);
    
        await homeController.loadActiveTimers();
    
        expect(activeTimersContainer.innerHTML).toContain('No active timers.');
    });
    
    test('It should show "No recent projects" if no projects are available', async () => {
        ProjectsController.getAllProjects = jest.fn().mockResolvedValue([]);
    
        await homeController.loadRecentProjects();
    
        expect(recentProjectsContainer.innerHTML).toContain('No recent projects.');
    });    

    test('It should prevent adding a manual entry if fields are empty', async () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        manualTaskInput.value = '';
        manualProjectInput.value = '';
        manualStartTimeInput.value = '';
        manualEndTimeInput.value = '';

        await addManualEntryButton.click();

        expect(alertMock).toHaveBeenCalledWith('Please fill in all fields.');
        alertMock.mockRestore();
    });

    test('It should log errors when adding a manual entry fails', async () => {
        jest.spyOn(TimeEntry, 'createTimeEntry').mockRejectedValue(new Error('Database failure'));
    
        manualTaskInput.value = 'Test Task';
        manualProjectInput.value = '1';
        manualStartTimeInput.value = '2024-02-21T10:00:00';
        manualEndTimeInput.value = '2024-02-21T11:00:00';
    
        await addManualEntryButton.click(); // Simula il click
    
        // Attendi un ciclo di event loop per assicurarti che il log sia stato scritto
        await new Promise(resolve => setTimeout(resolve, 100));
    
        const logs = readLogs(); // Usa la funzione creata nei test per leggere i log
        expect(logs).toMatch(/Error adding manual time entry: Database failure/);
    });    
});
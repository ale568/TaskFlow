/**
 * @jest-environment jsdom
 */

const homeController = require('../../renderer/controllers/homeController');
const TimerController = require('../../renderer/controllers/timerController');
const TimeEntry = require('../../renderer/models/timeEntry');
const ProjectsController = require('../../renderer/controllers/projectsController');

jest.mock('../../renderer/controllers/timerController');
jest.mock('../../renderer/controllers/projectsController');

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

    test('It should load and display active timers', async () => {
        TimerController.getAllTimers.mockResolvedValue([
            { id: 1, task: 'Test Task 1', status: 'running' },
            { id: 2, task: 'Test Task 2', status: 'paused' }
        ]);

        await homeController.loadActiveTimers();

        expect(activeTimersContainer.innerHTML).toContain('Test Task 1');
        expect(activeTimersContainer.innerHTML).toContain('Test Task 2');
        expect(activeTimersContainer.innerHTML.toLowerCase()).toContain('running');
        expect(activeTimersContainer.innerHTML.toLowerCase()).toContain('paused');
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

    test('It should handle manual time entry addition', async () => {
        jest.spyOn(TimeEntry, 'createTimeEntry').mockResolvedValue(1);
    
        manualTaskInput.value = 'Test Task';
        manualProjectInput.value = '1';
        manualStartTimeInput.value = '2024-02-21T10:00:00';
        manualEndTimeInput.value = '2024-02-21T11:00:00';

        addManualEntryButton.click();

        expect(TimeEntry.createTimeEntry).toHaveBeenCalledWith(
            '1', 'Test Task', '2024-02-21T10:00:00', '2024-02-21T11:00:00'
        );
    });    

    test('It should start a new timer on button click', async () => {
        TimerController.createTimer.mockResolvedValue(1);

        document.body.innerHTML += `<button class="start-timer" data-id="1">Start</button>`;
        homeController.setupStartTimerListeners();

        const startButton = document.querySelector('.start-timer');
        startButton.click();

        expect(TimerController.createTimer).toHaveBeenCalledWith(
            '1', 'New Task', expect.any(String), 'running'
        );
    });

    test('It should stop an active timer on button click', async () => {
        TimerController.updateTimer.mockResolvedValue({ success: true });

        document.body.innerHTML += `<button class="stop-timer" data-id="1">Stop</button>`;
        homeController.setupStopTimerListeners();

        const stopButton = document.querySelector('.stop-timer');
        stopButton.click();

        expect(TimerController.updateTimer).toHaveBeenCalledWith('1', { status: 'stopped' });
    });

    test('It should show "No active timers" if no timers are available', async () => {
        TimerController.getAllTimers.mockResolvedValue([]);

        await homeController.loadActiveTimers();

        expect(activeTimersContainer.innerHTML).toContain('No active timers.');
    });

    test('It should show "No recent projects" if no projects are available', async () => {
        ProjectsController.getAllProjects.mockResolvedValue([]);

        await homeController.loadRecentProjects();

        expect(recentProjectsContainer.innerHTML).toContain('No recent projects.');
    });

    test('It should prevent adding a manual entry if fields are empty', async () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        manualTaskInput.value = '';
        manualProjectInput.value = '';
        manualStartTimeInput.value = '';
        manualEndTimeInput.value = '';

        homeController.setupEventListeners();
        addManualEntryButton.click();

        expect(alertMock).toHaveBeenCalledWith('Please fill in all fields.');

        alertMock.mockRestore();
    });
});
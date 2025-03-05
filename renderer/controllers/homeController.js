const TimerController = require('./timerController');
const ProjectsController = require('./projectsController');
const TimeEntry = require('../models/timeEntry');
const loggingUtils = require('../utils/loggingUtils');

/**
 * Handles the initialization of the home screen by loading active timers and recent projects.
 */
document.addEventListener('DOMContentLoaded', async () => {
    loggingUtils.logMessage('info', 'Initializing Home Screen', 'CONTROLLERS');
    await loadActiveTimers();
    await loadRecentProjects();
    setupEventListeners();
});

/**
 * Loads and displays the active timers.
 */
async function loadActiveTimers() {
    try {
        const timers = await TimerController.getAllTimers();
        const activeTimersContainer = document.getElementById('active-timers');

        activeTimersContainer.innerHTML = ''; // Clear existing timers

        if (timers.length === 0) {
            activeTimersContainer.innerHTML = '<p>No active timers.</p>';
            loggingUtils.logMessage('info', 'No active timers found', 'CONTROLLERS');
            return;
        }

        timers.forEach(timer => {
            const timerElement = document.createElement('div');
            timerElement.classList.add('timer-item');
            timerElement.innerHTML = `
                <span>${timer.task} - ${timer.status.toUpperCase()}</span>
                <button class="timer-action" data-id="${timer.id}" data-action="stop">Stop</button>
            `;
            activeTimersContainer.appendChild(timerElement);
        });

        setupTimerListeners();
        loggingUtils.logMessage('info', `Loaded ${timers.length} active timers`, 'CONTROLLERS');
    } catch (error) {
        loggingUtils.logMessage('error', `Error loading active timers: ${error.message}`, 'CONTROLLERS');
    }
}

/**
 * Loads and displays the recent projects.
 */
async function loadRecentProjects() {
    try {
        const projects = await ProjectsController.getAllProjects();
        const recentProjectsContainer = document.getElementById('recent-projects');

        recentProjectsContainer.innerHTML = ''; // Clear existing projects

        if (projects.length === 0) {
            recentProjectsContainer.innerHTML = '<p>No recent projects.</p>';
            loggingUtils.logMessage('info', 'No recent projects found', 'CONTROLLERS');
            return;
        }

        projects.slice(0, 5).forEach(project => { // Show only last 5 projects
            const projectElement = document.createElement('div');
            projectElement.classList.add('project-item');
            projectElement.innerHTML = `
                <span>${project.name}</span>
                <button class="timer-action" data-id="${project.id}" data-action="start">Start Timer</button>
            `;
            recentProjectsContainer.appendChild(projectElement);
        });

        setupTimerListeners();
        loggingUtils.logMessage('info', `Loaded ${projects.length} recent projects`, 'CONTROLLERS');
    } catch (error) {
        loggingUtils.logMessage('error', `Error loading recent projects: ${error.message}`, 'CONTROLLERS');
    }
}

/**
 * Sets up event listeners for UI interactions.
 */
function setupEventListeners() {
    document.getElementById('add-manual-entry').addEventListener('click', handleManualEntry);
}

/**
 * Handles manual time entry addition.
 */
async function handleManualEntry() {
    const task = document.getElementById('manual-task').value;
    const projectId = document.getElementById('manual-project').value;
    const startTime = document.getElementById('manual-start-time').value;
    const endTime = document.getElementById('manual-end-time').value;

    if (!task || !projectId || !startTime || !endTime) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        await TimeEntry.createTimeEntry(projectId, task, startTime, endTime);
        alert('Time entry added successfully.');
        loggingUtils.logMessage('info', `Manual entry added: Task ${task}, Project ID ${projectId}`, 'CONTROLLERS');
        loadActiveTimers(); // Refresh timers
    } catch (error) {
        loggingUtils.logMessage('error', `Error adding manual time entry: ${error.message}`, 'CONTROLLERS');
        alert('Failed to add time entry.');
    }
}

/**
 * Sets up event listeners for both starting and stopping timers.
 */
function setupTimerListeners() {
    document.querySelectorAll('.timer-action').forEach(button => {
        button.addEventListener('click', async (event) => {
            const id = event.target.dataset.id;
            const action = event.target.dataset.action;

            try {
                if (action === 'start') {
                    await TimerController.createTimer(id, 'New Task', new Date().toISOString(), 'running');
                    loggingUtils.logMessage('info', `Timer started for Project ID ${id}`, 'CONTROLLERS');
                } else if (action === 'stop') {
                    await TimerController.updateTimer(id, { status: 'stopped' });
                    loggingUtils.logMessage('info', `Timer stopped for Timer ID ${id}`, 'CONTROLLERS');
                }
                loadActiveTimers();
            } catch (error) {
                loggingUtils.logMessage('error', `Error processing timer action: ${error.message}`, 'CONTROLLERS');
            }
        });
    });
}

module.exports = {
    loadActiveTimers,
    loadRecentProjects,
    setupEventListeners,
    setupTimerListeners
};
const TimerController = require('./timerController');
const ProjectsController = require('./projectsController');
const TimeEntry = require('../models/timeEntry');

/**
 * Handles the initialization of the home screen by loading active timers and recent projects.
 */
document.addEventListener('DOMContentLoaded', async () => {
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
            return;
        }

        timers.forEach(timer => {
            const timerElement = document.createElement('div');
            timerElement.classList.add('timer-item');
            timerElement.innerHTML = `
                <span>${timer.task} - ${timer.status.toUpperCase()}</span>
                <button class="stop-timer" data-id="${timer.id}">Stop</button>
            `;
            activeTimersContainer.appendChild(timerElement);
        });

        setupStopTimerListeners();
    } catch (error) {
        console.error('Error loading active timers:', error);
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
            return;
        }

        projects.slice(0, 5).forEach(project => { // Show only last 5 projects
            const projectElement = document.createElement('div');
            projectElement.classList.add('project-item');
            projectElement.innerHTML = `
                <span>${project.name}</span>
                <button class="start-timer" data-id="${project.id}">Start Timer</button>
            `;
            recentProjectsContainer.appendChild(projectElement);
        });

        setupStartTimerListeners();
    } catch (error) {
        console.error('Error loading recent projects:', error);
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
        loadActiveTimers(); // Refresh timers
    } catch (error) {
        console.error('Error adding manual time entry:', error);
        alert('Failed to add time entry.');
    }
}

/**
 * Sets up event listeners for starting a timer.
 */
function setupStartTimerListeners() {
    document.querySelectorAll('.start-timer').forEach(button => {
        button.addEventListener('click', async (event) => {
            const projectId = event.target.dataset.id;
            try {
                await TimerController.createTimer(projectId, 'New Task', new Date().toISOString(), 'running');
                loadActiveTimers();
            } catch (error) {
                console.error('Error starting timer:', error);
            }
        });
    });
}

/**
 * Sets up event listeners for stopping a timer.
 */
function setupStopTimerListeners() {
    document.querySelectorAll('.stop-timer').forEach(button => {
        button.addEventListener('click', async (event) => {
            const timerId = event.target.dataset.id;
            try {
                await TimerController.updateTimer(timerId, { status: 'stopped' });
                loadActiveTimers();
            } catch (error) {
                console.error('Error stopping timer:', error);
            }
        });
    });
}

module.exports = {      // Since we don't have a class, we need to export individual methods
    loadActiveTimers,
    loadRecentProjects,
    setupEventListeners,
    setupStartTimerListeners,
    setupStopTimerListeners
};
const Project = require('../models/project');
const Activity = require('../models/activity');

const createProject = (name, description) => {
    return new Project(name, description);
};

const addActivityToProject = (project, activity) => {
    project.activities.push(activity);
};

const getProjectTotalTime = (project) => {
    return project.activities.reduce((total, activity) => {
        const duration = parseFloat(activity.duration);
        return total + (isNaN(duration) ? 0 : duration);
    }, 0);
};

module.exports = {
    createProject,
    addActivityToProject,
    getProjectTotalTime
};
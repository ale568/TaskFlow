class ReportsController {
    getTotalTimeProject(projects) {
        const report = {};
        projects.forEach(project => {
            const totalTime = project.activities.reduce((total, activity) => {
                if (typeof activity.duration === 'number' && !isNaN(activity.duration)) {
                    return total + activity.duration;
                }
                return total;
            }, 0);
            report[project.name] = totalTime;
        });
        return report;
    }

    getActivitiesByProject(projectName, projects) {
        const project = projects.find(p => p.name === projectName);
        return project ? project.activities : [];
    }

    getActivitiesByTag(tag, projects) {
        const activities = [];
        projects.forEach(project => {
            project.activities.forEach(activity => {
                if (activity.tag && activity.tag.id === tag.id) {
                    activities.push(activity);
                }
            });
        });
        return activities;
    }
}

module.exports = new ReportsController();
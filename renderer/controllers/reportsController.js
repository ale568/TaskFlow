class ReportsController {
    getTotalTimeProject(projects) {
        return projects.reduce((report, project) => {
            const totalTime = project.activities
                .filter(activity => typeof activity.duration === 'number' && !isNaN(activity.duration))
                .reduce((total, activity) => total + activity.duration, 0);
            report[project.name] = totalTime;
            return report;
        }, {});
    }

    getActivitiesByProject(projectName, projects) {
        const project = projects.find(p => p.name === projectName);
        return project ? project.activities : [];
    }

    getActivitiesByTag(tag, projects) {
        return projects.flatMap(project => 
            project.activities.filter(activity => activity.tag && activity.tag.id === tag.id)
        );
    }
}

module.exports = new ReportsController();
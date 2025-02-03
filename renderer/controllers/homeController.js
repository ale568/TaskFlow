class HomeController {
    getRecentActivities(projects) {
        if (!Array.isArray(projects) || projects.length === 0) {
            return [];
        }

        let activities = [];
        projects.forEach(project => {
            if (Array.isArray(project.activities)) {
                activities = activities.concat(project.activities);
            }
        });

        // Sort activities by createdAt, handling cases where createdAt might not exist
        activities.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });

        return activities.slice(0, 3);
    }

    getActiveProjects(projects) {
        // Assuming active projects are those that have activities
        return projects.filter(project => Array.isArray(project.activities) && project.activities.length > 0);
    }
}

module.exports = new HomeController();
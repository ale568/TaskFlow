class HomeController {
    getRecentActivities(projects) {
        if (!Array.isArray(projects) || projects.length === 0) {
            return [];
        }

        const activities = projects.flatMap(project => project.activities || []);

        // Sort activities by createdAt, handling cases where createdAt might not exist
        activities.sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)));

        return activities.slice(0, 3);
    }

    getActiveProjects(projects) {
        return projects.filter(project => Array.isArray(project.activities) && project.activities.length > 0);
    }
}

module.exports = new HomeController();
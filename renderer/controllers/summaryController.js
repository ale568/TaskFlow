class SummaryController {
    getSummary(projects) {
        let totalWorkedHours = 0;
        const activitySummaryByProject = {};
        const tagSummary = new Map();

        projects.forEach(project => {
            let projectTotal = 0;
            project.activities.forEach(activity => {
                totalWorkedHours += activity.duration;
                projectTotal += activity.duration;

                const tag = activity.tag;
                if (tag) {
                    if (!tagSummary.has(tag.name)) {
                        tagSummary.set(tag.name, 0);
                    }
                    tagSummary.set(tag.name, tagSummary.get(tag.name) + 1);
                }
            });
            activitySummaryByProject[project.name] = projectTotal;
        });

        return {
            totalWorkedHours,
            activitySummaryByProject,
            tagSummary: Object.fromEntries(tagSummary)
        };
    }

    getTotalWorkedHours(projects) {
        return this.getSummary(projects).totalWorkedHours;
    }

    getActivitySummaryByProject(projects) {
        return this.getSummary(projects).activitySummaryByProject;
    }

    getTagUsageSummary(projects) {
        return this.getSummary(projects).tagSummary;
    }
}

module.exports = new SummaryController();
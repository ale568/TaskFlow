class ActivityController {
    calculateActivitySummary(projects) {
        let totalTimeSpent = 0;
        const projectTimeSummary = {};
        const tagUsageSummary = new Map();

        projects.forEach(project => {
            let projectTotalTime = 0;

            project.activities.forEach(activity => {
                totalTimeSpent += activity.duration;
                projectTotalTime += activity.duration;

                const tag = activity.tag;
                if (tag) {
                    tagUsageSummary.set(tag.name, (tagUsageSummary.get(tag.name) || 0) + 1);
                }
            });

            projectTimeSummary[project.name] = projectTotalTime;
        });

        return {
            totalTimeSpent,
            projectTimeSummary,
            tagUsageSummary: Object.fromEntries(tagUsageSummary)
        };
    }

    calculateTotalTimeSpent(projects) {
        return this.calculateActivitySummary(projects).totalTimeSpent;
    }

    calculateProjectTime(projects) {
        return this.calculateActivitySummary(projects).projectTimeSummary;
    }

    calculateTagUsage(projects) {
        return this.calculateActivitySummary(projects).tagUsageSummary;
    }
}

module.exports = new ActivityController();

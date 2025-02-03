class SummaryController {
    getTotalWorkedHours(projects) {
        return projects.reduce((total, project) => {
            return total + project.activities.reduce((projectTotal, activity) => {
                return projectTotal + activity.duration;
            }, 0);
        }, 0);
    }

    getActivitySummaryByProject(projects) {
        const summary = {};
        projects.forEach(project => {
            summary[project.name] = project.activities.reduce((total, activity) => {
                return total + activity.duration;
            }, 0);
        });
        return summary;
    }

    getTagUsageSummary(projects) {
        const tagSummary = {};
        projects.forEach(project => {
            project.activities.forEach(activity => {
                const tag = activity.tag;
                if (tag) {
                    if (!tagSummary[tag.name]) {
                        tagSummary[tag.name] = 0;
                    }
                    tagSummary[tag.name]++;
                }
            });
        });
        return tagSummary;
    }
}

module.exports = new SummaryController();
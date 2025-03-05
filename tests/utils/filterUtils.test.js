const FilterUtils = require('../../renderer/utils/filterUtils');
const moment = require('moment-timezone');

describe('FilterUtils', () => {
    const mockProjects = [
        { id: 1, name: "Project Alpha", status: "active" },
        { id: 2, name: "Project Beta", status: "archived" },
        { id: 3, name: "Project Gamma", status: "active" }
    ];

    test('Filters projects by active status', () => {
        const result = FilterUtils.filterProjects(mockProjects, { status: "active" });
        expect(result).toHaveLength(2);
        expect(result.map(p => p.name)).toEqual(["Project Alpha", "Project Gamma"]);
    });

    test('Filters projects by name keyword', () => {
        const result = FilterUtils.filterProjects(mockProjects, { name: "Beta" });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Project Beta");
    });

    test('Filters alerts by priority', () => {
        const mockAlerts = [
            { id: 1, project: "Project Alpha", priority: "high" },
            { id: 2, project: "Project Beta", priority: "low" },
        ];
        const result = FilterUtils.filterAlerts(mockAlerts, { priority: "high" });
        expect(result).toHaveLength(1);
        expect(result[0].priority).toBe("high");
    });

    test('Filters reports by date range', () => {
        const mockReports = [
            { id: 1, project: "Project Alpha", date: "2024-11-10" },
            { id: 2, project: "Project Beta", date: "2024-11-15" },
            { id: 3, project: "Project Gamma", date: "2024-12-01" }
        ];
    
        const result = FilterUtils.filterReports(mockReports, {
            dateRange: { start: "2024-11-10", end: "2024-11-30" }
        });
    
        expect(result).toHaveLength(2);
        expect(result.map(r => r.date)).toEqual(["2024-11-10", "2024-11-15"]);
    });
    
      

    test('Filters timesheets by tag', () => {
        const mockTimesheets = [
            { id: 1, project: "Project Alpha", tag: "Development" },
            { id: 2, project: "Project Beta", tag: "Testing" }
        ];
        const result = FilterUtils.filterTimesheets(mockTimesheets, { tag: "Testing" });
        expect(result).toHaveLength(1);
        expect(result[0].tag).toBe("Testing");
    });
});
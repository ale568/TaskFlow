const Report = require('../../renderer/models/report');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Report Model - Database Operations', () => {
    beforeAll(async () => {
        Report.setDatabase('taskflow_test_reports.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_reports.sqlite'); // Connect to the test database
        dbUtils.resetDatabase(); // Reset the database before running tests
    });

    beforeEach(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Prevent race conditions
    });

    test('It should create and retrieve a report', async () => {
        // Step 1: Create a project to link the report
        const projectId = await Project.createProject('Report Project', 'Project for report testing');

        // Step 2: Create a report associated with the project
        const reportId = await Report.createReport(projectId, 10, '2024-02-21', '2024-02-22');

        expect(reportId).toBeDefined();
        const report = await Report.getReportById(reportId);
        expect(report).not.toBeNull();
        expect(report.total_hours).toBe(10);
    });

    test('It should update a report', async () => {
        const projectId = await Project.createProject('Report Update Project', 'Project for updating reports');

        const reportId = await Report.createReport(projectId, 15, '2024-02-21', '2024-02-23');

        const updated = await Report.updateReport(reportId, { total_hours: 20 });
        expect(updated.success).toBeTruthy();

        const updatedReport = await Report.getReportById(reportId);
        expect(updatedReport.total_hours).toBe(20);
    });

    test('It should delete a report', async () => {
        const projectId = await Project.createProject('Report Delete Project', 'Project for deleting reports');

        const reportId = await Report.createReport(projectId, 5, '2024-02-20', '2024-02-21');

        const deleted = await Report.deleteReport(reportId);
        expect(deleted).toBeTruthy();

        const deletedReport = await Report.getReportById(reportId);
        expect(deletedReport).toBeNull();
    });

    test('It should return null for a non-existing report', async () => {
        const report = await Report.getReportById(99999);
        expect(report).toBeNull();
    });

    test('It should return false when updating a non-existing report', async () => {
        const result = await Report.updateReport(99999, { total_hours: 25 });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when deleting a non-existing report', async () => {
        const result = await Report.deleteReport(99999);
        expect(result).toBeFalsy();
    });

    test('It should retrieve all reports', async () => {
        const projectId = await Project.createProject('Report Retrieval Project', 'Project for retrieving reports');

        await Report.createReport(projectId, 12, '2024-02-21', '2024-02-22');
        await Report.createReport(projectId, 8, '2024-02-22', '2024-02-23');

        const reports = await Report.getAllReports();
        expect(reports.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});
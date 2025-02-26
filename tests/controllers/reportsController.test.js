const ReportsController = require('../../renderer/controllers/reportsController');
const Report = require('../../renderer/models/report');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('ReportsController - Database Operations', () => {
    beforeAll(async () => {
        Report.setDatabase('taskflow_test_reports.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_reports.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve a report', async () => {
        const uniqueProjectName = `Report Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for report testing');

        const spy = jest.spyOn(Report, 'createReport');
        const reportId = await ReportsController.createReport(projectId, 10, '2024-02-21', '2024-02-28');

        expect(spy).toHaveBeenCalledWith(projectId, 10, '2024-02-21', '2024-02-28');
        expect(reportId).toBeDefined();

        const report = await ReportsController.getReportById(reportId);
        expect(report).not.toBeNull();
        expect(report.total_hours).toBe(10);
        expect(report.startDate).toBe('2024-02-21');
        expect(report.endDate).toBe('2024-02-28');

        spy.mockRestore();
    });

    test('It should update a report', async () => {
        const uniqueProjectName = `Report Update Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for updating reports');

        const reportId = await ReportsController.createReport(projectId, 5, '2024-02-21', '2024-02-28');

        const spy = jest.spyOn(Report, 'updateReport');
        const updated = await ReportsController.updateReport(reportId, { total_hours: 15 });

        expect(spy).toHaveBeenCalledWith(reportId, { total_hours: 15 });
        expect(updated.success).toBeTruthy();

        const updatedReport = await ReportsController.getReportById(reportId);
        expect(updatedReport.total_hours).toBe(15);

        spy.mockRestore();
    });

    test('It should delete a report', async () => {
        const uniqueProjectName = `Report Delete Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for deleting reports');

        const reportId = await ReportsController.createReport(projectId, 8, '2024-02-21', '2024-02-28');

        const spy = jest.spyOn(Report, 'deleteReport');
        const deleted = await ReportsController.deleteReport(reportId);

        expect(spy).toHaveBeenCalledWith(reportId);
        expect(deleted).toBeTruthy();

        const deletedReport = await ReportsController.getReportById(reportId);
        expect(deletedReport).toBeNull();

        spy.mockRestore();
    });

    test('It should return null for a non-existing report', async () => {
        const spy = jest.spyOn(Report, 'getReportById');
        const report = await ReportsController.getReportById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(report).toBeNull();

        spy.mockRestore();
    });

    test('It should return false when updating a non-existing report', async () => {
        const spy = jest.spyOn(Report, 'updateReport');
        const result = await ReportsController.updateReport(99999, { total_hours: 20 });

        expect(spy).toHaveBeenCalledWith(99999, { total_hours: 20 });
        expect(result.success).toBeFalsy();

        spy.mockRestore();
    });

    test('It should return false when deleting a non-existing report', async () => {
        const spy = jest.spyOn(Report, 'deleteReport');
        const result = await ReportsController.deleteReport(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(result).toBeFalsy();

        spy.mockRestore();
    });

    test('It should retrieve all reports', async () => {
        const uniqueProjectName = `Report Retrieval Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for retrieving reports');

        await ReportsController.createReport(projectId, 7, '2024-02-21', '2024-02-28');
        await ReportsController.createReport(projectId, 12, '2024-03-01', '2024-03-07');

        const spy = jest.spyOn(Report, 'getAllReports');
        const reports = await ReportsController.getAllReports();

        expect(spy).toHaveBeenCalled();
        expect(reports.length).toBeGreaterThanOrEqual(2);

        spy.mockRestore();
    });

    test('It should handle errors when creating a report with an invalid project ID', async () => {
        const spy = jest.spyOn(Report, 'createReport').mockImplementation(() => {
            throw new Error('Invalid project ID');
        });

        await expect(ReportsController.createReport(99999, 10, '2024-02-21', '2024-02-28'))
            .rejects.toThrow('Failed to create report');

        spy.mockRestore();
    });

    test('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure

        let errorCaught = false;
        try {
            await ReportsController.createReport(99999, 10, '2024-02-21', '2024-02-28');
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy(); // Ensure an error was caught

        dbUtils.connect('taskflow_test_reports.sqlite'); // Restore database connection for further tests
    });

    afterAll(async () => {
        dbUtils.close();
    });
});
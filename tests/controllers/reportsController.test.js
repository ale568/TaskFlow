const ReportsController = require('../../renderer/controllers/reportsController');
const Report = require('../../renderer/models/report');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');
const exportUtils = require('../../renderer/utils/exportUtils');
const loggingUtils = require('../../renderer/utils/loggingUtils');
const dialogUtils = require('../../renderer/utils/dialogUtils');
const filterUtils = require('../../renderer/utils/filterUtils');

jest.mock('../../renderer/utils/exportUtils');
jest.mock('../../renderer/utils/loggingUtils');
jest.mock('../../renderer/utils/dialogUtils');
jest.mock('../../renderer/utils/filterUtils');

describe('ReportsController - Database Operations', () => {
    beforeAll(async () => {
        Report.setDatabase('taskflow_test_reports.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_reports.sqlite'); // Connect to the test database
    });

    beforeEach(() => {
        jest.clearAllMocks();
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

        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Report created successfully'), 'CONTROLLERS');

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

        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Report updated successfully'), 'CONTROLLERS');

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

        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Report deleted successfully'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should retrieve all reports with filtering', async () => {
        const reports = [
            { id: 1, project_id: 101, total_hours: 10, startDate: '2024-02-21', endDate: '2024-02-28' },
            { id: 2, project_id: 102, total_hours: 15, startDate: '2024-03-01', endDate: '2024-03-07' }
        ];

        Report.getAllReports = jest.fn().mockResolvedValue(reports);
        filterUtils.applyFilters = jest.fn().mockReturnValue([reports[0]]);

        const filteredReports = await ReportsController.getAllReports({ project_id: 101 });

        expect(filterUtils.applyFilters).toHaveBeenCalled();
        expect(filteredReports.length).toBe(1);
        expect(filteredReports[0].total_hours).toBe(10);

        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Retrieved'), 'CONTROLLERS');
    });

    test('It should handle errors when retrieving reports', async () => {
        Report.getAllReports = jest.fn().mockRejectedValue(new Error('DB error'));

        await expect(ReportsController.getAllReports()).rejects.toThrow('Failed to retrieve reports');

        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error retrieving reports'), 'CONTROLLERS');
    });

    test('It should export reports as CSV', async () => {
        Report.getAllReports = jest.fn().mockResolvedValue([
            { id: 1, project_id: 101, total_hours: 10, startDate: '2024-02-21', endDate: '2024-02-28' }
        ]);

        dialogUtils.showSaveDialog.mockResolvedValue('/path/to/reports.csv');

        await ReportsController.exportReports('csv');
        expect(exportUtils.exportCSV).toHaveBeenCalledWith(expect.any(Array), '/path/to/reports.csv');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Reports exported successfully'), 'CONTROLLERS');
    });

    test('It should handle missing reports for export', async () => {
        Report.getAllReports = jest.fn().mockResolvedValue([]);

        await expect(ReportsController.exportReports('csv')).rejects.toThrow('Failed to export reports');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error exporting reports'), 'CONTROLLERS');
    });

    test('It should not export if no file is selected', async () => {
        Report.getAllReports = jest.fn().mockResolvedValue([
            { id: 2, project_id: 102, total_hours: 15, startDate: '2024-03-01', endDate: '2024-03-07' }
        ]);

        dialogUtils.showSaveDialog.mockResolvedValue(null);

        await ReportsController.exportReports('csv');
        expect(exportUtils.exportCSV).not.toHaveBeenCalled();
    });

    test('It should log an error when report creation fails', async () => {
        Report.createReport = jest.fn().mockRejectedValue(new Error('DB error'));
    
        await expect(ReportsController.createReport(99999, 10, '2024-02-21', '2024-02-28'))
            .rejects.toThrow('Failed to create report');
    
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error creating report'), 'CONTROLLERS');
    });
    
    test('It should log an error when retrieving a report fails', async () => {
        Report.getReportById = jest.fn().mockRejectedValue(new Error('DB error'));
    
        await expect(ReportsController.getReportById(1)).rejects.toThrow('Failed to retrieve report');
    
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error retrieving report'), 'CONTROLLERS');
    });
    
    test('It should log an error when getting all reports fails', async () => {
        Report.getAllReports = jest.fn().mockRejectedValue(new Error('DB error'));
    
        await expect(ReportsController.getAllReports()).rejects.toThrow('Failed to retrieve reports');
    
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error retrieving reports'), 'CONTROLLERS');
    });
    
    test('It should log an error when an export utility fails', async () => {
        Report.getAllReports = jest.fn().mockResolvedValue([
            { id: 2, project_id: 102, total_hours: 15, startDate: '2024-03-01', endDate: '2024-03-07' }
        ]);
    
        dialogUtils.showSaveDialog.mockResolvedValue('/path/to/reports.csv');
        exportUtils.exportCSV = jest.fn().mockRejectedValue(new Error('Export failed'));
    
        await expect(ReportsController.exportReports('csv')).rejects.toThrow('Failed to export reports');
    
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error exporting reports'), 'CONTROLLERS');
    });
    

    afterAll(async () => {
        dbUtils.close();
    });
});